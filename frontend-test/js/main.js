// Register routes and main logic

// Register routes, delegating to feature modules
route('/login', renderLogin);
route('/register', renderRegister);
route('/dashboard', renderDashboard);
route('/recruiter-dashboard', renderRecruiterDashboard);
route('/recruiter-jobs', renderRecruiterJobs);
route('/recruiter-applications', renderRecruiterApplications);
route('/recruiter-matches', renderRecruiterMatches);
route('/jobs', renderJobs);
route('/profile', renderProfile);
route('/notifications', renderNotifications);
route('/messages', renderMessages);
route('/logout', () => { logout(); });
route('/404', render404);
route('/admin', renderAdmin);
route('/attendance', renderAttendance);



// All page logic is now in feature modules: dashboard.js, jobs.js, profile.js, notifications.js, messages.js, admin.js, attendance.js

function renderRecruiterDashboard() {
  document.getElementById('main-content').innerHTML = `
    <div class="container">
      <h2>Recruiter Dashboard</h2>
      <div class="flex">
        <div class="card"><a href="#/recruiter-jobs">My Jobs</a></div>
        <div class="card"><a href="#/recruiter-applications">Applications</a></div>
        <div class="card"><a href="#/recruiter-matches">Matches</a></div>
        <div class="card"><a href="#/profile">Profile</a></div>
        <div class="card"><a href="#/messages">Messages</a></div>
      </div>
    </div>
  `;
}


function renderRecruiterApplications() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Applications</h2><div id="recruiter-applications-list">Loading...</div></div>`;
  // TODO: Load and list applications for recruiter's jobs
}

function renderRecruiterMatches() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Matches</h2><div id="recruiter-matches-list">Loading...</div></div>`;
  // TODO: Load and list matches for recruiter's jobs
}

function renderPostJob() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Post New Job</h2><div>Job posting form coming soon...</div><button class="button" onclick="renderRecruiterJobs()">Back to My Jobs</button></div>`;
}

function render404() {
  document.getElementById('main-content').innerHTML = '<div class="container"><h2>404 - Page Not Found</h2></div>';
}
