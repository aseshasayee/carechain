from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from profiles.models import CandidateProfile, Hospital
from jobs.models import Job, JobApplication
from notifications.models import Notification, ChatMessage

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)


class DashboardStatsView(APIView):
    """
    View to get statistics for the admin dashboard
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get basic counts
        total_users = User.objects.count()
        pending_candidate_verifications = CandidateProfile.objects.filter(verification_status='pending').count()
        pending_hospital_verifications = Hospital.objects.filter(verification_status='pending').count()
        active_jobs = Job.objects.filter(is_active=True).count()
        total_applications = JobApplication.objects.count()
        
        # Get verification stats
        candidate_verification = {
            'pending': CandidateProfile.objects.filter(verification_status='pending').count(),
            'verified': CandidateProfile.objects.filter(verification_status='verified').count(),
            'rejected': CandidateProfile.objects.filter(verification_status='rejected').count(),
        }
        
        hospital_verification = {
            'pending': Hospital.objects.filter(verification_status='pending').count(),
            'verified': Hospital.objects.filter(verification_status='verified').count(),
            'rejected': Hospital.objects.filter(verification_status='rejected').count(),
        }
        
        return Response({
            'total_users': total_users,
            'pending_verifications': pending_candidate_verifications + pending_hospital_verifications,
            'active_jobs': active_jobs,
            'total_applications': total_applications,
            'candidate_verification': candidate_verification,
            'hospital_verification': hospital_verification,
        })


class RecentActivityView(APIView):
    """
    View to get recent activity for the admin dashboard
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get recent activity (last 20)
        recent_activity = []
        
        # Get recent job applications
        recent_applications = JobApplication.objects.order_by('-created_at')[:5]
        for app in recent_applications:
            recent_activity.append({
                'action': 'Job Application',
                'description': f'{app.candidate.user.get_full_name()} applied for {app.job.title}',
                'timestamp': app.created_at,
            })
        
        # Get recent candidate verifications
        recent_candidate_verifications = CandidateProfile.objects.filter(
            verification_status__in=['verified', 'rejected'],
            verification_date__isnull=False
        ).order_by('-verification_date')[:5]
        
        for profile in recent_candidate_verifications:
            action = 'Candidate Verified' if profile.verification_status == 'verified' else 'Candidate Rejected'
            recent_activity.append({
                'action': action,
                'description': f"{profile.user.get_full_name()}'s verification was {profile.verification_status}",
                'timestamp': profile.verification_date,
            })
        
        # Get recent hospital verifications
        recent_hospital_verifications = Hospital.objects.filter(
            verification_status__in=['verified', 'rejected'],
            verification_date__isnull=False
        ).order_by('-verification_date')[:5]
        
        for hospital in recent_hospital_verifications:
            action = 'Hospital Verified' if hospital.verification_status == 'verified' else 'Hospital Rejected'
            recent_activity.append({
                'action': action,
                'description': f"{hospital.name}'s verification was {hospital.verification_status}",
                'timestamp': hospital.verification_date,
            })
        
        # Get recent jobs posted
        recent_jobs = Job.objects.order_by('-created_at')[:5]
        for job in recent_jobs:
            recent_activity.append({
                'action': 'New Job Posted',
                'description': f"{job.employer.name if hasattr(job, 'employer') and job.employer else 'A recruiter'} posted a new {job.title} position",
                'timestamp': job.created_at,
            })
        
        # Sort by timestamp
        recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Take only the most recent 20
        recent_activity = recent_activity[:20]
        
        return Response(recent_activity)


class UserManagementView(generics.ListAPIView):
    """
    View to list and manage users
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get query parameters for filtering
        role = request.query_params.get('role', None)
        search = request.query_params.get('search', None)
        
        users = User.objects.all()
        
        # Apply filters
        if role:
            if role == 'candidate':
                users = users.filter(is_candidate=True)
            elif role == 'recruiter':
                users = users.filter(is_recruiter=True)
            elif role == 'admin':
                users = users.filter(Q(is_staff=True) | Q(is_superuser=True))
        
        if search:
            users = users.filter(
                Q(email__icontains=search) | 
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search)
            )
        
        # Build the response
        user_data = []
        for user in users:
            user_info = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_candidate': getattr(user, 'is_candidate', False),
                'is_recruiter': getattr(user, 'is_recruiter', False),
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
            }
            
            # Add profile info if candidate
            if getattr(user, 'is_candidate', False):
                try:
                    profile = CandidateProfile.objects.get(user=user)
                    user_info['verification_status'] = profile.verification_status
                except CandidateProfile.DoesNotExist:
                    user_info['verification_status'] = None
            
            user_data.append(user_info)
        
        return Response(user_data)
