// Login page logic
function renderLogin() {
  document.getElementById('main-content').innerHTML = `
    <div class="container">
      <h2>Login</h2>
      <form id="login-form">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button class="button" type="submit">Login</button>
      </form>
    </div>
  `;
  document.getElementById('login-form').onsubmit = async e => {
    e.preventDefault();
    const form = e.target;
    try {
      const data = await apiRequest(ENDPOINTS.login, {
        method: 'POST',
        body: {
          email: form.email.value,
          password: form.password.value
        }
      });
      localStorage.setItem('access', data.token);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify(data));
      showMessage('Login successful!', 'success');
      renderHeader();
      // Redirect based on role
      if (data.role === 'admin') {
        location.hash = '#/admin';
      } else if (data.role === 'recruiter') {
        location.hash = '#/dashboard'; // or a recruiter dashboard if you have one
      } else {
        location.hash = '#/dashboard';
      }
    } catch (err) {
      showMessage(err.data?.error || err.data?.detail || 'Login failed', 'error');
    }
  };
}
