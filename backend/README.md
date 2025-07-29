# CareChain - Healthcare Job Portal Backend

## Project Overview

CareChain is a comprehensive healthcare job portal backend built with Django REST Framework. It provides a complete API for managing healthcare job postings, candidate applications, recruiter management, and administrative functions specifically designed for the healthcare industry.

### Current Implementation Status

✅ **COMPLETED:**
- Complete Django project with 9 specialized apps
- Custom User model with role-based authentication (Admin, Recruiter, Candidate)
- Comprehensive database models for all healthcare-specific entities
- Full RESTful API implementation with 50+ endpoints
- JWT-based authentication system with role-specific login endpoints
- File upload and document management system
- Real-time messaging system
- Admin dashboard with analytics and user management
- Profile verification system for candidates and hospitals
- Job application tracking and management
- Notification system
- Testimonials and rating system
- Redis integration for caching and real-time features

� **IN PROGRESS:**
- Advanced job matching algorithm optimization
- Email notification system integration
- Celery background task processing
- WebSocket implementation for real-time updates

📋 **PLANNED:**
- Aadhaar verification integration
- Payment gateway integration for employer subscriptions
- Advanced analytics and reporting
- Mobile API optimizations
- Docker containerization for production deployment

## Tech Stack

- **Framework**: Django 4.2+ with Django REST Framework 3.14+
- **Authentication**: JWT Authentication with role-based access control
- **Database**: PostgreSQL (SQLite for development)
- **Caching**: Redis for session management and real-time features
- **File Storage**: Django FileField with media handling
- **Real-time**: Django Channels + Redis (planned)
- **Background Tasks**: Celery with Redis broker (in progress)
- **API Documentation**: Django REST Framework browsable API

## Project Structure

```
backend/
├── carechain/                 # Main Django project
│   ├── settings.py           # Django settings with environment configs
│   ├── urls.py              # Main URL configuration
│   ├── asgi.py              # ASGI config for Channels
│   └── wsgi.py              # WSGI config for deployment
├── accounts/                 # User authentication and management
│   ├── models.py            # Custom User model
│   ├── views.py             # Auth API views (login, register, profile)
│   ├── serializers.py       # User serializers
│   └── urls.py              # Authentication endpoints
├── profiles/                 # User profile management
│   ├── models.py            # CandidateProfile, RecruiterProfile, HospitalProfile
│   ├── views.py             # Profile CRUD operations
│   └── urls.py              # Profile management endpoints
├── jobs/                     # Job management system
│   ├── models.py            # Job, JobApplication, JobMatch, ActiveJob
│   ├── views.py             # Job CRUD, applications, search
│   └── urls.py              # Job-related endpoints
├── admin_api/                # Administrative functions
│   ├── models.py            # Admin-specific models
│   ├── views.py             # User management, analytics
│   └── urls.py              # Admin endpoints
├── messaging/                # Real-time messaging system
│   ├── models.py            # Conversation, Message
│   ├── views.py             # Messaging API
│   └── urls.py              # Messaging endpoints
├── notifications/            # Notification system
│   ├── models.py            # Notification model
│   ├── views.py             # Notification management
│   └── urls.py              # Notification endpoints
├── documents/                # File upload and document management
│   ├── models.py            # Document storage models
│   ├── views.py             # File upload handling
│   └── urls.py              # Document endpoints
├── testimonials/             # Rating and testimonial system
│   ├── models.py            # Testimonial, Rating models
│   ├── views.py             # Testimonial management
│   └── urls.py              # Testimonial endpoints
├── masters/                  # Master data (skills, qualifications, etc.)
│   ├── models.py            # MasterData models
│   └── management/          # Data seeding commands
├── media/                    # Uploaded files storage
├── requirements.txt          # Python dependencies
├── manage.py                # Django management commands
├── setup_redis.sh/.bat      # Redis setup scripts
├── create_sample_data.py     # Sample data generation
└── run_server.py            # Development server launcher
```
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

### Core Models Implemented:

