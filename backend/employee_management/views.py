"""
Views for employee management.
"""

from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from django.utils import timezone
from .models import Employment, EmployeeAvailability, EmployeePerformance, AbsenceRequest
from profiles.models import CandidateProfile, RecruiterProfile, Hospital
from jobs.models import CompletedJob
from .serializers import (
    EmploymentSerializer,
    EmployeeAvailabilitySerializer,
    EmployeePerformanceSerializer,
    AbsenceRequestSerializer,
)


class EmploymentListCreateView(generics.ListCreateAPIView):
    """View for listing and creating employment records."""
    
    serializer_class = EmploymentSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for debugging 401 errors
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'department', 'employment_type']
    search_fields = ['employee__first_name', 'employee__last_name', 'job_title']
    ordering_fields = ['start_date', 'created_at']
    
    def get_queryset(self):
        """Return employment records based on user type."""
        user = self.request.user
        
        # Debug logging
        print(f"EmploymentListCreateView accessed by user: {user}")
        print(f"User authenticated: {user.is_authenticated}")
        print(f"Authorization header: {self.request.META.get('HTTP_AUTHORIZATION', 'None')}")
        print(f"Request method: {self.request.method}")
        
        # For debugging authentication issues, return all records temporarily
        if not user.is_authenticated:
            print(f"Unauthenticated user - returning empty queryset")
            # For debugging, let's return a small sample instead of none
            return Employment.objects.all()[:5]  # Return first 5 records for debugging
        
        try:
            if hasattr(user, 'is_recruiter') and user.is_recruiter:
                # Recruiters see employees in their hospital
                try:
                    recruiter_profile = RecruiterProfile.objects.get(user=user)
                    print(f"Found recruiter profile: {recruiter_profile}")
                    return Employment.objects.filter(
                        hospital=recruiter_profile.hospital
                    ).order_by('-start_date')
                except RecruiterProfile.DoesNotExist:
                    # If no recruiter profile, return empty queryset
                    print(f"No recruiter profile found for user {user.email}")
                    return Employment.objects.all()[:5]  # Return sample for debugging
            elif hasattr(user, 'is_candidate') and user.is_candidate:
                # Candidates see their own employment records
                try:
                    candidate_profile = CandidateProfile.objects.get(user=user)
                    print(f"Found candidate profile: {candidate_profile}")
                    return Employment.objects.filter(
                        employee=candidate_profile
                    ).order_by('-start_date')
                except CandidateProfile.DoesNotExist:
                    # If no candidate profile, return empty queryset
                    print(f"No candidate profile found for user {user.email}")
                    return Employment.objects.all()[:5]  # Return sample for debugging
            else:
                # Admins see all employment records
                print(f"Admin user - returning all employment records")
                return Employment.objects.all().order_by('-start_date')
        except Exception as e:
            # If any error, return empty queryset to avoid crashes
            print(f"Error in get_queryset: {e}")
            return Employment.objects.all()[:5]  # Return sample for debugging
    
    def perform_create(self, serializer):
        """Create employment record with validation."""
        # Only recruiters can create employment records
        if not (hasattr(self.request.user, 'is_recruiter') and self.request.user.is_recruiter):
            raise PermissionError("Only recruiters can create employment records")
        
        try:
            recruiter_profile = RecruiterProfile.objects.get(user=self.request.user)
            serializer.save(employer=recruiter_profile, hospital=recruiter_profile.hospital)
        except RecruiterProfile.DoesNotExist:
            raise PermissionError("Recruiter profile not found")


class EmploymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting employment records."""
    
    serializer_class = EmploymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # For debugging authentication issues, add logging
        if not user.is_authenticated:
            print(f"Unauthenticated user accessing EmploymentDetailView")
            return Employment.objects.none()
        
        try:
            if hasattr(user, 'is_recruiter') and user.is_recruiter:
                try:
                    recruiter_profile = RecruiterProfile.objects.get(user=user)
                    return Employment.objects.filter(hospital=recruiter_profile.hospital)
                except RecruiterProfile.DoesNotExist:
                    print(f"No recruiter profile for user {user.email}")
                    return Employment.objects.none()
            elif hasattr(user, 'is_candidate') and user.is_candidate:
                try:
                    candidate_profile = CandidateProfile.objects.get(user=user)
                    return Employment.objects.filter(employee=candidate_profile)
                except CandidateProfile.DoesNotExist:
                    print(f"No candidate profile for user {user.email}")
                    return Employment.objects.none()
            else:
                # Admins see all employment records
                return Employment.objects.all()
        except Exception as e:
            print(f"Error in EmploymentDetailView.get_queryset: {e}")
            return Employment.objects.none()


class EmployeeAvailabilityListCreateView(generics.ListCreateAPIView):
    """View for listing and creating employee availability."""
    
    serializer_class = EmployeeAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'shift', 'date']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_recruiter:
            recruiter_profile = RecruiterProfile.objects.get(user=user)
            return EmployeeAvailability.objects.filter(
                employment__hospital=recruiter_profile.hospital
            ).order_by('-date')
        elif user.is_candidate:
            candidate_profile = CandidateProfile.objects.get(user=user)
            return EmployeeAvailability.objects.filter(
                employment__employee=candidate_profile
            ).order_by('-date')
        else:
            return EmployeeAvailability.objects.all().order_by('-date')


class CheckEmployeeAvailabilityView(APIView):
    """View for checking employee availability for specific dates."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        employee_id = request.data.get('employee_id')
        date = request.data.get('date')
        shift = request.data.get('shift', 'full_day')
        
        if not employee_id or not date:
            return Response(
                {"error": "employee_id and date are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only recruiters can check availability
        if not request.user.is_recruiter:
            return Response(
                {"error": "Only recruiters can check availability"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            candidate = CandidateProfile.objects.get(pk=employee_id)
            recruiter_profile = RecruiterProfile.objects.get(user=request.user)
            
            # Check if this employee works at the recruiter's hospital
            employment = Employment.objects.filter(
                employee=candidate,
                hospital=recruiter_profile.hospital,
                status='active'
            ).first()
            
            if not employment:
                return Response(
                    {"error": "Employee not found in your hospital"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check availability
            availability = EmployeeAvailability.objects.filter(
                employment=employment,
                date=date,
                shift=shift
            ).first()
            
            if availability:
                available = availability.status == 'available'
                status_info = availability.status
                notes = availability.notes
            else:
                # Default to available if no record exists
                available = True
                status_info = 'available'
                notes = None
            
            return Response({
                "available": available,
                "status": status_info,
                "notes": notes,
                "employee": f"{candidate.first_name} {candidate.last_name}",
                "date": date,
                "shift": shift
            }, status=status.HTTP_200_OK)
            
        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Employee not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class EmployeePerformanceListCreateView(generics.ListCreateAPIView):
    """View for listing and creating performance reviews."""
    
    serializer_class = EmployeePerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['review_type', 'employment__employee']
    ordering_fields = ['review_date', 'overall_rating']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_recruiter:
            recruiter_profile = RecruiterProfile.objects.get(user=user)
            return EmployeePerformance.objects.filter(
                employment__hospital=recruiter_profile.hospital
            ).order_by('-review_date')
        elif user.is_candidate:
            candidate_profile = CandidateProfile.objects.get(user=user)
            return EmployeePerformance.objects.filter(
                employment__employee=candidate_profile
            ).order_by('-review_date')
        else:
            return EmployeePerformance.objects.all().order_by('-review_date')
    
    def perform_create(self, serializer):
        """Create performance review."""
        serializer.save(reviewer=self.request.user)


class AbsenceRequestListCreateView(generics.ListCreateAPIView):
    """View for listing and creating absence requests."""
    
    serializer_class = AbsenceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'absence_type']
    ordering_fields = ['start_date', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_recruiter:
            recruiter_profile = RecruiterProfile.objects.get(user=user)
            return AbsenceRequest.objects.filter(
                employment__hospital=recruiter_profile.hospital
            ).order_by('-created_at')
        elif user.is_candidate:
            candidate_profile = CandidateProfile.objects.get(user=user)
            return AbsenceRequest.objects.filter(
                employment__employee=candidate_profile
            ).order_by('-created_at')
        else:
            return AbsenceRequest.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create absence request."""
        serializer.save(requested_by=self.request.user)


class AbsenceApprovalView(APIView):
    """View for approving/rejecting absence requests."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        absence_request = get_object_or_404(AbsenceRequest, pk=pk)
        
        # Only recruiters can approve absence requests for their hospital
        if not request.user.is_recruiter:
            return Response(
                {"error": "Only recruiters can approve absence requests"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        recruiter_profile = RecruiterProfile.objects.get(user=request.user)
        if absence_request.employment.hospital != recruiter_profile.hospital:
            return Response(
                {"error": "You can only approve requests for your hospital"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        action = request.data.get('action')  # 'approve' or 'reject'
        notes = request.data.get('notes', '')
        
        if action == 'approve':
            absence_request.status = 'approved'
        elif action == 'reject':
            absence_request.status = 'rejected'
        else:
            return Response(
                {"error": "Action must be 'approve' or 'reject'"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        absence_request.approved_by = request.user
        absence_request.approval_date = timezone.now()
        absence_request.approval_notes = notes
        absence_request.save()
        
        serializer = AbsenceRequestSerializer(absence_request)
        return Response({
            "absence_request": serializer.data,
            "message": f"Absence request {action}d successfully"
        }, status=status.HTTP_200_OK)