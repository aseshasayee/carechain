// Recruiter-specific UI and logic

// Render recruiter dashboard
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

// Render recruiter's jobs list
function renderRecruiterJobs() {
  document.getElementById('main-content').innerHTML = `
    <div class="container">
      <h2>My Jobs</h2>
      <div id="recruiter-jobs-list">Loading...</div>
      <button class="fab" title="Post New Job" onclick="renderPostJob()">＋</button>
    </div>
    <style>
      .fab {
        position: fixed;
        bottom: 32px;
        right: 32px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #1976d2;
        color: #fff;
        font-size: 2rem;
        border: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        cursor: pointer;
        z-index: 1000;
        transition: background 0.2s;
      }
      .fab:hover { background: #125ea2; }
    </style>
  `;
  loadRecruiterJobs();
}

function loadRecruiterJobs() {
  apiRequest(ENDPOINTS.jobs)
    .then(data => {
      console.log('[Recruiter Jobs API Response]', data);
      const jobs = Array.isArray(data) ? data : data.results || [];
      document.getElementById('recruiter-jobs-list').innerHTML = jobs.length ? jobs.map(job => `
        <div class="card flex-between">
          <div>
            <strong>${job.title}</strong><br>
            <span>${job.location || ''}</span><br>
            <span>Status: ${job.is_active ? 'Active' : 'Inactive'}</span><br>
            <span>Applications: ${job.applications_count || 0}</span>
          </div>
          <div>
            <button class="button" onclick="viewRecruiterJob(${job.id})">View</button>
            <button class="button" onclick="editRecruiterJob(${job.id})">Edit</button>
            <button class="button" onclick="deleteRecruiterJob(${job.id})">Delete</button>
          </div>
        </div>
      `).join('') : '<p>No jobs posted yet.</p>';
    })
    .catch(err => {
      console.error('[Recruiter Jobs API Error]', err);
      let msg = '<p>Failed to load jobs.</p>';
      if (err && err.status) {
        msg += `<pre>Status: ${err.status}\n${JSON.stringify(err.data, null, 2)}</pre>`;
      }
      document.getElementById('recruiter-jobs-list').innerHTML = msg;
    });
}