#### 1. **User Management** (accounts app):
```python
User (Custom)               # Email-based authentication with roles
├── email (primary key)     # Unique email for authentication
├── first_name, last_name  # User personal information
├── is_admin               # Admin role flag
├── is_recruiter          # Recruiter role flag
├── is_candidate          # Candidate role flag
├── is_active, is_verified # Account status flags
└── date_joined           # Registration timestamp
```

#### 2. **Profile Management** (profiles app):
```python
CandidateProfile           # Healthcare professional profiles
├── user                  # OneToOne with User
├── phone_number         # Contact information
├── date_of_birth        # Personal details
├── gender, address      # Demographics
├── years_of_experience  # Professional experience
├── skills              # ManyToMany with skills
├── certifications      # Professional certifications
├── verification_status # Account verification state
└── created_at          # Profile creation date

RecruiterProfile          # Hospital/Healthcare facility recruiters
├── user                 # OneToOne with User
├── company_name        # Healthcare facility name
├── designation         # Recruiter position
├── phone_number        # Contact details
├── company_address     # Facility location
└── verification_status # Recruiter verification state

HospitalProfile          # Hospital/Healthcare facility details
├── name                # Facility name
├── registration_number # Official registration
├── address             # Complete facility address
├── phone_number        # Primary contact
├── email               # Official email
├── type               # Hospital type (public/private/specialty)
├── bed_capacity       # Facility size indicator
└── verification_status # Official verification state
```

#### 3. **Job Management** (jobs app):
```python
Job                      # Healthcare job postings
├── title               # Job position title
├── description         # Detailed job description
├── requirements        # Job requirements and qualifications
├── location           # Job location
├── job_type           # Full-time/Part-time/Contract/Temporary
├── experience_level   # Entry/Mid/Senior/Executive
├── salary_min/max     # Salary range
├── posted_by          # ForeignKey to RecruiterProfile
├── hospital           # ForeignKey to HospitalProfile
├── is_active          # Job status
├── created_at         # Posting date
└── expires_at         # Application deadline

JobApplication          # Candidate applications to jobs
├── job                # ForeignKey to Job
├── candidate          # ForeignKey to CandidateProfile
├── status             # Applied/Reviewed/Shortlisted/Rejected/Hired
├── cover_letter       # Application cover letter
├── applied_at         # Application timestamp
└── updated_at         # Last status update

JobMatch               # AI-based job matching (future)
├── job                # ForeignKey to Job
├── candidate          # ForeignKey to CandidateProfile
├── match_score        # Compatibility score (0-100)
├── match_factors      # JSON field with matching criteria
└── created_at         # Match generation date

ActiveJob              # Currently active job assignments
├── job_application    # ForeignKey to accepted JobApplication
├── start_date         # Job start date
├── end_date           # Job end date (for temporary positions)
├── status             # Active/Completed/Terminated
└── created_at         # Assignment start timestamp

CompletedJob           # Historical job completion records
├── active_job         # ForeignKey to completed ActiveJob
├── completion_date    # Job completion timestamp
├── rating             # Job performance rating
├── feedback           # Completion feedback
└── created_at         # Record creation date
```

#### 4. **Communication System** (messaging app):
```python
Conversation           # Chat conversations between users
├── participants       # ManyToMany with User
├── created_at         # Conversation start date
└── updated_at         # Last message timestamp

Message                # Individual messages within conversations
├── conversation       # ForeignKey to Conversation
├── sender             # ForeignKey to User
├── content            # Message text content
├── is_read            # Read status flag
├── created_at         # Message timestamp
└── updated_at         # Edit timestamp (if applicable)
```

#### 5. **Document Management** (documents app):
```python
Document               # File upload and storage
├── uploaded_by        # ForeignKey to User
├── file               # FileField for document storage
├── document_type      # Resume/Certificate/ID/Medical_License
├── description        # Document description
├── is_verified        # Verification status
├── uploaded_at        # Upload timestamp
└── verified_at        # Verification timestamp
```

