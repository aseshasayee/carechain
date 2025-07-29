// Notifications page with mark all as read
function renderNotifications() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Notifications <button class="button" id="mark-all-read">Mark All Read</button></h2><div id="notifications-list">Loading...</div></div>`;
  loadNotifications();
  document.getElementById('mark-all-read').onclick = async () => {
    try {
      await apiRequest(ENDPOINTS.markAllNotificationsRead, { method: 'POST' });
      showMessage('All notifications marked as read!', 'success');
      loadNotifications();
    } catch {
      showMessage('Failed to mark as read', 'error');
    }
  };
}

function loadNotifications() {
  apiRequest(ENDPOINTS.notifications)
    .then(data => {
      const notifs = Array.isArray(data) ? data : data.results || [];
      document.getElementById('notifications-list').innerHTML = notifs.map(n => `
        <div class="card">
          <strong>${n.title || 'Notification'}</strong><br>
          <span>${n.body || ''}</span>
        </div>
      `).join('') || '<p>No notifications.</p>';
    })
    .catch(() => {
      document.getElementById('notifications-list').innerHTML = '<p>Failed to load notifications.</p>';
    });
}
