#!/usr/bin/env python
"""
Debug script to check authentication and user states.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'carechain.settings')
django.setup()

from django.contrib.auth import get_user_model
from profiles.models import CandidateProfile, RecruiterProfile, Hospital
from employee_management.models import Employment

User = get_user_model()

def debug_users():
    print("=== USER DEBUG INFO ===")
    
    # Check all users
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    
    for user in users:
        print(f"\nUser: {user.email}")
        print(f"  ID: {user.id}")
        print(f"  Active: {user.is_active}")
        print(f"  Recruiter: {getattr(user, 'is_recruiter', False)}")
        print(f"  Candidate: {getattr(user, 'is_candidate', False)}")
        print(f"  Staff: {user.is_staff}")
        print(f"  Superuser: {user.is_superuser}")
        
        # Check profiles
        try:
            if hasattr(user, 'candidateprofile'):
                print(f"  Has candidate profile: YES")
            else:
                print(f"  Has candidate profile: NO")
        except:
            print(f"  Has candidate profile: ERROR")
            
        try:
            if hasattr(user, 'recruiterprofile'):
                print(f"  Has recruiter profile: YES")
            else:
                print(f"  Has recruiter profile: NO")
        except:
            print(f"  Has recruiter profile: ERROR")
    
    # Check profiles
    print(f"\n=== PROFILE DEBUG INFO ===")
    candidates = CandidateProfile.objects.all()
    print(f"Total candidate profiles: {candidates.count()}")
    
    recruiters = RecruiterProfile.objects.all()
    print(f"Total recruiter profiles: {recruiters.count()}")
    
    hospitals = Hospital.objects.all()
    print(f"Total hospitals: {hospitals.count()}")
    
    employments = Employment.objects.all()
    print(f"Total employment records: {employments.count()}")
    
    # Check verified profiles
    verified_candidates = CandidateProfile.objects.filter(verification_status='verified')
    print(f"Verified candidates: {verified_candidates.count()}")
    
    if verified_candidates.exists():
        print("Verified candidates:")
        for candidate in verified_candidates:
            print(f"  - {candidate.first_name} {candidate.last_name}")

if __name__ == '__main__':
    debug_users()