#### 6. **Notification System** (notifications app):
```python
Notification           # User notifications
├── recipient          # ForeignKey to User
├── title              # Notification title
├── message            # Notification content
├── notification_type  # Job_Update/Application_Status/Message/System
├── is_read            # Read status
├── created_at         # Notification timestamp
└── data               # JSON field for additional data
```

#### 7. **Testimonials & Ratings** (testimonials app):
```python
Testimonial            # User testimonials and reviews
├── given_by           # ForeignKey to User (reviewer)
├── given_to           # ForeignKey to User (reviewee)
├── job                # ForeignKey to CompletedJob (optional)
├── rating             # Rating score (1-5)
├── title              # Review title
├── content            # Review content
├── is_approved        # Moderation status
└── created_at         # Review timestamp
```

#### 8. **Master Data** (masters app):
```python
SkillMaster            # Healthcare skills and specializations
├── name               # Skill name (e.g., "Critical Care Nursing")
├── category           # Skill category (Clinical/Administrative/Technical)
├── description        # Skill description
└── is_active          # Status flag

QualificationMaster    # Educational qualifications
├── name               # Qualification name (e.g., "Bachelor of Nursing")
├── level              # Diploma/Bachelor/Master/Doctorate
├── field              # Medical field
└── is_active          # Status flag

LocationMaster         # Geographic locations
├── city               # City name
├── state              # State name
├── country            # Country name
└── is_active          # Status flag
```

## API Endpoints Comprehensive Reference

### Base URL: `http://localhost:8000/api/`

### 🔐 **Authentication Endpoints** (`/api/accounts/`)

#### User Registration & Authentication
```http
POST   /api/accounts/register/              # User registration (any role)
POST   /api/accounts/login/                 # Candidate login
POST   /api/accounts/recruiter-login/       # Recruiter login  
POST   /api/accounts/admin-login/           # Admin login
POST   /api/accounts/verify-email/          # Email verification
GET    /api/accounts/profile/               # Get current user profile
PUT    /api/accounts/profile/               # Update current user profile
POST   /api/accounts/change-password/       # Change user password
```

**Authentication Headers Required:**
```http
Authorization: Bearer <jwt_access_token>
Content-Type: application/json
```

### 👤 **Profile Management** (`/api/profiles/`)

#### Candidate Profiles
```http
GET    /api/profiles/candidate/             # Get candidate profile
POST   /api/profiles/candidate/             # Create candidate profile
PUT    /api/profiles/candidate/             # Update candidate profile
DELETE /api/profiles/candidate/             # Delete candidate profile
```

#### Recruiter Profiles
```http
GET    /api/profiles/recruiter/             # Get recruiter profile
POST   /api/profiles/recruiter/             # Create recruiter profile
PUT    /api/profiles/recruiter/             # Update recruiter profile
DELETE /api/profiles/recruiter/             # Delete recruiter profile
```

#### Hospital Profiles
```http
GET    /api/profiles/hospital/              # Get hospital profile
POST   /api/profiles/hospital/              # Create hospital profile
PUT    /api/profiles/hospital/              # Update hospital profile
DELETE /api/profiles/hospital/              # Delete hospital profile
```

#### Verification System
```http
GET    /api/profiles/verification/          # Get verification status
POST   /api/profiles/verification/          # Submit verification request
PUT    /api/profiles/verification/          # Update verification documents

# Admin Verification Management
GET    /api/profiles/pending-verifications/    # Get pending verifications
GET    /api/profiles/verified-profiles/        # Get verified profiles
GET    /api/profiles/rejected-verifications/   # Get rejected verifications

# Hospital Verification Management
GET    /api/profiles/pending-hospital-verifications/  # Pending hospital verifications
GET    /api/profiles/verified-hospitals/              # Verified hospitals
GET    /api/profiles/rejected-hospital-verifications/ # Rejected hospital verifications

# Verification Actions (Admin only)
POST   /api/profiles/approve-verification/     # Approve candidate verification
POST   /api/profiles/reject-verification/      # Reject candidate verification
POST   /api/profiles/approve-hospital-verification/  # Approve hospital verification
POST   /api/profiles/reject-hospital-verification/   # Reject hospital verification

# Profile Details (Admin/Recruiter access)
GET    /api/profiles/candidate-details/<id>/   # Get detailed candidate profile
GET    /api/profiles/hospital-details/<id>/    # Get detailed hospital profile
GET    /api/profiles/verification-status/      # Check verification status
```

