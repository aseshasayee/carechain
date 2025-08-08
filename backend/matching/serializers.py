"""
Serializers for job matching and recommendation system.
"""

from rest_framework import serializers
from .models import (
    MatchingCriteria, JobMatch, CandidatePreferences, 
    SearchHistory, RecommendationFeedback, AutoMatchingSettings
)
from jobs.serializers import JobSerializer
from profiles.serializers import CandidateProfileSerializer


class MatchingCriteriaSerializer(serializers.ModelSerializer):
    """Serializer for matching criteria."""
    
    class Meta:
        model = MatchingCriteria
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that weights sum to approximately 1.0."""
        weights = [
            data.get('location_weight', 0),
            data.get('skills_weight', 0),
            data.get('experience_weight', 0),
            data.get('education_weight', 0)
        ]
        total_weight = sum(weights)
        
        if not (0.9 <= total_weight <= 1.1):
            raise serializers.ValidationError(
                "Weights should sum to approximately 1.0"
            )
        
        return data


class JobMatchSerializer(serializers.ModelSerializer):
    """Serializer for job matches."""
    
    candidate_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    hospital_name = serializers.SerializerMethodField()
    job_details = JobSerializer(source='job', read_only=True)
    candidate_details = CandidateProfileSerializer(source='candidate', read_only=True)
    match_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = JobMatch
        fields = [
            'id', 'candidate', 'job', 'match_score', 'skills_score',
            'experience_score', 'location_score', 'education_score',
            'match_details', 'is_viewed', 'is_applied', 'is_recommended',
            'created_at', 'updated_at', 'candidate_name', 'job_title',
            'hospital_name', 'job_details', 'candidate_details', 'match_percentage'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_candidate_name(self, obj):
        """Get formatted candidate name."""
        return f"{obj.candidate.first_name} {obj.candidate.last_name}"
    
    def get_job_title(self, obj):
        """Get job title."""
        return obj.job.title
    
    def get_hospital_name(self, obj):
        """Get hospital name."""
        return obj.job.hospital.name if obj.job.hospital else None
    
    def get_match_percentage(self, obj):
        """Get formatted match percentage."""
        return f"{obj.match_score:.1f}%"


class CandidatePreferencesSerializer(serializers.ModelSerializer):
    """Serializer for candidate preferences."""
    
    class Meta:
        model = CandidatePreferences
        fields = '__all__'
        read_only_fields = ['candidate', 'created_at', 'updated_at']


class SearchHistorySerializer(serializers.ModelSerializer):
    """Serializer for search history."""
    
    candidate_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SearchHistory
        fields = [
            'id', 'candidate', 'search_query', 'job_type', 'location',
            'filters_applied', 'results_count', 'clicked_jobs', 'applied_jobs',
            'search_date', 'candidate_name'
        ]
        read_only_fields = ['candidate', 'search_date']
    
    def get_candidate_name(self, obj):
        """Get formatted candidate name."""
        return f"{obj.candidate.first_name} {obj.candidate.last_name}"


class RecommendationFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for recommendation feedback."""
    
    candidate_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()
    
    class Meta:
        model = RecommendationFeedback
        fields = [
            'id', 'candidate', 'job', 'job_match', 'feedback_rating',
            'feedback_comments', 'is_interested', 'will_apply',
            'reasons_not_interested', 'created_at', 'candidate_name',
            'job_title', 'match_score'
        ]
        read_only_fields = ['candidate', 'created_at']
    
    def get_candidate_name(self, obj):
        """Get formatted candidate name."""
        return f"{obj.candidate.first_name} {obj.candidate.last_name}"
    
    def get_job_title(self, obj):
        """Get job title."""
        return obj.job.title
    
    def get_match_score(self, obj):
        """Get match score from job match."""
        return obj.job_match.match_score if obj.job_match else None


class AutoMatchingSettingsSerializer(serializers.ModelSerializer):
    """Serializer for auto matching settings."""
    
    class Meta:
        model = AutoMatchingSettings
        fields = '__all__'
        read_only_fields = ['last_run', 'created_at', 'updated_at']


class JobRecommendationSerializer(serializers.Serializer):
    """Serializer for job recommendations response."""
    
    job = JobSerializer()
    match_score = serializers.FloatField()
    match_details = serializers.JSONField()
    reasons = serializers.ListField(child=serializers.CharField())
    is_new = serializers.BooleanField()


class MatchingStatsSerializer(serializers.Serializer):
    """Serializer for matching statistics."""
    
    total_matches = serializers.IntegerField()
    high_quality_matches = serializers.IntegerField()
    applications_from_matches = serializers.IntegerField()
    average_match_score = serializers.FloatField()
    top_job_types = serializers.ListField(child=serializers.CharField())
    matching_success_rate = serializers.FloatField()


class CandidateMatchSummarySerializer(serializers.Serializer):
    """Serializer for candidate match summary."""
    
    candidate = CandidateProfileSerializer()
    total_recommendations = serializers.IntegerField()
    new_recommendations = serializers.IntegerField()
    applications_made = serializers.IntegerField()
    average_match_score = serializers.FloatField()
    last_recommendation_date = serializers.DateTimeField()
    preferences_updated = serializers.BooleanField()
