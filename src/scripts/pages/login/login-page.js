import { login } from '../../data/api';
import { Loading } from '../../components/Loading';
import { showAlert } from '../../components/Alert';
import { useLocalStorage } from '../../utils';

class LoginPage {
  async render() {
    return `
      <section class="login-page">
        <h2>Login</h2>
        <form id="login-form">
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required minlength="8" />
          </div>
          <button type="submit">Login</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  }

  async afterRender() {

    const {setItem: setItemToken} = useLocalStorage('token');
    const {setItem: setItemName} = useLocalStorage('name');

    const form = document.querySelector('#login-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = form.email.value;
      const password = form.password.value;

      try {
        Loading.show('Logging in...');
        const response = await login(email, password);
        if (response.error) {
            showAlert({
                title: 'Login Gagal',
                text: response.message,
                icon: 'error',
            });
        } else {
          setItemToken(response.loginResult.token);
          setItemName(response.loginResult.name);
          window.location.hash = '/';
          Loading.hide();
        }
      } catch (error) {
        console.error(error);
        showAlert({
            title: 'Login Gagal',
            text: error,
            icon: 'error',
        });
      } 
    });
  }
}

export default LoginPage;
