import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadDates } from './data/dates'
import { loadMarkers } from './data/blood'
import { loadDiagnostics } from './data/diagnostics'
import { loadOther } from './data/other'
import { loadWhoop } from './data/whoop'

function showError(msg: string) {
  const el = document.getElementById('root');
  if (el) {
    el.innerHTML = `<div style="font-family:system-ui;padding:24px;max-width:640px;margin:48px auto;color:#78716c"><h1 style="color:#0f172a;margin-bottom:8px;">Could not load health data</h1><p>${msg}</p></div>`;
  }
}

async function boot() {
  try {
    await Promise.all([loadDates(), loadMarkers(), loadDiagnostics(), loadOther(), loadWhoop()]);
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (e: any) {
    showError(e?.message || 'Unknown error fetching data/*.json');
  }
}

boot();
