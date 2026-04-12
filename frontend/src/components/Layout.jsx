import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

// ── Layout ────────────────────────────────────────────────────────────────────
export function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

// ── Protected Route ───────────────────────────────────────────────────────────
export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner spinner-dark" style={{ width: 30, height: 30 }} />
    </div>
  );

  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role === 'principal_assistant' ? 'assistant' : user.role}`} replace />;

  // Force password change on first login
  if (user.isFirstLogin) return <ChangePasswordModal />;

  return children;
}

// ── Change Password Modal ──────────────────────────────────────────────────────
function ChangePasswordModal() {
  const { user, setUser } = useAuth();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pw !== confirm) return toast.error('Passwords do not match');
    if (pw.length < 6) return toast.error('Minimum 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/change-password', { newPassword: pw });
      toast.success('Password changed! Please login again.');
      const updated = { ...user, isFirstLogin: false };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 }}>
      <div className="fadeIn" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={24} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Change Your Password</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>You are using a temporary password. Please set a new one to continue.</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 28 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>New Password</label>
              <input className="form-input form-input-dark" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min 6 characters" required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Confirm Password</label>
              <input className="form-input form-input-dark" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" /> Saving…</> : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
