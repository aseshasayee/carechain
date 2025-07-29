// Attendance page for viewing and submitting attendance
function renderAttendance() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Attendance</h2><form id="attendance-form" class="flex"><input type="date" name="date" required><button class="button" type="submit">Mark Present</button></form><div id="attendance-list">Loading...</div></div>`;
  loadAttendance();
  document.getElementById('attendance-form').onsubmit = async e => {
    e.preventDefault();
    try {
      await apiRequest(ENDPOINTS.attendance, { method: 'POST', body: { date: e.target.date.value } });
      showMessage('Attendance marked!', 'success');
      loadAttendance();
    } catch {
      showMessage('Failed to mark attendance', 'error');
    }
  };
}

function loadAttendance() {
  apiRequest(ENDPOINTS.attendance)
    .then(data => {
      const atts = Array.isArray(data) ? data : data.results || [];
      document.getElementById('attendance-list').innerHTML = atts.map(a => `<div class="card">${a.date} - ${a.status || 'Present'}</div>`).join('') || '<p>No attendance records.</p>';
    })
    .catch(() => {
      document.getElementById('attendance-list').innerHTML = '<p>Failed to load attendance.</p>';
    });
}
