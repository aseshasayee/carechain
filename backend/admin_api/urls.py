"""
URL patterns for the admin API app.
"""

from django.urls import path
from .views import (
    DashboardStatsView,
    RecentActivityView,
    UserManagementView,
)

app_name = 'admin_api'

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('recent-activity/', RecentActivityView.as_view(), name='recent_activity'),
    path('users/', UserManagementView.as_view(), name='users'),
] 