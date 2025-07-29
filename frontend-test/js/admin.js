// Admin panel for user management and activity
function renderAdmin() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Admin Panel</h2><div id="admin-activity">Loading...</div><div id="admin-users">Loading users...</div></div>`;
  loadAdminActivity();
  loadAdminUsers();
}

function loadAdminActivity() {
  apiRequest(ENDPOINTS.recentActivity)
    .then(data => {
      const acts = Array.isArray(data) ? data : data.results || [];
      document.getElementById('admin-activity').innerHTML = '<h3>Recent Activity</h3>' + (acts.map(a => `<div class="card">${a.activity || JSON.stringify(a)}</div>`).join('') || '<p>No activity.</p>');
    })
    .catch(() => {
      document.getElementById('admin-activity').innerHTML = '<p>Failed to load activity.</p>';
    });
}

function loadAdminUsers() {
  apiRequest(ENDPOINTS.users)
    .then(data => {
      const users = Array.isArray(data) ? data : data.results || [];
      document.getElementById('admin-users').innerHTML = '<h3>Users</h3>' + (users.map(u => `<div class="card">${u.email} (${u.role})</div>`).join('') || '<p>No users.</p>');
    })
    .catch(() => {
      document.getElementById('admin-users').innerHTML = '<p>Failed to load users.</p>';
    });
}
