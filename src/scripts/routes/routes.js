import HomePage from '../pages/home/home-page';
import AddPage from '../pages/add/add-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import NotFoundPage from '../pages/not-found/not-fount-page';

const routes = {
  '/': new HomePage(),
  '/add': new AddPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

function router() {
  const path = window.location.pathname;
  const page = routes[path] || new NotFoundPage(); 

  const appContainer = document.querySelector('#main-content');
  appContainer.innerHTML = page.render(); 
}

window.addEventListener('load', router);

window.addEventListener('popstate', router);

export default routes;
