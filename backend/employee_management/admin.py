# Django admin integration for employee management models
from django.contrib import admin
from .models import Employment, EmployeeAvailability, EmployeePerformance, AbsenceRequest


@admin.register(Employment)
class EmploymentAdmin(admin.ModelAdmin):
    list_display = ['employee', 'hospital', 'job_title', 'employment_type', 'status', 'start_date']
    list_filter = ['status', 'employment_type', 'department', 'hospital']
    search_fields = ['employee__first_name', 'employee__last_name', 'job_title']
    date_hierarchy = 'start_date'


@admin.register(EmployeeAvailability) 
class EmployeeAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['employment', 'date', 'shift', 'status']
    list_filter = ['status', 'shift', 'date']
    search_fields = ['employment__employee__first_name', 'employment__employee__last_name']


@admin.register(EmployeePerformance)
class EmployeePerformanceAdmin(admin.ModelAdmin):
    list_display = ['employment', 'review_date', 'review_type', 'overall_rating']
    list_filter = ['review_type', 'overall_rating', 'review_date']
    search_fields = ['employment__employee__first_name', 'employment__employee__last_name']


@admin.register(AbsenceRequest)
class AbsenceRequestAdmin(admin.ModelAdmin):
    list_display = ['employment', 'absence_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'absence_type', 'start_date']
    search_fields = ['employment__employee__first_name', 'employment__employee__last_name']
