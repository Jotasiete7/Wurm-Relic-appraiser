import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ecossistema-guilda/theme/theme.css'
import App from './App.tsx'

// Handle Vite dynamic import / chunk load failures (due to new deployments)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Preload error detected. Reloading page to fetch the latest assets...', event);
  const key = 'vite-preload-error-reload';
  const lastReload = sessionStorage.getItem(key);
  const now = Date.now();
  // Prevent infinite reload loop if reload doesn't help
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem(key, now.toString());
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
