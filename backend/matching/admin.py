# Django admin integration for matching models
from django.contrib import admin
from .models import (
    MatchingCriteria, JobMatch, CandidatePreferences, 
    SearchHistory, RecommendationFeedback, AutoMatchingSettings
)


@admin.register(MatchingCriteria)
class MatchingCriteriaAdmin(admin.ModelAdmin):
    list_display = ['job_type', 'skills_weight', 'experience_weight', 'location_weight', 'education_weight']
    list_filter = ['job_type']
    search_fields = ['job_type']


@admin.register(JobMatch)
class JobMatchAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'match_score', 'is_viewed', 'is_applied', 'created_at']
    list_filter = ['is_viewed', 'is_applied', 'is_recommended', 'created_at']
    search_fields = ['candidate__first_name', 'candidate__last_name', 'job__title']
    readonly_fields = ['match_score', 'skills_score', 'experience_score', 'location_score', 'education_score']


@admin.register(CandidatePreferences)
class CandidatePreferencesAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'salary_range', 'schedule_preference', 'remote_work_acceptable', 'notification_frequency']
    list_filter = ['salary_range', 'schedule_preference', 'remote_work_acceptable', 'notification_frequency']
    search_fields = ['candidate__first_name', 'candidate__last_name']


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'search_query', 'job_type', 'location', 'results_count', 'search_date']
    list_filter = ['search_date', 'job_type']
    search_fields = ['candidate__first_name', 'candidate__last_name', 'search_query']
    readonly_fields = ['search_date']


@admin.register(RecommendationFeedback)
class RecommendationFeedbackAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'feedback_rating', 'is_interested', 'will_apply', 'created_at']
    list_filter = ['feedback_rating', 'is_interested', 'will_apply', 'created_at']
    search_fields = ['candidate__first_name', 'candidate__last_name', 'job__title']
    readonly_fields = ['created_at']


@admin.register(AutoMatchingSettings)
class AutoMatchingSettingsAdmin(admin.ModelAdmin):
    list_display = ['is_enabled', 'matching_frequency', 'min_match_score', 'last_run']
    readonly_fields = ['last_run']
