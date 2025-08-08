import React, { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';

interface HospitalProfile {
  id: number;
  user: number;
  hospital_name: string;
  hospital_type: string;
  hospital_address: string;
  city: string;
  state: string;
  pincode: string;
  registration_number: string;
  is_profile_verified: boolean;
  verification_status: string;
  logo: string;
  website: string;
  description: string;
}

export default function HospitalProfilePage() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('api/profiles/recruiter/');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load profile' }));
        throw new Error(errorData.error || 'Failed to load profile');
      }
      const data = await res.json();
      setProfile(data);
      setForm(data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    setEdit(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest('api/profiles/recruiter/', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to save profile' }));
        throw new Error(errorData.error || 'Failed to save profile');
      }
      setEdit(false);
      await loadProfile();
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Error saving profile');
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
            Hospital Profile
          </h1>
          <p style={{ 
            color: '#333', 
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Manage your hospital information and verification status
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading profile...</div>
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
              onClick={loadProfile}
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
        ) : profile && !edit ? (
          <div style={{ 
            background: '#fff', 
            borderRadius: '20px', 
            boxShadow: '0 4px 32px rgba(189, 224, 254, 0.3)', 
            padding: '2.5rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.8rem', color: '#0077b6', marginBottom: '0.5rem' }}>
                  {profile.hospital_name}
                </h2>
                <span style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: profile.is_profile_verified ? '#d4edda' : '#f8d7da',
                  color: profile.is_profile_verified ? '#155724' : '#721c24'
                }}>
                  {profile.verification_status || 'pending'}
                </span>
              </div>
              <button 
                onClick={handleEdit} 
                style={{ 
                  background: '#0077b6', 
                  color: '#fff', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Edit Profile
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: '#333', marginBottom: '1rem' }}>Basic Information</h3>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Type:</strong> {profile.hospital_type || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Registration Number:</strong> {profile.registration_number || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Website:</strong> {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b6' }}>
                      {profile.website}
                    </a>
                  ) : 'N/A'}
                </div>
              </div>

              <div>
                <h3 style={{ fontWeight: 600, color: '#333', marginBottom: '1rem' }}>Address</h3>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Address:</strong> {profile.hospital_address || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>City:</strong> {profile.city || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>State:</strong> {profile.state || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Pincode:</strong> {profile.pincode || 'N/A'}
                </div>
              </div>
            </div>

            {profile.description && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontWeight: 600, color: '#333', marginBottom: '1rem' }}>Description</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{profile.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            background: '#fff', 
            borderRadius: '20px', 
            boxShadow: '0 4px 32px rgba(189, 224, 254, 0.3)', 
            padding: '2.5rem' 
          }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.8rem', color: '#0077b6', marginBottom: '2rem' }}>
              Edit Hospital Profile
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                    Hospital Name *
                  </label>
                  <input 
                    value={form.hospital_name || ''} 
                    onChange={e => setForm({ ...form, hospital_name: e.target.value })} 
                    placeholder="Hospital Name" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '1rem' 
                    }} 
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                    Hospital Type
                  </label>
                  <input 
                    value={form.hospital_type || ''} 
                    onChange={e => setForm({ ...form, hospital_type: e.target.value })} 
                    placeholder="e.g., General Hospital, Specialty Center" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                    Registration Number
                  </label>
                  <input 
                    value={form.registration_number || ''} 
                    onChange={e => setForm({ ...form, registration_number: e.target.value })} 
                    placeholder="Hospital Registration Number" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                    Website
                  </label>
                  <input 
                    value={form.website || ''} 
                    onChange={e => setForm({ ...form, website: e.target.value })} 
                    placeholder="https://hospital-website.com" 
                    type="url"
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                    Address
                  </label>
                  <input 
                    value={form.hospital_address || ''} 
                    onChange={e => setForm({ ...form, hospital_address: e.target.value })} 
                    placeholder="Hospital Address" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                    City
                  </label>
                  <input 
                    value={form.city || ''} 
                    onChange={e => setForm({ ...form, city: e.target.value })} 
                    placeholder="City" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                    State
                  </label>
                  <input 
                    value={form.state || ''} 
                    onChange={e => setForm({ ...form, state: e.target.value })} 
                    placeholder="State" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                    Pincode
                  </label>
                  <input 
                    value={form.pincode || ''} 
                    onChange={e => setForm({ ...form, pincode: e.target.value })} 
                    placeholder="Pincode" 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>
                  Description
                </label>
                <textarea 
                  value={form.description || ''} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="Brief description of your hospital and services" 
                  rows={4}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb', 
                    fontSize: '1rem',
                    resize: 'vertical'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setEdit(false)}
                  style={{ 
                    background: '#6c757d', 
                    color: '#fff', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '8px', 
                    fontWeight: '600', 
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    background: loading ? '#ccc' : '#0077b6', 
                    color: '#fff', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '8px', 
                    fontWeight: '600', 
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