### 💼 **Job Management** (`/api/jobs/`)

#### Job CRUD Operations
```http
GET    /api/jobs/                          # List all jobs (with pagination & filters)
POST   /api/jobs/                          # Create new job (Recruiter only)
GET    /api/jobs/<id>/                     # Get specific job details
PUT    /api/jobs/<id>/                     # Update job (Owner only)
DELETE /api/jobs/<id>/                     # Delete job (Owner only)
```

#### Job Applications
```http
GET    /api/jobs/applications/             # List user's applications
POST   /api/jobs/applications/             # Apply to a job
GET    /api/jobs/applications/<id>/        # Get application details
PUT    /api/jobs/applications/<id>/        # Update application status
DELETE /api/jobs/applications/<id>/        # Withdraw application

# Job-specific applications (Recruiter view)
GET    /api/jobs/<job_id>/applications/    # Get applications for specific job
POST   /api/jobs/<job_id>/applications/    # Direct application to job
```

#### Job Matching & Search
```http
GET    /api/jobs/matches/                  # Get job matches for candidate
GET    /api/jobs/search/                   # Basic job search
POST   /api/jobs/advanced-search/          # Advanced job search with filters
```

#### Active Job Management
```http
GET    /api/jobs/active/                   # List active job assignments
GET    /api/jobs/active/<id>/              # Get active job details
PUT    /api/jobs/active/<id>/              # Update active job status
```

#### Completed Jobs
```http
GET    /api/jobs/completed/                # List completed jobs
GET    /api/jobs/completed/<id>/           # Get completed job details
```

**Job Search Filters:**
```json
{
  "location": "city, state",
  "job_type": "full-time|part-time|contract|temporary",
  "experience_level": "entry|mid|senior|executive",
  "salary_min": 50000,
  "salary_max": 100000,
  "skills": ["nursing", "critical-care"],
  "hospital_type": "public|private|specialty"
}
```

### 🔧 **Admin API** (`/api/admin/`)

#### User Management
```http
GET    /api/admin/users/                   # List all users (with filters)
GET    /api/admin/users/<id>/              # Get specific user details
PUT    /api/admin/users/<id>/              # Update user details
DELETE /api/admin/users/<id>/              # Deactivate user account
POST   /api/admin/users/<id>/activate/     # Activate user account
POST   /api/admin/users/<id>/deactivate/   # Deactivate user account
```

#### Analytics & Dashboard
```http
GET    /api/admin/dashboard-stats/         # Get dashboard statistics
GET    /api/admin/recent-activity/         # Get recent platform activity
GET    /api/admin/analytics/users/         # User analytics
GET    /api/admin/analytics/jobs/          # Job posting analytics
GET    /api/admin/analytics/applications/  # Application analytics
```

**Admin Dashboard Response:**
```json
{
  "total_users": 1250,
  "total_candidates": 850,
  "total_recruiters": 120,
  "total_jobs": 340,
  "active_jobs": 180,
  "total_applications": 2150,
  "pending_verifications": 45,
  "verified_profiles": 780,
  "recent_registrations": 23
}
```

### 💬 **Messaging System** (`/api/messaging/`)

#### Conversation Management
```http
GET    /api/messaging/conversations/           # List user's conversations
POST   /api/messaging/conversations/create/    # Create new conversation
GET    /api/messaging/conversations/<id>/      # Get conversation details
DELETE /api/messaging/conversations/<id>/      # Delete conversation
```

#### Message Operations
```http
GET    /api/messaging/conversations/<id>/messages/  # Get conversation messages
POST   /api/messaging/conversations/<id>/send/      # Send message
PUT    /api/messaging/conversations/<id>/read/      # Mark messages as read
```

