# Job Portal API Reference

This document lists all available API endpoints organized by functionality. All endpoints are prefixed with the base URL.

Base URL: `http://localhost:8000/api/`

## Authentication & User Management APIs

### Accounts
- `POST /accounts/register/` - Register new user
- `POST /accounts/login/` - User login
- `POST /accounts/verify-email/` - Verify email address
- `GET /accounts/profile/` - Get user profile
- `PUT /accounts/profile/` - Update user profile
- `POST /accounts/change-password/` - Change user password
- `GET /accounts/statistics/` - Get public statistics

### Hospital Authentication
- `POST /profiles/hospital-register/` - Register hospital
- `POST /profiles/hospital-login/` - Hospital login

## Job Management APIs

### Jobs
- `GET /jobs/` - List all jobs
- `POST /jobs/` - Create new job
- `GET /jobs/{id}/` - Get job details
- `PUT /jobs/{id}/` - Update job
- `DELETE /jobs/{id}/` - Delete job

### Job Applications
- `GET /jobs/applications/` - List all applications
- `POST /jobs/applications/` - Create job application
- `GET /jobs/applications/{id}/` - Get application details
- `PUT /jobs/applications/{id}/` - Update application
- `DELETE /jobs/applications/{id}/` - Delete application
- `GET /jobs/{job_id}/applications/` - Get applications for specific job
- `PUT /jobs/applications/{id}/status/` - Update application status

### Active & Completed Jobs
- `GET /jobs/active/` - List active jobs
- `GET /jobs/active/{id}/` - Get active job details
- `GET /jobs/completed/` - List completed jobs

### Job Search
- `GET /jobs/search/` - Basic job search
- `GET /jobs/advanced-search/` - Advanced job search

### Job Candidates
- `GET /jobs/{job_id}/candidates/` - Get candidates for a job
- `GET /jobs/candidates/search/` - Search candidates

### Hospital Statistics
- `GET /jobs/hospital-stats/` - Get hospital statistics

## Interview Management APIs

### Interviews
- `GET /jobs/interviews/` - List interviews
- `POST /jobs/interviews/` - Schedule interview
- `GET /jobs/interviews/{id}/` - Get interview details
- `PUT /jobs/interviews/{id}/` - Update interview
- `DELETE /jobs/interviews/{id}/` - Delete interview
- `POST /jobs/interviews/{id}/confirm/` - Confirm interview

## Feedback APIs

### Feedback
- `GET /jobs/feedback/` - List feedback
- `POST /jobs/feedback/` - Submit feedback
- `GET /jobs/feedback/{id}/` - Get feedback details
- `PUT /jobs/feedback/{id}/` - Update feedback
- `DELETE /jobs/feedback/{id}/` - Delete feedback

## Job Matching & Recommendations APIs

### Job Matching
- `GET /matching/recommendations/` - Get job recommendations
- `GET /matching/recommendations/summary/` - Get match summary
- `POST /matching/run-matching/` - Run job matching algorithm
- `GET /matching/matches/` - List job matches
- `POST /matching/jobs/{job_id}/viewed/` - Mark job as viewed

### Candidate Preferences
- `GET /matching/preferences/` - Get candidate preferences
- `POST /matching/preferences/` - Set candidate preferences
- `PUT /matching/preferences/` - Update candidate preferences

### Feedback & History
- `POST /matching/feedback/` - Submit recommendation feedback
- `GET /matching/search-history/` - Get search history

### Statistics & Settings
- `GET /matching/stats/` - Get matching statistics
- `GET /matching/settings/` - Get auto-matching settings
- `PUT /matching/settings/` - Update auto-matching settings

## Profile Management APIs

### User Profiles
- `GET /profiles/candidate/` - Get candidate profile
- `PUT /profiles/candidate/` - Update candidate profile
- `GET /profiles/recruiter/` - Get recruiter profile
- `PUT /profiles/recruiter/` - Update recruiter profile

### Profile Verification
- `GET /profiles/verification-status/` - Get verification status
- `GET /profiles/verified-profiles/` - List verified profiles
- `POST /profiles/candidate-verification/` - Submit candidate verification
- `POST /profiles/hospital-verification/` - Submit hospital verification

