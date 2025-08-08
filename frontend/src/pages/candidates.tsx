import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';

interface CandidateProfile {
  id: number;
  first_name: string;
  last_name: string;
  specialization?: string;
  years_of_experience?: number;
  verification_status?: string;
  bio?: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates(query = '') {
    setLoading(true);
    setError('');
    try {
      const url = query ? `api/profiles/verified-profiles/?search=${encodeURIComponent(query)}` : 'api/profiles/verified-profiles/';
      const res = await apiRequest(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load candidates' }));
        throw new Error(errorData.error || 'Failed to load candidates');
      }
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : (data.results || []));
    } catch (err: any) {
      console.error('Error loading candidates:', err);
      setError(err.message || 'Error loading candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 900, 
            color: '#0077b6', 
            marginBottom: '0.5rem',
            textShadow: '0 2px 8px rgba(189, 224, 254, 0.5)' 
          }}>
            Verified Candidates
          </h1>
          <p style={{ 
            color: '#333', 
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Browse and connect with qualified healthcare professionals
          </p>
        </div>

        <div style={{ 
          background: '#fff', 
          borderRadius: '16px', 
          padding: '2rem', 
          marginBottom: '2rem',
          boxShadow: '0 4px 24px rgba(189, 224, 254, 0.3)' 
        }}>
          <form onSubmit={e => { e.preventDefault(); loadCandidates(search); }} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search candidates..." 
              style={{ 
                flex: 1, 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                fontSize: '1rem'
              }} 
            />
            <button 
              type="submit" 
              style={{ 
                background: '#0077b6', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading candidates...</div>
          </div>
        ) : error ? (
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            padding: '2rem', 
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(189, 224, 254, 0.3)' 
          }}>
            <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>
            <button 
              onClick={() => loadCandidates()}
              style={{
                background: '#0077b6',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {candidates.length === 0 ? (
              <div style={{ 
                gridColumn: '1 / -1',
                background: '#fff', 
                borderRadius: '12px', 
                padding: '3rem', 
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(189, 224, 254, 0.3)'
              }}>
                <div style={{ fontSize: '1.1rem', color: '#666' }}>No candidates found.</div>
              </div>
            ) : (
              candidates.map(c => (
                <div 
                  key={c.id} 
                  style={{ 
                    background: '#fff', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 24px rgba(189, 224, 254, 0.3)', 
                    padding: '1.5rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(189, 224, 254, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(189, 224, 254, 0.3)';
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.3rem', color: '#0077b6', marginBottom: '0.5rem' }}>
                    {c.first_name} {c.last_name}
                  </div>
                  <div style={{ color: '#555', marginBottom: '0.25rem' }}>
                    <strong>Specialization:</strong> {c.specialization || 'N/A'}
                  </div>
                  <div style={{ color: '#555', marginBottom: '0.25rem' }}>
                    <strong>Experience:</strong> {c.years_of_experience || 0} years
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: c.verification_status === 'verified' ? '#d4edda' : '#f8d7da',
                      color: c.verification_status === 'verified' ? '#155724' : '#721c24'
                    }}>
                      {c.verification_status || 'pending'}
                    </span>
                  </div>
                  {c.bio && (
                    <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                      {c.bio.length > 100 ? `${c.bio.substring(0, 100)}...` : c.bio}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
