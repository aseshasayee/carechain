# CareChain API Documentation

## Overview

The CareChain API provides endpoints for managing the healthcare job portal platform. It includes functionality for user authentication, profile management, job management, messaging, and more.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8000/api/
```

## Authentication

CareChain uses JWT (JSON Web Token) authentication for API access.

### Authentication Endpoints

#### Obtain Token

```
POST /token/
```

Obtain a JWT token by providing valid credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1..."
}
```

#### Refresh Token

```
POST /token/refresh/
```

Obtain a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1..."
}
```

## Accounts

### User Registration and Management

#### Register User

```
POST /accounts/register/
```

Register a new user account (candidate or recruiter).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "candidate"  // or "recruiter"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "candidate",
  "is_email_verified": false
}
```

#### Verify Email

```
POST /accounts/verify-email/
```

Verify user's email using verification token.

**Request Body:**
```json
{
  "token": "verification-token-sent-to-email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

#### User Profile

```
GET /accounts/profile/
```

Retrieve the current user's account information.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "candidate",
  "is_email_verified": true
}
```

#### Change Password

```
POST /accounts/change-password/
```

Change the current user's password.

**Request Body:**
```json
{
  "old_password": "oldpassword",
  "new_password": "newpassword"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

## Profiles

### Candidate Profile

#### Get Candidate Profile

```
GET /profiles/candidate/
```

Retrieve the current candidate user's profile.

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "phone_number": "+911234567890",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "aadhaar_number": "123456789012",
  "is_aadhaar_verified": true,
  "is_profile_verified": false,
  "verification_status": "pending",
  "bio": "Experienced healthcare professional",
  "profile_image": "/media/profiles/user1.jpg",
  "specialization": "Cardiology",
  "years_of_experience": 5
}
```

#### Update Candidate Profile

```
PUT /profiles/candidate/
```

Update the current candidate user's profile.

**Request Body:**
```json
{
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "phone_number": "+911234567890",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "bio": "Experienced healthcare professional",
  "specialization": "Cardiology",
  "years_of_experience": 5
}
```

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "phone_number": "+911234567890",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "aadhaar_number": "123456789012",
  "is_aadhaar_verified": true,
  "is_profile_verified": false,
  "verification_status": "pending",
  "bio": "Experienced healthcare professional",
  "profile_image": "/media/profiles/user1.jpg",
  "specialization": "Cardiology",
  "years_of_experience": 5
}
```

#### Verify Aadhaar

```
POST /profiles/verify-aadhaar/
```

Submit Aadhaar details for verification.

**Request Body:**
```json
{
  "aadhaar_number": "123456789012",
  "aadhaar_front_image": "[base64 encoded image]",
  "aadhaar_back_image": "[base64 encoded image]"
}
```

**Response:**
```json
{
  "message": "Aadhaar verification submitted successfully"
}
```

### Recruiter Profile

#### Get Recruiter Profile

```
GET /profiles/recruiter/
```

Retrieve the current recruiter user's profile.

**Response:**
```json
{
  "id": 1,
  "user": 2,
  "hospital_name": "ABC Hospital",
  "hospital_type": "private",
  "hospital_address": "456 Hospital Lane",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "registration_number": "HOSP123456",
  "is_profile_verified": true,
  "verification_status": "approved",
  "logo": "/media/profiles/hospital1.jpg",
  "website": "https://hospital.com",
  "description": "A multi-specialty hospital"
}
```

#### Update Recruiter Profile

```
PUT /profiles/recruiter/
```

Update the current recruiter user's profile.

**Request Body:**
```json
{
  "hospital_name": "ABC Hospital",
  "hospital_type": "private",
  "hospital_address": "456 Hospital Lane",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "website": "https://hospital.com",
  "description": "A multi-specialty hospital"
}
```

**Response:**
```json
{
  "id": 1,
  "user": 2,
  "hospital_name": "ABC Hospital",
  "hospital_type": "private",
  "hospital_address": "456 Hospital Lane",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "registration_number": "HOSP123456",
  "is_profile_verified": true,
  "verification_status": "approved",
  "logo": "/media/profiles/hospital1.jpg",
  "website": "https://hospital.com",
  "description": "A multi-specialty hospital"
}
```

## Jobs

### Job Management

#### List/Create Jobs

```
GET /jobs/
POST /jobs/
```

List all jobs (filtered based on user role) or create a new job.

**Create Job Request Body:**
```json
{
  "title": "Cardiologist Required",
  "description": "We are looking for an experienced cardiologist",
  "location": "Mumbai",
  "department": "Cardiology",
  "job_type": "full_time",
  "salary": 150000,
  "start_date": "2023-08-01",
  "end_date": null,
  "qualifications": ["MBBS", "MD"],
  "skills": ["Patient care", "ECG"],
  "experience_required": 3,
  "vacancies": 2
}
```

**List Jobs Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Cardiologist Required",
      "description": "We are looking for an experienced cardiologist",
      "location": "Mumbai",
      "department": "Cardiology",
      "job_type": "full_time",
      "salary": 150000,
      "start_date": "2023-08-01",
      "end_date": null,
      "qualifications": ["MBBS", "MD"],
      "skills": ["Patient care", "ECG"],
      "experience_required": 3,
      "vacancies": 2,
      "is_filled": false,
      "is_active": true,
      "created_at": "2023-07-15T10:30:00Z",
      "employer": {
        "id": 1,
        "hospital_name": "ABC Hospital"
      }
    }
  ]
}
```

