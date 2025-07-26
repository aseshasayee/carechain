// Authentication helper functions for CareChain Portal
// This file provides common authentication functionality for all pages

const AuthHelper = {
    // Check if user is logged in
    isLoggedIn: function() {
        return localStorage.getItem('token') !== null;
    },
    
    // Get the current user's token
    getToken: function() {
        return localStorage.getItem('token');
    },
    
    // Get the current user object
    getUser: function() {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch (e) {
                console.error("Failed to parse user JSON:", e);
                return null;
            }
        }
        return null;
    },
    
    // Get user role (candidate, recruiter, admin)
    getUserRole: function() {
        return localStorage.getItem('userRole');
    },
    
    // Check if user is a specific role
    isRole: function(role) {
        const userRole = this.getUserRole();
        const user = this.getUser();
        
        if (role === 'candidate') {
            return userRole === 'candidate' || (user && user.isCandidate);
        } else if (role === 'recruiter') {
            return userRole === 'recruiter' || (user && user.isRecruiter);
        } else if (role === 'admin') {
            return userRole === 'admin' || (user && user.isAdmin);
        }
        
        return false;
    },
    
    // Check if user is candidate
    isCandidate: function() {
        return this.isRole('candidate');
    },
    
    // Check if user is recruiter
    isRecruiter: function() {
        return this.isRole('recruiter');
    },
    
    // Check if user is admin
    isAdmin: function() {
        return this.isRole('admin');
    },
    
    // Redirect to login if not authenticated
    requireAuth: function() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Redirect to unauthorized page if not the correct role
    requireRole: function(role) {
        if (!this.requireAuth()) {
            return false;
        }
        
        if (!this.isRole(role)) {
            window.location.href = 'unauthorized.html';
            return false;
        }
        
        return true;
    },
    
    // Get full name of current user
    getUserFullName: function() {
        const user = this.getUser();
        if (user) {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            
            if (firstName || lastName) {
                return `${firstName} ${lastName}`.trim();
            }
        }
        
        // Return role-based default if no name found
        if (this.isAdmin()) return 'Admin';
        if (this.isRecruiter()) return 'Recruiter';
        if (this.isCandidate()) return 'Candidate';
        
        return 'User';
    },
    
    // Logout the current user
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    },
    
    // Make authenticated API request
    apiRequest: async function(endpoint, options = {}) {
        if (!this.isLoggedIn()) {
            throw new Error('User not authenticated');
        }
        
        const token = this.getToken();
        const url = API_CONFIG ? API_CONFIG.getApiUrl(endpoint) : endpoint;
        
        // Set default headers
        const headers = options.headers || {};
        headers['Authorization'] = `Bearer ${token}`;
        
        if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        }
        
        const fetchOptions = {
            ...options,
            headers
        };
        
        const response = await fetch(url, fetchOptions);
        
        // Handle errors
        if (!response.ok) {
            // Try to extract error message
            try {
                const errorData = await response.json();
                throw new Error(
                    errorData.detail || 
                    errorData.error || 
                    `API request failed with status: ${response.status}`
                );
            } catch (e) {
                throw new Error(`API request failed with status: ${response.status}`);
            }
        }
        
        // If response is 204 No Content, return null
        if (response.status === 204) {
            return null;
        }
        
        // Parse and return the JSON response
        return await response.json();
    },
    
    // Setup logout button functionality
    setupLogoutButton: function(buttonId = 'logoutBtn') {
        const logoutBtn = document.getElementById(buttonId);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    },
    
    // Update UI with user name
    updateUserNameInUI: function(elementId = 'userName') {
        const userNameElement = document.getElementById(elementId);
        if (userNameElement) {
            userNameElement.textContent = this.getUserFullName();
        }
    },
    
    // Initialize auth on a page
    initPage: function(requiredRole = null) {
        if (requiredRole) {
            if (!this.requireRole(requiredRole)) {
                return false;
            }
        } else if (!this.requireAuth()) {
            return false;
        }
        
        this.setupLogoutButton();
        this.updateUserNameInUI();
        
        return true;
    }
};

// Execute automatically if included directly in a page
document.addEventListener('DOMContentLoaded', function() {
    const requiredRoleMeta = document.querySelector('meta[name="required-role"]');
    const requiredRole = requiredRoleMeta ? requiredRoleMeta.getAttribute('content') : null;
    
    if (requiredRole) {
        AuthHelper.initPage(requiredRole);
    }
}); 