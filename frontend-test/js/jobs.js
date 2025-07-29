// Jobs page with search, apply, and detail view
function renderJobs() {
  document.getElementById('main-content').innerHTML = `
    <div class="container">
      <h2>Jobs</h2>
      <form id="job-search-form" class="flex">
        <input type="text" name="q" placeholder="Search jobs..." />
        <button class="button" type="submit">Search</button>
      </form>
      <div id="jobs-list">Loading...</div>
      <div style="margin-top:1rem;">
        <button class="button" onclick="renderMyApplications()">My Applications</button>
        <button class="button" onclick="renderMyMatches()">My Matches</button>
      </div>
    </div>
  `;
  loadJobs();
  document.getElementById('job-search-form').onsubmit = e => {
    e.preventDefault();
    loadJobs(e.target.q.value);
  };
}

function loadJobs(query = '') {
  let url = ENDPOINTS.jobs;
  if (query) url = ENDPOINTS.jobSearch + `?q=${encodeURIComponent(query)}`;
  apiRequest(url)
    .then(data => {
      const jobs = Array.isArray(data) ? data : data.results || [];
      document.getElementById('jobs-list').innerHTML = jobs.map(job => `
        <div class="card flex-between">
          <div>
            <strong>${job.title}</strong><br>
            <span>${job.location || ''}</span><br>
            <span>Status: ${job.has_applied ? 'Applied' : 'Not Applied'}</span><br>
            <span>Matched: ${job.is_matched ? 'Yes' : 'No'}</span>
          </div>
          ${job.has_applied ? `<span class='card'>${job.application_status || 'Applied'}</span>` : `<button class="button" onclick="applyToJob(${job.id})">Apply</button>`}
          <button class="button" onclick="viewJob(${job.id})">View</button>
        </div>
      `).join('') || '<p>No jobs found.</p>';
    })
    .catch(() => {
      document.getElementById('jobs-list').innerHTML = '<p>Failed to load jobs.</p>';
    });
}

window.applyToJob = async function(jobId) {
  try {
    await apiRequest(ENDPOINTS.jobApplications(jobId), { method: 'POST', body: { cover_letter: 'Interested!' } });
    showMessage('Applied to job!', 'success');
    renderJobs();
  } catch (err) {
    showMessage(err.data?.detail || err.data?.error || 'Failed to apply', 'error');
  }
};

window.viewJob = function(jobId) {
  renderJobDetail(jobId);
};

function renderJobDetail(jobId) {
  document.getElementById('main-content').innerHTML = '<div class="container">Loading job...</div>';
  apiRequest(ENDPOINTS.jobs + jobId + '/')
    .then(job => {
      document.getElementById('main-content').innerHTML = `
        <div class="container">
          <h2>${job.title}</h2>
          <div class="card">
            <strong>Location:</strong> ${job.location || ''}<br>
            <strong>Description:</strong> ${job.description || ''}<br>
            <strong>Posted by:</strong> ${job.employer_details?.hospital_name || ''}<br>
            <strong>Status:</strong> ${job.has_applied ? 'Applied' : 'Not Applied'}<br>
            <strong>Application Status:</strong> ${job.application_status || '-'}<br>
            <strong>Matched:</strong> ${job.is_matched ? 'Yes' : 'No'}<br>
            <strong>Matching Score:</strong> ${job.matching_score ?? '-'}<br>
            ${job.has_applied ? `<span class='card'>Already applied</span>` : `<button class="button" onclick="applyToJob(${job.id})">Apply</button>`}
            <button class="button" onclick="renderJobs()">Back to Jobs</button>
          </div>
        </div>
      `;
    })
    .catch(() => {
      document.getElementById('main-content').innerHTML = '<div class="container">Failed to load job.</div>';
    });
}

// My Applications
window.renderMyApplications = function() {
  document.getElementById('main-content').innerHTML = '<div class="container"><h2>My Applications</h2><div id="my-applications-list">Loading...</div><button class="button" onclick="renderJobs()">Back to Jobs</button></div>';
  apiRequest(ENDPOINTS.applications)
    .then(data => {
      const apps = Array.isArray(data) ? data : data.results || [];
      document.getElementById('my-applications-list').innerHTML = apps.map(app => `
        <div class="card flex-between">
          <div>
            <strong>${app.job_details?.title || ''}</strong><br>
            <span>Status: ${app.status || '-'}</span><br>
            <span>Applied on: ${app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '-'}</span>
          </div>
          <button class="button" onclick="viewJob(${app.job})">View Job</button>
        </div>
      `).join('') || '<p>No applications found.</p>';
    })
    .catch(() => {
      document.getElementById('my-applications-list').innerHTML = '<p>Failed to load applications.</p>';
    });
}

// My Matches
window.renderMyMatches = function() {
  document.getElementById('main-content').innerHTML = '<div class="container"><h2>My Matches</h2><div id="my-matches-list">Loading...</div><button class="button" onclick="renderJobs()">Back to Jobs</button></div>';
  apiRequest(ENDPOINTS.jobMatches)
    .then(data => {
      const matches = Array.isArray(data) ? data : data.results || [];
      document.getElementById('my-matches-list').innerHTML = matches.map(match => `
        <div class="card flex-between">
          <div>
            <strong>${match.job_details?.title || ''}</strong><br>
            <span>Matching Score: ${match.matching_score ?? '-'}</span><br>
            <span>Shortlisted: ${match.shortlisted ? 'Yes' : 'No'}</span>
          </div>
          <button class="button" onclick="viewJob(${match.job})">View Job</button>
        </div>
      `).join('') || '<p>No matches found.</p>';
    })
    .catch(() => {
      document.getElementById('my-matches-list').innerHTML = '<p>Failed to load matches.</p>';
    });
}
