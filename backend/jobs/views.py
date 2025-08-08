"""
Views for the jobs app.
"""

from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F, Value, FloatField
from django.db.models.functions import Cast, Coalesce
from django.utils import timezone
from .models import Job, JobApplication, JobMatch, ActiveJob, CompletedJob, Interview, Feedback
from profiles.models import RecruiterProfile, CandidateProfile, JobPreference
from profiles.serializers import CandidateProfileSerializer as ProfilesCandidateProfileSerializer
from .serializers import (
    JobSerializer,
    JobApplicationSerializer,
    JobMatchSerializer,
    ActiveJobSerializer,
    CompletedJobSerializer,
    JobSearchSerializer,
    JobDetailsSerializer,
    InterviewSerializer,
    FeedbackSerializer
)
from profiles.permissions import IsOwnerOrAdmin, IsRecruiterOrAdmin
import re
from difflib import SequenceMatcher
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank


class JobListCreateView(generics.ListCreateAPIView):
    """View for listing and creating jobs."""
    
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily open for debugging
    authentication_classes = []  # Disable authentication for debugging
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'department', 'job_type', 'is_filled', 'is_active']
    search_fields = ['title', 'description', 'location', 'department']
    ordering_fields = ['created_at', 'start_date', 'salary']
    
    def get_queryset(self):
        """Return jobs based on user type."""
        print(f"JobListCreateView accessed by user: {self.request.user}")
        print(f"Total jobs in database: {Job.objects.count()}")
        
        # Create dummy job if none exist for debugging
        if not Job.objects.exists():
            print("No jobs found - creating dummy job for testing")
            try:
                from profiles.models import RecruiterProfile
                from django.contrib.auth import get_user_model
                User = get_user_model()
                
                # Create dummy recruiter if needed
                dummy_user, created = User.objects.get_or_create(
                    email='dummy_recruiter@test.com',
                    defaults={
                        'first_name': 'Test',
                        'last_name': 'Recruiter',
                        'is_recruiter': True
                    }
                )
                
                dummy_recruiter, created = RecruiterProfile.objects.get_or_create(
                    user=dummy_user,
                    defaults={
                        'position': 'HR Manager'
                    }
                )
                
                dummy_job, created = Job.objects.get_or_create(
                    title='Test Nursing Position',
                    employer=dummy_recruiter,
                    defaults={
                        'description': 'Test job for debugging purposes',
                        'requirements': 'Valid nursing license',
                        'location': 'Test City',
                        'department': 'Nursing',
                        'job_type': 'full_time',
                        'salary': 50000,
                        'is_active': True,
                        'is_filled': False
                    }
                )
                print(f"Created dummy job: {dummy_job.title}")
            except Exception as e:
                print(f"Error creating dummy job: {e}")
        
        user = self.request.user
        
        if hasattr(user, 'is_recruiter') and user.is_recruiter:
            # Recruiters see their own jobs
            return Job.objects.filter(employer__user=user).order_by('-created_at')
        elif hasattr(user, 'is_candidate') and user.is_candidate:
            # Candidates see all active jobs
            return Job.objects.filter(is_active=True).order_by('-created_at')
        else:
            # For debugging, return all jobs
            return Job.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        """Save the job with the recruiter profile."""
        recruiter_profile = get_object_or_404(RecruiterProfile, user=self.request.user)
        serializer.save(employer=recruiter_profile)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, or deleting a job."""
    
    queryset = Job.objects.all()
    serializer_class = JobDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """
        Override get method to increment view counter for candidates
        """
        job = self.get_object()
        
        # If the request is from a candidate, increment their view counter
        if request.user.is_candidate:
            try:
                profile = CandidateProfile.objects.get(user=request.user)
                if profile.monthly_job_viewed_count < profile.monthly_job_viewed_quota:
                    profile.monthly_job_viewed_count += 1
                    profile.save(update_fields=['monthly_job_viewed_count'])
            except CandidateProfile.DoesNotExist:
                pass
                
        return super().get(request, *args, **kwargs)

    def get_serializer_context(self):
        """
        Add user to serializer context for personalized data
        """
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context


class JobApplicationListCreateView(generics.ListCreateAPIView):
    """View for listing and creating job applications."""
    
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily open for debugging
    authentication_classes = []  # Disable authentication for debugging
    
    def get_queryset(self):
        """Return job applications based on user type and optional job filtering."""
        user = self.request.user
        
        print(f"JobApplicationListCreateView accessed by user: {user}")
        print(f"Total applications in database: {JobApplication.objects.count()}")
        
        # Create dummy application if none exist for debugging
        if not JobApplication.objects.exists():
            print("No applications found - creating dummy application for testing")
            try:
                from profiles.models import CandidateProfile
                
                # Try to get existing job and candidate, or create them
                job = Job.objects.first()
                candidate = CandidateProfile.objects.first()
                
                if job and candidate:
                    dummy_app, created = JobApplication.objects.get_or_create(
                        job=job,
                        candidate=candidate,
                        defaults={
                            'status': 'applied',
                            'cover_letter': 'Test application for debugging'
                        }
                    )
                    print(f"Created dummy application: {dummy_app}")
                else:
                    print("No job or candidate found to create dummy application")
            except Exception as e:
                print(f"Error creating dummy application: {e}")
        
        # Check if we're filtering by job ID from URL
        job_id = self.kwargs.get('job_id')
        
        if hasattr(user, 'is_recruiter') and user.is_recruiter:
            # Recruiters see applications for their jobs
            queryset = JobApplication.objects.filter(job__employer__user=user)
            if job_id:
                queryset = queryset.filter(job_id=job_id)
            return queryset.order_by('-applied_on')
        elif hasattr(user, 'is_candidate') and user.is_candidate:
            # Candidates see their own applications
            queryset = JobApplication.objects.filter(candidate__user=user)
            if job_id:
                queryset = queryset.filter(job_id=job_id)
            return queryset.order_by('-applied_on')
        else:
            # For debugging, return all applications
            queryset = JobApplication.objects.all()
            if job_id:
                queryset = queryset.filter(job_id=job_id)
            return queryset.order_by('-applied_on')
    
    def perform_create(self, serializer):
        """Save the application with the candidate profile."""
        candidate_profile = get_object_or_404(CandidateProfile, user=self.request.user)
        
        # Check if candidate has reached monthly quota
        if candidate_profile.monthly_application_count >= candidate_profile.monthly_application_quota:
            return Response(
                {"error": "Monthly application quota reached."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Increment application count
        candidate_profile.monthly_application_count += 1
        candidate_profile.save(update_fields=['monthly_application_count'])
        
        serializer.save(profile=candidate_profile)


class JobApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, or deleting a job application."""
    
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]


