import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { GraduationCap, BookOpen, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

// ── Student Login ─────────────────────────────────────────────────────────────
export function StudentLogin() {
  const [form, setForm] = useState({ universityRegNo: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { studentLogin } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await studentLogin(form.universityRegNo, form.password);
      navigate('/student');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2e1065, #5b21b6)', padding: 20 }}>
      <div className="fadeIn" style={{ width: '100%', maxWidth: 400 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Back
        </Link>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <GraduationCap size={26} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>Student Login</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>Use your University Registration Number</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 28 }}>
          {error && <div className="alert" style={{ marginBottom: 16, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}><AlertCircle size={15} /> {error}</div>}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>University Registration No.</label>
              <input className="form-input form-input-dark" style={{ fontFamily: 'var(--mono)', letterSpacing: 1 }} value={form.universityRegNo} onChange={e => setForm(f => ({ ...f, universityRegNo: e.target.value }))} placeholder="e.g. 23XXXXXXXX" required />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
              <input className="form-input form-input-dark" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
            </div>
            <button className="btn btn-lg" type="submit" disabled={loading} style={{ background: '#5b21b6', color: 'white', borderRadius: 12 }}>
              {loading ? <><span className="spinner" /> Logging in…</> : 'Login'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            New student?{' '}<Link to="/student-register" style={{ color: '#c4b5fd', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Student Register ──────────────────────────────────────────────────────────
export function StudentRegister() {
  const [form, setForm] = useState({ universityRegNo: '', email: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'invalid'
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setLoading(true); setStatus(null);
    try {
      const res = await api.post('/auth/student-register', form);
      setStatus('success'); setMsg(res.data.message);
    } catch (err) {
      const m = err.response?.data?.message || 'Registration failed';
      setStatus('error'); setMsg(m);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2e1065, #5b21b6)', padding: 20 }}>
      <div className="fadeIn" style={{ width: '100%', maxWidth: 460 }}>
        <Link to="/student-login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Back to login
        </Link>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>Student Registration</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>Enter your university details to create an account</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 28 }}>
          <div className="alert" style={{ marginBottom: 20, background: 'rgba(91,33,182,0.3)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd', fontSize: 13 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            Your details must match the college admission records. Login credentials will be sent to your registered email.
          </div>

          {status === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle2 size={30} color="#15803d" />
              </div>
              <h3 style={{ color: 'white', marginBottom: 8 }}>Account Created!</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{msg}</p>
              <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => navigate('/student-login')}>Go to Login</button>
            </div>
          )}

          {status !== 'success' && (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {status === 'error' && <div className="alert" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}><AlertCircle size={15} /> {msg} <Link to="/complaint" style={{ color: '#fca5a5', fontWeight: 700, marginLeft: 6 }}>File Complaint</Link></div>}
              <div className="form-group">
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>University Registration Number</label>
                <input className="form-input form-input-dark" style={{ fontFamily: 'var(--mono)', letterSpacing: 1 }} value={form.universityRegNo} onChange={e => setForm(f => ({ ...f, universityRegNo: e.target.value }))} placeholder="e.g. 23XXXXXXXX" required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>College Email Address</label>
                <input className="form-input form-input-dark" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@college.ac.in" required />
              </div>
              <button className="btn btn-lg" type="submit" disabled={loading} style={{ background: '#5b21b6', color: 'white', borderRadius: 12 }}>
                {loading ? <><span className="spinner" /> Verifying…</> : 'Verify & Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Teacher Register ──────────────────────────────────────────────────────────
export function TeacherRegister() {
  const [form, setForm] = useState({ name: '', email: '', designation: '', departments: [], password: '', confirm: '' });
  const [depts, setDepts] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    api.get('/clearance/departments').then(r => setDepts(r.data));
  }, []);

  const toggleDept = id => {
    setForm(f => ({
      ...f,
      departments: f.departments.includes(id)
        ? f.departments.filter(d => d !== id)
        : [...f.departments, id],
    }));
  };

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.departments.length === 0) return setError('Select at least one department');
    setError(''); setLoading(true);
    try {
      await api.post('/auth/teacher-register', { name: form.name, email: form.email, designation: form.designation, departments: form.departments, password: form.password });
      setSuccess(true);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #022c22, #0f6e56)', padding: 20 }}>
      <div className="fadeIn" style={{ width: '100%', maxWidth: 520 }}>
        <Link to="/login?role=teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24, textDecoration: 'none' }}>
          <ArrowLeft size={15} /> Back to login
        </Link>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>Request Faculty Access</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>Admin will review and send your credentials by email</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={48} color="#6ee7b7" style={{ margin: '0 auto 14px', display: 'block' }} />
              <h3 style={{ color: 'white', marginBottom: 8 }}>Request Submitted!</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Admin will review your request and send login credentials to your email.</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <div className="alert" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}><AlertCircle size={15} /> {error}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Full Name</label>
                  <input className="form-input form-input-dark" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. / Prof. Full Name" required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>College Email</label>
                  <input className="form-input form-input-dark" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="prof@college.ac.in" required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Designation</label>
                  <select
                    className="form-input form-input-dark"
                    value={form.designation}
                    onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                    required
                    style={{
                      background: '#0f6e56',
                      color: 'white',
                    }}
                  >
                    <option value="" style={{ background: '#064e3b', color: 'white' }}>Select…</option>
                    {['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Librarian', 'Hostel Warden', 'Accounts Officer', 'Exam Controller', 'Principal'].map(d => (
                      <option key={d} value={d} style={{ background: '#064e3b', color: 'white' }}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Department(s) — Select all that apply</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {depts.map(d => (
                    <button key={d.id} type="button" onClick={() => toggleDept(d.id)}
                      style={{
                        padding: '6px 14px', borderRadius: 99, border: '1.5px solid',
                        borderColor: form.departments.includes(d.id) ? '#0f6e56' : 'rgba(255,255,255,0.15)',
                        background: form.departments.includes(d.id) ? 'rgba(15,110,86,0.3)' : 'transparent',
                        color: form.departments.includes(d.id) ? '#6ee7b7' : 'rgba(255,255,255,0.45)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
                  <input className="form-input form-input-dark" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 chars" required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Confirm Password</label>
                  <input className="form-input form-input-dark" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat" required />
                </div>
              </div>

              <button className="btn btn-teal btn-lg" type="submit" disabled={loading} style={{ marginTop: 4, borderRadius: 12 }}>
                {loading ? <><span className="spinner" /> Submitting…</> : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
