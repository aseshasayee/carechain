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
from .models import Job, JobApplication, JobMatch, ActiveJob, CompletedJob
from profiles.models import RecruiterProfile, CandidateProfile, JobPreference
from .serializers import (
    JobSerializer,
    JobApplicationSerializer,
    JobMatchSerializer,
    ActiveJobSerializer,
    CompletedJobSerializer,
    JobSearchSerializer,
    JobDetailsSerializer
)
from profiles.permissions import IsOwnerOrAdmin, IsRecruiterOrAdmin
import re
from difflib import SequenceMatcher
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank


class JobListCreateView(generics.ListCreateAPIView):
    """View for listing and creating jobs."""
    
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'department', 'job_type', 'is_filled', 'is_active']
    search_fields = ['title', 'description', 'location', 'department']
    ordering_fields = ['created_at', 'start_date', 'salary']
    
    def get_queryset(self):
        """Return jobs based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see their own jobs
            return Job.objects.filter(employer__user=user).order_by('-created_at')
        elif user.is_candidate:
            # Candidates see all active jobs
            return Job.objects.filter(is_active=True).order_by('-created_at')
        else:
            # Admins see all jobs
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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return job applications based on user type and optional job filtering."""
        user = self.request.user
        
        # Check if we're filtering by job ID from URL
        job_id = self.kwargs.get('job_id')
        
        if user.is_recruiter:
            # Recruiters see applications for their jobs
            queryset = JobApplication.objects.filter(job__employer__user=user)
            if job_id:
                queryset = queryset.filter(job_id=job_id)
            return queryset.order_by('-applied_on')
        elif user.is_candidate:
            # Candidates see their own applications
            queryset = JobApplication.objects.filter(profile__user=user)
            if job_id:
                queryset = queryset.filter(job_id=job_id)
            return queryset.order_by('-applied_on')
        else:
            # Admins see all applications
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