import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  specialization?: string;
  years_of_experience?: number;
  verification_status: string;
  application_status: string;
  applied_at: string;
  bio?: string;
}

interface JobCandidatesData {
  job_title: string;
  total_applications: number;
  candidates: Candidate[];
}

interface JobDetailsModalProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ jobId, isOpen, onClose }) => {
  const [candidatesData, setCandidatesData] = useState<JobCandidatesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && jobId && jobId > 0) {
      fetchCandidates();
    } else if (isOpen && (!jobId || jobId <= 0)) {
      setError('Invalid job ID provided');
    }
  }, [isOpen, jobId]);

  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      console.log(`Fetching candidates for job ID: ${jobId}`);
      const response = await apiRequest(`api/jobs/${jobId}/candidates/`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        let errorMessage = 'Failed to load candidates';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Candidates data received:', data);
      setCandidatesData(data);
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      setError(err.message || 'Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return { bg: '#e3f2fd', color: '#1976d2' };
      case 'under_review':
        return { bg: '#fff3e0', color: '#f57c00' };
      case 'shortlisted':
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      case 'interviewed':
        return { bg: '#e8f5e8', color: '#388e3c' };
      case 'hired':
        return { bg: '#e8f5e8', color: '#2e7d32' };
      case 'rejected':
        return { bg: '#ffebee', color: '#d32f2f' };
      default:
        return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#0077b6',
              marginBottom: '0.25rem'
            }}>
              {candidatesData?.job_title || 'Job Details'}
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              {candidatesData ? `${candidatesData.total_applications} applications` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.5rem',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '2rem',
          maxHeight: 'calc(90vh - 120px)',
          overflow: 'auto'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading candidates...</div>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem'
            }}>
              <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>
              <button
                onClick={fetchCandidates}
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
          ) : candidatesData?.candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '1.1rem', color: '#666' }}>No applications yet for this job.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {candidatesData?.candidates.map(candidate => {
                const statusStyle = getStatusColor(candidate.application_status);
                return (
                  <div
                    key={candidate.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '0.25rem'
                        }}>
                          {candidate.first_name} {candidate.last_name}
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                          {candidate.specialization} • {candidate.years_of_experience || 0} years experience
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color
                        }}>
                          {candidate.application_status.replace('_', ' ')}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          backgroundColor: candidate.verification_status === 'verified' ? '#d4edda' : '#f8d7da',
                          color: candidate.verification_status === 'verified' ? '#155724' : '#721c24'
                        }}>
                          {candidate.verification_status}
                        </span>
                      </div>
                    </div>

                    {candidate.bio && (
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#555',
                        lineHeight: '1.5',
                        marginBottom: '1rem'
                      }}>
                        {candidate.bio.length > 150 ? `${candidate.bio.substring(0, 150)}...` : candidate.bio}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      color: '#888'
                    }}>
                      <span>Applied: {new Date(candidate.applied_at).toLocaleDateString()}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          style={{
                            background: '#0077b6',
                            color: '#fff',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          View Profile
                        </button>
                        {candidate.application_status === 'applied' && (
                          <button
                            style={{
                              background: '#28a745',
                              color: '#fff',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Shortlist
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
