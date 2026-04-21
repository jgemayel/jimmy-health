#!/usr/bin/env bash
set -e
root="$(cd "$(dirname "$0")/.." && pwd)"
dist="$root/dist"
python3 - <<PY
import shutil, re
from pathlib import Path
root = Path("$root"); dist = root / "dist"
html = (dist / 'index.html').read_text()
inject = '<link rel="manifest" href="manifest.json"><link rel="apple-touch-icon" href="icons/icon-192.png">'
if '</head>' in html: html = html.replace('</head>', inject + '</head>')
elif '<body>' in html: html = html.replace('<body>', inject + '<body>')
(dist / 'index.html').write_text(html)
def copy(src, dst):
    if src.is_dir(): shutil.copytree(src, dst, dirs_exist_ok=True)
    else:
        dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst)
copy(root / 'manifest.json', dist / 'manifest.json')
copy(root / 'icons', dist / 'icons')
copy(root / 'public' / 'data', dist / 'data')
(dist / '.nojekyll').write_text('')
sw = """
const CACHE = 'jimmy-health-v1';
const ASSETS = ['./', 'index.html', 'manifest.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener('activate', (e) => { self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.includes('/data/')) { e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(cc => cc.put(e.request, c)); return r; }).catch(() => caches.match(e.request))); return; }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(fr => { const c = fr.clone(); caches.open(CACHE).then(cc => cc.put(e.request, c)); return fr; })));
});
"""
(dist / 'sw.js').write_text(sw)
html = (dist / 'index.html').read_text()
reg = "<script>if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}</script>"
html = html.replace('</body>', reg + '</body>') if '</body>' in html else html + reg
(dist / 'index.html').write_text(html)
PY
echo "post-build complete"
