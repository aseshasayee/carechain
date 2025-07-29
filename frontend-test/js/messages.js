// Modern chat inbox for recruiter and candidate
function renderMessages() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Messages</h2><div id="messages-list">Loading...</div></div>`;
  // Fetch all chat rooms for the user (rooms where user is recruiter or candidate)
  apiRequest('/api/chat/rooms/')
    .then(data => {
      const rooms = Array.isArray(data) ? data : data.results || [];
      if (!rooms.length) {
        document.getElementById('messages-list').innerHTML = '<p>No chat rooms.</p>';
        return;
      }
      document.getElementById('messages-list').innerHTML = rooms.map(room => `
        <div class="card flex-between">
          <div>
            <strong>${room.recipient_name || room.name}</strong>
          </div>
          <button class="button" onclick="openChatUI('${room.name}','${room.recipient_name || room.name}',${room.recipient_id || ''})">Open</button>
        </div>
      `).join('');
    })
    .catch(() => {
      document.getElementById('messages-list').innerHTML = '<p>Failed to load messages.</p>';
    });
}

// Poll for new rooms every 5 seconds for real-time updates
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (window.location.hash.includes('messages')) {
      renderMessages();
    }
  }, 5000);
}
