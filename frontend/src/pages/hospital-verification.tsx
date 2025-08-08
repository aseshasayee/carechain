import React, { useState } from 'react';
import { apiRequest } from '../utils/api';
import Link from 'next/link';

export default function HospitalVerificationPage() {
  const [form, setForm] = useState<any>({});
  const [fileInputs, setFileInputs] = useState<any>({});
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, files, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev: any) => ({ ...prev, [name]: checked ? 'true' : 'false' }));
    } else if (files) {
      setFileInputs((prev: any) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult('');
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v as string));
    Object.entries(fileInputs).forEach(([k, v]) => {
      if (v instanceof File) formData.append(k, v, v.name);
    });
    try {
      const res = await fetch('http://127.0.0.1:8000/api/profiles/hospital-verification/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setResult('Submitted! ID: ' + data.id);
    } catch (err: any) {
      setResult('Error: ' + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(90deg, #e0f7fa, #caf0f8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 0 32px #bde0fe', padding: 40, minWidth: 400, maxWidth: 500 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0077b6', marginBottom: 24 }}>Hospital Verification</h2>
        <label style={{ display: 'block', marginBottom: 12 }}>Official Name: <input name="official_name" required onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>Registration Number: <input name="registration_number" required onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>GST Number: <input name="gst_number" onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>Official Contact Number: <input name="official_contact_number" required onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>Address: <input name="address" required onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>Primary Contact Name: <input name="primary_contact_name" required onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>Primary Contact Phone: <input name="primary_contact_phone" required onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>Primary Contact Email: <input name="primary_contact_email" type="email" required onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>Registration Proof: <input name="registration_proof" type="file" required onChange={handleChange} style={{ width: '100%' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>GST Certificate: <input name="gst_certificate" type="file" onChange={handleChange} style={{ width: '100%' }} /></label>
        <label style={{ display: 'block', marginBottom: 12 }}>NABH Certified: <input name="is_nabh_certified" type="checkbox" onChange={handleChange} style={{ marginLeft: 8 }} /></label>
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#0077b6', color: '#fff', padding: 12, borderRadius: 8, fontWeight: 700, fontSize: 18, border: 'none', marginTop: 16 }}>{loading ? 'Submitting...' : 'Submit Verification'}</button>
        {result && <div style={{ marginTop: 16, color: result.startsWith('Error') ? 'red' : 'green', fontWeight: 600 }}>{result}</div>}
      </form>
    </div>
  );
}
