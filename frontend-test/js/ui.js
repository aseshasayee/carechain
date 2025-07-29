// UI rendering helpers
function showMessage(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = 'card ' + type;
  el.textContent = msg;
  document.getElementById('main-content').prepend(el);
  setTimeout(() => el.remove(), 3500);
}

function renderHeader() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  let nav = '';
  if (user) {
    if (user.is_recruiter || user.role === 'recruiter') {
      nav = `
        <nav>
          <a href="#/recruiter-dashboard">Recruiter Dashboard</a>
          <a href="#/recruiter-jobs">My Jobs</a>
          <a href="#/recruiter-applications">Applications</a>
          <a href="#/recruiter-matches">Matches</a>
          <a href="#/profile">Profile</a>
          <a href="#/messages">Messages</a>
          <a href="#/logout" onclick="logout();return false;">Logout</a>
        </nav>
      `;
    } else {
      nav = `
        <nav>
          <a href="#/dashboard">Dashboard</a>
          <a href="#/jobs">Jobs</a>
          <a href="#/profile">Profile</a>
          <a href="#/notifications">Notifications</a>
          <a href="#/messages">Messages</a>
          <a href="#/logout" onclick="logout();return false;">Logout</a>
        </nav>
      `;
    }
  } else {
    nav = '<nav><a href="#/login">Login</a> <a href="#/register">Register</a></nav>';
  }
  document.getElementById('main-header').innerHTML = `
    <h1>Job Portal</h1>
    ${nav}
  `;
}

document.addEventListener('DOMContentLoaded', renderHeader);
window.addEventListener('storage', renderHeader);
