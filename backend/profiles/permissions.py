"""
Custom permissions for the profiles app.
"""

from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to allow owners of a profile or admins to access.
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow admin users
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Check if the user owns the profile
        return obj.user == request.user


class IsRecruiterOrAdmin(permissions.BasePermission):
    """
    Permission to allow only recruiters or admins to access.
    """
    
    def has_permission(self, request, view):
        # Allow admin users
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        # Check if the user is a recruiter
        return hasattr(request.user, 'is_recruiter') and request.user.is_recruiter


class IsCandidateOwner(permissions.BasePermission):
    """
    Permission to allow only candidate profile owners to access.
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if the user owns the profile
        return obj.user == request.user


class IsRecruiterOwner(permissions.BasePermission):
    """
    Permission to allow only recruiter profile owners to access.
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if the user owns the profile
        return obj.user == request.user 