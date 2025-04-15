import { register } from '../../data/api';
import { Loading } from '../../components/Loading';
import { showAlert } from '../../components/Alert';

class RegisterPage {
  async render() {
    return `
      <section class="register-page">
        <h2>Register</h2>
        <form id="register-form">
          <div>
            <label for="name">Nama:</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Register</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#register-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      try {
        Loading.show('Register in...');
        const response = await register(name, email, password);
        if (response.error) {
            showAlert({
              title: 'Register Gagal',
              text: response.message,
              icon: 'error',
          });
        } else {
          showAlert({
            title: 'Registrasi berhasil! Silakan login.',
            text: response.message,
            icon: 'success',
            onConfirm: () => {
              window.location.hash = '/login';
            }
        });
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export default RegisterPage;
