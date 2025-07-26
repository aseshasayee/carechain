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
)

app_name = 'jobs'

urlpatterns = [
    # Jobs
    path('', JobListCreateView.as_view(), name='job-list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    
    # Job Applications
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
] 