### Admin Verification Management
- `GET /profiles/pending-verifications/` - List pending verifications
- `GET /profiles/rejected-verifications/` - List rejected verifications
- `GET /profiles/candidate/{id}/` - Get candidate details
- `GET /profiles/hospital/{id}/` - Get hospital details
- `POST /profiles/approve-verification/{id}/` - Approve verification
- `POST /profiles/reject-verification/{id}/` - Reject verification

### Hospital Verification
- `GET /profiles/pending-hospital-verifications/` - List pending hospital verifications
- `GET /profiles/verified-hospitals/` - List verified hospitals
- `GET /profiles/rejected-hospital-verifications/` - List rejected hospital verifications
- `POST /profiles/approve-hospital-verification/{id}/` - Approve hospital verification
- `POST /profiles/reject-hospital-verification/{id}/` - Reject hospital verification

## Document Management APIs

### Supporting Documents
- `GET /documents/supporting-documents/` - List supporting documents
- `POST /documents/supporting-documents/` - Upload supporting document
- `GET /documents/supporting-documents/{id}/` - Get document details
- `PUT /documents/supporting-documents/{id}/` - Update document
- `DELETE /documents/supporting-documents/{id}/` - Delete document

### Licensures
- `GET /documents/licensures/` - List licensures
- `POST /documents/licensures/` - Add licensure
- `GET /documents/licensures/{id}/` - Get licensure details
- `PUT /documents/licensures/{id}/` - Update licensure
- `DELETE /documents/licensures/{id}/` - Delete licensure

### Qualifications
- `GET /documents/qualifications/` - List qualifications
- `POST /documents/qualifications/` - Add qualification
- `GET /documents/qualifications/{id}/` - Get qualification details
- `PUT /documents/qualifications/{id}/` - Update qualification
- `DELETE /documents/qualifications/{id}/` - Delete qualification

### Skills
- `GET /documents/skills/` - List skills
- `POST /documents/skills/` - Add skill
- `GET /documents/skills/{id}/` - Get skill details
- `PUT /documents/skills/{id}/` - Update skill
- `DELETE /documents/skills/{id}/` - Delete skill

### Master Data
- `GET /documents/qualification-masters/` - List qualification masters
- `GET /documents/skill-masters/` - List skill masters

## Employee Management APIs

### Employment
- `GET /employee-management/employment/` - List employment records
- `POST /employee-management/employment/` - Create employment record
- `GET /employee-management/employment/{id}/` - Get employment details
- `PUT /employee-management/employment/{id}/` - Update employment
- `DELETE /employee-management/employment/{id}/` - Delete employment

### Employee Availability
- `GET /employee-management/availability/` - List availability records
- `POST /employee-management/availability/` - Set availability
- `GET /employee-management/availability/check/` - Check employee availability

### Performance Reviews
- `GET /employee-management/performance/` - List performance reviews
- `POST /employee-management/performance/` - Create performance review

### Absence Management
- `GET /employee-management/absence-requests/` - List absence requests
- `POST /employee-management/absence-requests/` - Submit absence request
- `POST /employee-management/absence-requests/{id}/approve/` - Approve/reject absence

## Admin APIs

### Dashboard & Analytics
- `GET /admin/dashboard-stats/` - Get dashboard statistics
- `GET /admin/recent-activity/` - Get recent activity
- `GET /admin/users/` - List users (admin only)

## Invitation System APIs

### Job Invitations
- `POST /jobs/invite-to-apply/` - Invite candidate to apply for job

## Notes

1. **Authentication**: Most endpoints require authentication. Use Bearer token in Authorization header.
2. **HTTP Methods**: 
   - GET: Retrieve data
   - POST: Create new resource
   - PUT: Update existing resource
   - DELETE: Remove resource
3. **Path Parameters**: `{id}`, `{job_id}`, etc. should be replaced with actual numeric IDs
4. **Response Format**: All APIs return JSON responses
5. **Error Handling**: Standard HTTP status codes are used (200, 201, 400, 401, 404, 500)

## Example Usage

```
GET /api/jobs/
Authorization: Bearer your-jwt-token

POST /api/jobs/applications/
Authorization: Bearer your-jwt-token
Content-Type: application/json
```
