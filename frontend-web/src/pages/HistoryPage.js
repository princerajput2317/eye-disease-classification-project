import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../App';

const LABEL_CLASS = {
  Normal:                'label-Normal',
  Cataract:              'label-Cataract',
  Glaucoma:              'label-Glaucoma',
  'Diabetic Retinopathy':'label-Diabetic',
};

export default function HistoryPage() {
  const [records,  setRecords]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [page,     setPage]     = useState(0);
  const LIMIT = 20;

  const fetch = async (p = 0) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/history?limit=${LIMIT}&offset=${p * LIMIT}`);
     setRecords(data.records || []);
     setTotal(data.total || 0);
      setPage(p);
    } catch {
      setError('Failed to load history. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(0); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await axios.delete(`${API_BASE}/history/${id}`);
      setRecords(r => r.filter(x => x.id !== id));
      setTotal(t => t - 1);
      if (selected?.id === id) setSelected(null);
    } catch { alert('Delete failed.'); }
  };

  const formatDate = (ts) => ts ? new Date(ts).toLocaleString() : '—';

  const confColor = (c) => c >= 80 ? '#10b981' : c >= 55 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <h1 className="page-title">Prediction History</h1>
      <p className="page-sub">{total} total predictions stored in database</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem' }}>
        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No predictions yet. Go to Detect page and upload an eye image.</p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Diagnosis</th>
                    <th>Confidence</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} style={{ cursor: 'pointer', background: selected?.id === r.id ? 'rgba(0,200,255,0.05)' : '' }}
                      onClick={() => setSelected(selected?.id === r.id ? null : r)}>
                      <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>#{r.id}</td>
                      <td>
                        {r.image_b64
                          ? <img src={`data:image/jpeg;base64,${r.image_b64}`} alt="" className="thumb" />
                          : <div className="thumb" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👁</div>
                        }
                      </td>
                      <td>
                        <span className={`label-badge ${LABEL_CLASS[r.label] || 'label-Normal'}`}>
                          {r.label}
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ color: confColor(r.confidence), fontWeight: 600 }}>
                          {r.confidence}%
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatDate(r.timestamp)}</td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={e => { e.stopPropagation(); del(r.id); }}>
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Page {page + 1} of {Math.ceil(total / LIMIT)}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                    onClick={() => fetch(page - 1)} disabled={page === 0}>← Prev</button>
                  <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                    onClick={() => fetch(page + 1)} disabled={(page + 1) * LIMIT >= total}>Next →</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>📊 Detail</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
            </div>

            {selected.image_b64 && (
              <img src={`data:image/jpeg;base64,${selected.image_b64}`} alt="eye"
                style={{ width: '100%', borderRadius: 'var(--radius)', objectFit: 'cover', marginBottom: '1rem', maxHeight: '200px' }} />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                ['ID',          `#${selected.id}`],
                ['Diagnosis',   selected.label],
                ['Confidence',  `${selected.confidence}%`],
                ['File',        selected.filename],
                ['Date',        formatDate(selected.timestamp)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500, textAlign: 'right', maxWidth: '180px', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Score breakdown */}
            {selected.all_scores && Object.keys(selected.all_scores).length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Score Breakdown</div>
                {Object.entries(selected.all_scores).sort((a, b) => b[1] - a[1]).map(([cls, s]) => (
                  <div key={cls} style={{ marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{cls}</span>
                      <span className="mono" style={{ color: 'var(--accent)' }}>{s}%</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${s}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