#### Retrieve/Update/Delete Job

```
GET /jobs/{id}/
PUT /jobs/{id}/
DELETE /jobs/{id}/
```

Get details of a specific job, update a job, or delete a job.

**Response:**
```json
{
  "id": 1,
  "title": "Cardiologist Required",
  "description": "We are looking for an experienced cardiologist",
  "location": "Mumbai",
  "department": "Cardiology",
  "job_type": "full_time",
  "salary": 150000,
  "start_date": "2023-08-01",
  "end_date": null,
  "qualifications": ["MBBS", "MD"],
  "skills": ["Patient care", "ECG"],
  "experience_required": 3,
  "vacancies": 2,
  "is_filled": false,
  "is_active": true,
  "created_at": "2023-07-15T10:30:00Z",
  "employer": {
    "id": 1,
    "hospital_name": "ABC Hospital"
  }
}
```

### Job Applications

#### List/Create Job Applications

```
GET /jobs/applications/
POST /jobs/applications/
```

List user's job applications or create a new job application.

**Create Application Request Body:**
```json
{
  "job": 1,
  "cover_letter": "I am very interested in this position...",
  "expected_salary": 160000
}
```

**List Applications Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "job": {
        "id": 1,
        "title": "Cardiologist Required",
        "employer": {
          "id": 1,
          "hospital_name": "ABC Hospital"
        }
      },
      "candidate": {
        "id": 1,
        "user": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe"
        }
      },
      "status": "applied",
      "applied_at": "2023-07-16T14:20:00Z",
      "cover_letter": "I am very interested in this position...",
      "expected_salary": 160000
    }
  ]
}
```

#### Retrieve/Update/Delete Job Application

```
GET /jobs/applications/{id}/
PUT /jobs/applications/{id}/
DELETE /jobs/applications/{id}/
```

Get details of a specific job application, update status, or withdraw application.

**Response:**
```json
{
  "id": 1,
  "job": {
    "id": 1,
    "title": "Cardiologist Required",
    "employer": {
      "id": 1,
      "hospital_name": "ABC Hospital"
    }
  },
  "candidate": {
    "id": 1,
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe"
    }
  },
  "status": "applied",
  "applied_at": "2023-07-16T14:20:00Z",
  "cover_letter": "I am very interested in this position...",
  "expected_salary": 160000
}
```

### Job Matches

```
GET /jobs/matches/
```

List job matches for the current user.

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "job": {
        "id": 1,
        "title": "Cardiologist Required",
        "employer": {
          "id": 1,
          "hospital_name": "ABC Hospital"
        }
      },
      "candidate": {
        "id": 1,
        "user": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe"
        }
      },
      "match_score": 85.5,
      "matched_at": "2023-07-15T12:00:00Z"
    }
  ]
}
```

### Advanced Job Search

```
GET /jobs/advanced-search/
```

Advanced job search with intelligent matching algorithms that consider candidate's profile, skills, and preferences.

**Query Parameters:**
```
q=cardiology            # Search term to match against job title and description
min_salary=120000       # Minimum salary requirement
max_salary=200000       # Maximum salary requirement
location=Mumbai         # Desired job location
department=Cardiology   # Department or specialization
job_type=full_time      # Type of job (full_time, part_time, contract, etc.)
experience=5            # Maximum years of experience required
```