window.renderPostJob = function() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Post New Job</h2><form id="post-job-form">
    <input type="text" name="title" placeholder="Job Title" required />
    <input type="text" name="location" placeholder="Location" required />
    <input type="text" name="department" placeholder="Department" required />
    <input type="number" name="salary" placeholder="Salary" required />
    <select name="pay_unit" required><option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="per_shift">Per Shift</option></select>
    <select name="job_type" required><option value="full_time">Full Time</option><option value="part_time">Part Time</option><option value="contract">Contract</option><option value="temporary">Temporary</option><option value="locum">Locum</option></select>
    <input type="number" name="experience_required" placeholder="Experience Required (years)" min="0" required />
    <textarea name="description" placeholder="Job Description" required></textarea>
    <button class="button" type="submit">Post Job</button>
    <button class="button" type="button" onclick="renderRecruiterJobs()">Cancel</button>
  </form></div>`;
  document.getElementById('post-job-form').onsubmit = async e => {
    e.preventDefault();
    const form = e.target;
    try {
      await apiRequest(ENDPOINTS.jobs, {
        method: 'POST',
        body: {
          title: form.title.value,
          location: form.location.value,
          department: form.department.value,
          salary: form.salary.value,
          pay_unit: form.pay_unit.value,
          job_type: form.job_type.value,
          experience_required: form.experience_required.value,
          description: form.description.value
        }
      });
      showMessage('Job posted!', 'success');
      renderRecruiterJobs();
    } catch (err) {
      showMessage('Failed to post job', 'error');
    }
  };
};

window.viewRecruiterJob = function(jobId) {
  document.getElementById('main-content').innerHTML = '<div class="container">Loading job...</div>';
  apiRequest(ENDPOINTS.jobs + jobId + '/')
    .then(job => {
      document.getElementById('main-content').innerHTML = `
        <div class="container">
          <h2>${job.title}</h2>
          <div class="card">
            <strong>Location:</strong> ${job.location || ''}<br>
            <strong>Description:</strong> ${job.description || ''}<br>
            <strong>Status:</strong> ${job.is_active ? 'Active' : 'Inactive'}<br>
            <strong>Applications:</strong> ${job.applications_count || 0}<br>
            <button class="button" onclick="renderRecruiterJobs()">Back to My Jobs</button>
            <button class="button" onclick="viewRecruiterApplications(${job.id})">Manage Applicants</button>
          </div>
        </div>
      `;
    })
    .catch(() => {
      document.getElementById('main-content').innerHTML = '<div class="container">Failed to load job.</div>';
    });
};

window.editRecruiterJob = function(jobId) {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Edit Job</h2><form id="edit-job-form">Loading...</form></div>`;
  apiRequest(ENDPOINTS.jobs + jobId + '/')
    .then(job => {
      document.getElementById('edit-job-form').innerHTML = `
        <input type="text" name="title" placeholder="Job Title" value="${job.title || ''}" required />
        <input type="text" name="location" placeholder="Location" value="${job.location || ''}" required />
        <input type="text" name="department" placeholder="Department" value="${job.department || ''}" required />
        <input type="number" name="salary" placeholder="Salary" value="${job.salary || ''}" required />
        <select name="pay_unit" required>
          <option value="hourly" ${job.pay_unit === 'hourly' ? 'selected' : ''}>Hourly</option>
          <option value="daily" ${job.pay_unit === 'daily' ? 'selected' : ''}>Daily</option>
          <option value="weekly" ${job.pay_unit === 'weekly' ? 'selected' : ''}>Weekly</option>
          <option value="monthly" ${job.pay_unit === 'monthly' ? 'selected' : ''}>Monthly</option>
          <option value="yearly" ${job.pay_unit === 'yearly' ? 'selected' : ''}>Yearly</option>
          <option value="per_shift" ${job.pay_unit === 'per_shift' ? 'selected' : ''}>Per Shift</option>
        </select>
        <select name="job_type" required>
          <option value="full_time" ${job.job_type === 'full_time' ? 'selected' : ''}>Full Time</option>
          <option value="part_time" ${job.job_type === 'part_time' ? 'selected' : ''}>Part Time</option>
          <option value="contract" ${job.job_type === 'contract' ? 'selected' : ''}>Contract</option>
          <option value="temporary" ${job.job_type === 'temporary' ? 'selected' : ''}>Temporary</option>
          <option value="locum" ${job.job_type === 'locum' ? 'selected' : ''}>Locum</option>
        </select>
        <input type="number" name="experience_required" placeholder="Experience Required (years)" min="0" value="${job.experience_required || 0}" required />
        <textarea name="description" placeholder="Job Description" required>${job.description || ''}</textarea>
        <button class="button" type="submit">Save Changes</button>
        <button class="button" type="button" onclick="renderRecruiterJobs()">Cancel</button>
      `;
      document.getElementById('edit-job-form').onsubmit = async e => {
        e.preventDefault();
        const form = e.target;
        try {
          await apiRequest(ENDPOINTS.jobs + jobId + '/', {
            method: 'PATCH',
            body: {
              title: form.title.value,
              location: form.location.value,
              department: form.department.value,
              salary: form.salary.value,
              pay_unit: form.pay_unit.value,
              job_type: form.job_type.value,
              experience_required: form.experience_required.value,
              description: form.description.value
            }
          });
          showMessage('Job updated!', 'success');
          renderRecruiterJobs();
        } catch (err) {
          showMessage('Failed to update job', 'error');
        }
      };
    })
    .catch(() => {
      document.getElementById('edit-job-form').innerHTML = '<p>Failed to load job details.</p>';
    });
};

window.deleteRecruiterJob = async function(jobId) {
  if (!confirm('Are you sure you want to delete this job?')) return;
  try {
    await apiRequest(ENDPOINTS.jobs + jobId + '/', { method: 'DELETE' });
    showMessage('Job deleted!', 'success');
    renderRecruiterJobs();
  } catch (err) {
    showMessage('Failed to delete job', 'error');
  }
};

window.viewRecruiterApplications = function(jobId) {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Applicants for Job #${jobId}</h2><div id="recruiter-applications-list">Loading...</div><button class="button" onclick="renderRecruiterJobs()">Back to My Jobs</button></div>`;
  apiRequest(ENDPOINTS.jobApplications(jobId))
    .then(data => {
      const apps = Array.isArray(data) ? data : data.results || [];
      document.getElementById('recruiter-applications-list').innerHTML = apps.length ? apps.map(app => `
        <div class="card flex-between">
          <div>
            <strong>${app.candidate_details?.full_name || ''}</strong><br>
            <span>Status: <b>${app.status || '-'}</b><br>
            <span>Applied on: ${app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '-'}<br>
            <span>Experience: ${app.candidate_details?.experience_years ?? '-'} years<br>
            <span>Email: ${app.candidate_details?.email || '-'}<br>
          </div>
          <div>
            <select onchange="updateApplicationStatus(${app.id}, this.value)">
              <option value="">Change Status</option>
              <option value="shortlisted">Shortlist</option>
              <option value="interviewed">Interview</option>
              <option value="hired">Hire</option>
              <option value="rejected">Reject</option>
            </select>
            <button class="button" onclick="initiateMessaging(${app.candidate_details?.id})">Message</button>
          </div>
        </div>
      `).join('') : '<p>No applicants yet.</p>';
    })
    .catch(() => {
      document.getElementById('recruiter-applications-list').innerHTML = '<p>Failed to load applicants.</p>';
    });
};

