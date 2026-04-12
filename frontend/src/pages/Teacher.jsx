import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Clock, Search } from 'lucide-react';

export default function TeacherDashboard() {
  const [data, setData] = useState({ clearances: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [processing, setProcessing] = useState(null);

  const load = (p = page) => {
    setLoading(true);
    api.get(`/clearance/teacher-requests?page=${p}&limit=10`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const update = async (id, status) => {
    setProcessing(id);
    try {
      const res = await api.patch(`/clearance/dept/${id}`, { status, remarks: remarks[id] || '' });
      toast.success(`${status === 'approved' ? '✅ Approved' : '❌ Rejected'} — student notified by email`);
      if (res.data.allApproved) toast.success('🎉 All departments cleared! Request sent to Principal.');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(null); }
  };

  const filtered = data.clearances.filter(c => filter === 'all' || c.status === filter);
  const counts = { all: data.clearances.length, pending: data.clearances.filter(c => c.status === 'pending').length, approved: data.clearances.filter(c => c.status === 'approved').length, rejected: data.clearances.filter(c => c.status === 'rejected').length };

  return (
    <div className="fadeIn">
      <div style={{ marginBottom: 22 }}>
        <div className="page-title">Student Clearance Requests</div>
        <div className="page-sub">Review and approve department-wise clearances</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-teal' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty"><div className="spinner spinner-dark" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty card"><CheckCircle2 size={36} color="var(--success)" /><div style={{ fontWeight: 600 }}>No {filter} requests</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => {
            const student = c.clearanceRequest?.student;
            const isOpen = expanded === c.id;
            return (
              <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Card header */}
                <div style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => setExpanded(isOpen ? null : c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #5b21b6, #1a56db)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>
                      {student?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{student?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{student?.universityRegNo} · {student?.course} · <strong style={{ color: '#0f6e56' }}>{c.department?.name}</strong></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge badge-${c.status}`}>{c.status}</span>
                    {isOpen ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px', background: 'var(--bg)' }}>
                    {/* Student details grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                      {[
                        ['Roll No.', c.clearanceRequest?.rollNumber],
                        ['Year of Admission', c.clearanceRequest?.yearOfAdmission],
                        ['Date of Leaving', c.clearanceRequest?.dateOfLeaving],
                        ['Academic Year', c.clearanceRequest?.academicYear],
                        ['Contact', c.clearanceRequest?.contactNumber],
                        ['Department', c.department?.name],
                      ].map(([k,v]) => (
                        <div key={k} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{v || '—'}</div>
                        </div>
                      ))}
                    </div>

                    {c.clearanceRequest?.residentialAddress && (
                      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Residential Address</div>
                        <div style={{ fontSize: 13 }}>{c.clearanceRequest.residentialAddress}</div>
                      </div>
                    )}

                    {c.status === 'pending' && (
                      <>
                        <div className="form-group" style={{ marginBottom: 14 }}>
                          <label className="form-label">Remarks (optional)</label>
                          <textarea className="form-input" rows={2} placeholder="Add remarks for student..." value={remarks[c.id] || ''} onChange={e => setRemarks(r => ({ ...r, [c.id]: e.target.value }))} style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-success" disabled={processing === c.id} onClick={() => update(c.id, 'approved')}>
                            {processing === c.id ? <span className="spinner" /> : <CheckCircle2 size={15} />} Approve — Auto Sign
                          </button>
                          <button className="btn btn-danger" disabled={processing === c.id} onClick={() => update(c.id, 'rejected')}>
                            {processing === c.id ? <span className="spinner" /> : <XCircle size={15} />} Reject
                          </button>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                          ✦ Your digital signature will be automatically stamped on approval
                        </div>
                      </>
                    )}

                    {c.status !== 'pending' && (
                      <div>
                        {c.teacherSignature && (
                          <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px' }}>
                            <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Digital Signature</div>
                            <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: '#166534' }}>{c.teacherSignature}</div>
                          </div>
                        )}
                        {c.remarks && (
                          <div style={{ marginTop: 10, background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Remarks</div>
                            <div style={{ fontSize: 13 }}>{c.remarks}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          {Array.from({ length: data.pages }, (_, i) => i+1).map(p => (
            <button key={p} className={`btn btn-sm ${page === p ? 'btn-teal' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
