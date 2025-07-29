#!/usr/bin/env python
"""
Script to create sample data for the applicant tracking system.
"""

import os
import sys
import django
from datetime import date, datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'carechain.settings')
django.setup()

from django.contrib.auth import get_user_model
from jobs.models import Job, JobApplication
from profiles.models import RecruiterProfile, CandidateProfile, Hospital

User = get_user_model()

def create_sample_data():
    print("Creating sample data...")
    
    # Create a sample hospital
    hospital, created = Hospital.objects.get_or_create(
        name="City General Hospital",
        defaults={
            'registration_number': 'CGH001',
            'contact_no': '+91-44-12345678',
            'address': '123 Main Street, Chennai, Tamil Nadu',
            'primary_contact': 'Dr. Administrator',
            'verification_status': 'verified'
        }
    )
    
    # Create a recruiter user
    recruiter_user, created = User.objects.get_or_create(
        email='recruiter@citygeneral.com',
        defaults={
            'is_recruiter': True,
            'is_active': True
        }
    )
    if created:
        recruiter_user.set_password('password123')
        recruiter_user.save()
    
    # Create recruiter profile
    recruiter_profile, created = RecruiterProfile.objects.get_or_create(
        user=recruiter_user,
        defaults={
            'hospital': hospital,
            'position': 'HR Manager',
            'is_verified': True
        }
    )
    
    # Create sample jobs
    jobs_data = [
        {
            'title': 'Senior Registered Nurse - ICU',
            'description': 'We are looking for an experienced ICU nurse to join our critical care team.',
            'location': 'Chennai',
            'department': 'ICU',
            'job_type': 'full_time',
            'start_date': date(2025, 8, 1),
            'salary': 50000,
            'pay_unit': 'monthly',
            'experience_required': 3,
            'is_active': True
        },
        {
            'title': 'Cardiologist',
            'description': 'Seeking a qualified cardiologist for our cardiac care unit.',
            'location': 'Chennai',
            'department': 'Cardiology',
            'job_type': 'full_time',
            'start_date': date(2025, 8, 15),
            'salary': 150000,
            'pay_unit': 'monthly',
            'experience_required': 5,
            'is_active': True
        },
        {
            'title': 'Emergency Room Physician',
            'description': 'Emergency medicine physician needed for 24/7 emergency services.',
            'location': 'Chennai',
            'department': 'Emergency',
            'job_type': 'full_time',
            'start_date': date(2025, 7, 30),
            'salary': 120000,
            'pay_unit': 'monthly',
            'experience_required': 2,
            'is_active': True
        }
    ]
    
    created_jobs = []
    for job_data in jobs_data:
        job, created = Job.objects.get_or_create(
            title=job_data['title'],
            employer=recruiter_profile,
            defaults=job_data
        )
        created_jobs.append(job)
        if created:
            print(f"Created job: {job.title}")
    
    # Create sample candidates
    candidates_data = [
        {
            'email': 'priya.sharma@email.com',
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'experience_years': 5,
            'headline': 'Experienced ICU Nurse'
        },
        {
            'email': 'rajesh.kumar@email.com',
            'first_name': 'Rajesh',
            'last_name': 'Kumar',
            'experience_years': 8,
            'headline': 'Senior Staff Nurse'
        },
        {
            'email': 'anil.gupta@email.com',
            'first_name': 'Dr. Anil',
            'last_name': 'Gupta',
            'experience_years': 12,
            'headline': 'Consultant Cardiologist'
        },
        {
            'email': 'sunita.reddy@email.com',
            'first_name': 'Dr. Sunita',
            'last_name': 'Reddy',
            'experience_years': 15,
            'headline': 'Senior Cardiologist'
        },
        {
            'email': 'vikram.singh@email.com',
            'first_name': 'Dr. Vikram',
            'last_name': 'Singh',
            'experience_years': 6,
            'headline': 'Emergency Medicine Specialist'
        }
    ]
    
    created_candidates = []
    for candidate_data in candidates_data:
        user, created = User.objects.get_or_create(
            email=candidate_data['email'],
            defaults={
                'is_candidate': True,
                'is_active': True
            }
        )
        if created:
            user.set_password('password123')
            user.save()
        
        candidate_profile, created = CandidateProfile.objects.get_or_create(
            user=user,
            defaults={
                'first_name': candidate_data['first_name'],
                'last_name': candidate_data['last_name'],
                'experience_years': candidate_data['experience_years'],
                'headline': candidate_data['headline']
            }
        )
        created_candidates.append(candidate_profile)
        if created:
            print(f"Created candidate: {candidate_profile.first_name} {candidate_profile.last_name}")
    
    # Create sample job applications
    applications_data = [
        # Applications for ICU Nurse job
        {
            'candidate_idx': 0,  # Priya Sharma
            'job_idx': 0,  # ICU Nurse
            'status': 'applied'
        },
        {
            'candidate_idx': 1,  # Rajesh Kumar
            'job_idx': 0,  # ICU Nurse
            'status': 'in_review'
        },
        # Applications for Cardiologist job
        {
            'candidate_idx': 2,  # Dr. Anil Gupta
            'job_idx': 1,  # Cardiologist
            'status': 'applied'
        },
        {
            'candidate_idx': 3,  # Dr. Sunita Reddy
            'job_idx': 1,  # Cardiologist
            'status': 'interviewed'
        },
        # Applications for Emergency job
        {
            'candidate_idx': 4,  # Dr. Vikram Singh
            'job_idx': 2,  # Emergency
            'status': 'applied'
        }
    ]
    
    for app_data in applications_data:
        candidate = created_candidates[app_data['candidate_idx']]
        job = created_jobs[app_data['job_idx']]
        
        application, created = JobApplication.objects.get_or_create(
            profile=candidate,
            job=job,
            defaults={
                'status': app_data['status'],
                'personal_statement': f'I am interested in the {job.title} position and believe my {candidate.experience_years} years of experience make me a great fit.'
            }
        )
        if created:
            print(f"Created application: {candidate.first_name} {candidate.last_name} -> {job.title}")
    
    print("Sample data creation completed!")
    print(f"Total Jobs: {Job.objects.count()}")
    print(f"Total Applications: {JobApplication.objects.count()}")

if __name__ == '__main__':
    create_sample_data()
