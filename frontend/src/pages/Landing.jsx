import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CheckSquare, ShieldCheck, GraduationCap, BookOpen } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminExists, setAdminExists] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user) {
      const role = user.role;
      navigate(role === 'principal_assistant' ? '/assistant' : `/${role}`, { replace: true });
      return;
    }
    api.get('/auth/check-setup')
      .then(r => {
        if (!r.data.adminExists) navigate('/setup', { replace: true });
        else setAdminExists(true);
      })
      .catch(() => setAdminExists(true))
      .finally(() => setChecking(false));
  }, [user]);

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const roles = [
    {
      key: 'admin', icon: ShieldCheck, color: '#1a56db', bg: '#dbeafe',
      title: 'Admin', sub: 'College office administration',
      desc: ['Manage teachers & students', 'Approve teacher accounts', 'Monitor all clearances'],
      onClick: () => navigate('/login?role=admin'),
    },
    {
      key: 'teacher', icon: BookOpen, color: '#0f6e56', bg: '#ccfbf1',
      title: 'Teacher / Faculty', sub: 'Professor / HOD / Librarian',
      desc: ['Approve dept clearances', 'View student requests', 'Auto digital signature'],
      onClick: () => navigate('/login?role=teacher'),
    },
    {
      key: 'student', icon: GraduationCap, color: '#5b21b6', bg: '#ede9fe',
      title: 'Student', sub: 'University Registration No.',
      desc: ['Apply for no-dues', 'Track approval status', 'Download certificate'],
      onClick: () => navigate('/student-login'),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: -80, right: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(26,86,219,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(14,165,233,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="fadeIn" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ width: 62, height: 62, borderRadius: 18, background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 28px rgba(26,86,219,0.4)' }}>
          <CheckSquare size={30} color="white" />
        </div>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>NoDues Portal</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginTop: 8 }}>
          Digital No-Dues Clearance System
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>
          Select your role to continue
        </p>
      </div>

      {/* Role cards */}
      <div className="fadeIn" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20, width: '100%', maxWidth: 920 }}>
        {roles.map(({ key, icon: Icon, color, bg, title, sub, desc, onClick }) => (
          <button key={key} onClick={onClick}
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon size={24} color={color} />
            </div>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{title}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 16 }}>{sub}</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {desc.map((d, i) => (
                <li key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  {d}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Principal link */}
      <div style={{ marginTop: 28, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
        Principal / Assistant?{' '}
        <span style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/login?role=principal')}>
          Login here
        </span>
      </div>
    </div>
  );
}
