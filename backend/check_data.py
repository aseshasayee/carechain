#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append('c:\\Users\\asesh\\OneDrive\\Desktop\\job portal\\backend')

# Set the Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'carechain.settings'

# Setup Django
django.setup()

from jobs.models import Job, JobApplication
from profiles.models import RecruiterProfile, CandidateProfile, Hospital

def check_data():
    print("=== Database Status ===")
    print(f"Hospitals: {Hospital.objects.count()}")
    print(f"Recruiter Profiles: {RecruiterProfile.objects.count()}")
    print(f"Candidate Profiles: {CandidateProfile.objects.count()}")
    print(f"Jobs: {Job.objects.count()}")
    print(f"Job Applications: {JobApplication.objects.count()}")
    
    print("\n=== Jobs Details ===")
    for job in Job.objects.all():
        applications_count = job.applications.count()
        print(f"- {job.title} (Applications: {applications_count})")
    
    print("\n=== Applications Details ===")
    for app in JobApplication.objects.all():
        print(f"- {app.profile.first_name} {app.profile.last_name} applied for {app.job.title} (Status: {app.status})")

if __name__ == '__main__':
    check_data()
