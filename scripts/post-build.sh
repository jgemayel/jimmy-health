#!/usr/bin/env bash
set -e
root="$(cd "$(dirname "$0")/.." && pwd)"
dist="$root/dist"
python3 - <<PY
import shutil, re
from pathlib import Path
root = Path("$root"); dist = root / "dist"
html = (dist / 'index.html').read_text()

# Inject manifest + apple-touch-icon + SW registration with update check
inject_head = '<link rel="manifest" href="manifest.json"><link rel="apple-touch-icon" href="icons/icon-192.png">'
if '</head>' in html: html = html.replace('</head>', inject_head + '</head>')
elif '<body>' in html: html = html.replace('<body>', inject_head + '<body>')

# Inject SW registration + an aggressive update trigger at end of body
sw_reg = """
<script>
(function(){
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      reg.update();
      if (reg.waiting) { reg.waiting.postMessage({type:'SKIP_WAITING'}); }
      reg.addEventListener('updatefound', function(){
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function(){
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            nw.postMessage({type:'SKIP_WAITING'});
          }
        });
      });
    }).catch(function(){});
    // On controller change (new SW took over), reload once for a clean page
    var reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
})();
</script>
"""
if '</body>' in html: html = html.replace('</body>', sw_reg + '</body>')
else: html = html + sw_reg
(dist / 'index.html').write_text(html)

def copy(src, dst):
    if src.is_dir(): shutil.copytree(src, dst, dirs_exist_ok=True)
    else:
        dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst)
copy(root / 'manifest.json', dist / 'manifest.json')
copy(root / 'icons', dist / 'icons')
copy(root / 'public' / 'data', dist / 'data')
copy(root / 'public' / 'exercises', dist / 'exercises')
(dist / '.nojekyll').write_text('')

# New service worker: network-first for HTML and data, cache-first for static assets, clears old caches
sw = """
const CACHE = 'jimmy-health-v4';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') { self.skipWaiting(); }
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/jimmy-health/' || url.pathname === '/jimmy-health';
  const isData = url.pathname.includes('/data/');
  if (isHTML || isData) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(fr => {
      const copy = fr.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return fr;
    }))
  );
});
"""
(dist / 'sw.js').write_text(sw)
PY
echo "post-build complete"
