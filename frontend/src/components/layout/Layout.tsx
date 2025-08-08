import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e0f7fa 0%, #caf0f8 50%, #a2d2ff 100%)',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      {showNavigation && <Navigation />}
      
      <main style={{ 
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
