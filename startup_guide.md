# Job Portal Startup Guide

This guide will help you start and run the Job Portal application correctly.

## Prerequisites

- Python 3.8 or higher
- Node.js (for serving the frontend files)
- PostgreSQL database
- Redis server (for WebSockets and caching)

## Starting the Backend Server

### Using PowerShell Script (Windows)

1. Open PowerShell in the root directory of the project
2. Run the startup script:
   ```
   .\start_server.ps1
   ```
3. The script will:
   - Navigate to the backend directory
   - Activate the virtual environment if it exists
   - Start the Django development server

### Manual Startup

If you prefer to start the server manually:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment (Windows):
   ```
   .\venv\Scripts\activate
   ```
   
   Activate the virtual environment (macOS/Linux):
   ```bash
   source venv/bin/activate
   ```

3. Start the Django server:
   ```
   python manage.py runserver
   ```

## Starting the Frontend

The frontend is a simple set of HTML, CSS, and JavaScript files that can be accessed directly via the browser or served using a simple HTTP server.

### Using Python's built-in HTTP server:

1. Open a new terminal window
2. Navigate to the frontend directory:
   ```bash
   cd frontend/test-ui
   ```

3. Start the HTTP server:
   ```bash
   python -m http.server 5000
   ```
   
4. The frontend will be available at `http://localhost:5000`

## Accessing the Application

- Backend API: `http://localhost:8000/api/`
- Frontend: `http://localhost:5000/`

## Test Login Credentials

### Recruiter
- Email: recruiter@example.com
- Password: password123

### Candidate
- Email: candidate@example.com
- Password: password123

### Admin
- Email: admin@example.com
- Password: admin123

## Troubleshooting

### Backend API not responding
- Ensure the Django server is running correctly
- Check for error messages in the terminal where Django is running
- Verify the database settings in `backend/carechain/settings.py`
- Make sure Redis is running if using WebSockets

### Frontend not loading data
- Check browser console (F12) for error messages
- Ensure the backend API is running and accessible
- Verify that the API_CONFIG.BASE_URL in `js/api-config.js` matches your Django server address

### Authentication issues
- Ensure you're using the correct role at login (Candidate/Recruiter/Admin)
- Check browser console for token validation errors
- Try clearing browser storage and logging in again

## Additional Resources

- API Documentation: See `api.md` for a complete list of endpoints
- Implementation Summary: `implementation_summary.md`
- Implementation Changes: `implementation_changes.md` 