window.updateApplicationStatus = async function(appId, status) {
  try {
    await apiRequest(ENDPOINTS.applicationDetail(appId), { method: 'PATCH', body: { status } });
    showMessage('Application status updated!', 'success');
    // Reload the applications list if present
    if (window.location.hash.startsWith('#/recruiter-applications')) {
      renderRecruiterApplications();
    } else if (window.location.hash.startsWith('#/recruiter-jobs')) {
      // If on job-specific applications view, reload that job's applications
      const match = window.location.hash.match(/viewRecruiterApplications\((\d+)\)/);
      if (match) {
        viewRecruiterApplications(Number(match[1]));
      } else {
        renderRecruiterJobs();
      }
    }
  } catch (err) {
    showMessage('Failed to update status', 'error');
  }
};

// Applications page for recruiter (all jobs)
function renderRecruiterApplications() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>All Applications</h2><div id="recruiter-applications-list">Loading...</div></div>`;
  apiRequest(ENDPOINTS.applications)
    .then(data => {
      const apps = Array.isArray(data) ? data : data.results || [];
      document.getElementById('recruiter-applications-list').innerHTML = apps.length ? apps.map(app => `
        <div class="card flex-between">
          <div>
            <strong>Job:</strong> ${app.job_details?.title || ''}<br>
            <strong>Candidate:</strong> ${app.candidate_details?.full_name || ''}<br>
            <span>Status: <b>${app.status || '-'}</b><br>
            <span>Applied on: ${app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '-'}<br>
            <span>Experience: ${app.candidate_details?.experience_years ?? '-'} years<br>
            <span>Email: ${app.candidate_details?.email || '-'}<br>
          </div>
          <div>
            <select onchange="updateApplicationStatus(${app.id}, this.value)">
              <option value="">Change Status</option>
              <option value="shortlisted">Shortlist</option>
              <option value="interviewed">Interview</option>
              <option value="hired">Hire</option>
              <option value="rejected">Reject</option>
            </select>
            <button class="button" onclick="initiateMessaging(${app.candidate_details?.id}, '${app.candidate_details?.full_name || ''}')">Message</button>
          </div>
        </div>
      `).join('') : '<p>No applications yet.</p>';
    })
    .catch(() => {
      document.getElementById('recruiter-applications-list').innerHTML = '<p>Failed to load applications.</p>';
    });
}

// Placeholder for Redis-based messaging integration
window.initiateMessaging = function(candidateId, candidateName) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const recruiterId = user.id || 'recruiter';
  const roomName = `recruiter_${recruiterId}_candidate_${candidateId}`;
  openChatUI(roomName, candidateName, candidateId);
  // Also show the main messages interface for full chat access
  setTimeout(() => {
    if (window.renderMessages) renderMessages();
  }, 500);
};

// Matches page for recruiter
function renderRecruiterMatches() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Matches</h2><div id="recruiter-matches-list">Loading...</div></div>`;
  apiRequest(ENDPOINTS.jobMatches)
    .then(data => {
      const matches = Array.isArray(data) ? data : data.results || [];
      document.getElementById('recruiter-matches-list').innerHTML = matches.length ? matches.map(match => `
        <div class="card flex-between">
          <div>
            <strong>${match.job_details?.title || ''}</strong><br>
            <span>Candidate: ${match.candidate_details?.full_name || ''}</span><br>
            <span>Matching Score: ${match.matching_score ?? '-'}</span><br>
            <span>Shortlisted: ${match.shortlisted ? 'Yes' : 'No'}</span>
          </div>
          <button class="button" onclick="initiateMessaging(${match.candidate_details?.id})">Message</button>
        </div>
      `).join('') : '<p>No matches found.</p>';
    })
    .catch(() => {
      document.getElementById('recruiter-matches-list').innerHTML = '<p>Failed to load matches.</p>';
    });
}

// Expose recruiter page functions globally for router
window.renderRecruiterDashboard = renderRecruiterDashboard;
window.renderRecruiterJobs = renderRecruiterJobs;
window.renderRecruiterApplications = renderRecruiterApplications;
window.renderRecruiterMatches = renderRecruiterMatches;