### 🔔 **Notifications** (`/api/notifications/`)

#### Notification Management
```http
GET    /api/notifications/                 # List user notifications
GET    /api/notifications/<id>/            # Get specific notification
POST   /api/notifications/<id>/mark-read/  # Mark notification as read
POST   /api/notifications/mark-all-read/   # Mark all notifications as read
DELETE /api/notifications/<id>/            # Delete notification
```

### 📄 **Document Management** (`/api/documents/`)

#### File Upload & Management
```http
GET    /api/documents/                     # List user's documents
POST   /api/documents/upload/              # Upload new document
GET    /api/documents/<id>/                # Get document details
PUT    /api/documents/<id>/                # Update document metadata
DELETE /api/documents/<id>/                # Delete document
```

**Document Upload Request:**
```http
POST /api/documents/upload/
Content-Type: multipart/form-data

file: <file_data>
document_type: "resume|certificate|id|medical_license"
description: "Document description"
```

### ⭐ **Testimonials & Ratings** (`/api/testimonials/`)

#### Testimonial Management
```http
GET    /api/testimonials/                  # List testimonials
POST   /api/testimonials/                  # Create new testimonial
GET    /api/testimonials/<id>/             # Get specific testimonial
PUT    /api/testimonials/<id>/             # Update testimonial
DELETE /api/testimonials/<id>/             # Delete testimonial

# Specific user testimonials
GET    /api/testimonials/user/<user_id>/   # Get testimonials for specific user
GET    /api/testimonials/my-reviews/       # Get current user's given reviews
GET    /api/testimonials/about-me/         # Get testimonials about current user
```

## Setup Instructions

### Prerequisites
- Python 3.9+ installed
- PostgreSQL 12+ (for production) or SQLite (for development)
- Redis 6+ (for caching and real-time features)
- Git for version control

### 1. Clone Repository & Setup Environment
```bash
# Clone the repository
git clone <repository-url>
cd job-portal/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
# Install all required packages
pip install -r requirements.txt

# Verify installation
pip list
```

### 3. Redis Setup
```bash
# On Windows (using provided script):
setup_redis.bat

# On Linux/Mac (using provided script):
chmod +x setup_redis.sh
./setup_redis.sh

# Or install Redis manually:
# Windows: Download from https://redis.io/download
# Ubuntu: sudo apt-get install redis-server
# Mac: brew install redis
```

### 4. Database Configuration

#### For Development (SQLite - Default):
```bash
# Apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

#### For Production (PostgreSQL):
```bash
# 1. Install PostgreSQL and create database
sudo -u postgres createdb carechain_db
sudo -u postgres createuser carechain_user

# 2. Update settings.py DATABASES configuration
# 3. Install psycopg2 (already in requirements.txt)
# 4. Apply migrations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Load Sample Data (Optional)
```bash
# Create sample healthcare jobs and users
python create_sample_data.py

# Or use Django management command
python manage.py loaddata sample_data.json
```

### 6. Environment Variables Setup
Create a `.env` file in the backend directory:
```env
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://carechain_user:password@localhost:5432/carechain_db

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Email Configuration (for production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# File Upload Settings
MEDIA_ROOT=/path/to/media/files
MEDIA_URL=/media/

# Security Settings (for production)
SECURE_SSL_REDIRECT=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
```

### 7. Run Development Server
```bash
# Start Redis server (in separate terminal)
redis-server

# Start Django development server
python manage.py runserver 8000

# Or use the provided script
python run_server.py
```

### 8. Verify Installation
- **API Root**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/ (browsable API)

## Development Workflow

### Database Migrations
```bash
# After model changes
python manage.py makemigrations
python manage.py migrate

# Check migration status
python manage.py showmigrations

# Rollback migration (if needed)
python manage.py migrate app_name migration_name
```

### Creating Sample Data
```bash
# Run the sample data creation script
python create_sample_data.py

# This creates:
# - 10 candidate profiles
# - 5 recruiter profiles  
# - 3 hospital profiles
# - 20 job postings
# - 50 job applications
# - Sample skills and qualifications
```

