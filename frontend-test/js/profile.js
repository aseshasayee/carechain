// Profile page with edit and document upload
function renderProfile() {
  document.getElementById('main-content').innerHTML = `<div class="container"><h2>Profile</h2><div id="profile-data">Loading...</div></div>`;
  Promise.all([
    apiRequest(ENDPOINTS.candidateProfile),
    apiRequest(ENDPOINTS.verificationStatus)
  ]).then(([profile, verification]) => {
    document.getElementById('profile-data').innerHTML = `
      <form id="profile-form">
        <div class="card">
          <label>Email: <input type="email" name="email" value="${profile.user_email || ''}" disabled /></label><br>
          <label>Full Name: <input type="text" name="full_name" value="${profile.full_name || ''}" /></label><br>
          <label>Phone: <input type="text" name="phone" value="${profile.contact_number || ''}" /></label><br>
          <label>DOB: <input type="date" name="dob" value="${profile.dob || ''}" /></label><br>
          <label>Gender: <input type="text" name="gender" value="${profile.gender || ''}" /></label><br>
          <label>Location: <input type="text" name="location" value="${profile.location || ''}" /></label><br>
          <button class="button" type="submit">Update Profile</button>
        </div>
      </form>
      <div class="card">
        <h3>Verification & Quotas</h3>
        <ul>
          <li><strong>Verification Status:</strong> ${verification.verification_status || 'pending'}</li>
          <li><strong>Profile Complete:</strong> ${verification.profile_complete ? 'Yes' : 'No'}</li>
          <li><strong>Aadhaar Verified:</strong> ${verification.aadhaar_verified ? 'Yes' : 'No'}
            ${!verification.aadhaar_verified ? `<form id="aadhaar-form" style="display:inline;"><input type="text" name="aadhaar_number" placeholder="Aadhaar Number" maxlength="12" pattern="\\d{12}" required><button class="button" type="submit">Verify Aadhaar</button></form>` : ''}
          </li>
          <li><strong>Documents Uploaded:</strong> ${verification.documents_count || 0} (${verification.verified_documents_count || 0} verified)</li>
          <li><strong>Proof Ready:</strong> ${verification.is_proof_ready ? 'Yes' : 'No'}</li>
        </ul>
        <ul>
          <li><strong>Monthly Application Quota:</strong> ${profile.monthly_application_count || 0} / ${profile.monthly_application_quota || 50}</li>
          <li><strong>Monthly Job View Quota:</strong> ${profile.monthly_job_viewed_count || 0} / ${profile.monthly_job_viewed_quota || 100}</li>
        </ul>
      </div>
      <div class="card">
        <h3>Upload Document</h3>
        <form id="doc-upload-form">
          <input type="file" name="file" required />
          <button class="button" type="submit">Upload</button>
        </form>
      </div>
      <div class="card">
        <h3>Supporting Documents</h3>
        <ul>
          ${(profile.supporting_documents && profile.supporting_documents.length) ? profile.supporting_documents.map(doc => `<li>${doc.file_name || doc.file || 'Document'} - ${doc.verified ? 'Verified' : 'Pending'}</li>`).join('') : '<li>No documents uploaded.</li>'}
        </ul>
      </div>
    `;
    document.getElementById('profile-form').onsubmit = async e => {
      e.preventDefault();
      const form = e.target;
      try {
        await apiRequest(ENDPOINTS.candidateProfile, {
          method: 'PUT',
          body: {
            first_name: form.full_name.value.split(' ')[0] || '',
            last_name: form.full_name.value.split(' ').slice(1).join(' ') || '',
            contact_number: form.phone.value,
            dob: form.dob.value,
            gender: form.gender.value,
            location: form.location.value
          }
        });
        showMessage('Profile updated!', 'success');
        renderProfile();
      } catch (err) {
        showMessage('Update failed', 'error');
      }
    };
    const aadhaarForm = document.getElementById('aadhaar-form');
    if (aadhaarForm) {
      aadhaarForm.onsubmit = async e => {
        e.preventDefault();
        const aadhaar = aadhaarForm.aadhaar_number.value;
        try {
          await apiRequest(API_BASE + '/profiles/verify-aadhaar/', {
            method: 'POST',
            body: { aadhaar_number: aadhaar }
          });
          showMessage('Aadhaar verified!', 'success');
          renderProfile();
        } catch (err) {
          showMessage('Aadhaar verification failed', 'error');
        }
      };
    }
    document.getElementById('doc-upload-form').onsubmit = async e => {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData();
      fd.append('file', form.file.files[0]);
      try {
        await apiRequest(ENDPOINTS.supportingDocuments, {
          method: 'POST',
          body: fd
        });
        showMessage('Document uploaded!', 'success');
        renderProfile();
      } catch (err) {
        showMessage('Upload failed', 'error');
      }
    };
  }).catch(() => {
    document.getElementById('profile-data').innerHTML = '<p>Failed to load profile.</p>';
  });
}
