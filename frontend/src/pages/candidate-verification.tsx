import React, { useState } from 'react';
import { apiRequest } from '../utils/api';

export default function CandidateVerification() {
  const [form, setForm] = useState<any>({});
  const [fileInputs, setFileInputs] = useState<any>({});
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, files } = e.target;
    if (files) {
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
      const res = await fetch('http://127.0.0.1:8000/api/profiles/candidate-verification/', {
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
    <div className="container">
      <h2>Candidate Verification</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Registration Number: <input name="registration_number" required onChange={handleChange} /></label><br />
        <label>Specialization: <input name="specialization" required onChange={handleChange} /></label><br />
        <label>Years of Experience: <input name="years_of_experience" type="number" required onChange={handleChange} /></label><br />
        <label>Qualification Certificates: <input name="qualification_certificates" type="file" required onChange={handleChange} /></label><br />
        <label>Registration Certificate: <input name="registration_certificate" type="file" required onChange={handleChange} /></label><br />
        <label>Resume: <input name="resume" type="file" required onChange={handleChange} /></label><br />
        <label>Government ID: <input name="government_id" type="file" required onChange={handleChange} /></label><br />
        <label>Additional Certifications: <input name="additional_certifications" type="file" onChange={handleChange} /></label><br />
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      </form>
      <div>{result}</div>
    </div>
  );
}