### Testing API Endpoints
```bash
# Install httpie for easy API testing
pip install httpie

# Test authentication
http POST localhost:8000/api/accounts/login/ email=test@example.com password=testpass123

# Test with authentication
http GET localhost:8000/api/jobs/ "Authorization:Bearer <your-jwt-token>"

# Test file upload
http --form POST localhost:8000/api/documents/upload/ file@resume.pdf document_type=resume "Authorization:Bearer <token>"
```

## Production Deployment

### Environment Configuration
```bash
# Install production dependencies
pip install gunicorn psycopg2-binary

# Collect static files
python manage.py collectstatic

# Set production environment variables
export DEBUG=False
export SECRET_KEY="your-production-secret-key"
export DATABASE_URL="your-production-database-url"
```

### Gunicorn Configuration
```bash
# Install gunicorn
pip install gunicorn

# Create gunicorn configuration file
# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
preload_app = True
keepalive = 5

# Run with gunicorn
gunicorn carechain.wsgi:application -c gunicorn.conf.py
```

### Docker Setup (Optional)
```dockerfile
# Dockerfile example
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "carechain.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## API Testing & Documentation

### Using Django REST Framework Browsable API
1. Navigate to `http://localhost:8000/api/`
2. Browse endpoints interactively
3. Test requests with built-in forms
4. View response formats and status codes

### Authentication Testing
```bash
# Register new user
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "is_candidate": true
  }'

# Login and get JWT token
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123"
  }'

# Use JWT token for authenticated requests
curl -H "Authorization: Bearer <your-jwt-token>" \
  http://localhost:8000/api/profiles/candidate/
```

### Database Management
```bash
# Backup database
python manage.py dumpdata > backup.json

# Restore database
python manage.py loaddata backup.json

# Reset database (development only)
python manage.py flush
python manage.py migrate
python create_sample_data.py
```

## Advanced Features & Architecture

### Authentication & Authorization System
- **JWT-based Authentication**: Secure token-based authentication with refresh tokens
- **Role-based Access Control**: Three distinct user roles (Admin, Recruiter, Candidate)
- **Permission Classes**: Custom permissions for API endpoint access control
- **Email Verification**: Account verification system for enhanced security

### File Upload & Document Management
- **Secure File Handling**: Support for PDF, DOC, DOCX, and image files
- **Document Types**: Resume, certificates, ID documents, medical licenses
- **File Validation**: Size limits, format validation, virus scanning ready
- **Storage Management**: Organized file storage with user-specific directories

### Real-time Features (In Progress)
- **Django Channels**: WebSocket support for real-time messaging
- **Redis Integration**: Caching and session management
- **Live Notifications**: Real-time job alerts and application updates
- **Chat System**: Direct messaging between recruiters and candidates

### Job Matching Algorithm
- **Skill-based Matching**: Advanced algorithm matching candidates to jobs
- **Location Preferences**: Geographic proximity and remote work options
- **Experience Matching**: Years of experience and seniority level alignment
- **Availability Tracking**: Candidate availability and job schedule compatibility

### API Features
- **RESTful Design**: Following REST principles for all endpoints
- **Pagination**: Efficient data loading with cursor and page-based pagination
- **Filtering & Search**: Advanced filtering capabilities for all list endpoints
- **Error Handling**: Comprehensive error responses with helpful messages
- **API Versioning**: Prepared for future API version management

### Security Implementation
- **Input Validation**: Comprehensive data validation using DRF serializers
- **SQL Injection Protection**: Django ORM provides built-in protection
- **XSS Prevention**: Output sanitization and CSRF protection
- **Rate Limiting**: API endpoint rate limiting for abuse prevention
- **HTTPS Ready**: SSL/TLS configuration for production deployment

