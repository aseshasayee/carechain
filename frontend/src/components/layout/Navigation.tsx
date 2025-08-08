import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  HeartIcon,
  BriefcaseIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'candidate' | 'hospital' | 'admin';
  verification_status?: string;
}

const Navigation: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Get user info from localStorage or API
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user') || localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        // Normalize user data structure and map recruiter to hospital
        const userType = parsedUser.user_type || parsedUser.userType || parsedUser.role || 
                        localStorage.getItem('userRole') || localStorage.getItem('userType') || 'candidate';
        const normalizedUserType = userType === 'recruiter' ? 'hospital' : userType;
        
        console.log('Navigation user detection:', {
          parsedUser,
          userType,
          normalizedUserType,
          storedRole: localStorage.getItem('userRole'),
          storedType: localStorage.getItem('userType')
        });
        
        setUser({
          id: parsedUser.id || parsedUser.user_id,
          email: parsedUser.email,
          first_name: parsedUser.first_name || parsedUser.firstName || 'User',
          last_name: parsedUser.last_name || parsedUser.lastName || '',
          user_type: normalizedUserType as 'candidate' | 'hospital' | 'admin',
          verification_status: parsedUser.verification_status || parsedUser.status || 'pending'
        });
      } catch (error) {
        console.error('Error parsing user info:', error);
        // If parsing fails, check if we have minimal info from token
        const userType = localStorage.getItem('userType') || localStorage.getItem('userRole') || localStorage.getItem('role');
        if (userType) {
          const normalizedUserType = userType === 'recruiter' ? 'hospital' : userType;
          setUser({
            id: 1,
            email: 'user@example.com',
            first_name: 'Demo',
            last_name: 'User',
            user_type: normalizedUserType as 'candidate' | 'hospital' | 'admin',
            verification_status: 'pending'
          });
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  // Navigation items based on user type
  const getNavigationItems = () => {
    if (!user) {
      return [
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/jobs', label: 'Browse Jobs', icon: BriefcaseIcon },
        { href: '/login', label: 'Login', icon: UserIcon },
        { href: '/register', label: 'Register', icon: AcademicCapIcon }
      ];
    }

    switch (user.user_type) {
      case 'candidate':
        return [
          { href: '/candidate-dashboard', label: 'Dashboard', icon: HomeIcon },
          { href: '/jobs', label: 'Browse Jobs', icon: BriefcaseIcon },
          { href: '/job-matching', label: 'Job Matching', icon: HeartIcon },
          { href: '/applications', label: 'My Applications', icon: DocumentDuplicateIcon },
          { href: '/profile_new', label: 'My Profile', icon: UserIcon },
          { href: '/candidate-verification', label: 'Verification', icon: ShieldCheckIcon }
        ];

      case 'hospital':
        return [
          { href: '/hospital-dashboard', label: 'Dashboard', icon: HomeIcon },
          { href: '/post-job', label: 'Post Job', icon: BriefcaseIcon },
          { href: '/job-management', label: 'Manage Jobs', icon: ClipboardDocumentListIcon },
          { href: '/candidates', label: 'Browse Candidates', icon: UsersIcon },
          { href: '/employee-management', label: 'Employee Management', icon: UsersIcon },
          { href: '/applications', label: 'Applications', icon: DocumentDuplicateIcon },
          { href: '/hospital-profile', label: 'Hospital Profile', icon: BuildingOfficeIcon },
          { href: '/hospital-verification', label: 'Verification', icon: ShieldCheckIcon }
        ];

      case 'admin':
        return [
          { href: '/dashboard', label: 'Admin Dashboard', icon: HomeIcon },
          { href: '/candidates', label: 'All Candidates', icon: UsersIcon },
          { href: '/jobs', label: 'All Jobs', icon: BriefcaseIcon },
          { href: '/applications', label: 'All Applications', icon: DocumentDuplicateIcon },
          { href: '/employee-management', label: 'Employee Management', icon: UsersIcon },
          { href: '/job-matching', label: 'Matching System', icon: HeartIcon }
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const navStyle: React.CSSProperties = {
    background: 'rgba(0,119,182,0.95)',
    color: '#fff',
    padding: '1.2rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 2px 16px rgba(189, 224, 254, 0.3)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logoStyle: React.CSSProperties = {
    fontWeight: 900,
    fontSize: '1.8rem',
    letterSpacing: '0.5px',
    color: '#fff',
    textShadow: '0 2px 8px rgba(0, 150, 199, 0.5)',
    textDecoration: 'none'
  };

  const navLinksStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  };

  const navLinkStyle: React.CSSProperties = {
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const activeLinkStyle: React.CSSProperties = {
    ...navLinkStyle,
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#90e0ef'
  };

  const userInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#90e0ef',
    fontSize: '0.9rem'
  };

  const mobileMenuStyle: React.CSSProperties = {
    display: 'none'
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'rgba(0,119,182,0.98)',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    padding: '1rem',
    minWidth: '200px',
    zIndex: 60
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <Link href="/" style={logoStyle}>
          CareChain
          {user && (
            <span style={{ color: '#90e0ef', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
              {user.user_type === 'candidate' ? 'Professional' : 
               user.user_type === 'hospital' ? 'Hospital' : 'Admin'}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={navLinksStyle}>
            {navigationItems.map((item) => {
              const isActive = router.pathname === item.href;
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={isActive ? activeLinkStyle : navLinkStyle}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
                      (e.target as HTMLElement).style.color = '#90e0ef';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      (e.target as HTMLElement).style.background = 'transparent';
                      (e.target as HTMLElement).style.color = '#fff';
                    }
                  }}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Info and Actions */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <div style={userInfoStyle}>
                <span>
                  {user.first_name} {user.last_name}
                </span>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#90e0ef',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <UserIcon className="h-5 w-5" />
                </button>
              </div>

              {isMenuOpen && (
                <div style={dropdownStyle}>
                  <div style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#90e0ef' }}>
                      {user.email}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#bde0fe', marginTop: '0.2rem' }}>
                      Status: {user.verification_status || 'Pending'}
                    </div>
                  </div>
                  
                  <Link
                    href={user.user_type === 'hospital' ? '/hospital-profile' : '/profile_new'}
                    style={{ 
                      ...navLinkStyle, 
                      width: '100%', 
                      justifyContent: 'flex-start',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <CogIcon className="h-4 w-4" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    style={{
                      ...navLinkStyle,
                      width: '100%',
                      justifyContent: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/login" style={navLinkStyle}>
                Login
              </Link>
              <Link 
                href="/register" 
                style={{
                  ...navLinkStyle,
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#90e0ef'
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-menu" style={{
          display: 'none',
          background: 'rgba(0,119,182,0.98)',
          padding: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...navLinkStyle,
                  width: '100%',
                  marginBottom: '0.5rem',
                  justifyContent: 'flex-start'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                <IconComponent className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          
          {user && (
            <button
              onClick={handleLogout}
              style={{
                ...navLinkStyle,
                width: '100%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                justifyContent: 'flex-start',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-menu-button {
            display: block !important;
          }
          
          .mobile-menu {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
          
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
