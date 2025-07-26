# CareChain - Healthcare Job Portal Backend

## Project Overview

CareChain is a dynamic job matching platform built specifically for the healthcare sector. It addresses the unique challenges faced by small to medium-sized hospitals in hiring for temporary or short-term roles.

### Current Implementation Status

✅ **COMPLETED:**
- Django project structure with 4 apps (authentication, candidates, jobs, employers)
- Custom User model with email authentication
- Complete database models for all entities
- Basic API endpoints structure
- Virtual environment setup
- Basic HTML frontend for testing

🔄 **IN PROGRESS:**
- API serializers and views
- Database migrations
- Authentication system (JWT tokens)

📋 **TODO:**
- Complete API implementations
- Celery task configuration
- Django Channels for real-time features
- Aadhaar verification integration
- Email service integration
- Job matching algorithm
- File upload handling

## Tech Stack

- **Backend**: Django REST Framework (DRF)
- **Authentication**: OAuth2 and JWT Authentication  
- **Database**: PostgreSQL (SQLite for development)
- **Background Tasks**: Celery with Redis
- **Real-time**: Django Channels + Redis
- **File Storage**: Django FileField (can be extended to AWS S3)

## Project Structure

```
backend/
├── carechain/                 # Main Django project
│   ├── settings.py           # Django settings
│   ├── urls.py              # Main URL configuration
│   ├── asgi.py              # ASGI config for Channels
│   └── celery.py            # Celery configuration
├── authentication/           # User auth and management
│   ├── models.py            # User, EmailVerification, PasswordReset
│   ├── views.py             # Auth API views
│   ├── serializers.py       # DRF serializers
│   └── urls.py              # Auth endpoints
├── candidates/               # Candidate profiles and management
│   ├── models.py            # CandidateProfile, Skills, Qualifications, etc.
│   └── urls.py              # Candidate endpoints
├── jobs/                     # Job postings and applications
│   ├── models.py            # Job, JobApplication, JobMatch, etc.
│   └── urls.py              # Job endpoints
├── employers/                # Employer profiles and management
│   ├── models.py            # Employer, EmployerSubscription, etc.
│   └── urls.py              # Employer endpoints
└── requirements.txt          # Python dependencies
```

## Database Models

### Key Models Implemented:

1. **User Models** (authentication app):
   - Custom User with email authentication
   - EmailVerificationToken
   - PasswordResetToken

2. **Candidate Models** (candidates app):
   - CandidateProfile
   - QualificationMaster & Qualification
   - SkillMaster & Skill
   - Licensure
   - OffPlatformWorkExperience
   - SupportingDocument
   - Attendance

3. **Job Models** (jobs app):
   - Job
   - JobApplication
   - JobMatch (AI matching)
   - ActiveJob
   - CompletedJob
   - Testimonial
   - AbsenceNotification

4. **Employer Models** (employers app):
   - Employer
   - EmployerSubscription
   - EmployerRating

## API Endpoints Structure

### Authentication (`/api/auth/`)
- `POST /register/` - User registration
- `POST /login/` - User login
- `POST /logout/` - User logout
- `GET /verify-email/<token>/` - Email verification
- `POST /password/reset/` - Password reset request
- `POST /password/reset/confirm/<token>/` - Password reset confirm
- `POST /token/refresh/` - Refresh JWT token

### Candidates (`/api/candidates/`)
- `GET,PUT /profiles/<id>/` - Profile CRUD
- `POST /profile/<id>/verify-aadhaar/<aadhaar>/` - Aadhaar verification
- `GET /profile/<id>/applications/` - Application history
- `POST /profile/<id>/withdraw/<job_id>/` - Withdraw application
- `GET,POST /current-job/` - Current job management
- `POST /current-job/absence/` - Notify absence
- `POST /current-job/feedback/` - Submit feedback
- `POST /current-job/resign/` - Resign from job

### Jobs (`/api/jobs/`)
- `GET /search/` - Search jobs with filters
- `GET /jobs/<id>/` - Job details
- `POST /apply/<job_id>/` - Apply to job
- `GET /matches/` - Get job matches

### Employers (`/api/employers/`)
- `GET,PUT /employers/<id>/` - Employer profile CRUD
- `GET /dashboard/` - Employer dashboard
- `GET,POST /jobs/` - Employer's jobs
- `GET /jobs/<id>/applicants/` - Job applicants
- `GET /jobs/<id>/matches/` - Matched candidates

## Setup Instructions

### 1. Virtual Environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# For development (SQLite)
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# For production (PostgreSQL)
# 1. Install PostgreSQL
# 2. Create database 'carechain_db'
# 3. Update DATABASES setting in settings.py
# 4. Run migrations
```

### 4. Run Development Server
```bash
python manage.py runserver 8000
```

### 5. Test Frontend
Open `frontend_test/index.html` in a browser to test the API endpoints.

## Next Steps

1. **Complete API Implementation**
   - Finish all serializers and views
   - Add proper validation and error handling
   - Implement pagination

2. **Authentication & Authorization**
   - Complete JWT token implementation
   - Add proper permission classes
   - Email verification system

3. **Advanced Features**
   - Job matching algorithm
   - Real-time notifications (Django Channels)
   - Background tasks (Celery)
   - File upload handling

4. **Testing & Deployment**
   - Unit tests
   - API documentation
   - Docker containerization
   - Production deployment

## API Testing

Use the provided HTML frontend or tools like Postman to test endpoints:

- **Base URL**: `http://localhost:8000/api/`
- **Admin Panel**: `http://localhost:8000/admin/`

## Environment Variables

Create a `.env` file for production:
```
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:password@localhost/carechain_db
REDIS_URL=redis://localhost:6379
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password
```

## Contributing

1. Follow Django coding standards
2. Add tests for new features
3. Update documentation
4. Follow the API versioning strategy
