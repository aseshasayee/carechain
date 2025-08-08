"""
URL patterns for employee management.
"""

from django.urls import path
from .views import (
    EmploymentListCreateView,
    EmploymentDetailView,
    EmployeeAvailabilityListCreateView,
    CheckEmployeeAvailabilityView,
    EmployeePerformanceListCreateView,
    AbsenceRequestListCreateView,
    AbsenceApprovalView,
)

app_name = 'employee_management'

urlpatterns = [
    # Employment management
    path('employment/', EmploymentListCreateView.as_view(), name='employment-list-create'),
    path('employment/<int:pk>/', EmploymentDetailView.as_view(), name='employment-detail'),
    
    # Employee availability
    path('availability/', EmployeeAvailabilityListCreateView.as_view(), name='availability-list-create'),
    path('availability/check/', CheckEmployeeAvailabilityView.as_view(), name='check-availability'),
    
    # Performance reviews
    path('performance/', EmployeePerformanceListCreateView.as_view(), name='performance-list-create'),
    
    # Absence requests
    path('absence-requests/', AbsenceRequestListCreateView.as_view(), name='absence-list-create'),
    path('absence-requests/<int:pk>/approve/', AbsenceApprovalView.as_view(), name='absence-approval'),
]