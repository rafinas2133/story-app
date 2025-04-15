import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { useLocalStorage } from '../utils';
import { initDB, clearAllData } from '../data/db';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    this.#content.innerHTML = await page.render();
    await page.afterRender();

    this.#updateNavbarLoginState();

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;

      const installButton = document.getElementById('install-button');
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          }
          deferredPrompt = null;
        });
      });
    });
  }

  #updateNavbarLoginState() {
    const { getItem, removeItem } = useLocalStorage('token');

    const navList = document.querySelector('#nav-list');

    const token = getItem();
    if (token) {
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/add">Add Story</a></li>
        <li id="nav-login-item"><a href="#/login">Login</a></li>
      `;
      const navLoginItem = document.querySelector('#nav-login-item');
      navLoginItem.innerHTML = `
        <button id="logout-button">Logout</button>
      `;

      const logoutBtn = document.querySelector('#logout-button');
      logoutBtn.addEventListener('click', async () => {
        try {

          await initDB();
          
          await clearAllData();
          
          removeItem();

          window.location.hash = '/login';
          
          setTimeout(() => {
            location.reload();
          }, 1000);
        } catch (error) {
          console.error('Error during logout:', error);
          
          removeItem();
          window.location.hash = '/login';
          location.reload();
        }
      });
    }
  }

}

export default App;
