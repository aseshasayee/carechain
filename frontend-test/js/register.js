// Register page logic
function renderRegister() {
  document.getElementById('main-content').innerHTML = `
    <div class="container">
      <h2>Register</h2>
      <form id="register-form">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <input type="text" name="first_name" placeholder="First Name" required />
        <input type="text" name="last_name" placeholder="Last Name" required />
        <select name="role" required>
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button class="button" type="submit">Register</button>
      </form>
    </div>
  `;
  document.getElementById('register-form').onsubmit = async e => {
    e.preventDefault();
    const form = e.target;
    const role = form.role.value;
    const body = {
      email: form.email.value,
      password: form.password.value,
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      is_candidate: role === 'candidate',
      is_recruiter: role === 'recruiter'
    };
    console.log('Registration payload:', body);
    try {
      const resp = await apiRequest(ENDPOINTS.register, {
        method: 'POST',
        body
      });
      console.log('Registration response:', resp);
      showMessage('Registration successful! Please check your email.', 'success');
      location.hash = '#/login';
    } catch (err) {
      console.error('Registration error:', err);
      showMessage(err.data?.detail || 'Registration failed', 'error');
    }
  };
}
