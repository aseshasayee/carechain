import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '../utils/api';
import JobDetailsModal from '../components/job-management/JobDetailsModal';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  department: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  start_date: string;
  end_date?: string;
  qualifications: string[];
  skills: string[];
  experience_required: number;
  vacancies: number;
  is_filled: boolean;
  is_active: boolean;
  applications_count: number;
  created_at: string;
}

const JobManagementPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    search: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `api/jobs/?${queryString}` : 'api/jobs/';
      
      const response = await apiRequest(url);
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.results || []);
      } else {
        throw new Error('Failed to fetch jobs');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (jobId: number, currentStatus: boolean) => {
    try {
      const response = await apiRequest(`api/jobs/${jobId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        await fetchJobs(); // Refresh the list
      } else {
        throw new Error('Failed to update job status');
      }
    } catch (err: any) {
      alert('Error updating job status: ' + err.message);
    }
  };

  const handleViewDetails = (jobId: number) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const handleEditJob = (jobId: number) => {
    // Navigate to edit page (you can implement this)
    window.location.href = `/edit-job/${jobId}`;
  };

  const handleDeactivateJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to deactivate this job?')) {
      return;
    }
    await toggleJobStatus(jobId, true); // Deactivate (set is_active to false)
  };

  const deleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    try {
      const response = await apiRequest(`api/jobs/${jobId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchJobs(); // Refresh the list
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (err: any) {
      alert('Error deleting job: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0077b6', marginBottom: '1rem' }}>
            Job Management
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Manage your job postings, track applications, and update job details
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Filters */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: '#fff'
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="filled">Filled</option>
              </select>

              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  minWidth: '250px'
                }}
              />
            </div>

            <Link
              href="/post-job"
              style={{
                background: '#0077b6',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ➕ Post New Job
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading jobs...</div>
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
              onClick={fetchJobs}
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
        ) : jobs.length === 0 ? (
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            padding: '3rem', 
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(189, 224, 254, 0.3)' 
          }}>
            <h3 style={{ color: '#666', marginBottom: '1rem' }}>No jobs found</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
              {filters.search || filters.status ? 
                'Try adjusting your filters to see more results.' :
                'You haven\'t posted any jobs yet.'
              }
            </p>
            <Link
              href="/post-job"
              style={{
                background: '#0077b6',
                color: '#fff',
                padding: '1rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(189, 224, 254, 0.3)' }}>
            {jobs.map((job, index) => (
              <div 
                key={job.id} 
                style={{ 
                  padding: '2rem',
                  borderBottom: index < jobs.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <h3 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '600', 
                        color: '#333', 
                        margin: 0 
                      }}>
                        {job.title}
                      </h3>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: job.is_active ? (job.is_filled ? '#ffc107' : '#28a745') : '#6c757d',
                        color: '#fff'
                      }}>
                        {job.is_filled ? 'Filled' : job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '1rem', 
                      marginBottom: '1rem',
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      <div><strong>Department:</strong> {job.department}</div>
                      <div><strong>Location:</strong> {job.location}</div>
                      <div><strong>Type:</strong> {job.job_type}</div>
                      <div><strong>Experience:</strong> {job.experience_required} years</div>
                      <div><strong>Vacancies:</strong> {job.vacancies}</div>
                      <div><strong>Applications:</strong> {job.applications_count || 0}</div>
                    </div>

                    {job.salary_min && job.salary_max && (
                      <div style={{ color: '#0077b6', fontWeight: '600', marginBottom: '1rem' }}>
                        Salary: ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      Posted: {new Date(job.created_at).toLocaleDateString()}
                      {job.start_date && (
                        <> • Start Date: {new Date(job.start_date).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                    <button
                      onClick={() => handleViewDetails(job.id)}
                      style={{
                        background: '#17a2b8',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleEditJob(job.id)}
                      style={{
                        background: '#ffc107',
                        color: '#000',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleJobStatus(job.id, job.is_active)}
                      style={{
                        background: job.is_active ? '#dc3545' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {job.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => deleteJob(job.id)}
                      style={{
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Job Details Modal */}
      {selectedJobId && (
        <JobDetailsModal
          jobId={selectedJobId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedJobId(null);
          }}
        />
      )}
    </div>
  );
};

export default JobManagementPage;
