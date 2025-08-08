import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CandidateVerificationStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://127.0.0.1:8000/api/profiles/verification-status/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (!res.ok) throw data;
        setStatus(data);
      } catch (err: any) {
        setError('Could not fetch verification status.');
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(90deg, #e0f7fa, #caf0f8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #bde0fe', padding: 40, minWidth: 400, maxWidth: 500, marginTop: 60 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0077b6', marginBottom: 24 }}>Candidate Verification Status</h2>
        {loading ? (
          <div style={{ color: '#0077b6', fontWeight: 600 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red', fontWeight: 600 }}>{error}</div>
        ) : status ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              Status: <span style={{ color: status.status === 'verified' ? '#28a745' : status.status === 'rejected' ? '#dc3545' : '#ffc107' }}>{status.status.charAt(0).toUpperCase() + status.status.slice(1)}</span>
            </div>
            {status.status === 'rejected' && (
              <div style={{ color: '#dc3545', marginBottom: 12 }}>
                Reason: {status.rejection_reason || 'Not specified'}
              </div>
            )}
            {status.status === 'pending' && (
              <div style={{ color: '#ffc107', marginBottom: 12 }}>
                Your verification is under review.
              </div>
            )}
            {status.status === 'verified' && (
              <div style={{ color: '#28a745', marginBottom: 12 }}>
                You are verified!
              </div>
            )}
            <div style={{ marginTop: 24 }}>
              <Link href="/profile" style={{ color: '#0077b6', fontWeight: 600, textDecoration: 'underline' }}>Go to Profile</Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
