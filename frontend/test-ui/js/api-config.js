// API Configuration
const API_CONFIG = {
    // Base API URL - change this to your production API when deploying
    BASE_URL: 'http://localhost:8000/api',
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        AUTH: {
            CANDIDATE_LOGIN: '/accounts/login/',
            RECRUITER_LOGIN: '/accounts/recruiter-login/',
            ADMIN_LOGIN: '/accounts/admin-login/',
            REFRESH_TOKEN: '/accounts/token/refresh/',
            REGISTER: '/accounts/register/',
            PASSWORD_RESET: '/accounts/password-reset/',
        },
        
        // Admin
        ADMIN: {
            DASHBOARD_STATS: '/admin/dashboard-stats/',
            RECENT_ACTIVITY: '/admin/recent-activity/',
            USERS: '/admin/users/',
        },
        
        // Profiles
        PROFILES: {
            CANDIDATE_PROFILE: '/profiles/candidate/',
            RECRUITER_PROFILE: '/profiles/recruiter/',
            HOSPITAL_PROFILE: '/profiles/hospital/',
            CANDIDATE_VERIFICATION: '/profiles/verification/',
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
            DETAIL: '/jobs/',
            APPLICATIONS: '/jobs/applications/',
            APPLY: '/jobs/applications/',
            MY_APPLICATIONS: '/jobs/applications/',  // Filter will be applied in request
            POSTED_JOBS: '/jobs/',  // For recruiters, their own jobs will be returned
            ACTIVE: '/jobs/active/',
            COMPLETED: '/jobs/completed/',
            SEARCH: '/jobs/search/',
            ADVANCED_SEARCH: '/jobs/advanced-search/',
            MATCHES: '/jobs/matches/',
        },
        
        // Notifications
        NOTIFICATIONS: {
            LIST: '/notifications/',
            MARK_READ: '/notifications/mark-read/',
            WEBSOCKET: 'ws://localhost:8000/api/ws/chat/',
            GET_MESSAGES: '/notifications/messages/',
        }
    },
    
    // Helper to get full URL
    getApiUrl: function(endpoint) {
        return this.BASE_URL + endpoint;
    }
};

// Export for use in other files
if (typeof module !== 'undefined') {
    module.exports = API_CONFIG;
} 