"""
Views for job matching and recommendation system.
"""

import json
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, Avg, Count, F
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    MatchingCriteria, JobMatch, CandidatePreferences, 
    SearchHistory, RecommendationFeedback, AutoMatchingSettings
)
from .serializers import (
    MatchingCriteriaSerializer, JobMatchSerializer, CandidatePreferencesSerializer,
    SearchHistorySerializer, RecommendationFeedbackSerializer, AutoMatchingSettingsSerializer,
    JobRecommendationSerializer, MatchingStatsSerializer, CandidateMatchSummarySerializer
)
from jobs.models import Job, JobApplication
from profiles.models import CandidateProfile, RecruiterProfile


class JobRecommendationsView(APIView):
    """View for getting personalized job recommendations for candidates."""
    
    permission_classes = [permissions.AllowAny]  # Temporarily open for debugging
    authentication_classes = []  # Disable authentication for debugging
    
    def get(self, request):
        """Get job recommendations for the authenticated candidate."""
        print(f"JobRecommendationsView accessed by user: {request.user}")
        
        # For debugging, return sample recommendations even without authentication
        if not request.user.is_authenticated:
            print("User not authenticated - returning sample recommendations")
            from jobs.models import Job
            from jobs.serializers import JobSerializer
            
            # Return some sample jobs as recommendations
            sample_jobs = Job.objects.all()[:5]
            job_data = []
            
            for job in sample_jobs:
                job_data.append({
                    'id': job.id,
                    'title': job.title,
                    'department': job.department,
                    'location': job.location,
                    'salary': job.salary,
                    'match_score': 85.0,  # Dummy match score
                    'match_reasons': ['Location match', 'Department preference']
                })
            
            return Response({
                'recommendations': job_data,
                'total_count': len(job_data),
                'message': 'Sample recommendations for debugging'
            })
        
        if not request.user.is_candidate:
            return Response(
                {"error": "Only candidates can get job recommendations"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            candidate_profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Candidate profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get query parameters
        limit = min(int(request.GET.get('limit', 10)), 50)
        min_score = float(request.GET.get('min_score', 60.0))
        job_type = request.GET.get('job_type', '')
        location = request.GET.get('location', '')
        
        # Initialize matching engine
        from .matching_algorithm import JobMatchingEngine
        matching_engine = JobMatchingEngine()
        
        # Get recommendations
        recommendations = matching_engine.get_recommendations_for_candidate(
            candidate_profile=candidate_profile,
            limit=limit,
            min_score=min_score,
            job_type=job_type,
            location=location
        )
        
        # Serialize results
        serializer = JobRecommendationSerializer(recommendations, many=True)
        
        return Response({
            "recommendations": serializer.data,
            "total_count": len(recommendations),
            "min_score_threshold": min_score
        }, status=status.HTTP_200_OK)


class RunJobMatchingView(APIView):
    """View for manually triggering job matching process."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Run job matching for all candidates or specific candidate."""
        # Only recruiters and admins can trigger matching
        if not (request.user.is_recruiter or request.user.is_staff):
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        candidate_id = request.data.get('candidate_id')
        force_update = request.data.get('force_update', False)
        
        from .matching_algorithm import JobMatchingEngine
        matching_engine = JobMatchingEngine()
        
        if candidate_id:
            # Run matching for specific candidate
            try:
                candidate = CandidateProfile.objects.get(pk=candidate_id)
                results = matching_engine.match_candidate_to_jobs(
                    candidate, force_update=force_update
                )
                
                return Response({
                    "message": f"Matching completed for {candidate.first_name} {candidate.last_name}",
                    "matches_created": results['matches_created'],
                    "matches_updated": results['matches_updated']
                }, status=status.HTTP_200_OK)
                
            except CandidateProfile.DoesNotExist:
                return Response(
                    {"error": "Candidate not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Run matching for all candidates
            results = matching_engine.match_all_candidates(force_update=force_update)
            
            return Response({
                "message": "Matching completed for all candidates",
                "candidates_processed": results['candidates_processed'],
                "total_matches_created": results['total_matches_created'],
                "total_matches_updated": results['total_matches_updated']
            }, status=status.HTTP_200_OK)


class CandidatePreferencesView(APIView):
    """View for managing candidate job preferences."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get preferences for the authenticated candidate."""
        if not request.user.is_candidate:
            return Response(
                {"error": "Only candidates can access preferences"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            candidate_profile = CandidateProfile.objects.get(user=request.user)
            preferences, created = CandidatePreferences.objects.get_or_create(
                candidate=candidate_profile
            )
            serializer = CandidatePreferencesSerializer(preferences)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Candidate profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request):
        """Update preferences for the authenticated candidate."""
        if not request.user.is_candidate:
            return Response(
                {"error": "Only candidates can update preferences"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            candidate_profile = CandidateProfile.objects.get(user=request.user)
            preferences, created = CandidatePreferences.objects.get_or_create(
                candidate=candidate_profile
            )
            
            serializer = CandidatePreferencesSerializer(preferences, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Trigger new matching after preferences update
                from .matching_algorithm import JobMatchingEngine
                matching_engine = JobMatchingEngine()
                matching_engine.match_candidate_to_jobs(candidate_profile, force_update=True)
                
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Candidate profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class JobMatchListView(generics.ListAPIView):
    """View for listing job matches."""
    
    serializer_class = JobMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_viewed', 'is_applied', 'is_recommended']
    ordering_fields = ['match_score', 'created_at']
    
    def get_queryset(self):
        """Return matches based on user type."""
        user = self.request.user
        
        if user.is_candidate:
            candidate_profile = CandidateProfile.objects.get(user=user)
            return JobMatch.objects.filter(
                candidate=candidate_profile,
                is_recommended=True
            ).order_by('-match_score')
        elif user.is_recruiter:
            recruiter_profile = RecruiterProfile.objects.get(user=user)
            return JobMatch.objects.filter(
                job__hospital=recruiter_profile.hospital
            ).order_by('-match_score')
        else:
            return JobMatch.objects.all().order_by('-match_score')


class MarkJobViewedView(APIView):
    """View for marking a job recommendation as viewed."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, job_id):
        """Mark job as viewed by candidate."""
        if not request.user.is_candidate:
            return Response(
                {"error": "Only candidates can mark jobs as viewed"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            candidate_profile = CandidateProfile.objects.get(user=request.user)
            job_match = JobMatch.objects.get(
                candidate=candidate_profile,
                job_id=job_id
            )
            
            job_match.is_viewed = True
            job_match.save()
            
            return Response({
                "message": "Job marked as viewed"
            }, status=status.HTTP_200_OK)
            
        except JobMatch.DoesNotExist:
            return Response(
                {"error": "Job match not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class RecommendationFeedbackView(generics.CreateAPIView):
    """View for collecting feedback on job recommendations."""
    
    serializer_class = RecommendationFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create feedback and update matching algorithm."""
        if not self.request.user.is_candidate:
            raise PermissionError("Only candidates can provide feedback")
        
        candidate_profile = CandidateProfile.objects.get(user=self.request.user)
        serializer.save(candidate=candidate_profile)


class SearchHistoryView(generics.ListCreateAPIView):
    """View for managing search history."""
    
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return search history for the authenticated candidate."""
        if not self.request.user.is_candidate:
            return SearchHistory.objects.none()
        
        candidate_profile = CandidateProfile.objects.get(user=self.request.user)
        return SearchHistory.objects.filter(candidate=candidate_profile)
    
    def perform_create(self, serializer):
        """Create search history record."""
        if not self.request.user.is_candidate:
            raise PermissionError("Only candidates can create search history")
        
        candidate_profile = CandidateProfile.objects.get(user=self.request.user)
        serializer.save(candidate=candidate_profile)


class MatchingStatsView(APIView):
    """View for getting matching system statistics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get matching statistics."""
        if not (request.user.is_recruiter or request.user.is_staff):
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Calculate statistics
        total_matches = JobMatch.objects.count()
        high_quality_matches = JobMatch.objects.filter(match_score__gte=80).count()
        
        # Get applications from matches
        applications_from_matches = JobApplication.objects.filter(
            job__in=JobMatch.objects.values('job')
        ).count()
        
        # Average match score
        avg_match_score = JobMatch.objects.aggregate(
            avg_score=Avg('match_score')
        )['avg_score'] or 0
        
        # Top job types
        top_job_types = list(
            JobMatch.objects.values('job__job_type')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
            .values_list('job__job_type', flat=True)
        )
        
        # Success rate (applications / matches)
        success_rate = (applications_from_matches / total_matches * 100) if total_matches > 0 else 0
        
        stats = {
            'total_matches': total_matches,
            'high_quality_matches': high_quality_matches,
            'applications_from_matches': applications_from_matches,
            'average_match_score': round(avg_match_score, 2),
            'top_job_types': top_job_types,
            'matching_success_rate': round(success_rate, 2)
        }
        
        serializer = MatchingStatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AutoMatchingSettingsView(generics.RetrieveUpdateAPIView):
    """View for managing auto matching settings."""
    
    serializer_class = AutoMatchingSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get or create auto matching settings."""
        if not self.request.user.is_staff:
            raise PermissionError("Only administrators can manage auto matching settings")
        
        settings, created = AutoMatchingSettings.objects.get_or_create(
            pk=1,  # Singleton pattern
            defaults={
                'is_enabled': True,
                'matching_frequency': 'daily',
                'min_match_score': 60.0,
            }
        )
        return settings


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def candidate_match_summary(request):
    """Get match summary for a candidate."""
    if not request.user.is_candidate:
        return Response(
            {"error": "Only candidates can view match summary"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        candidate_profile = CandidateProfile.objects.get(user=request.user)
        
        # Get match statistics
        matches = JobMatch.objects.filter(candidate=candidate_profile)
        total_recommendations = matches.count()
        new_recommendations = matches.filter(is_viewed=False).count()
        
        # Get applications made
        applications_made = JobApplication.objects.filter(
            candidate=candidate_profile
        ).count()
        
        # Average match score
        avg_match_score = matches.aggregate(
            avg_score=Avg('match_score')
        )['avg_score'] or 0
        
        # Last recommendation date
        last_recommendation = matches.order_by('-created_at').first()
        last_recommendation_date = last_recommendation.created_at if last_recommendation else None
        
        # Check if preferences are updated
        try:
            preferences = CandidatePreferences.objects.get(candidate=candidate_profile)
            preferences_updated = True
        except CandidatePreferences.DoesNotExist:
            preferences_updated = False
        
        summary = {
            'candidate': candidate_profile,
            'total_recommendations': total_recommendations,
            'new_recommendations': new_recommendations,
            'applications_made': applications_made,
            'average_match_score': round(avg_match_score, 2),
            'last_recommendation_date': last_recommendation_date,
            'preferences_updated': preferences_updated
        }
        
        serializer = CandidateMatchSummarySerializer(summary)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except CandidateProfile.DoesNotExist:
        return Response(
            {"error": "Candidate profile not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )