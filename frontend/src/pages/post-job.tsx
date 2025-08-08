import React, { useState } from 'react';
import { apiRequest } from '../utils/api';
import Link from 'next/link';

export default function PostJobPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    department: '',
    job_type: '',
    salary: '',
    start_date: '',
    end_date: '',
    qualifications: '',
    skills: '',
    experience_required: '',
    vacancies: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest('http://localhost:8000/api/jobs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salary: Number(form.salary),
          experience_required: Number(form.experience_required),
          vacancies: Number(form.vacancies),
          qualifications: form.qualifications.split(',').map(q => q.trim()),
          skills: form.skills.split(',').map(s => s.trim()),
        }),
      });
      if (!res.ok) throw new Error('Failed to post job');
      setSuccess('Job posted successfully!');
      setForm({
        title: '', description: '', location: '', department: '', job_type: '', salary: '', start_date: '', end_date: '', qualifications: '', skills: '', experience_required: '', vacancies: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0077b6', marginBottom: 24 }}>Post a Job</h1>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 0 10px #caf0f8', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" required />
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" required />
          <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Department" required />
          <input value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })} placeholder="Job Type (e.g. full_time)" required />
          <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="Salary" type="number" required />
          <input value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} placeholder="Start Date (YYYY-MM-DD)" required />
          <input value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} placeholder="End Date (YYYY-MM-DD)" />
          <input value={form.qualifications} onChange={e => setForm({ ...form, qualifications: e.target.value })} placeholder="Qualifications (comma separated)" />
          <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Skills (comma separated)" />
          <input value={form.experience_required} onChange={e => setForm({ ...form, experience_required: e.target.value })} placeholder="Experience Required (years)" type="number" />
          <input value={form.vacancies} onChange={e => setForm({ ...form, vacancies: e.target.value })} placeholder="Vacancies" type="number" />
          <button type="submit" style={{ background: '#0077b6', color: '#fff', border: 'none', borderRadius: 4, padding: '12px 0', fontWeight: 600 }} disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {success && <div style={{ color: 'green' }}>{success}</div>}
        </form>
      </main>
    </div>
  );
}
