"""
URL patterns for the jobs app.
"""

from django.urls import path
from .views import (
    JobListCreateView,
    JobDetailView,
    JobApplicationListCreateView,
    JobApplicationDetailView,
    JobMatchListView,
    ActiveJobListView,
    ActiveJobDetailView,
    CompletedJobListView,
    JobSearchView,
    AdvancedJobSearchView,
    InterviewListCreateView,
    InterviewDetailView,
    InterviewConfirmView,
    FeedbackListCreateView,
    FeedbackDetailView,
    CandidateSearchView,
    JobApplicationStatusUpdateView,
    InviteToApplyView,
    HospitalStatsView,
    JobCandidatesView,
)

app_name = 'jobs'

urlpatterns = [
    # Jobs
    path('', JobListCreateView.as_view(), name='job-list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    
    # Job Applications for specific job
    path('<int:job_id>/applications/', JobApplicationListCreateView.as_view(), name='job-applications-for-job'),
    
    # Job Applications (general)
    path('applications/', JobApplicationListCreateView.as_view(), name='job-application-list'),
    path('applications/<int:pk>/', JobApplicationDetailView.as_view(), name='job-application-detail'),
    
    # Job Matches
    path('matches/', JobMatchListView.as_view(), name='job-match-list'),
    
    # Active Jobs
    path('active/', ActiveJobListView.as_view(), name='active-job-list'),
    path('active/<int:pk>/', ActiveJobDetailView.as_view(), name='active-job-detail'),
    
    # Completed Jobs
    path('completed/', CompletedJobListView.as_view(), name='completed-job-list'),
    
    # Job Search
    path('search/', JobSearchView.as_view(), name='job-search'),
    path('advanced-search/', AdvancedJobSearchView.as_view(), name='advanced-job-search'),
    
    # Interviews
    path('interviews/', InterviewListCreateView.as_view(), name='interview-list'),
    path('interviews/<int:pk>/', InterviewDetailView.as_view(), name='interview-detail'),
    path('interviews/<int:pk>/confirm/', InterviewConfirmView.as_view(), name='interview-confirm'),
    
    # Feedback
    path('feedback/', FeedbackListCreateView.as_view(), name='feedback-list'),
    path('feedback/<int:pk>/', FeedbackDetailView.as_view(), name='feedback-detail'),
    
    # Enhanced Job Management
    path('candidates/search/', CandidateSearchView.as_view(), name='candidate-search'),
    path('applications/<int:pk>/status/', JobApplicationStatusUpdateView.as_view(), name='application-status-update'),
    path('invite-to-apply/', InviteToApplyView.as_view(), name='invite-to-apply'),
    
    # Hospital Dashboard Stats
    path('hospital-stats/', HospitalStatsView.as_view(), name='hospital-stats'),
    
    # Job Candidates (for View Details)
    path('<int:job_id>/candidates/', JobCandidatesView.as_view(), name='job-candidates'),
] 