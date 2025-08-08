
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../utils/api';

const cardAnim = {
  animation: 'fadeInUp 0.7s cubic-bezier(.23,1.01,.32,1)'
};

if (typeof window !== 'undefined' && !document.getElementById('fadeInUpKeyframes')) {
  const style = document.createElement('style');
  style.id = 'fadeInUpKeyframes';
  style.innerHTML = `@keyframes fadeInUp {0%{opacity:0;transform:translateY(40px);}100%{opacity:1;transform:translateY(0);}}`;
  document.head.appendChild(style);
}

interface HospitalStats {
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  total_employees: number;
}

interface Job {
  id: number;
  title: string;
  department: string;
  applications_count: number;
  is_active: boolean;
  created_at: string;
}

export default function HospitalDashboard() {
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch hospital statistics
      const statsRes = await apiRequest('api/jobs/hospital-stats/');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        const errorData = await statsRes.json().catch(() => ({ error: 'Failed to load stats' }));
        console.error('Stats error:', errorData);
      }

      // Fetch recent jobs
      const jobsRes = await apiRequest('api/jobs/?limit=5');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setRecentJobs(Array.isArray(jobsData) ? jobsData : (jobsData.results || []));
      } else {
        const errorData = await jobsRes.json().catch(() => ({ error: 'Failed to load jobs' }));
        console.error('Jobs error:', errorData);
      }
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center', ...cardAnim }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 900, 
            color: '#0077b6', 
            marginBottom: '0.5rem',
            textShadow: '0 2px 8px rgba(189, 224, 254, 0.5)' 
          }}>
            Hospital Dashboard
          </h1>
          <p style={{ 
            color: '#333', 
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Manage your job postings, review candidates, and track applications
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading dashboard...</div>
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
              onClick={fetchDashboardData}
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
          <>
            {/* Statistics Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '2rem', 
              marginBottom: '3rem' 
            }}>
              <div style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: '2rem', 
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(189, 224, 254, 0.3)',
                ...cardAnim 
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0077b6', marginBottom: '0.5rem' }}>
                  {stats?.total_jobs || 0}
                </div>
                <div style={{ fontWeight: 600, color: '#333', fontSize: '1.1rem' }}>Total Jobs</div>
              </div>

              <div style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: '2rem', 
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(189, 224, 254, 0.3)',
                ...cardAnim 
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#28a745', marginBottom: '0.5rem' }}>
                  {stats?.active_jobs || 0}
                </div>
                <div style={{ fontWeight: 600, color: '#333', fontSize: '1.1rem' }}>Active Jobs</div>
              </div>

              <div style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: '2rem', 
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(189, 224, 254, 0.3)',
                ...cardAnim 
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ff6b35', marginBottom: '0.5rem' }}>
                  {stats?.total_applications || 0}
                </div>
                <div style={{ fontWeight: 600, color: '#333', fontSize: '1.1rem' }}>Applications</div>
              </div>

              <div style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: '2rem', 
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(189, 224, 254, 0.3)',
                ...cardAnim 
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#8b5cf6', marginBottom: '0.5rem' }}>
                  {stats?.total_employees || 0}
                </div>
                <div style={{ fontWeight: 600, color: '#333', fontSize: '1.1rem' }}>Employees</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ 
              background: '#fff', 
              borderRadius: '20px', 
              padding: '2.5rem', 
              marginBottom: '3rem',
              boxShadow: '0 4px 32px rgba(189, 224, 254, 0.3)',
              ...cardAnim 
            }}>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                color: '#0077b6', 
                marginBottom: '2rem',
                textAlign: 'center' 
              }}>
                Quick Actions
              </h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1.5rem' 
              }}>
                <Link 
                  href="/post-job" 
                  style={{ 
                    background: 'linear-gradient(135deg, #0077b6, #00b4d8)', 
                    color: '#fff', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    fontWeight: 700, 
                    textDecoration: 'none', 
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 16px rgba(0, 119, 182, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📝 Post New Job
                </Link>
                
                <Link 
                  href="/candidates" 
                  style={{ 
                    background: 'linear-gradient(135deg, #28a745, #20c997)', 
                    color: '#fff', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    fontWeight: 700, 
                    textDecoration: 'none', 
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  👥 Browse Candidates
                </Link>
                
                <Link 
                  href="/employee-management" 
                  style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', 
                    color: '#fff', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    fontWeight: 700, 
                    textDecoration: 'none', 
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔧 Employee Management
                </Link>
                
                <Link 
                  href="/applications" 
                  style={{ 
                    background: 'linear-gradient(135deg, #ff6b35, #f8961e)', 
                    color: '#fff', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    fontWeight: 700, 
                    textDecoration: 'none', 
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📄 Review Applications
                </Link>
              </div>
            </div>

            {/* Recent Jobs */}
            <div style={{ 
              background: '#fff', 
              borderRadius: '20px', 
              padding: '2.5rem',
              boxShadow: '0 4px 32px rgba(189, 224, 254, 0.3)',
              ...cardAnim 
            }}>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 700, 
                color: '#0077b6', 
                marginBottom: '2rem' 
              }}>
                Recent Job Postings
              </h2>
              {recentJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  No job postings yet. <Link href="/post-job" style={{ color: '#0077b6', fontWeight: 600 }}>Post your first job</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentJobs.map(job => (
                    <div key={job.id} style={{ 
                      padding: '1.5rem', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}>
                      <div>
                        <h3 style={{ fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                          {job.title}
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {job.department} • {job.applications_count} applications
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: job.is_active ? '#d4edda' : '#f8d7da',
                          color: job.is_active ? '#155724' : '#721c24'
                        }}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <Link 
                          href={`/jobs/${job.id}`}
                          style={{
                            background: '#0077b6',
                            color: '#fff',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link 
                  href="/job-management" 
                  style={{ 
                    color: '#0077b6', 
                    fontWeight: 600, 
                    textDecoration: 'underline',
                    fontSize: '1.1rem'
                  }}
                >
                  View All Jobs →
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