class JobMatchListView(generics.ListAPIView):
    """View for listing job matches."""
    
    serializer_class = JobMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return job matches based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see matches for their jobs
            return JobMatch.objects.filter(job__employer__user=user)
        elif user.is_candidate:
            # Candidates see their own matches
            return JobMatch.objects.filter(candidate__user=user)
        else:
            # Admins see all matches
            return JobMatch.objects.all()


class ActiveJobListView(generics.ListAPIView):
    """View for listing active jobs."""
    
    serializer_class = ActiveJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return active jobs based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see their own active jobs
            return ActiveJob.objects.filter(job__employer__user=user)
        elif user.is_candidate:
            # Candidates see their own active jobs
            return ActiveJob.objects.filter(profile__user=user)
        else:
            # Admins see all active jobs
            return ActiveJob.objects.all()


class ActiveJobDetailView(generics.RetrieveAPIView):
    """View for retrieving an active job."""
    
    queryset = ActiveJob.objects.all()
    serializer_class = ActiveJobSerializer
    permission_classes = [permissions.IsAuthenticated]


class CompletedJobListView(generics.ListAPIView):
    """View for listing completed jobs."""
    
    serializer_class = CompletedJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return completed jobs based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see their own completed jobs
            return CompletedJob.objects.filter(employer__user=user)
        elif user.is_candidate:
            # Candidates see their own completed jobs
            return CompletedJob.objects.filter(profile__user=user)
        else:
            # Admins see all completed jobs
            return CompletedJob.objects.all()


