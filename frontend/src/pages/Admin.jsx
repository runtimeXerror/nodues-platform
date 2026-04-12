import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, FileText, CheckCircle2, Clock, Building2, UserCheck, AlertCircle, Trash2, Search, Plus, Download, ChevronDown, ChevronUp, X } from 'lucide-react';

// ── Admin Dashboard ────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)); }, []);

  const cards = stats ? [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: '#5b21b6', bg: '#ede9fe' },
    { label: 'Active Teachers', value: stats.totalTeachers, icon: UserCheck, color: '#0f6e56', bg: '#ccfbf1' },
    { label: 'Pending Teachers', value: stats.pendingTeachers, icon: Clock, color: '#92400e', bg: '#fef9c3' },
    { label: 'Total Requests', value: stats.totalRequests, icon: FileText, color: '#1a56db', bg: '#dbeafe' },
    { label: 'Completed', value: stats.completedRequests, icon: CheckCircle2, color: '#15803d', bg: '#dcfce7' },
    { label: 'Allowed Students', value: stats.allowedStudents, icon: Users, color: '#9a3412', bg: '#ffedd5' },
  ] : [];

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">Admin Dashboard</div>
        <div className="page-sub">System overview and management</div>
      </div>
      <div className="stat-grid">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={20} color={color} /></div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value ?? '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
      {stats?.pendingTeachers > 0 && (
        <div className="alert alert-warning" style={{ marginTop: 20 }}>
          <AlertCircle size={16} />
          <span><strong>{stats.pendingTeachers} teacher(s)</strong> waiting for approval. <a href="/admin/teachers" style={{ color: 'var(--warning)', fontWeight: 700 }}>Review now →</a></span>
        </div>
      )}
    </div>
  );
}

