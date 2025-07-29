// Universal Navigation Component for CareChain Portal
// This component handles navigation and authentication state across all pages

const NavigationHelper = {
    // Initialize navigation for the current page
    init: function() {
        this.checkAuthState();
        this.setupEventListeners();
        this.updateUserInterface();
    },

    // Check authentication state and redirect if needed
    checkAuthState: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const publicPages = ['index.html', 'login.html', 'register.html', 'unauthorized.html'];
        
        if (!publicPages.includes(currentPage) && !AuthHelper.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        // Check role-specific access
        if (currentPage.startsWith('admin_') && !AuthHelper.isAdmin()) {
            window.location.href = 'unauthorized.html';
            return;
        }
        if (currentPage.startsWith('recruiter_') && !AuthHelper.isRecruiter()) {
            window.location.href = 'unauthorized.html';
            return;
        }
        if (currentPage.startsWith('candidate_') && !AuthHelper.isCandidate()) {
            window.location.href = 'unauthorized.html';
            return;
        }
    },

    // Update UI based on authentication state
    updateUserInterface: function() {
        this.updateHeader();
        this.updateNavigation();
    },

    // Update header with user info or auth buttons
    updateHeader: function() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        if (AuthHelper.isLoggedIn()) {
            const user = AuthHelper.getUser();
            const fullName = AuthHelper.getUserFullName();
            
            if (userInfo) {
                userInfo.style.display = 'flex';
                if (userName) userName.textContent = fullName || user.email.split('@')[0];
                if (userAvatar) userAvatar.textContent = (fullName || user.email).charAt(0).toUpperCase();
            }
            if (authButtons) authButtons.style.display = 'none';
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
        }
    },

    // Update navigation based on user role
    updateNavigation: function() {
        const mainNav = document.getElementById('mainNav');
        const navList = document.getElementById('navList');
        
        if (!mainNav || !navList || !AuthHelper.isLoggedIn()) {
            if (mainNav) mainNav.style.display = 'none';
            return;
        }

        mainNav.style.display = 'block';
        navList.innerHTML = '';

        const role = AuthHelper.getUserRole();
        const navItems = this.getNavigationItems(role);

        navItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            
            const a = document.createElement('a');
            a.href = item.href;
            a.className = 'nav-link';
            a.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
            
            // Highlight active page
            const currentPage = window.location.pathname.split('/').pop();
            if (item.href === currentPage || 
                (item.href === 'index.html' && !currentPage)) {
                a.classList.add('active');
            }
            
            li.appendChild(a);
            navList.appendChild(li);
        });
    },

    // Get navigation items based on role
    getNavigationItems: function(role) {
        const baseItems = [
            { href: 'index.html', text: 'Home', icon: 'fas fa-home' }
        ];

        switch (role) {
            case 'admin':
                return baseItems.concat([
                    { href: 'admin_dashboard.html', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { href: 'admin_candidate_verification.html', text: 'Verify Candidates', icon: 'fas fa-user-check' },
                    { href: 'admin_hospital_verification.html', text: 'Verify Hospitals', icon: 'fas fa-hospital' },
                    { href: 'employee_management.html', text: 'Manage Users', icon: 'fas fa-users-cog' }
                ]);
            
            case 'recruiter':
                return baseItems.concat([
                    { href: 'recruiter_dashboard.html', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { href: 'jobs.html', text: 'Manage Jobs', icon: 'fas fa-briefcase' },
                    { href: 'applicant_tracking.html', text: 'Applications', icon: 'fas fa-users' },
                    { href: 'recruiter_chat.html', text: 'Messages', icon: 'fas fa-comments' },
                    { href: 'profile.html', text: 'Profile', icon: 'fas fa-user-cog' }
                ]);
            
            case 'candidate':
                return baseItems.concat([
                    { href: 'candidate_dashboard.html', text: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { href: 'jobs.html', text: 'Browse Jobs', icon: 'fas fa-search' },
                    { href: 'candidate_chat.html', text: 'Messages', icon: 'fas fa-comments' },
                    { href: 'attendance.html', text: 'Attendance', icon: 'fas fa-calendar-check' },
                    { href: 'profile.html', text: 'Profile', icon: 'fas fa-user-cog' }
                ]);
            
            default:
                return baseItems;
        }
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Logout functionality
        const logoutButtons = document.querySelectorAll('[onclick="logout()"]');
        logoutButtons.forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };
        });

        // Setup mobile menu toggle if exists
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mainNav = document.getElementById('mainNav');
        
        if (mobileMenuToggle && mainNav) {
            mobileMenuToggle.onclick = () => {
                mainNav.classList.toggle('mobile-open');
            };
        }
    },

    // Logout user
    logout: function() {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        
        // Redirect to login
        window.location.href = 'login.html';
    },

    // Show loading state
    showLoading: function(element) {
        if (element) {
            element.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        }
    },

    // Show error state
    showError: function(element, message) {
        if (element) {
            element.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
        }
    },

    // Show empty state
    showEmpty: function(element, message) {
        if (element) {
            element.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i> ${message}</div>`;
        }
    }
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    NavigationHelper.init();
});

// Make it globally available
window.NavigationHelper = NavigationHelper;
