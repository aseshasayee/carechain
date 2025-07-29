# API Reference

This document provides a comprehensive reference for all backend API endpoints, grouped by module, with example requests and responses. Use this as a guide for frontend integration.

---

## Authentication & Accounts

### Register User
- **POST** `/api/accounts/register/`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "role": "candidate"  // or "recruiter"
}
```
- **Response:**
```json
{
  "message": "Registration successful. Please verify your email."
}
```

### Login (Candidate)
- **POST** `/api/accounts/login/`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
- **Response:**
```json
{
  "access": "<jwt_token>",
  "refresh": "<refresh_token>",
  "user": { ... }
}
```

### Login (Recruiter)
- **POST** `/api/accounts/recruiter-login/`

### Login (Admin)
- **POST** `/api/accounts/admin-login/`

### Verify Email
- **POST** `/api/accounts/verify-email/`
- **Body:** `{ "token": "<verification_token>" }`

### Get/Update Profile
- **GET/PUT** `/api/accounts/profile/`

### Change Password
- **POST** `/api/accounts/change-password/`
- **Body:** `{ "old_password": "...", "new_password": "..." }`

---

## Jobs

### List/Create Jobs
- **GET/POST** `/api/jobs/`

### Job Detail
- **GET/PUT/DELETE** `/api/jobs/<job_id>/`

### Apply to Job
- **POST** `/api/jobs/<job_id>/applications/`
- **Body:** `{ "cover_letter": "..." }`

### List Applications (all jobs)
- **GET** `/api/jobs/applications/`

### Application Detail
- **GET/PUT/DELETE** `/api/jobs/applications/<application_id>/`

### Job Matches
- **GET** `/api/jobs/matches/`

### Active Jobs
- **GET** `/api/jobs/active/`
- **GET** `/api/jobs/active/<job_id>/`

### Completed Jobs
- **GET** `/api/jobs/completed/`

### Job Search
- **GET** `/api/jobs/search/?q=...`
- **GET** `/api/jobs/advanced-search/?location=...&role=...`

---

## Profiles

### Candidate Profile
- **GET/PUT** `/api/profiles/candidate/`

### Recruiter Profile
- **GET/PUT** `/api/profiles/recruiter/`

### Verification Status
- **GET** `/api/profiles/verification-status/`

#### Admin Endpoints
- **GET** `/api/profiles/pending-verifications/`
- **GET** `/api/profiles/verified-profiles/`
- **GET** `/api/profiles/rejected-verifications/`
- **GET** `/api/profiles/pending-hospital-verifications/`
- **GET** `/api/profiles/verified-hospitals/`
- **GET** `/api/profiles/rejected-hospital-verifications/`
- **GET** `/api/profiles/candidate-details/<id>/`
- **GET** `/api/profiles/hospital-details/<id>/`
- **POST** `/api/profiles/approve-verification/<id>/`
- **POST** `/api/profiles/reject-verification/<id>/`
- **POST** `/api/profiles/approve-hospital-verification/<id>/`
- **POST** `/api/profiles/reject-hospital-verification/<id>/`

---

## Documents

### Supporting Documents
- **GET/POST** `/api/documents/supporting-documents/`
- **GET/PUT/DELETE** `/api/documents/supporting-documents/<id>/`

### Licensures
- **GET/POST** `/api/documents/licensures/`
- **GET/PUT/DELETE** `/api/documents/licensures/<id>/`

### Qualifications
- **GET/POST** `/api/documents/qualifications/`
- **GET/PUT/DELETE** `/api/documents/qualifications/<id>/`

### Skills
- **GET/POST** `/api/documents/skills/`
- **GET/PUT/DELETE** `/api/documents/skills/<id>/`

### Master Data
- **GET** `/api/documents/qualification-masters/`
- **GET** `/api/documents/skill-masters/`

---

## Notifications

### List Notifications
- **GET** `/api/notifications/`

### Notification Detail
- **GET** `/api/notifications/<id>/`

### Mark All Read
- **POST** `/api/notifications/mark-all-read/`

### Email Notifications
- **GET** `/api/notifications/emails/`

### Chat Rooms
- **GET** `/api/notifications/rooms/`
- **GET** `/api/notifications/rooms/<id>/`

### Chat Messages
- **GET** `/api/notifications/rooms/<room_id>/messages/`
- **POST** `/api/notifications/rooms/<room_id>/mark-read/`

### Direct Message
- **POST** `/api/notifications/direct-message/`

### User Presence
- **GET** `/api/notifications/presence/`

### Contacts
- **GET** `/api/notifications/contacts/`

---

## Messaging

### Chat Rooms
- **GET/POST** `/api/messaging/rooms/`
- **GET/PUT/DELETE** `/api/messaging/rooms/<uuid>/`

### Messages
- **GET/POST** `/api/messaging/rooms/<uuid>/messages/`
- **POST** `/api/messaging/rooms/<uuid>/mark-read/`

### Online Status
- **GET** `/api/messaging/online-status/`

### Chat Summary
- **GET** `/api/messaging/summary/`

---

## Attendance

### Attendance
- **GET/POST** `/api/attendance/`
- **GET/PUT/DELETE** `/api/attendance/<id>/`

### Absence Notifications
- **GET/POST** `/api/attendance/absences/`
- **GET/PUT/DELETE** `/api/attendance/absences/<id>/`

### Attendance Summaries
- **GET** `/api/attendance/summaries/`

---

## Admin API

### Dashboard Stats
- **GET** `/api/admin/dashboard-stats/`

### Recent Activity
- **GET** `/api/admin/recent-activity/`

### User Management
- **GET/POST** `/api/admin/users/`

---

## Notes
- All endpoints require authentication unless otherwise specified.
- Use JWT tokens in the `Authorization: Bearer <token>` header.
- For file uploads, use `multipart/form-data`.
- For paginated endpoints, use `?page=1` etc.

---

## Example: Authenticated Request

```http
GET /api/jobs/active/ HTTP/1.1
Host: yourdomain.com
Authorization: Bearer <jwt_token>
```

---

For more details on request/response bodies, see the backend README or contact the backend team.