**Response:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Senior Cardiologist Required",
      "description": "We are looking for an experienced cardiologist",
      "location": "Mumbai",
      "department": "Cardiology",
      "job_type": "full_time",
      "salary": 180000,
      "match_score": 0.92,
      "skills_match": ["cardiology", "patient care", "ECG"],
      "employer": {
        "id": 1,
        "hospital_name": "ABC Hospital"
      }
    },
    {
      "id": 2,
      "title": "Cardiac Specialist",
      "description": "Join our team of cardiac specialists",
      "location": "Delhi",
      "department": "Cardiology",
      "job_type": "full_time",
      "salary": 160000,
      "match_score": 0.78,
      "skills_match": ["cardiology", "patient care"],
      "employer": {
        "id": 2,
        "hospital_name": "XYZ Medical Center"
      }
    }
  ]
}
```

The advanced search endpoint returns jobs sorted by match score, which is calculated using several factors:
- Skills match (50% weight)
- Location proximity (20% weight)
- Experience requirements match (15% weight)
- Salary match (10% weight)
- Job type preference match (5% weight)

### Active/Completed Jobs

#### List Active Jobs

```
GET /jobs/active/
```

List active jobs for candidates.

#### Get Active Job Detail

```
GET /jobs/active/{id}/
```

Get details of a specific active job.

#### List Completed Jobs

```
GET /jobs/completed/
```

List completed jobs for candidates.

## Documents

### Supporting Documents

#### List/Create Supporting Documents

```
GET /documents/supporting-documents/
POST /documents/supporting-documents/
```

List or upload supporting documents.

**Create Request Body:**
```json
{
  "document_type": "identity",
  "file": "[file upload]",
  "description": "My identity proof"
}
```

#### Get/Update/Delete Supporting Document

```
GET /documents/supporting-documents/{id}/
PUT /documents/supporting-documents/{id}/
DELETE /documents/supporting-documents/{id}/
```

### Licensures

#### List/Create Licensures

```
GET /documents/licensures/
POST /documents/licensures/
```

List or create medical licensure records.

**Create Request Body:**
```json
{
  "license_type": "Medical License",
  "license_number": "ML123456",
  "issuing_authority": "Medical Council of India",
  "issue_date": "2020-01-01",
  "expiry_date": "2025-01-01",
  "document": "[file upload]"
}
```

#### Get/Update/Delete Licensure

```
GET /documents/licensures/{id}/
PUT /documents/licensures/{id}/
DELETE /documents/licensures/{id}/
```

### Qualifications

#### List/Create Qualifications

```
GET /documents/qualifications/
POST /documents/qualifications/
```

List or create educational qualifications.

**Create Request Body:**
```json
{
  "qualification": 1,
  "institution": "AIIMS Delhi",
  "year_of_passing": 2015,
  "score": 8.5,
  "document": "[file upload]"
}
```

#### Get/Update/Delete Qualification

```
GET /documents/qualifications/{id}/
PUT /documents/qualifications/{id}/
DELETE /documents/qualifications/{id}/
```

### Skills

#### List/Create Skills

```
GET /documents/skills/
POST /documents/skills/
```

List or create professional skills.

**Create Request Body:**
```json
{
  "skill": 1,
  "proficiency_level": "expert",
  "years_of_experience": 3,
  "description": "Proficient in cardiac surgeries"
}
```

#### Get/Update/Delete Skill

```
GET /documents/skills/{id}/
PUT /documents/skills/{id}/
DELETE /documents/skills/{id}/
```

### Master Data

```
GET /documents/qualification-masters/
GET /documents/skill-masters/
```

Get lists of qualification and skill master data.

## Attendance

### Attendance Records

#### List/Create Attendance

```
GET /attendance/
POST /attendance/
```

List or create attendance records.

**Create Request Body:**
```json
{
  "date": "2023-07-20",
  "job": 1,
  "time_in": "09:00:00",
  "time_out": "17:00:00",
  "status": "present",
  "notes": "Regular day"
}
```

#### Get/Update Attendance

```
GET /attendance/{id}/
PUT /attendance/{id}/
```

### Absence Notifications

#### List/Create Absence Notifications

```
GET /attendance/absences/
POST /attendance/absences/
```

List or create absence notifications.

**Create Request Body:**
```json
{
  "job": 1,
  "date": "2023-07-25",
  "reason": "Medical emergency",
  "description": "Need to attend to a family emergency",
  "supporting_document": "[file upload]"
}
```

#### Get/Update Absence Notification

```
GET /attendance/absences/{id}/
PUT /attendance/absences/{id}/
```

### Attendance Summary

```
GET /attendance/summaries/
```

Get attendance summaries for the current user.

## Notifications

### System Notifications

#### List Notifications

```
GET /notifications/
```

List notifications for the current user.

**Response:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "content": "Your job application status has been updated to 'shortlisted'",
      "notification_type": "application_status",
      "created_at": "2023-07-18T09:30:00Z",
      "read": false,
      "read_at": null,
      "related_job": 1,
      "related_job_application": 1
    },
    {
      "id": 2,
      "content": "You have a new message from ABC Hospital",
      "notification_type": "message",
      "created_at": "2023-07-17T14:45:00Z",
      "read": true,
      "read_at": "2023-07-17T15:00:00Z",
      "related_job": null,
      "related_job_application": null
    }
  ]
}
```

