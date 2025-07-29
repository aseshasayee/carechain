// Enhanced API Helper for CareChain Portal
// This provides a consistent interface for all API calls

const APIHelper = {
    // Default headers for API requests
    getHeaders: function(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth && AuthHelper.isLoggedIn()) {
            headers['Authorization'] = `Bearer ${AuthHelper.getToken()}`;
        }
        
        return headers;
    },

    // Generic request method
    async request(method, endpoint, data = null, includeAuth = true) {
        try {
            const config = {
                method: method,
                headers: this.getHeaders(includeAuth),
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(API_CONFIG.getApiUrl(endpoint), config);
            
            // Handle different response types
            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                throw new Error(responseData.message || responseData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return {
                success: true,
                data: responseData,
                status: response.status
            };
        } catch (error) {
            console.error('API Request Error:', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 500
            };
        }
    },

    // GET request
    async get(endpoint, params = null) {
        let url = endpoint;
        if (params) {
            url = API_CONFIG.replaceUrlParams(endpoint, params);
        }
        return this.request('GET', url);
    },

    // POST request
    async post(endpoint, data, params = null) {
        let url = endpoint;
        if (params) {
            url = API_CONFIG.replaceUrlParams(endpoint, params);
        }
        return this.request('POST', url, data);
    },

    // PUT request
    async put(endpoint, data, params = null) {
        let url = endpoint;
        if (params) {
            url = API_CONFIG.replaceUrlParams(endpoint, params);
        }
        return this.request('PUT', url, data);
    },

    // PATCH request
    async patch(endpoint, data, params = null) {
        let url = endpoint;
        if (params) {
            url = API_CONFIG.replaceUrlParams(endpoint, params);
        }
        return this.request('PATCH', url, data);
    },

    // DELETE request
    async delete(endpoint, params = null) {
        let url = endpoint;
        if (params) {
            url = API_CONFIG.replaceUrlParams(endpoint, params);
        }
        return this.request('DELETE', url);
    },

    // Authentication methods
    auth: {
        async login(email, password, userType = 'candidate') {
            const endpoint = userType === 'admin' ? API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGIN :
                           userType === 'recruiter' ? API_CONFIG.ENDPOINTS.AUTH.RECRUITER_LOGIN :
                           API_CONFIG.ENDPOINTS.AUTH.LOGIN;
            
            return APIHelper.post(endpoint, { email, password }, null);
        },

        async register(userData) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData, null);
        },

        async getProfile() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
        },

        async changePassword(passwordData) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
        }
    },

    // Jobs methods
    jobs: {
        async getAll(page = 1, filters = {}) {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                ...filters
            });
            return APIHelper.get(`${API_CONFIG.ENDPOINTS.JOBS.LIST}?${queryParams}`);
        },

        async getById(jobId) {
            return APIHelper.get(API_CONFIG.ENDPOINTS.JOBS.DETAIL, { id: jobId });
        },

        async create(jobData) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.JOBS.CREATE, jobData);
        },

        async update(jobId, jobData) {
            return APIHelper.put(API_CONFIG.ENDPOINTS.JOBS.UPDATE, jobData, { id: jobId });
        },

        async delete(jobId) {
            return APIHelper.delete(API_CONFIG.ENDPOINTS.JOBS.DELETE, { id: jobId });
        },

        async apply(jobId) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.JOBS.APPLY, {}, { id: jobId });
        },

        async getMyApplications() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.JOBS.MY_APPLICATIONS);
        },

        async getPostedJobs() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.JOBS.POSTED_JOBS);
        },

        async search(query, filters = {}) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.JOBS.SEARCH, { query, ...filters });
        }
    },

    // Profiles methods
    profiles: {
        async getCandidate() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.PROFILES.CANDIDATE);
        },

        async updateCandidate(profileData) {
            return APIHelper.put(API_CONFIG.ENDPOINTS.PROFILES.CANDIDATE, profileData);
        },

        async getRecruiter() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.PROFILES.RECRUITER);
        },

        async updateRecruiter(profileData) {
            return APIHelper.put(API_CONFIG.ENDPOINTS.PROFILES.RECRUITER, profileData);
        },

        async getHospital() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.PROFILES.HOSPITAL);
        },

        async updateHospital(profileData) {
            return APIHelper.put(API_CONFIG.ENDPOINTS.PROFILES.HOSPITAL, profileData);
        },

        async submitVerification(verificationData) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.PROFILES.VERIFICATION, verificationData);
        },

        async getVerificationStatus() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.PROFILES.VERIFICATION_STATUS);
        },

        async getPendingVerifications() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.PROFILES.PENDING_VERIFICATIONS);
        },

        async approveVerification(profileId) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.PROFILES.APPROVE_CANDIDATE, { profile_id: profileId });
        },

        async rejectVerification(profileId, reason) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.PROFILES.REJECT_CANDIDATE, { profile_id: profileId, reason });
        }
    },

    // Admin methods
    admin: {
        async getDashboardStats() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_STATS);
        },

        async getUsers(page = 1, filters = {}) {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                ...filters
            });
            return APIHelper.get(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}?${queryParams}`);
        },

        async getRecentActivity() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.ADMIN.RECENT_ACTIVITY);
        }
    },

    // Notifications methods
    notifications: {
        async getAll() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST);
        },

        async markAsRead(notificationId) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ, {}, { id: notificationId });
        },

        async markAllAsRead() {
            return APIHelper.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
        }
    },

    // Messaging methods
    messaging: {
        async getConversations() {
            return APIHelper.get(API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATIONS);
        },

        async getMessages(conversationId) {
            return APIHelper.get(API_CONFIG.ENDPOINTS.MESSAGING.MESSAGES, { id: conversationId });
        },

        async sendMessage(conversationId, message) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.MESSAGING.SEND, { message }, { id: conversationId });
        },

        async createConversation(participantId) {
            return APIHelper.post(API_CONFIG.ENDPOINTS.MESSAGING.CREATE_CONVERSATION, { participant_id: participantId });
        }
    },

    // File upload helper
    async uploadFile(file, endpoint = API_CONFIG.ENDPOINTS.DOCUMENTS.UPLOAD) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(API_CONFIG.getApiUrl(endpoint), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AuthHelper.getToken()}`
                    // Don't set Content-Type for FormData, let browser set it
                },
                body: formData
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `Upload failed: ${response.statusText}`);
            }

            return {
                success: true,
                data: responseData,
                status: response.status
            };
        } catch (error) {
            console.error('File Upload Error:', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 500
            };
        }
    },

    // Handle API errors consistently
    handleError: function(error, defaultMessage = 'An error occurred') {
        console.error('API Error:', error);
        
        if (error.status === 401) {
            // Unauthorized - redirect to login
            AuthHelper.logout();
            window.location.href = 'login.html';
            return 'Session expired. Please login again.';
        } else if (error.status === 403) {
            return 'You do not have permission to perform this action.';
        } else if (error.status === 404) {
            return 'The requested resource was not found.';
        } else if (error.status >= 500) {
            return 'Server error. Please try again later.';
        }
        
        return error.error || defaultMessage;
    }
};

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    // You can show a user-friendly error message here
});

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = APIHelper;
}
