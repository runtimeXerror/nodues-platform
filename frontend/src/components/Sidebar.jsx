import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Users, Building2,
  LogOut, CheckSquare, Award, UserCheck, AlertCircle,
  ClipboardList, BookOpen, Settings
} from 'lucide-react';

const NAV = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/teachers', icon: UserCheck, label: 'Teacher Requests' },
    { to: '/admin/students', icon: Users, label: 'Student Database' },
    { to: '/admin/requests', icon: FileText, label: 'All Requests' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/complaints', icon: AlertCircle, label: 'Complaints' },
    { to: '/admin/users', icon: Settings, label: 'Users' },
  ],
  teacher: [
    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/requests', icon: ClipboardList, label: 'Student Requests' },
  ],
  student: [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/apply', icon: FileText, label: 'Apply No-Dues' },
    { to: '/student/status', icon: CheckSquare, label: 'Track Status' },
    { to: '/student/certificate', icon: Award, label: 'Certificate' },
  ],
  principal: [
    { to: '/principal', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/principal/requests', icon: ClipboardList, label: 'Final Approvals' },
  ],
  principal_assistant: [
    { to: '/assistant', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/assistant/complaints', icon: AlertCircle, label: 'Complaints' },
  ],
};

const ROLE_COLOR = {
  admin: '#1a56db',
  teacher: '#0f6e56',
  student: '#5b21b6',
  principal: '#9a3412',
  principal_assistant: '#92400e',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV[user?.role] || [];
  const color = ROLE_COLOR[user?.role] || '#1a56db';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={18} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>NoDues Portal</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 7 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ color: 'white', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--mono)', marginTop: 2 }}>
          {user?.universityRegNo || user?.facultyId || user?.email?.split('@')[0]}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to.split('/').length <= 2}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 11px', borderRadius: 8, marginBottom: 3,
              color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: 13.5,
              textDecoration: 'none', transition: 'all 0.12s',
            })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => { logout(); navigate('/'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 8, width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13.5, cursor: 'pointer', transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
