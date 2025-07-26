#!/usr/bin/env python
"""
Test script for Job Portal key workflows
"""

import requests
import json
import time
import sys
from getpass import getpass
import argparse

API_BASE_URL = "http://localhost:8000/api"
token = None

def print_header(message):
    """Print a section header."""
    print("\n" + "=" * 80)
    print(f" {message}")
    print("=" * 80)

def print_success(message):
    """Print a success message."""
    print(f"✓ {message}")

def print_error(message):
    """Print an error message."""
    print(f"✗ {message}")

def make_request(method, endpoint, data=None, files=None, auth=True):
    """Make an HTTP request to the API."""
    url = f"{API_BASE_URL}{endpoint}"
    headers = {}
    
    if auth and token:
        headers["Authorization"] = f"Bearer {token}"
    
    if data and not files:
        headers["Content-Type"] = "application/json"
        data = json.dumps(data)
    
    try:
        if method.lower() == "get":
            response = requests.get(url, headers=headers)
        elif method.lower() == "post":
            response = requests.post(url, data=data, headers=headers, files=files)
        elif method.lower() == "put":
            response = requests.put(url, data=data, headers=headers, files=files)
        elif method.lower() == "patch":
            response = requests.patch(url, data=data, headers=headers, files=files)
        elif method.lower() == "delete":
            response = requests.delete(url, headers=headers)
        else:
            print_error(f"Unsupported method: {method}")
            return None
        
        return response
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {e}")
        return None

def login(email, password):
    """Log in to the system."""
    print_header("Testing Login")
    
    response = make_request("post", "/accounts/login/", data={
        "email": email,
        "password": password
    }, auth=False)
    
    if response and response.status_code == 200:
        global token
        data = response.json()
        token = data.get("token")
        user_role = "candidate" if data.get("is_candidate") else "recruiter"
        print_success(f"Login successful as {user_role}")
        return token
    else:
        print_error(f"Login failed: {response.json() if response else 'No response'}")
        return None

def test_candidate_workflow():
    """Test candidate workflow."""
    print_header("Testing Candidate Workflow")
    
    # 1. Get profile
    print("1. Fetching candidate profile...")
    response = make_request("get", "/profiles/candidate/")
    
    if response and response.status_code == 200:
        profile_data = response.json()
        print_success("Profile fetched successfully")
        profile_id = profile_data.get("id")
    else:
        print_error(f"Failed to fetch profile: {response.json() if response else 'No response'}")
        return
    
    # 2. Check verification status
    print("\n2. Checking verification status...")
    response = make_request("get", "/profiles/verification-status/")
    
    if response and response.status_code == 200:
        status_data = response.json()
        print_success(f"Verification status: {status_data.get('status')}")
    else:
        print_error(f"Failed to get verification status: {response.json() if response else 'No response'}")
    
    # 3. Search for jobs
    print("\n3. Searching for jobs...")
    response = make_request("get", "/jobs/search/?keyword=doctor")
    
    if response and response.status_code == 200:
        jobs_data = response.json()
        print_success(f"Found {len(jobs_data)} jobs")
        
        if jobs_data:
            job_id = jobs_data[0].get("id")
            
            # 4. Apply for a job
            print("\n4. Applying for job...")
            response = make_request("post", "/jobs/applications/", data={
                "job": job_id,
                "cover_letter": "I am very interested in this position."
            })
            
            if response and response.status_code in [201, 200]:
                print_success("Job application submitted successfully")
            else:
                print_error(f"Failed to apply for job: {response.json() if response else 'No response'}")
    else:
        print_error(f"Failed to search for jobs: {response.json() if response else 'No response'}")

def test_recruiter_workflow():
    """Test recruiter workflow."""
    print_header("Testing Recruiter Workflow")
    
    # 1. Get profile
    print("1. Fetching recruiter profile...")
    response = make_request("get", "/profiles/recruiter/")
    
    if response and response.status_code == 200:
        profile_data = response.json()
        print_success("Profile fetched successfully")
    else:
        print_error(f"Failed to fetch profile: {response.json() if response else 'No response'}")
        return
    
    # 2. Check verification status
    print("\n2. Checking verification status...")
    response = make_request("get", "/profiles/verification-status/")
    
    if response and response.status_code == 200:
        status_data = response.json()
        print_success(f"Verification status: {status_data.get('status')}")
        
        # Only proceed if verified
        if status_data.get('status') != 'verified':
            print_error("Recruiter not verified. Cannot post jobs.")
            return
    else:
        print_error(f"Failed to get verification status: {response.json() if response else 'No response'}")
        return
    
    # 3. Post a job
    print("\n3. Posting a job...")
    job_data = {
        "title": "Senior Doctor",
        "description": "We are looking for an experienced doctor to join our team.",
        "location": "Mumbai",
        "department": "Cardiology",
        "experience_required": 5,
        "qualifications_required": "MD in Cardiology",
        "job_type": "full_time",
        "salary_range_min": 100000,
        "salary_range_max": 200000
    }
    
    response = make_request("post", "/jobs/", data=job_data)
    
    if response and response.status_code == 201:
        job = response.json()
        print_success(f"Job posted successfully with ID {job.get('id')}")
        job_id = job.get("id")
        
        # 4. Get applications for the job
        print("\n4. Checking applications for this job...")
        response = make_request("get", f"/jobs/{job_id}/applications/")
        
        if response and response.status_code == 200:
            applications = response.json()
            print_success(f"Found {len(applications)} applications")
            
            # 5. Update an application status if any exist
            if applications:
                app_id = applications[0].get("id")
                print("\n5. Updating application status...")
                
                response = make_request("patch", f"/jobs/applications/{app_id}/", data={
                    "status": "in_review"
                })
                
                if response and response.status_code == 200:
                    print_success("Application status updated successfully")
                else:
                    print_error(f"Failed to update application status: {response.json() if response else 'No response'}")
        else:
            print_error(f"Failed to get applications: {response.json() if response else 'No response'}")
    else:
        print_error(f"Failed to post job: {response.json() if response else 'No response'}")

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Test Job Portal workflows")
    parser.add_argument("--role", choices=["candidate", "recruiter"], required=True,
                        help="The role to test (candidate or recruiter)")
    parser.add_argument("--email", required=True, help="Email address for login")
    
    args = parser.parse_args()
    
    # Get password
    password = getpass("Enter password: ")
    
    # Login
    if not login(args.email, password):
        print_error("Login failed. Exiting.")
        sys.exit(1)
    
    # Run workflow based on role
    if args.role == "candidate":
        test_candidate_workflow()
    else:
        test_recruiter_workflow()

if __name__ == "__main__":
    main() 