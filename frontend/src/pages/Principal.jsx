import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Award, AlertCircle, X } from 'lucide-react';

// ── Principal Dashboard ───────────────────────────────────────────────────────
export function PrincipalDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [processing, setProcessing] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);

  const load = () => api.get('/clearance/principal-pending').then(r => setRequests(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const approve = async id => {
    setProcessing(id);
    try {
      await api.post(`/clearance/principal-approve/${id}`, { remarks: remarks[id] || '' });
      toast.success('✅ Approved! Student notified by email. Certificate unlocked.');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(null); }
  };

  const reject = async (id, reason) => {
    try {
      await api.post(`/clearance/principal-reject/${id}`, { remarks: reason });
      toast.success('Request rejected. Student notified.');
      setRejectModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="empty"><div className="spinner spinner-dark" /></div>;

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 22 }}>
        <div className="page-title">Final Approval — Principal</div>
        <div className="page-sub">{requests.length} clearance(s) pending your approval</div>
      </div>

      {requests.length === 0 ? (
        <div className="empty card"><Award size={40} color="var(--success)" /><div style={{ fontWeight: 600 }}>No pending approvals. All caught up!</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {requests.map(r => {
            const student = r.student;
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => setExpanded(isOpen ? null : r.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #5b21b6, #1a56db)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                      {student?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{student?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{student?.universityRegNo} · {student?.course} · {student?.department}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="badge badge-approved">All Depts Cleared</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '18px 20px', background: 'var(--bg)' }}>
                    {/* Student clearance details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 18 }}>
                      {[
                        ['Student Name', r.studentName],
                        ['Registration No.', r.regNo],
                        ['Roll Number', r.rollNumber],
                        ['Year of Admission', r.yearOfAdmission],
                        ['Date of Leaving', r.dateOfLeaving],
                        ['Academic Year', r.academicYear],
                        ['Contact', r.contactNumber],
                      ].map(([k,v]) => (
                        <div key={k} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{v || '—'}</div>
                        </div>
                      ))}
                    </div>

                    {r.residentialAddress && (
                      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Residential Address</div>
                        <div style={{ fontSize: 13 }}>{r.residentialAddress}</div>
                      </div>
                    )}

                    {/* Department signatures */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Department Clearances & Digital Signatures</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {r.deptClearances?.map(d => (
                          <div key={d.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px' }}>
                            <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{d.department?.name}</div>
                              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: '#166534', marginTop: 3 }}>{d.teacherSignature}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Remarks + actions */}
                    <div className="form-group" style={{ marginBottom: 14 }}>
                      <label className="form-label">Principal Remarks (optional, appears on certificate)</label>
                      <textarea className="form-input" rows={2} placeholder="Add final remarks..." value={remarks[r.id] || ''} onChange={e => setRemarks(rm => ({ ...rm, [r.id]: e.target.value }))} style={{ resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-success" disabled={processing === r.id} onClick={() => approve(r.id)}>
                        {processing === r.id ? <span className="spinner" /> : <CheckCircle2 size={15} />}
                        Final Approve — Sign + Seal
                      </button>
                      <button className="btn btn-danger" onClick={() => setRejectModal(r.id)}>
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                      ✦ Approving will auto-stamp your digital signature + college seal on the certificate
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <RejectModal onClose={() => setRejectModal(null)} onReject={reason => reject(rejectModal, reason)} />
      )}
    </div>
  );
}

function RejectModal({ onClose, onReject }) {
  const [reason, setReason] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div className="card fadeIn" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Reject Request</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={18} /></button>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Reason (will be emailed to student)</label>
          <textarea className="form-input" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter rejection reason..." style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-danger" onClick={() => onReject(reason)}>Reject & Notify Student</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Complaint Page (public) ───────────────────────────────────────────────────
export function ComplaintPage() {
  const [form, setForm] = useState({ studentName: '', regNo: '', email: '', issue: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/clearance/complaint', form);
      setSuccess(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 }}>
      <div className="fadeIn" style={{ width: '100%', maxWidth: 480 }}>
        <h2 style={{ color: 'white', fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>Data Correction Complaint</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>If your registration details are incorrect, submit a complaint for review.</p>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={44} color="#6ee7b7" style={{ margin: '0 auto 14px', display: 'block' }} />
              <h3 style={{ color: 'white' }}>Complaint Submitted!</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>The Principal's assistant will review and contact you.</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['studentName','Full Name','Your full name'],['regNo','Registration No.','University reg. number'],['email','Email Address','your@college.ac.in']].map(([k,l,p]) => (
                <div key={k} className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</label>
                  <input className="form-input form-input-dark" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} required />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Issue Description</label>
                <textarea className="form-input form-input-dark" rows={4} value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} placeholder="Describe the data issue..." required style={{ resize: 'vertical' }} />
              </div>
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ borderRadius: 12 }}>
                {loading ? <><span className="spinner" /> Submitting…</> : 'Submit Complaint'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