// ── Teacher Requests ───────────────────────────────────────────────────────────
export function TeacherRequests() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState('');

  const load = () => api.get('/admin/pending-teachers').then(r => setTeachers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const approve = async id => {
    try { await api.post(`/admin/approve-teacher/${id}`); toast.success('Teacher approved! Credentials sent by email.'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const reject = async () => {
    try { await api.post(`/admin/reject-teacher/${rejectId}`, { reason }); toast.success('Teacher rejected'); setRejectId(null); setReason(''); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="empty"><div className="spinner spinner-dark" /></div>;

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">Teacher Join Requests</div>
        <div className="page-sub">{teachers.length} pending request(s)</div>
      </div>

      {teachers.length === 0 ? (
        <div className="empty card"><CheckCircle2 size={36} color="var(--success)" /><div style={{ fontWeight: 600 }}>All caught up! No pending requests.</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {teachers.map(t => {
            let depts = [];
            try { depts = JSON.parse(t.departments || '[]'); } catch {}
            return (
              <div key={t.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f6e56', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{t.email}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{t.designation}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        {depts.map(d => <span key={d} style={{ background: '#dbeafe', color: '#1a56db', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Dept #{d}</span>)}
                      </div>
                      <div style={{ color: 'var(--light)', fontSize: 11, marginTop: 6 }}>Requested: {new Date(t.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success btn-sm" onClick={() => approve(t.id)}>✓ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setRejectId(t.id)}>✗ Reject</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="card fadeIn" style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Reject Teacher</div>
              <button onClick={() => setRejectId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={18} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Reason (will be emailed to teacher)</label>
              <textarea className="form-input" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter rejection reason..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" onClick={reject}>Reject & Notify</button>
              <button className="btn btn-ghost" onClick={() => setRejectId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Student Database ───────────────────────────────────────────────────────────
export function StudentDatabase() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ universityRegNo: '', email: '', name: '', course: '', department: '', year: '' });
  const [adding, setAdding] = useState(false);

  const load = () => api.get('/admin/allowed-students').then(r => setStudents(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const add = async e => {
    e.preventDefault(); setAdding(true);
    try { await api.post('/admin/allowed-students', form); toast.success('Student added!'); setForm({ universityRegNo: '', email: '', name: '', course: '', department: '', year: '' }); setShowAdd(false); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAdding(false); }
  };

  const remove = async id => {
    if (!confirm('Remove this student?')) return;
    await api.delete(`/admin/allowed-students/${id}`); toast.success('Removed'); load();
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.universityRegNo?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Student Database</div>
          <div className="page-sub">Pre-approved students who can register</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(s => !s)}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      {showAdd && (
        <div className="card fadeIn" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Add New Student</div>
          <form onSubmit={add}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
              {[['universityRegNo','University Reg. No.','23XXXXXXXX'],['email','College Email','student@college.ac.in'],['name','Full Name','Student Name'],['course','Course','B.Tech CSE'],['department','Department','Computer Science'],['year','Year','3rd']].map(([k,l,p]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} required={['universityRegNo','email','name'].includes(k)} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={adding}>{adding ? <><span className="spinner" /> Adding…</> : 'Add Student'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--light)' }} />
          <input className="form-input" style={{ paddingLeft: 34 }} placeholder="Search by name, reg no., email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Reg. No.</th><th>Email</th><th>Course</th><th>Year</th><th>Registered</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></td></tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{s.universityRegNo}</td>
                <td style={{ color: 'var(--muted)' }}>{s.email}</td>
                <td>{s.course || '—'}</td>
                <td>{s.year || '—'}</td>
                <td>{s.isRegistered ? <span className="badge badge-approved">Yes</span> : <span className="badge badge-pending">No</span>}</td>
                <td>
                  <button className="btn btn-danger btn-sm" style={{ gap: 4 }} onClick={() => remove(s.id)} disabled={s.isRegistered}>
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <div className="empty" style={{ padding: 40 }}>No students found</div>}
      </div>
    </div>
  );
}

// ── Admin Departments ──────────────────────────────────────────────────────────
export function AdminDepartments() {
  const [depts, setDepts] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = () => api.get('/admin/departments').then(r => setDepts(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const add = async e => {
    e.preventDefault(); setAdding(true);
    try { await api.post('/admin/departments', form); toast.success('Department added!'); setForm({ name: '', code: '', description: '' }); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAdding(false); }
  };

  const del = async id => {
    if (!confirm('Delete department?')) return;
    await api.delete(`/admin/departments/${id}`); toast.success('Deleted'); load();
  };

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 22 }}>
        <div className="page-title">Clearance Departments</div>
        <div className="page-sub">Manage departments required for no-dues clearance</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Add Department</div>
        <form onSubmit={add}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group"><label className="form-label">Department Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Library" required /></div>
            <div className="form-group"><label className="form-label">Code</label><input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="LIB" required /></div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" /></div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={adding}>{adding ? <><span className="spinner" /> Adding…</> : <><Plus size={15} /> Add Department</>}</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {depts.map(d => (
          <div key={d.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={18} color="#1a56db" />
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#1a56db', background: '#dbeafe', padding: '1px 7px', borderRadius: 5, display: 'inline-block', marginTop: 3 }}>{d.code}</div>
                {d.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>{d.description}</div>}
              </div>
            </div>
            <button onClick={() => del(d.id)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', flexShrink: 0 }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── All Requests (Admin) ───────────────────────────────────────────────────────
export function AdminAllRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/admin/requests').then(r => setRequests(r.data)).finally(() => setLoading(false)); }, []);

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 22 }}>
        <div className="page-title">All Clearance Requests</div>
        <div className="page-sub">{requests.length} total requests</div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Student</th><th>Reg. No.</th><th>Academic Year</th><th>Status</th><th>Applied</th><th>Depts</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></td></tr>
            : requests.map(r => {
              const approved = r.deptClearances?.filter(d => d.status === 'approved').length || 0;
              const total = r.deptClearances?.length || 0;
              return (
                <tr key={r.id}>
                  <td><div style={{ fontWeight: 600 }}>{r.student?.name}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.student?.email}</div></td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{r.student?.universityRegNo}</td>
                  <td>{r.academicYear}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ height: 6, width: 80, background: 'var(--border)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${total ? (approved/total)*100 : 0}%`, background: 'var(--success)', borderRadius: 3, transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{approved}/{total}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && requests.length === 0 && <div className="empty" style={{ padding: 40 }}>No requests yet</div>}
      </div>
    </div>
  );
}
