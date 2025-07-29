// API Configuration
const API_CONFIG = {
    // Base API URL - change this to your production API when deploying
    BASE_URL: 'http://localhost:8000/api',
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        AUTH: {
            LOGIN: '/accounts/login/',
            RECRUITER_LOGIN: '/accounts/recruiter-login/',
            ADMIN_LOGIN: '/accounts/admin-login/',
            REGISTER: '/accounts/register/',
            VERIFY_EMAIL: '/accounts/verify-email/',
            PROFILE: '/accounts/profile/',
            CHANGE_PASSWORD: '/accounts/change-password/',
        },
        
        // Admin
        ADMIN: {
            USERS: '/admin/users/',
            DASHBOARD_STATS: '/admin/dashboard-stats/',
            RECENT_ACTIVITY: '/admin/recent-activity/',
        },
        
        // Profiles
        PROFILES: {
            CANDIDATE: '/profiles/candidate/',
            RECRUITER: '/profiles/recruiter/',
            HOSPITAL: '/profiles/hospital/',
            VERIFICATION: '/profiles/verification/',
            HOSPITAL_VERIFICATION: '/profiles/hospital-verification/',
            PENDING_VERIFICATIONS: '/profiles/pending-verifications/',
            VERIFIED_PROFILES: '/profiles/verified-profiles/',
            REJECTED_VERIFICATIONS: '/profiles/rejected-verifications/',
            PENDING_HOSPITAL_VERIFICATIONS: '/profiles/pending-hospital-verifications/',
            VERIFIED_HOSPITALS: '/profiles/verified-hospitals/',
            REJECTED_HOSPITAL_VERIFICATIONS: '/profiles/rejected-hospital-verifications/',
            CANDIDATE_DETAILS: '/profiles/candidate-details/',
            HOSPITAL_DETAILS: '/profiles/hospital-details/',
            APPROVE_CANDIDATE: '/profiles/approve-verification/',
            REJECT_CANDIDATE: '/profiles/reject-verification/',
            APPROVE_HOSPITAL: '/profiles/approve-hospital-verification/',
            REJECT_HOSPITAL: '/profiles/reject-hospital-verification/',
            VERIFICATION_STATUS: '/profiles/verification-status/',
        },
        
        // Jobs
        JOBS: {
            LIST: '/jobs/',
            DETAIL: '/jobs/{id}/',
            CREATE: '/jobs/',
            UPDATE: '/jobs/{id}/',
            DELETE: '/jobs/{id}/',
            APPLICATIONS: '/jobs/applications/',
            APPLY: '/jobs/{id}/apply/',
            MY_APPLICATIONS: '/jobs/my-applications/',
            POSTED_JOBS: '/jobs/my-jobs/',
            SEARCH: '/jobs/search/',
        },
        
        // Documents
        DOCUMENTS: {
            UPLOAD: '/documents/upload/',
            LIST: '/documents/',
            DELETE: '/documents/{id}/',
        },
        
        // Notifications
        NOTIFICATIONS: {
            LIST: '/notifications/',
            MARK_READ: '/notifications/{id}/mark-read/',
            MARK_ALL_READ: '/notifications/mark-all-read/',
        },
        
        // Messaging
        MESSAGING: {
            CONVERSATIONS: '/messaging/conversations/',
            MESSAGES: '/messaging/conversations/{id}/messages/',
            SEND: '/messaging/conversations/{id}/send/',
            CREATE_CONVERSATION: '/messaging/conversations/create/',
        },
        
        // Testimonials
        TESTIMONIALS: {
            LIST: '/testimonials/',
            CREATE: '/testimonials/',
            UPDATE: '/testimonials/{id}/',
            DELETE: '/testimonials/{id}/',
        }
    },
    
    // Helper to get full URL
    getApiUrl: function(endpoint) {
        return this.BASE_URL + endpoint;
    },
    
    // Helper to replace URL parameters
    replaceUrlParams: function(endpoint, params) {
        let url = endpoint;
        for (const [key, value] of Object.entries(params)) {
            url = url.replace(`{${key}}`, value);
        }
        return url;
    }
};

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = API_CONFIG;
} 