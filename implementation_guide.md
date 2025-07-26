# Candidate Workflow Implementation Guide

## Overview

We have implemented the core components needed for the candidate workflow based on the provided diagrams. This guide summarizes what has been accomplished and outlines the remaining steps to complete the implementation.

## Implemented Components

1. **Authentication Flow**
   - Added a custom login view for candidates with profile info
   - Enhanced JWT authentication with profile data
   - Added verification status checks during login

2. **Profile Management**
   - Created JobPreference model for storing candidate job preferences
   - Added endpoints for job preferences management
   - Created verification status endpoint to check profile and document completion

3. **Job Search**
   - Added enhanced job search with filters
   - Implemented preference-based job filtering
   - Created personalized job details with match status

4. **Application System**
   - Enforced application quotas for candidates
   - Added application tracking information in responses
   - Implemented job match detection

## Database Model Changes

1. Added `JobPreference` model to the `profiles` app:
   - Connected to CandidateProfile via OneToOneField
   - Stores preferences for job location, department, type, etc.
   - Used for intelligent job matching

## API Endpoints Added

1. **Authentication**
   - `/api/accounts/login/` - Enhanced login for candidates

2. **Profile Management**
   - `/api/profiles/job-preferences/` - Get/update job preferences
   - `/api/profiles/verification-status/` - Check profile completion and document verification

3. **Job Search**
   - `/api/jobs/search/` - Advanced job search with preference filtering

## Next Steps

To complete the implementation according to the workflow diagram:

1. **Frontend Integration**
   - Create login page that redirects to dashboard
   - Implement dashboard with profile completion status
   - Build job search interface with preference filters
   - Create document upload interface
   - Implement job matching UI

2. **Proof-Ready Profile Flow**
   - Add visual indicators for profile completion
   - Implement document verification display
   - Add profile status tags (Proof-Ready/Not Proof-Ready)

3. **Job Application Flow**
   - Complete application form UI
   - Create application tracking dashboard
   - Implement job match display

4. **Messaging System**
   - Fix indentation issues in the WebSocket consumers
   - Update frontend WebSocket connection URL to include /api/ prefix
   - Implement UI for chat functionality
   - Add notifications for job matches and applications

5. **Auto-Fill Jobs**
   - Complete the auto-fill feature for emergency job coverage
   - Implement UI for accepting auto-fill requests

6. **Check-In System**
   - Implement the check-in feature for current jobs
   - Create check-in history view

## Implementation Tips

1. **For Authentication**:
   - Use the JWT token from `/api/accounts/login/` for all authenticated requests
   - Store the user profile information from the login response

2. **For Profile Completion**:
   - Check the verification status endpoint to determine if profile is proof-ready
   - Guide users to complete profile and upload documents

3. **For Job Search**:
   - Use the preference-based search to show relevant jobs
   - Toggle between all jobs and preference-filtered jobs

4. **For Document Verification**:
   - Implement document upload with progress indicators
   - Show verification status for each document

5. **For WebSockets**:
   - Fix indentation issues in consumer.py
   - Use proper WebSocket connection path with /api/ prefix

## Migration Issues

There are currently some indentation errors in the WebSocket consumer code that are preventing migrations from running correctly. These need to be fixed before the application will run properly:

1. The indentation error in `backend/notifications/consumers.py` needs to be fixed
2. After fixing all indentation errors, run:
   ```
   python manage.py makemigrations profiles
   python manage.py migrate
   ```

## Conclusion

The implemented components provide a solid foundation for the candidate workflow. By following the remaining steps, you'll be able to fully implement the workflow shown in the diagrams. 