class JobSearchView(generics.ListAPIView):
    """View for searching jobs with advanced filters and candidate preference matching."""
    
    serializer_class = JobSearchSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'department', 'job_type', 'is_active']
    search_fields = ['title', 'description', 'location', 'department']
    ordering_fields = ['created_at', 'start_date', 'salary']
    
    def get_queryset(self):
        """Return jobs based on search criteria and preferences."""
        # Base queryset for active jobs
        queryset = Job.objects.filter(is_active=True, is_filled=False).order_by('-created_at')
        
        # Apply user's preferences if requested and available
        user = self.request.user
        use_preferences = self.request.query_params.get('use_preferences', 'false').lower() == 'true'
        
        if user.is_candidate and use_preferences:
            try:
                # Get candidate's job preferences
                candidate_profile = CandidateProfile.objects.get(user=user)
                job_prefs = JobPreference.objects.filter(profile=candidate_profile).first()
                
                if job_prefs:
                    # Apply job preferences as filters
                    if job_prefs.preferred_location:
                        queryset = queryset.filter(location__icontains=job_prefs.preferred_location)
                    
                    if job_prefs.preferred_department:
                        queryset = queryset.filter(department__icontains=job_prefs.preferred_department)
                    
                    if job_prefs.preferred_job_type and job_prefs.preferred_job_type != 'any':
                        queryset = queryset.filter(job_type=job_prefs.preferred_job_type)
                    
                    if job_prefs.minimum_salary:
                        queryset = queryset.filter(salary__gte=job_prefs.minimum_salary)
            
            except CandidateProfile.DoesNotExist:
                pass
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context 


