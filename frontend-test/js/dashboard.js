// Dashboard page with stats and quick links
function renderDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) {
    location.hash = '#/login';
    return;
  }
  document.getElementById('main-content').innerHTML = `
    <div class="container">
      <h2>Welcome, ${user.email}</h2>
      <div id="dashboard-stats" class="flex"></div>
      <div class="flex">
        <div class="card">
          <a href="#/jobs">Browse Jobs</a>
        </div>
        <div class="card">
          <a href="#/profile">Your Profile</a>
        </div>
        <div class="card">
          <a href="#/notifications">Notifications</a>
        </div>
        <div class="card">
          <a href="#/messages">Messages</a>
        </div>
      </div>
    </div>
  `;
  loadDashboardStats();
}

function loadDashboardStats() {
  apiRequest(ENDPOINTS.dashboardStats)
    .then(data => {
      document.getElementById('dashboard-stats').innerHTML = `
        <div class="card"><strong>Jobs:</strong> ${data.jobs_count || 0}</div>
        <div class="card"><strong>Applications:</strong> ${data.applications_count || 0}</div>
        <div class="card"><strong>Messages:</strong> ${data.messages_count || 0}</div>
      `;
    })
    .catch(() => {
      document.getElementById('dashboard-stats').innerHTML = '';
    });
}
