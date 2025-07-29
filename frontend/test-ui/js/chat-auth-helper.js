// Simple Authentication Helper for CareChain Chat Testing
// Add this script to test real backend integration

class ChatAuthHelper {
    static setDemoAuth(userType = 'candidate') {
        // Set demo authentication tokens for testing
        const demoTokens = {
            candidate: {
                authToken: 'demo_candidate_token_12345',
                userType: 'candidate',
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@candidate.com'
            },
            recruiter: {
                authToken: 'demo_recruiter_token_12345',
                userType: 'recruiter',
                userId: 10,
                firstName: 'Sarah',
                lastName: 'Wilson',
                email: 'sarah.wilson@hospital.com'
            }
        };
        
        const userData = demoTokens[userType];
        
        localStorage.setItem('authToken', userData.authToken);
        localStorage.setItem('userType', userData.userType);
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('userFirstName', userData.firstName);
        localStorage.setItem('userLastName', userData.lastName);
        localStorage.setItem('userEmail', userData.email);
        
        console.log(`Demo ${userType} authentication set!`);
        return userData;
    }
    
    static clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
        localStorage.removeItem('userEmail');
        console.log('Authentication cleared!');
    }
    
    static getAuthInfo() {
        return {
            authToken: localStorage.getItem('authToken'),
            userType: localStorage.getItem('userType'),
            userId: localStorage.getItem('userId'),
            firstName: localStorage.getItem('userFirstName'),
            lastName: localStorage.getItem('userLastName'),
            email: localStorage.getItem('userEmail')
        };
    }
    
    static isAuthenticated() {
        return !!localStorage.getItem('authToken');
    }
}

// Global helper functions for console testing
window.setDemoCandidate = () => ChatAuthHelper.setDemoAuth('candidate');
window.setDemoRecruiter = () => ChatAuthHelper.setDemoAuth('recruiter');
window.clearAuth = () => ChatAuthHelper.clearAuth();
window.getAuthInfo = () => ChatAuthHelper.getAuthInfo();

// Auto-set demo auth based on page if none exists
document.addEventListener('DOMContentLoaded', () => {
    if (!ChatAuthHelper.isAuthenticated()) {
        const isRecruiterPage = window.location.href.includes('recruiter_chat');
        const userType = isRecruiterPage ? 'recruiter' : 'candidate';
        
        console.log(`No authentication found. Setting demo ${userType} auth.`);
        console.log(`To test real backend, use: setDemo${userType.charAt(0).toUpperCase() + userType.slice(1)}()`);
        console.log('To clear auth and test demo mode, use: clearAuth()');
        
        // Set demo auth for testing
        ChatAuthHelper.setDemoAuth(userType);
    } else {
        console.log('Authentication found:', ChatAuthHelper.getAuthInfo());
    }
});

console.log('🔧 Chat Auth Helper loaded!');
console.log('Commands available:');
console.log('- setDemoCandidate() - Set candidate auth for real backend testing');
console.log('- setDemoRecruiter() - Set recruiter auth for real backend testing');
console.log('- clearAuth() - Clear auth to test demo mode');
console.log('- getAuthInfo() - View current auth info');
