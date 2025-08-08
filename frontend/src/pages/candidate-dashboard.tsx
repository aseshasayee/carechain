
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../utils/api';

const cardAnim = {
  animation: 'fadeInUp 0.7s cubic-bezier(.23,1.01,.32,1)'
};

// Add fadeInUp keyframes to global style if not present
if (typeof window !== 'undefined' && !document.getElementById('fadeInUpKeyframes')) {
  const style = document.createElement('style');
  style.id = 'fadeInUpKeyframes';
  style.innerHTML = `@keyframes fadeInUp {0%{opacity:0;transform:translateY(40px);}100%{opacity:1;transform:translateY(0);}}`;
  document.head.appendChild(style);
}

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  verification_status: string;
  profile_completion: number;
}
interface Application {
  id: number;
  job: { id: number; title: string; hospital: { hospital_name: string } };
  status: string;
  applied_at: string;
}
interface Job {
  id: number;
  title: string;
  hospital: { hospital_name: string };
  location: string;
  salary_min: number;
  salary_max: number;
}

export default function CandidateDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      
      try {
        // Profile
        const profRes = await apiRequest('api/profiles/candidate/');
        if (!profRes.ok) throw new Error('Failed to load profile');
        const profData = await profRes.json();
        setProfile(profData);

        // Verification
        const verRes = await apiRequest('api/profiles/verification-status/');
        if (!verRes.ok) throw new Error('Failed to load verification');
        setVerification(await verRes.json());

        // Applications
        const appRes = await apiRequest('api/jobs/applications/');
        if (!appRes.ok) throw new Error('Failed to load applications');
        const appData = await appRes.json();
        setApplications(appData.results || []);

        // Recommended Jobs
        const jobsRes = await apiRequest('api/jobs/matches/');
        if (!jobsRes.ok) throw new Error('Failed to load jobs');
        const jobsData = await jobsRes.json();
        setJobs(jobsData.results || []);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center', marginTop: 60 }}>{error}</div>
        ) : (
          <>
            <div style={{ marginBottom: 32, width: '100%', maxWidth: 900, textAlign: 'center', ...cardAnim }}>
              <h1 style={{ fontSize: 44, fontWeight: 900, color: '#0077b6', marginBottom: 8, letterSpacing: 0.5, textShadow: '0 2px 8px #bde0fe' }}>
                Welcome, {profile?.first_name} {profile?.last_name}
              </h1>
              <p style={{ color: '#333', marginBottom: 8, fontSize: 22 }}>Your personalized dashboard for job search and application tracking</p>
            </div>
            <div style={{ display: 'flex', width: '100%', maxWidth: 900, gap: 32, marginBottom: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #bde0fe', padding: 36, textAlign: 'center', transition: 'transform 0.2s', ...cardAnim }}>
                <div style={{ fontWeight: 700, color: '#0077b6', fontSize: 20, marginBottom: 8 }}>Applications</div>
                <div style={{ fontSize: 38, fontWeight: 900, color: '#023e8a' }}>{applications.length}</div>
              </div>
              <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #bde0fe', padding: 36, textAlign: 'center', transition: 'transform 0.2s', ...cardAnim }}>
                <div style={{ fontWeight: 700, color: '#0077b6', fontSize: 20, marginBottom: 8 }}>Verification Status</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#023e8a', textTransform: 'capitalize' }}>{verification?.verification_status || profile?.verification_status}</div>
              </div>
              <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #bde0fe', padding: 36, textAlign: 'center', transition: 'transform 0.2s', ...cardAnim }}>
                <div style={{ fontWeight: 700, color: '#0077b6', fontSize: 20, marginBottom: 8 }}>Profile Complete</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#023e8a' }}>{verification?.profile_complete ? 'Yes' : 'No'}</div>
              </div>
              <div style={{ flex: 1, minWidth: 220, background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #bde0fe', padding: 36, textAlign: 'center', transition: 'transform 0.2s', ...cardAnim }}>
                <div style={{ fontWeight: 700, color: '#0077b6', fontSize: 20, marginBottom: 8 }}>Aadhaar Verified</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#023e8a' }}>{verification?.aadhaar_verified ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 0 32px #bde0fe', padding: 44, marginBottom: 40, width: '100%', maxWidth: 900, ...cardAnim }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0077b6', marginBottom: 16 }}>Recent Applications</h2>
              {applications.length === 0 ? (
                <div>No applications yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {applications.slice(0, 5).map(app => (
                    <li key={app.id} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>
                        {app.job?.title || 'Unknown Job'}
                        <span style={{ color: '#00b4d8' }}>@ {app.job?.hospital?.hospital_name || 'Unknown Hospital'}</span>
                      </div>
                      <div style={{ fontSize: 14, color: '#888' }}>Status: {app.status} | Applied: {new Date(app.applied_at).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/applications" style={{ color: '#0077b6', fontWeight: 600, textDecoration: 'underline' }}>View All Applications</Link>
              <div style={{ marginTop: 16 }}>
                <Link href="/candidate-verification" style={{ color: '#fff', background: '#0077b6', borderRadius: 6, padding: '10px 24px', fontWeight: 600, textDecoration: 'none', marginTop: 12, display: 'inline-block' }}>Submit/Update Verification</Link>
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 0 20px #caf0f8', padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0077b6', marginBottom: 16 }}>Recommended Jobs</h2>
              {jobs.length === 0 ? (
                <div>No recommended jobs at this time.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {jobs.slice(0, 5).map(job => (
                    <li key={job.id} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>{job.title} <span style={{ color: '#00b4d8' }}>@ {job.hospital.hospital_name}</span></div>
                      <div style={{ fontSize: 14, color: '#888' }}>{job.location} | Salary: ₹{job.salary_min} - ₹{job.salary_max}</div>
                      <Link href={`/jobs/${job.id}`} style={{ color: '#fff', background: '#00b4d8', borderRadius: 6, padding: '6px 16px', marginLeft: 8, fontWeight: 600, textDecoration: 'none' }}>View</Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/jobs" style={{ color: '#0077b6', fontWeight: 600, textDecoration: 'underline' }}>Browse All Jobs</Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