### Performance Optimization
- **Database Indexing**: Optimized database queries with proper indexing
- **Query Optimization**: select_related and prefetch_related for efficient joins
- **Caching Strategy**: Redis-based caching for frequently accessed data
- **Background Tasks**: Celery integration for long-running operations

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. Database Connection Issues
```bash
# Check database connection
python manage.py dbshell

# Reset migrations (development only)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
```

#### 2. Redis Connection Problems
```bash
# Check Redis status
redis-cli ping

# Start Redis service
# Windows: redis-server.exe
# Linux: sudo service redis-server start
# Mac: brew services start redis
```

#### 3. JWT Token Issues
```bash
# Check token expiry settings in settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    ...
}

# Clear expired tokens (if needed)
python manage.py flush_expired_tokens
```

#### 4. File Upload Problems
```bash
# Check media directory permissions
ls -la media/
chmod 755 media/

# Verify MEDIA_ROOT and MEDIA_URL settings
python manage.py shell
>>> from django.conf import settings
>>> print(settings.MEDIA_ROOT)
>>> print(settings.MEDIA_URL)
```

#### 5. API Endpoint 404 Errors
```bash
# Check URL patterns
python manage.py show_urls

# Verify app registration in INSTALLED_APPS
# Check include() statements in main urls.py
```

### Performance Monitoring
```bash
# Enable Django debugging
DEBUG_TOOLBAR = True  # in settings.py

# Database query monitoring
python manage.py shell
>>> from django.db import connection
>>> print(len(connection.queries))
>>> print(connection.queries)

# Memory usage monitoring
pip install memory-profiler
python -m memory_profiler manage.py runserver
```

## Contributing Guidelines

### Code Standards
- **PEP 8 Compliance**: Follow Python coding standards
- **Type Hints**: Use type annotations for better code clarity
- **Docstrings**: Document all classes and functions
- **Variable Naming**: Use descriptive variable and function names

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-endpoint

# Make changes and commit
git add .
git commit -m "Add new job matching endpoint"

# Push and create pull request
git push origin feature/new-endpoint
```

### Testing Requirements
```bash
# Run existing tests
python manage.py test

# Create new tests for features
# Follow Django testing best practices
# Maintain test coverage above 80%
```

### Documentation Updates
- Update API documentation for new endpoints
- Add docstrings for new models and views
- Update README for configuration changes
- Include example requests/responses

## Future Roadmap

### Phase 1: Core Enhancements (Current)
- [ ] Complete email notification system
- [ ] Advanced job matching algorithm optimization
- [ ] Real-time messaging implementation
- [ ] Comprehensive unit testing

### Phase 2: Advanced Features
- [ ] Payment gateway integration for employer subscriptions
- [ ] Mobile API optimizations
- [ ] Advanced analytics and reporting
- [ ] AI-powered candidate recommendations

### Phase 3: Enterprise Features
- [ ] Multi-tenant architecture for healthcare networks
- [ ] Advanced compliance reporting
- [ ] Integration APIs for third-party systems
- [ ] White-label solutions for healthcare organizations

### Phase 4: Scale & Optimization
- [ ] Microservices architecture migration
- [ ] Container orchestration with Kubernetes
- [ ] Advanced monitoring and logging
- [ ] Global CDN integration for file uploads

## Support & Resources

### Development Resources
- **Django Documentation**: https://docs.djangoproject.com/
- **DRF Documentation**: https://www.django-rest-framework.org/
- **Redis Documentation**: https://redis.io/documentation
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

### API Testing Tools
- **Postman**: For comprehensive API testing
- **httpie**: Command-line HTTP client
- **DRF Browsable API**: Built-in interactive API explorer
- **Swagger/OpenAPI**: API documentation (future implementation)

### Deployment Resources
- **Docker**: Container deployment
- **AWS/GCP/Azure**: Cloud deployment options
- **Nginx**: Reverse proxy configuration
- **Gunicorn**: WSGI server for production

### Contact & Support
For technical issues or questions regarding the backend implementation, please:
1. Check this documentation first
2. Review existing issues in the repository
3. Create detailed issue reports with error logs
4. Follow the contributing guidelines for code submissions