#### Get Notification Detail

```
GET /notifications/{id}/
```

Get details of a specific notification.

#### Mark All Notifications Read

```
POST /notifications/mark-all-read/
```

Mark all notifications as read.

### Email Notifications

```
GET /notifications/emails/
```

Get a list of email notifications sent to the user.

### Messaging System

#### List Chat Rooms

```
GET /notifications/rooms/
```

List chat rooms for the current user.

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Chat between John Doe and ABC Hospital",
      "room_type": "direct",
      "created_at": "2023-07-15T10:00:00Z",
      "updated_at": "2023-07-18T14:30:00Z",
      "participants": [1, 2],
      "participants_details": [
        {
          "id": 1,
          "email": "john@example.com",
          "first_name": "John",
          "last_name": "Doe"
        },
        {
          "id": 2,
          "email": "hospital@example.com",
          "first_name": "ABC",
          "last_name": "Hospital"
        }
      ],
      "is_active": true,
      "related_job_application": 1,
      "last_message": {
        "id": 5,
        "content": "When can you start?",
        "sender_id": 2,
        "sender_name": "ABC Hospital",
        "created_at": "2023-07-18T14:30:00Z"
      },
      "unread_count": 1
    }
  ]
}
```

#### Get Chat Room Detail

```
GET /notifications/rooms/{id}/
```

Get details of a specific chat room.

#### List/Send Messages in a Room

```
GET /notifications/rooms/{room_id}/messages/
POST /notifications/rooms/{room_id}/messages/
```

List messages or send a new message in a chat room.

**Send Message Request Body:**
```json
{
  "content": "Yes, I can start on August 1st."
}
```

**Response:**
```json
{
  "count": 6,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "room": 1,
      "sender": 1,
      "sender_name": "John Doe",
      "content": "Hello, I'm interested in the job.",
      "created_at": "2023-07-15T10:05:00Z",
      "is_system_message": false,
      "receipts": [
        {
          "id": 1,
          "recipient": 2,
          "delivered": true,
          "delivered_at": "2023-07-15T10:06:00Z",
          "read": true,
          "read_at": "2023-07-15T10:10:00Z"
        }
      ]
    },
    // More messages...
    {
      "id": 6,
      "room": 1,
      "sender": 1,
      "sender_name": "John Doe",
      "content": "Yes, I can start on August 1st.",
      "created_at": "2023-07-18T14:35:00Z",
      "is_system_message": false,
      "receipts": []
    }
  ]
}
```

#### Mark Messages as Read

```
POST /notifications/rooms/{room_id}/mark-read/
```

Mark all messages in a room as read.

#### Send Direct Message

```
POST /notifications/direct-message/
```

Send a direct message to a user (creates a room if necessary).

**Request Body:**
```json
{
  "recipient_id": 2,
  "content": "Hello, I have a question about the job.",
  "job_application_id": 1
}
```

#### User Presence

```
GET /notifications/presence/
```

Get online status of users.

#### Contacts List

```
GET /notifications/contacts/
```

Get a list of users with chat history.

## WebSocket API

WebSockets are used for real-time communication.

### Chat WebSocket

Connect to `/api/ws/chat/` with a valid authentication token.

**Commands:**

1. Join Room:
```json
{
  "command": "join_room",
  "room_id": 1
}
```

2. Send Message:
```json
{
  "command": "send_message",
  "room_id": 1,
  "content": "Hello there",
  "temp_id": "temp-123"
}
```

3. Mark Messages Read:
```json
{
  "command": "read_messages",
  "room_id": 1
}
```

4. Typing Indicator:
```json
{
  "command": "typing",
  "room_id": 1,
  "is_typing": true
}
```

5. Leave Room:
```json
{
  "command": "leave_room",
  "room_id": 1
}
```

**Messages:**

1. Chat Message:
```json
{
  "type": "chat_message",
  "message": {
    "id": 10,
    "room_id": 1,
    "sender_id": 2,
    "content": "Hello there",
    "created_at": "2023-07-18T15:00:00Z",
    "temp_id": "temp-123"
  }
}
```

2. Read Receipt:
```json
{
  "type": "read_receipt",
  "reader_id": 1,
  "room_id": 1,
  "timestamp": "2023-07-18T15:01:00Z"
}
```

3. Typing Indicator:
```json
{
  "type": "typing_indicator",
  "user_id": 2,
  "room_id": 1,
  "is_typing": true
}
```

## Testimonials

*Note: This API section is currently under development.*

## Employers

*Note: This API section is currently under development.*

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include a message explaining the error:

```json
{
  "detail": "Error message here"
}
```

Or for validation errors:

```json
{
  "field_name": [
    "Error message for this field"
  ]
}
``` 