import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';
import Link from 'next/link';

interface Application {
  id: number;
  job: { id: number; title: string; employer: { hospital_name: string } };
  status: string;
  applied_at: string;
  cover_letter?: string;
  expected_salary?: number;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    setError('');
    
    try {
      const res = await apiRequest('api/jobs/applications/');
      if (!res.ok) throw new Error('Failed to load applications');
      const data = await res.json();
      setApplications(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Error loading applications');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1rem' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0077b6', marginBottom: 32, textShadow: '0 2px 8px #bde0fe' }}>My Applications</h1>
        {loading ? (
          <div style={{ fontSize: 18, color: '#0077b6', fontWeight: 600, textAlign: 'center' }}>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red', fontWeight: 600, textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {applications.length === 0 ? <div style={{ color: '#555', fontWeight: 500, textAlign: 'center' }}>No applications found.</div> : applications.map(app => (
              <div key={app.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #bde0fe', padding: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeInUp 0.7s cubic-bezier(.23,1.01,.32,1)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#0077b6' }}>{app.job.title}</div>
                  <div style={{ color: '#555' }}>Employer: {app.job.employer?.hospital_name}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>Applied: {new Date(app.applied_at).toLocaleString()}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>Status: <span style={{ fontWeight: 600 }}>{app.status}</span></div>
                  {app.cover_letter && <div style={{ color: '#888', fontSize: 14 }}>Cover Letter: {app.cover_letter}</div>}
                  {app.expected_salary && <div style={{ color: '#888', fontSize: 14 }}>Expected Salary: ₹{app.expected_salary}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
