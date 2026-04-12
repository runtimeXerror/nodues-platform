import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FileText, CheckCircle2, Clock, XCircle, Award, Download, ChevronRight, AlertCircle, Info } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { api.get('/clearance/my').then(r => setRequests(r.data)).finally(() => setLoading(false)); }, []);

  const latest = requests[0];
  const stats = {
    total: requests.length,
    completed: requests.filter(r => r.status === 'completed').length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
  };

  const deptProgress = latest?.deptClearances || [];
  const approvedDepts = deptProgress.filter(d => d.status === 'approved').length;

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</div>
        <div className="page-sub">
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, marginRight: 8 }}>{user?.universityRegNo}</span>
          {user?.course} · {user?.department}
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total Requests', value: stats.total, icon: FileText, color: '#1a56db', bg: '#dbeafe' },
          { label: 'Completed', value: stats.completed, icon: Award, color: '#15803d', bg: '#dcfce7' },
          { label: 'In Progress', value: stats.approved, icon: Clock, color: '#92400e', bg: '#fef9c3' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#9a3412', bg: '#ffedd5' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={20} color={color} /></div>
            <div><div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div></div>
          </div>
        ))}
      </div>

      {requests.length === 0 && !loading && (
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #5b21b6)', borderRadius: 16, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>Apply for No-Dues Clearance</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>Submit your clearance request to get started</div>
          </div>
          <button className="btn btn-lg" style={{ background: 'white', color: '#1a56db', fontWeight: 700 }} onClick={() => navigate('/student/apply')}>
            Apply Now <ChevronRight size={17} />
          </button>
        </div>
      )}

      {latest && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Latest Request Status</div>
            <span className={`badge badge-${latest.status}`}>{latest.status}</span>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Department approvals</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{approvedDepts} / {deptProgress.length}</span>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${deptProgress.length ? (approvedDepts / deptProgress.length) * 100 : 0}%`, background: 'var(--success)', borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10, marginBottom: 18 }}>
            {deptProgress.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', background: d.status === 'approved' ? '#f0fdf4' : d.status === 'rejected' ? '#fff1f2' : 'white' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: d.status === 'approved' ? 'var(--success)' : d.status === 'rejected' ? 'var(--danger)' : 'var(--warning)' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.department?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{d.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[['Session', latest.academicYear], ['Applied', new Date(latest.createdAt).toLocaleDateString('en-IN')]].map(([k, v]) => (
              <div key={k} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 14px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {latest.status === 'completed' && (
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-success" onClick={() => navigate('/student/certificate')}>
                <Download size={16} /> Download Certificate
              </button>
            </div>
          )}

          {latest.status === 'approved' && (
            <div className="alert alert-info" style={{ marginTop: 14 }}>
              <Info size={15} style={{ flexShrink: 0 }} />
              All departments cleared! Waiting for Principal's final approval.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Apply No-Dues ─────────────────────────────────────────────────────────────
export function ApplyNoDues() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    studentName: user?.name || '',
    regNo: user?.universityRegNo || '',
    rollNumber: user?.rollNumber || '',
    yearOfAdmission: user?.yearOfAdmission || '',
    dateOfLeaving: '',
    contactNumber: user?.contactNumber || '',
    residentialAddress: user?.residentialAddress || '',
    academicYear: '',
    tcAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.tcAccepted) return toast.error('Please accept Terms & Conditions');
    setLoading(true);
    try {
      await api.post('/clearance/submit', { ...form, tcAccepted: true });
      setSuccess(true);
      setTimeout(() => navigate('/student'), 2500);
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="fadeIn" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <CheckCircle2 size={34} color="#15803d" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Request Submitted!</h2>
        <p style={{ color: 'var(--muted)', marginTop: 8 }}>Your request has been sent to all departments. Redirecting…</p>
      </div>
    </div>
  );

  // Generate 4-year sessions e.g. 2021-2025, 2020-2024 ...
  const sessions = Array.from({ length: 12 }, (_, i) => {
    const start = new Date().getFullYear() - i;
    return `${start}-${start + 4}`;
  });

  return (
    <div className="fadeIn" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 22 }}>
        <div className="page-title">No-Dues Application Form</div>
        <div className="page-sub">Fill all details carefully — they will appear on your certificate</div>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: 20 }}>
        <AlertCircle size={16} style={{ flexShrink: 0 }} />
        <strong>Warning:</strong> Fill all details carefully. These details will appear on your official No-Dues Clearance Certificate and cannot be changed later.
      </div>

      <div className="card">
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Student Full Name *</label>
              <input className="form-input" name="studentName" value={form.studentName} onChange={h} placeholder="As per official records" required />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Number *</label>
              <input className="form-input" name="regNo" value={form.regNo} onChange={h} placeholder="University Reg. No." required style={{ fontFamily: 'var(--mono)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input className="form-input" name="rollNumber" value={form.rollNumber} onChange={h} placeholder="College roll number" required style={{ fontFamily: 'var(--mono)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Admission *</label>
              <input className="form-input" name="yearOfAdmission" value={form.yearOfAdmission} onChange={h} placeholder="e.g. 2021" required />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Leaving *</label>
              <input className="form-input" name="dateOfLeaving" type="date" value={form.dateOfLeaving} onChange={h} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input className="form-input" name="contactNumber" value={form.contactNumber} onChange={h} placeholder="Active mobile number" required />
            </div>
            <div className="form-group">
              <label className="form-label">Session (Course Duration) *</label>
              <select className="form-input" name="academicYear" value={form.academicYear} onChange={h} required>
                <option value="">Select session</option>
                {sessions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Residential Address *</label>
              <textarea className="form-input" name="residentialAddress" value={form.residentialAddress} onChange={h} rows={3} placeholder="Full permanent home address" required style={{ resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Terms and Conditions</div>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
              <li>All details provided will appear on the official certificate as-is.</li>
              <li>False information may lead to cancellation of clearance.</li>
              <li>The clearance process requires approval from all departments and the Principal.</li>
              <li>Certificate will only be issued after all approvals are complete.</li>
            </ul>
            <label className="checkbox-wrap" style={{ fontWeight: 600, fontSize: 14 }}>
              <input type="checkbox" checked={form.tcAccepted} onChange={e => setForm(f => ({ ...f, tcAccepted: e.target.checked }))} />
              <span>I have read and accept the Terms & Conditions. I confirm that all details entered are correct.</span>
            </label>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading || !form.tcAccepted} style={{ borderRadius: 12 }}>
            {loading ? <><span className="spinner" /> Submitting…</> : '🚀 Submit No-Dues Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Certificate Download ───────────────────────────────────────────────────────
export function Certificate() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(null);
  const [signForm, setSignForm] = useState({ signature: '', tcAccepted: false });
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/clearance/my').then(r => setRequests(r.data.filter(r => r.status === 'completed'))).finally(() => setLoading(false));
  }, []);

  const download = async (requestId) => {
    if (!signForm.signature) return toast.error('Please type your digital signature');
    if (!signForm.tcAccepted) return toast.error('Please accept Terms & Conditions');
    setDownloading(true);
    try {
      const res = await api.post(`/clearance/${requestId}/sign-download`, { signature: signForm.signature, tcAccepted: true }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `NoDues-Certificate-${user?.universityRegNo}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
      setSigning(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Download failed'); }
    finally { setDownloading(false); }
  };

  if (loading) return <div className="empty"><div className="spinner spinner-dark" /></div>;

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">My Certificates</div>
        <div className="page-sub">Download your approved clearance certificates</div>
      </div>

      {requests.length === 0 ? (
        <div className="empty card">
          <Award size={44} color="var(--light)" />
          <div style={{ fontWeight: 600, fontSize: 16 }}>No certificates yet</div>
          <div style={{ fontSize: 14 }}>Your certificate will appear here after all approvals are complete.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {requests.map(r => (
            <div key={r.id} style={{ background: 'linear-gradient(135deg, #1e3a8a, #1a56db)', borderRadius: 18, padding: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: -30, left: -10, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Award size={22} color="white" />
                </div>
                <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>No-Dues Certificate</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{r.academicYear}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Cert ID: {r.certificateId}</div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Approved: {new Date(r.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <button
                  onClick={() => setSigning(r.id)}
                  style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#1a56db', padding: '9px 18px', borderRadius: 99, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                  <Download size={14} /> Download Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {signing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="card fadeIn" style={{ width: '100%', maxWidth: 460 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Digital Signature Required</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
              Type your full name as a digital signature and accept T&C to download your certificate.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Digital Signature (type your full name)</label>
              <input className="form-input" value={signForm.signature} onChange={e => setSignForm(f => ({ ...f, signature: e.target.value }))} placeholder={user?.name} style={{ fontStyle: 'italic', fontSize: 16 }} />
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>This acts as your official digital signature on the certificate.</div>
            </div>
            <label className="checkbox-wrap" style={{ marginBottom: 20, fontSize: 13 }}>
              <input type="checkbox" checked={signForm.tcAccepted} onChange={e => setSignForm(f => ({ ...f, tcAccepted: e.target.checked }))} />
              <span>I confirm all details are correct and accept the Terms & Conditions. I understand this certificate is official.</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success" disabled={downloading || !signForm.signature || !signForm.tcAccepted} onClick={() => download(signing)}>
                {downloading ? <><span className="spinner" /> Generating…</> : <><Download size={15} /> Download PDF</>}
              </button>
              <button className="btn btn-ghost" onClick={() => setSigning(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
