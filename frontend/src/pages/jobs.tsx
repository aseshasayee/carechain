import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  department: string;
  job_type: string;
  salary: number;
  start_date: string;
  end_date: string | null;
  qualifications: string[];
  skills: string[];
  experience_required: number;
  vacancies: number;
  is_filled: boolean;
  is_active: boolean;
  employer: { id: number; hospital_name: string };
  has_applied?: boolean;
  application_status?: string;
  is_matched?: boolean;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs(query = '') {
    setLoading(true);
    setError('');
    
    let url = 'api/jobs/';
    if (query) url += `?search=${encodeURIComponent(query)}`;
    try {
      const res = await apiRequest(url);
      if (!res.ok) throw new Error('Failed to load jobs');
      const data = await res.json();
      setJobs(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Error loading jobs');
    } finally {
      setLoading(false);
    }
  }

  async function applyToJob(jobId: number) {
    try {
      const res = await apiRequest('http://localhost:8000/api/jobs/applications/', {
        method: 'POST',
        body: JSON.stringify({ job: jobId, cover_letter: 'Interested!' }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to apply');
      await loadJobs(search);
      alert('Applied to job!');
    } catch (err: any) {
      alert(err.message || 'Failed to apply');
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0077b6', marginBottom: 24 }}>Jobs</h1>
        <form onSubmit={e => { e.preventDefault(); loadJobs(search); }} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          <button type="submit" style={{ background: '#0077b6', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px' }}>Search</button>
        </form>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.length === 0 ? <div>No jobs found.</div> : jobs.map(job => (
              <div key={job.id} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 0 8px #caf0f8', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{job.title}</div>
                  <div style={{ color: '#555' }}>{job.location} | {job.department} | {job.job_type}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>Salary: ₹{job.salary}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>Employer: {job.employer?.hospital_name}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>Experience: {job.experience_required} yrs</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {job.has_applied ? (
                    <span style={{ color: '#43a047', fontWeight: 600 }}>{job.application_status || 'Applied'}</span>
                  ) : (
                    <button style={{ background: '#0077b6', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px' }} onClick={() => applyToJob(job.id)}>Apply</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