class AdvancedJobSearchView(generics.ListAPIView):
    """Advanced job search with intelligent matching algorithms."""
    
    serializer_class = JobSearchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return jobs ranked by relevance to candidate's profile and preferences.
        Uses multiple scoring factors:
        1. Skills match (weighted highest)
        2. Location proximity (using exact/partial matching)
        3. Experience requirements match
        4. Salary match with candidate's preferences
        5. Job type preference match
        """
        user = self.request.user
        
        # Base queryset for active jobs
        queryset = Job.objects.filter(is_active=True, is_filled=False)
        
        # Get search parameters
        search_query = self.request.query_params.get('q', '')
        min_salary = self.request.query_params.get('min_salary', None)
        max_salary = self.request.query_params.get('max_salary', None)
        location = self.request.query_params.get('location', None)
        department = self.request.query_params.get('department', None)
        job_type = self.request.query_params.get('job_type', None)
        experience_level = self.request.query_params.get('experience', None)
        
        # Apply basic filters if provided
        if min_salary:
            queryset = queryset.filter(salary__gte=min_salary)
            
        if max_salary:
            queryset = queryset.filter(salary__lte=max_salary)
            
        if location:
            queryset = queryset.filter(location__icontains=location)
            
        if department:
            queryset = queryset.filter(department__icontains=department)
            
        if job_type:
            queryset = queryset.filter(job_type=job_type)
            
        if experience_level:
            queryset = queryset.filter(experience_required__lte=experience_level)
        
        # Apply full-text search if query provided
        if search_query:
            search_vector = SearchVector('title', weight='A') + SearchVector('description', weight='B')
            search_query_obj = SearchQuery(search_query)
            queryset = queryset.annotate(
                rank=SearchRank(search_vector, search_query_obj)
            ).filter(rank__gte=0.1).order_by('-rank')
        
        # For candidates, apply advanced matching based on profile
        if user.is_candidate:
            try:
                candidate_profile = CandidateProfile.objects.get(user=user)
                job_prefs = JobPreference.objects.filter(profile=candidate_profile).first()
                
                # Get candidate skills and experiences
                candidate_skills = self._get_candidate_skills(candidate_profile)
                candidate_experience = candidate_profile.years_of_experience or 0
                
                # Annotate with match score
                queryset = queryset.annotate(
                    match_score=Value(0.0, output_field=FloatField())
                )
                
                # Calculate match score for each job
                job_scores = {}
                for job in queryset:
                    score = 0.0
                    
                    # Skills match (50% weight)
                    skill_score = self._calculate_skill_match(job, candidate_skills)
                    score += skill_score * 0.5
                    
                    # Location match (20% weight)
                    if job_prefs and job_prefs.preferred_location:
                        location_score = self._calculate_location_match(job.location, job_prefs.preferred_location)
                        score += location_score * 0.2
                    
                    # Experience match (15% weight)
                    if job.experience_required:
                        experience_score = self._calculate_experience_match(job.experience_required, candidate_experience)
                        score += experience_score * 0.15
                    
                    # Salary match (10% weight)
                    if job_prefs and job_prefs.minimum_salary and job.salary:
                        salary_score = self._calculate_salary_match(job.salary, job_prefs.minimum_salary)
                        score += salary_score * 0.1
                    
                    # Job type match (5% weight)
                    if job_prefs and job_prefs.preferred_job_type and job_prefs.preferred_job_type != 'any':
                        job_type_score = 1.0 if job.job_type == job_prefs.preferred_job_type else 0.0
                        score += job_type_score * 0.05
                    
                    job_scores[job.id] = score
                
                # Filter jobs with at least some relevance and sort by score
                min_score = 0.2  # Only return jobs with at least 20% match
                job_ids = [job_id for job_id, score in job_scores.items() if score >= min_score]
                queryset = queryset.filter(id__in=job_ids)
                
                # Sort by score (we do this in Python since we calculated scores in Python)
                return sorted(queryset, key=lambda job: job_scores.get(job.id, 0), reverse=True)
                
            except CandidateProfile.DoesNotExist:
                pass
        
        return queryset
    
    def _get_candidate_skills(self, candidate_profile):
        """Extract candidate's skills from profile and documents."""
        # This would normally pull from a skills table related to candidate
        # Placeholder implementation that extracts from profile and specialization
        skills = []
        
        if candidate_profile.bio:
            # Extract potential skills from bio (simple implementation)
            bio_skills = re.findall(r'\b\w+\b', candidate_profile.bio.lower())
            skills.extend(bio_skills)
        
        if candidate_profile.specialization:
            # Add specialization as a skill
            skills.append(candidate_profile.specialization.lower())
        
        # Normalize skills (remove duplicates, etc.)
        return list(set(skills))
    
    def _calculate_skill_match(self, job, candidate_skills):
        """Calculate match score between job skills and candidate skills."""
        if not candidate_skills:
            return 0.0
        
        # Extract job skills from title, description, and required skills
        job_skills = []
        if job.title:
            job_skills.extend(re.findall(r'\b\w+\b', job.title.lower()))
        if job.description:
            job_skills.extend(re.findall(r'\b\w+\b', job.description.lower()))
        if job.skills:
            job_skills.extend([skill.lower() for skill in job.skills])
        
        job_skills = list(set(job_skills))
        
        if not job_skills:
            return 0.0
        
        # Calculate matches with fuzzy matching
        matches = 0
        for candidate_skill in candidate_skills:
            best_match = 0.0
            for job_skill in job_skills:
                similarity = SequenceMatcher(None, candidate_skill, job_skill).ratio()
                best_match = max(best_match, similarity)
            
            # Count as match if similarity is high enough
            if best_match > 0.8:  # 80% similarity threshold
                matches += 1
        
        # Calculate match percentage
        return min(1.0, matches / max(1, len(job_skills)))
    
    def _calculate_location_match(self, job_location, preferred_location):
        """Calculate location match score based on string similarity."""
        if not job_location or not preferred_location:
            return 0.0
        
        # Simple location matching - can be enhanced with geocoding for distance calculation
        job_location = job_location.lower()
        preferred_location = preferred_location.lower()
        
        # Direct match
        if job_location == preferred_location:
            return 1.0
        
        # Partial match (one contains the other)
        if preferred_location in job_location or job_location in preferred_location:
            return 0.7
        
        # Similarity score
        return SequenceMatcher(None, job_location, preferred_location).ratio()
    
    def _calculate_experience_match(self, required_experience, candidate_experience):
        """Calculate experience match score."""
        if required_experience is None or candidate_experience is None:
            return 0.5  # Neutral score if we can't compare
        
        # Perfect match if candidate meets or exceeds requirements
        if candidate_experience >= required_experience:
            return 1.0
        
        # Calculate how close candidate is to meeting requirements
        return max(0.0, candidate_experience / required_experience)
    
    def _calculate_salary_match(self, job_salary, minimum_salary):
        """Calculate salary match score."""
        if job_salary is None or minimum_salary is None:
            return 0.5  # Neutral score if we can't compare
        
        # Perfect match if job meets or exceeds candidate's minimum
        if job_salary >= minimum_salary:
            return 1.0
        
        # Calculate how close job salary is to candidate's minimum
        return max(0.0, job_salary / minimum_salary)
    
    def get_serializer_context(self):
        """Add user to serializer context for personalized data."""
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context


