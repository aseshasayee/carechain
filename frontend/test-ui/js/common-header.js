// Common Header Component for CareChain Portal
// This creates a consistent header across all pages

const CommonHeader = {
    // Initialize the header
    init: function() {
        this.createHeader();
        this.bindEvents();
        this.updateUserInterface();
    },

    // Create the header HTML structure
    createHeader: function() {
        const existingHeader = document.querySelector('.header');
        if (existingHeader) {
            existingHeader.remove();
        }

        const headerHTML = `
            <header class="header">
                <div class="container">
                    <div class="header-content">
                        <a href="index.html" class="logo">
                            <i class="fas fa-heartbeat"></i> CareChain
                        </a>
                        <nav class="header-nav" id="headerNav">
                            <!-- Navigation will be populated based on user role -->
                        </nav>
                        <div class="user-menu" id="userMenu">
                            <div class="user-info" id="userInfo" style="display: none;">
                                <div class="user-avatar" id="userAvatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="user-details">
                                    <span id="userName">User</span>
                                    <small id="userRole">Role</small>
                                </div>
                                <div class="dropdown" id="userDropdown">
                                    <button class="dropdown-toggle" id="dropdownToggle">
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="dropdown-menu" id="dropdownMenu">
                                        <a href="profile.html" class="dropdown-item">
                                            <i class="fas fa-user-circle"></i> Profile
                                        </a>
                                        <a href="#" class="dropdown-item" onclick="CommonHeader.logout()">
                                            <i class="fas fa-sign-out-alt"></i> Logout
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div id="authButtons">
                                <a href="login.html" class="btn btn-primary btn-sm">
                                    <i class="fas fa-sign-in-alt"></i> Login
                                </a>
                                <a href="register.html" class="btn btn-outline btn-sm">
                                    <i class="fas fa-user-plus"></i> Register
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;

        // Insert header at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    },

    // Bind event listeners
    bindEvents: function() {
        // Toggle dropdown menu
        const dropdownToggle = document.getElementById('dropdownToggle');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function() {
                dropdownMenu.classList.remove('show');
            });
        }
    },

    // Update user interface based on authentication status
    updateUserInterface: function() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const headerNav = document.getElementById('headerNav');

        if (AuthHelper.isLoggedIn()) {
            const user = AuthHelper.getUser();
            const role = AuthHelper.getUserRole();

            // Show user info, hide auth buttons
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';

            // Update user display
            document.getElementById('userName').textContent = user?.first_name || user?.name || 'User';
            document.getElementById('userRole').textContent = this.formatRole(role);

            // Update navigation based on role
            this.updateNavigation(role);
        } else {
            // Show auth buttons, hide user info
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
            
            // Clear navigation
            headerNav.innerHTML = '';
        }
    },

    // Update navigation based on user role
    updateNavigation: function(role) {
        const headerNav = document.getElementById('headerNav');
        let navHTML = '';

        switch(role) {
            case 'admin':
                navHTML = `
                    <a href="admin_dashboard.html" class="nav-link">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="admin_candidate_verification.html" class="nav-link">
                        <i class="fas fa-user-check"></i> Verifications
                    </a>
                    <a href="verification_admin.html" class="nav-link">
                        <i class="fas fa-users"></i> Users
                    </a>
                `;
                break;
            case 'recruiter':
                navHTML = `
                    <a href="recruiter_dashboard.html" class="nav-link">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="jobs.html" class="nav-link">
                        <i class="fas fa-briefcase"></i> Jobs
                    </a>
                    <a href="applicant_tracking.html" class="nav-link">
                        <i class="fas fa-users"></i> Applications
                    </a>
                    <a href="messages.html" class="nav-link">
                        <i class="fas fa-envelope"></i> Messages
                    </a>
                `;
                break;
            case 'candidate':
                navHTML = `
                    <a href="candidate_dashboard.html" class="nav-link">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="jobs.html" class="nav-link">
                        <i class="fas fa-search"></i> Browse Jobs
                    </a>
                    <a href="applicant_tracking.html" class="nav-link">
                        <i class="fas fa-file-alt"></i> My Applications
                    </a>
                    <a href="messages.html" class="nav-link">
                        <i class="fas fa-envelope"></i> Messages
                    </a>
                `;
                break;
            default:
                navHTML = `
                    <a href="jobs.html" class="nav-link">
                        <i class="fas fa-search"></i> Browse Jobs
                    </a>
                `;
        }

        headerNav.innerHTML = navHTML;

        // Highlight current page
        this.highlightCurrentPage();
    },

    // Highlight the current page in navigation
    highlightCurrentPage: function() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    },

    // Format role for display
    formatRole: function(role) {
        switch(role) {
            case 'admin': return 'Administrator';
            case 'recruiter': return 'Recruiter';
            case 'candidate': return 'Candidate';
            default: return 'User';
        }
    },

    // Logout function
    logout: function() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear all stored data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('refreshToken');
            
            // Redirect to login page
            window.location.href = 'login.html';
        }
    },

    // Refresh the header (useful after login/logout)
    refresh: function() {
        this.updateUserInterface();
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    CommonHeader.init();
});

// Global function for logout (for onclick handlers)
function logout() {
    CommonHeader.logout();
}
