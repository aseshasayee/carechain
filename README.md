# CareChain Job Portal

A comprehensive job portal platform for healthcare professionals.

## Project Structure

- `/backend` - Django backend with REST API
- `/frontend` - Frontend UI components

## Backend Setup

1. Create a virtual environment:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```
   python manage.py migrate
   ```

4. Create a superuser for admin access:
   ```
   python manage.py createsuperuser
   ```
   - Enter email, name, and password when prompted
   - Make sure to assign admin role to this user

5. Start the development server:
   ```
   python manage.py runserver
   ```

6. Access the Django admin at `http://localhost:8000/admin/`

## API Configuration

The frontend is configured to connect to the backend API at `http://localhost:8000/api`. If you need to change this:

1. Edit `frontend/test-ui/js/api-config.js`
2. Update the `BASE_URL` value to your production API URL

## Required API Endpoints

The frontend expects the following API endpoints to be implemented:

### Authentication
- `/accounts/login/` - Candidate login
- `/accounts/recruiter-login/` - Recruiter login
- `/accounts/admin-login/` - Admin login

### Hospital Registration & Login (Minimal)
- `/profiles/hospital-register/` - Minimal hospital registration (name, registration_number, contact_no, password)
- `/profiles/hospital-login/` - Minimal hospital login (registration_number or contact_no, password)

**Hospital Registration Example:**
POST `/api/profiles/hospital-register/`
```
{
  "name": "ABC Hospital",
  "registration_number": "HOSP123456",
  "contact_no": "9876543210",
  "password": "securepassword"
}
```

**Hospital Login Example:**
POST `/api/profiles/hospital-login/`
```
{
  "registration_number": "HOSP123456",
  "password": "securepassword"
}
// or
{
  "contact_no": "9876543210",
  "password": "securepassword"
}
```

### Admin
- `/admin/dashboard-stats/` - Dashboard statistics
- `/admin/recent-activity/` - Recent activity feed
- `/admin/users/` - User management

### Profiles
- `/profiles/pending-verifications/` - List pending candidate verifications
- `/profiles/verified-profiles/` - List verified candidates
- `/profiles/rejected-verifications/` - List rejected candidate verifications
- `/profiles/pending-hospital-verifications/` - List pending hospital verifications
- `/profiles/verified-hospitals/` - List verified hospitals
- `/profiles/rejected-hospital-verifications/` - List rejected hospital verifications
- `/profiles/candidate-details/{id}/` - Get candidate details
- `/profiles/hospital-details/{id}/` - Get hospital details
- `/profiles/approve-verification/{id}/` - Approve candidate verification
- `/profiles/reject-verification/{id}/` - Reject candidate verification
- `/profiles/approve-hospital-verification/{id}/` - Approve hospital verification
- `/profiles/reject-hospital-verification/{id}/` - Reject hospital verification

## Frontend Setup

1. The frontend is built with vanilla HTML, CSS, and JavaScript
2. Open the HTML files directly in your browser or serve with a local server
3. For testing, use the provided `admin@example.com` account (password in your database) for admin access

## Important Note

This application uses JWT authentication. Make sure your backend properly implements JWT token generation and validation. 