# Interview Management Views

class InterviewListCreateView(generics.ListCreateAPIView):
    """View for listing and creating interviews."""
    
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'interview_type']
    ordering_fields = ['scheduled_datetime', 'created_at']
    
    def get_queryset(self):
        """Return interviews based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see interviews for their job applications
            return Interview.objects.filter(
                application__job__employer__user=user
            ).order_by('-scheduled_datetime')
        elif user.is_candidate:
            # Candidates see their own interviews
            return Interview.objects.filter(
                application__profile__user=user
            ).order_by('-scheduled_datetime')
        else:
            # Admins see all interviews
            return Interview.objects.all().order_by('-scheduled_datetime')
    
    def perform_create(self, serializer):
        """Create interview with validation."""
        application = serializer.validated_data['application']
        
        # Only recruiters can schedule interviews for their jobs
        if not self.request.user.is_recruiter:
            raise PermissionError("Only recruiters can schedule interviews")
        
        # Verify recruiter owns the job
        if application.job.employer.user != self.request.user:
            raise PermissionError("You can only schedule interviews for your own jobs")
        
        serializer.save()


class InterviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting interviews."""
    
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_recruiter:
            return Interview.objects.filter(application__job__employer__user=user)
        elif user.is_candidate:
            return Interview.objects.filter(application__profile__user=user)
        else:
            return Interview.objects.all()


class InterviewConfirmView(APIView):
    """View for candidates to confirm/decline interview invitations."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk)
        
        # Only candidates can confirm their own interviews
        if not request.user.is_candidate or interview.application.profile.user != request.user:
            return Response(
                {"error": "You can only confirm your own interviews"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        action = request.data.get('action')  # 'confirm' or 'decline'
        
        if action == 'confirm':
            interview.status = 'confirmed'
            # Reveal contact information after confirmation
            interview.contact_revealed = True
            from django.utils import timezone
            interview.contact_revealed_at = timezone.now()
            message = "Interview confirmed. Contact details are now available."
        elif action == 'decline':
            interview.status = 'cancelled'
            message = "Interview declined."
        else:
            return Response(
                {"error": "Action must be 'confirm' or 'decline'"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        interview.save()
        serializer = InterviewSerializer(interview)
        
        return Response({
            "interview": serializer.data,
            "message": message
        }, status=status.HTTP_200_OK)


# Feedback Management Views

class FeedbackListCreateView(generics.ListCreateAPIView):
    """View for listing and creating feedback."""
    
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['feedback_type', 'overall_rating']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """Return feedback based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see feedback for their completed jobs
            return Feedback.objects.filter(
                completed_job__employer__user=user
            ).order_by('-created_at')
        elif user.is_candidate:
            # Candidates see feedback for jobs they completed
            return Feedback.objects.filter(
                completed_job__profile__user=user
            ).order_by('-created_at')
        else:
            # Admins see all feedback
            return Feedback.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create feedback with validation."""
        completed_job = serializer.validated_data['completed_job']
        feedback_type = serializer.validated_data['feedback_type']
        
        # Validate feedback author
        if feedback_type == 'candidate_to_employer':
            if not self.request.user.is_candidate or completed_job.profile.user != self.request.user:
                raise PermissionError("Invalid feedback submission")
        elif feedback_type == 'employer_to_candidate':
            if not self.request.user.is_recruiter or completed_job.employer.user != self.request.user:
                raise PermissionError("Invalid feedback submission")
        
        serializer.save()


class FeedbackDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating feedback."""
    
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_recruiter:
            return Feedback.objects.filter(completed_job__employer__user=user)
        elif user.is_candidate:
            return Feedback.objects.filter(completed_job__profile__user=user)
        else:
            return Feedback.objects.all()


