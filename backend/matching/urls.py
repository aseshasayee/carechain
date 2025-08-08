"""
URL patterns for job matching system.
"""

from django.urls import path
from .views import (
    JobRecommendationsView,
    RunJobMatchingView,
    CandidatePreferencesView,
    JobMatchListView,
    MarkJobViewedView,
    RecommendationFeedbackView,
    SearchHistoryView,
    MatchingStatsView,
    AutoMatchingSettingsView,
    candidate_match_summary,
)

app_name = 'matching'

urlpatterns = [
    # Job recommendations
    path('recommendations/', JobRecommendationsView.as_view(), name='job-recommendations'),
    path('recommendations/summary/', candidate_match_summary, name='match-summary'),
    
    # Job matching management
    path('run-matching/', RunJobMatchingView.as_view(), name='run-matching'),
    path('matches/', JobMatchListView.as_view(), name='job-matches'),
    path('jobs/<int:job_id>/viewed/', MarkJobViewedView.as_view(), name='mark-job-viewed'),
    
    # Candidate preferences
    path('preferences/', CandidatePreferencesView.as_view(), name='candidate-preferences'),
    
    # Feedback and history
    path('feedback/', RecommendationFeedbackView.as_view(), name='recommendation-feedback'),
    path('search-history/', SearchHistoryView.as_view(), name='search-history'),
    
    # Statistics and settings
    path('stats/', MatchingStatsView.as_view(), name='matching-stats'),
    path('settings/', AutoMatchingSettingsView.as_view(), name='auto-matching-settings'),
]