import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0077b6', marginBottom: '2rem' }}>
          My Profile
        </h1>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 16px rgba(189, 224, 254, 0.3)' }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Profile page is under development. Please check back later.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
