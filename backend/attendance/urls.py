"""
URL patterns for the attendance app.
"""

from django.urls import path
from .views import (
    AttendanceListCreateView,
    AttendanceDetailView,
    AbsenceNotificationListCreateView,
    AbsenceNotificationDetailView,
    AttendanceSummaryListView,
)

app_name = 'attendance'

urlpatterns = [
    # Attendance
    path('', AttendanceListCreateView.as_view(), name='attendance-list'),
    path('<int:pk>/', AttendanceDetailView.as_view(), name='attendance-detail'),
    
    # Absence Notifications
    path('absences/', AbsenceNotificationListCreateView.as_view(), name='absence-notification-list'),
    path('absences/<int:pk>/', AbsenceNotificationDetailView.as_view(), name='absence-notification-detail'),
    
    # Attendance Summaries
    path('summaries/', AttendanceSummaryListView.as_view(), name='attendance-summary-list'),
] 