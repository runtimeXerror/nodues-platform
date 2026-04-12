import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function Setup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/check-setup').then(r => {
      if (r.data.adminExists) navigate('/', { replace: true });
    });
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await api.post('/auth/setup', { name: form.name, email: form.email, password: form.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Admin setup complete!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 }}>
      <div className="fadeIn" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800 }}>First Time Setup</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>
            Create the admin account to get started
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          <div className="alert alert-info" style={{ marginBottom: 22, background: 'rgba(26,86,219,0.15)', border: '1px solid rgba(26,86,219,0.3)', color: '#93c5fd' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            This page is only available once. After setup, it will redirect to login.
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Admin Full Name</label>
              <input className="form-input form-input-dark" name="name" value={form.name} onChange={handle} placeholder="College Admin" required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Official College Email</label>
              <input className="form-input form-input-dark" name="email" type="email" value={form.email} onChange={handle} placeholder="admin@college.ac.in" required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
              <input className="form-input form-input-dark" name="password" type="password" value={form.password} onChange={handle} placeholder="Min 6 characters" required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Confirm Password</label>
              <input className="form-input form-input-dark" name="confirm" type="password" value={form.confirm} onChange={handle} placeholder="Repeat password" required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 6, borderRadius: 12 }}>
              {loading ? <><span className="spinner" /> Setting up…</> : 'Complete Setup →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
