import '../styles/styles.css';
import App from './pages/app';
import { renderWithTransition } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  window.addEventListener('popstate', async () => {
    renderWithTransition(async (container) => {
      await app.renderPage();
    }, '#main-content');
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/story-app/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker berhasil didaftarkan:', registration.scope);
        })
        .catch(error => {
          console.error('Pendaftaran ServiceWorker gagal:', error);
        });
    });
  } 
});
