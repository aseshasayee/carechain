from django.contrib import admin
from .models import HospitalVerification, CandidateVerification

@admin.register(HospitalVerification)
class HospitalVerificationAdmin(admin.ModelAdmin):
    list_display = ('hospital', 'official_name', 'status', 'reviewed_by', 'reviewed_at', 'created_at')
    search_fields = ('official_name', 'registration_number', 'primary_contact_email')
    list_filter = ('status', 'is_nabh_certified', 'created_at')

@admin.register(CandidateVerification)
class CandidateVerificationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'registration_number', 'specialization', 'status', 'reviewed_by', 'reviewed_at', 'created_at')
    search_fields = ('registration_number', 'candidate__user__email', 'specialization')
    list_filter = ('status', 'created_at')