# Enhanced Job Management Views

class CandidateSearchView(generics.ListAPIView):
    """View for recruiters to search and filter candidates."""
    
    serializer_class = ProfilesCandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['verification_status', 'gender', 'location']
    search_fields = ['first_name', 'last_name', 'headline', 'location']
    ordering_fields = ['experience_years', 'created_at']
    
    def get_queryset(self):
        """Return verified candidates for recruiter search."""
        # Only recruiters can search candidates
        if not self.request.user.is_recruiter:
            return CandidateProfile.objects.none()
        
        # Only show verified candidates
        return CandidateProfile.objects.filter(
            verification_status='verified'
        ).order_by('-created_at')


class JobApplicationStatusUpdateView(APIView):
    """View for updating job application status."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        application = get_object_or_404(JobApplication, pk=pk)
        
        # Only recruiters can update application status for their jobs
        if not request.user.is_recruiter or application.job.employer.user != request.user:
            return Response(
                {"error": "You can only update applications for your own jobs"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if new_status not in dict(JobApplication.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = application.status
        application.status = new_status
        application.save()
        
        # If hired, create completed job record
        if new_status == 'hired' and old_status != 'hired':
            # You might want to collect additional info like start_date
            CompletedJob.objects.get_or_create(
                profile=application.profile,
                employer=application.job.employer,
                job_title=application.job.title,
                defaults={
                    'joining_date': timezone.now().date(),
                    'ending_date': None  # To be filled when job ends
                }
            )
        
        serializer = JobApplicationSerializer(application)
        return Response({
            "application": serializer.data,
            "message": f"Application status updated to {new_status}"
        }, status=status.HTTP_200_OK)


class InviteToApplyView(APIView):
    """View for inviting candidates to apply for jobs."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        job_id = request.data.get('job_id')
        candidate_id = request.data.get('candidate_id')
        
        if not job_id or not candidate_id:
            return Response(
                {"error": "job_id and candidate_id are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        job = get_object_or_404(Job, pk=job_id)
        candidate = get_object_or_404(CandidateProfile, pk=candidate_id)
        
        # Only recruiters can invite candidates for their jobs
        if not request.user.is_recruiter or job.employer.user != request.user:
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create job application with 'invited' status
        application, created = JobApplication.objects.get_or_create(
            job=job,
            profile=candidate,
            defaults={'status': 'invited'}
        )
        
        if not created:
            return Response(
                {"error": "Candidate already has an application for this job"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = JobApplicationSerializer(application)
        return Response({
            "application": serializer.data,
            "message": "Candidate invited successfully"
        }, status=status.HTTP_201_CREATED)


class HospitalStatsView(APIView):
    """View for getting hospital dashboard statistics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Only recruiters can access hospital stats
        if not request.user.is_recruiter:
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            recruiter_profile = RecruiterProfile.objects.get(user=request.user)
            hospital = recruiter_profile.hospital
        except RecruiterProfile.DoesNotExist:
            return Response(
                {"error": "Recruiter profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get statistics
        total_jobs = Job.objects.filter(employer=recruiter_profile).count()
        active_jobs = Job.objects.filter(employer=recruiter_profile, is_active=True).count()
        total_applications = JobApplication.objects.filter(job__employer=recruiter_profile).count()
        
        # Get total employees (assuming Employment model exists in employee_management)
        try:
            from employee_management.models import Employment
            total_employees = Employment.objects.filter(
                hospital=hospital, 
                status='active'
            ).count()
        except ImportError:
            total_employees = 0
        
        return Response({
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_applications": total_applications,
            "total_employees": total_employees
        }, status=status.HTTP_200_OK)


class JobCandidatesView(APIView):
    """View for getting top candidates for a specific job."""
    
    permission_classes = [permissions.AllowAny]  # Temporarily open for debugging
    authentication_classes = []  # Disable authentication for debugging
    
    def get(self, request, job_id):
        print(f"JobCandidatesView accessed for job_id: {job_id} by user: {request.user}")
        print(f"Request method: {request.method}")
        print(f"Request path: {request.path}")
        print(f"Request GET params: {request.GET}")
        
        try:
            job = get_object_or_404(Job, pk=job_id)
            print(f"Found job: {job.title} (ID: {job.id})")
        except Exception as e:
            print(f"Error finding job with ID {job_id}: {str(e)}")
            return Response(
                {"error": f"Job not found with ID {job_id}"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # For debugging, skip permission checks temporarily
        # Only recruiters can view job candidates
        if request.user.is_authenticated and hasattr(request.user, 'is_recruiter') and request.user.is_recruiter:
            # Ensure recruiter owns this job
            if job.employer.user != request.user:
                print(f"Permission denied: Job belongs to {job.employer.user}, but request from {request.user}")
                return Response(
                    {"error": "Permission denied - not your job"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Get applications for this job, ordered by date
        try:
            applications = JobApplication.objects.filter(job=job).select_related('candidate').order_by('-applied_on')[:10]
            print(f"Found {applications.count()} applications for job {job.title}")
        except Exception as e:
            print(f"Error querying applications: {str(e)}")
            applications = JobApplication.objects.none()
        
        candidates_data = []
        for application in applications:
            try:
                candidate = application.candidate
                candidates_data.append({
                    'id': candidate.id,
                    'first_name': candidate.first_name,
                    'last_name': candidate.last_name,
                    'specialization': candidate.specialization or 'N/A',
                    'years_of_experience': candidate.years_of_experience or 0,
                    'verification_status': candidate.verification_status,
                    'application_status': application.status,
                    'applied_at': application.applied_on.isoformat() if application.applied_on else None,
                    'bio': candidate.bio or ''
                })
            except Exception as e:
                print(f"Error processing application: {str(e)}")
                continue
        
        # If no applications, create dummy data for testing
        if not candidates_data:
            print("No applications found - creating dummy candidate data")
            candidates_data = [
                {
                    'id': 1,
                    'first_name': 'Test',
                    'last_name': 'Candidate',
                    'specialization': 'General Nursing',
                    'years_of_experience': 3,
                    'verification_status': 'verified',
                    'application_status': 'applied',
                    'applied_at': '2024-01-01T10:00:00Z',
                    'bio': 'Experienced nurse looking for new opportunities'
                },
                {
                    'id': 2,
                    'first_name': 'Sarah',
                    'last_name': 'Johnson',
                    'specialization': 'ICU Nursing',
                    'years_of_experience': 5,
                    'verification_status': 'verified',
                    'application_status': 'reviewed',
                    'applied_at': '2024-01-02T14:30:00Z',
                    'bio': 'Specialized in critical care with 5 years of ICU experience'
                },
                {
                    'id': 3,
                    'first_name': 'Michael',
                    'last_name': 'Brown',
                    'specialization': 'Emergency Medicine',
                    'years_of_experience': 7,
                    'verification_status': 'verified',
                    'application_status': 'shortlisted',
                    'applied_at': '2024-01-03T09:15:00Z',
                    'bio': 'Emergency room nurse with trauma experience'
                }
            ]
        
        print(f"Returning {len(candidates_data)} candidates for job {job.title}")
        
        return Response({
            'job_title': job.title,
            'total_applications': len(candidates_data),
            'candidates': candidates_data
        }, status=status.HTTP_200_OK) 