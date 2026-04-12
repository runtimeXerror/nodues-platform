import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [params] = useSearchParams();
  const role = params.get('role') || 'admin';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const ROLE_INFO = {
    admin: { label: 'Admin Login', color: '#1a56db', gradient: 'linear-gradient(135deg, #1e3a8a, #1a56db)' },
    teacher: { label: 'Teacher / Faculty Login', color: '#0f6e56', gradient: 'linear-gradient(135deg, #064e3b, #0f6e56)' },
    principal: { label: 'Principal Login', color: '#9a3412', gradient: 'linear-gradient(135deg, #431407, #9a3412)' },
    principal_assistant: { label: 'Principal Assistant Login', color: '#92400e', gradient: 'linear-gradient(135deg, #451a03, #92400e)' },
  };
  const info = ROLE_INFO[role] || ROLE_INFO.admin;

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      const u = data.user;
      if (u.role === 'principal_assistant') navigate('/assistant');
      else navigate(`/${u.role}`);
      toast.success(`Welcome, ${u.name}!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: info.gradient, padding: 20 }}>
      <div style={{ position: 'fixed', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div className="fadeIn" style={{ width: '100%', maxWidth: 400 }}>
        {/* Back */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Back to role selection
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <CheckSquare size={26} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>NoDues Portal</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 5 }}>{info.label}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 28 }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 18, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input className="form-input form-input-dark" style={{ paddingLeft: 34 }} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@college.ac.in" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input className="form-input form-input-dark" style={{ paddingLeft: 34 }} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
              </div>
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 4, background: info.color, borderRadius: 12 }}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          {role === 'teacher' && (
            <p style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              New here?{' '}
              <Link to="/teacher-register" style={{ color: '#6ee7b7', fontWeight: 600 }}>Request access</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
