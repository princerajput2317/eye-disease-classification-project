import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../App';

const DISEASE_INFO = {
  Normal: {
    icon: '✅', color: '#10b981',
    desc: 'No eye disease detected. Your eye appears healthy. Continue regular eye check-ups.',
    tips: ['Schedule annual eye exams', 'Wear UV-protective sunglasses', 'Eat a diet rich in leafy greens and omega-3'],
  },
  Cataract: {
    icon: '🌫️', color: '#f59e0b',
    desc: 'Cataract detected – clouding of the eye lens causing blurry vision. Treatable with surgery.',
    tips: ['Consult an ophthalmologist immediately', 'Surgery is highly effective and quick', 'Wear prescription glasses in the meantime'],
  },
  Glaucoma: {
    icon: '🔴', color: '#ef4444',
    desc: 'Glaucoma detected – increased eye pressure damaging the optic nerve. Requires prompt treatment.',
    tips: ['See a doctor urgently – vision loss can be irreversible', 'Eye drops or surgery can slow progression', 'Regular pressure monitoring required'],
  },
  'Diabetic Retinopathy': {
    icon: '⚠️', color: '#7c3aed',
    desc: 'Diabetic Retinopathy detected – damage to retinal blood vessels due to high blood sugar.',
    tips: ['Control blood sugar levels strictly', 'Anti-VEGF injections or laser treatment available', 'Monitor vision changes daily'],
  },
};

// ── Popup component ──────────────────────────────────────────────────────────
function Popup({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-card, #0d1428)', border: '1px solid #ef4444',
        borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '100%',
        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.75rem' }}>
          Not an Eye Image
        </div>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {message}
        </p>
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#fca5a5'
        }}>
          Please upload a <strong>retinal / fundus eye photograph</strong> — the kind taken by an eye doctor's camera.
        </div>
        <button onClick={onClose} style={{
          background: 'linear-gradient(135deg, #00c8ff, #0090cc)', color: '#000',
          border: 'none', borderRadius: '10px', padding: '0.65rem 2rem',
          fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', width: '100%'
        }}>
          Upload a Different Image
        </button>
      </div>
    </div>
  );
}

export default function DetectPage({ onDemoMode }) {
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);
  const [popup,       setPopup]       = useState(null);
  const [apiStatus,   setApiStatus]   = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/health`)
      .then(r => { setApiStatus(r.data); onDemoMode(r.data.demo_mode); })
      .catch(() => setApiStatus(null));
  }, [onDemoMode]);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setPopup('The file you uploaded is not an image. Please upload a JPG or PNG retinal eye image.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const predict = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await axios.post(`${API_BASE}/predict`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
      });
      setResult(data);
      if (data.demo_mode) onDemoMode(true);
    } catch (e) {
      const resp = e.response?.data;
      if (resp?.popup || resp?.not_eye) {
        // Show popup for non-eye images
        setPopup(resp.error || 'This does not appear to be a retinal eye image.');
        setResult(null);
      } else {
        setError(resp?.error || 'Connection failed. Is the backend running on port 5000?');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null); };

  const info = result ? (DISEASE_INFO[result.label] || DISEASE_INFO['Normal']) : null;

  return (
    <div>
      {/* Non-eye image popup */}
      <Popup message={popup} onClose={() => { setPopup(null); reset(); }} />

      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Eye Disease Detection</h1>
        <p className="page-sub">Upload a retinal fundus image to detect eye diseases using AI</p>
      </div>

      {/* API status bar */}
      {apiStatus && (
        <div className={`alert ${apiStatus.demo_mode ? 'alert-info' : 'alert-success'}`} style={{ marginBottom: '1.5rem' }}>
          {apiStatus.demo_mode
            ? '⚡ Demo Mode: No trained model found. Train the model first (Step 5 in the setup guide). Predictions are random.'
            : '✅ Model loaded and ready for prediction.'}
        </div>
      )}
      {!apiStatus && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          ⚠️ Backend offline at {API_BASE}. Run: <code>cd backend && python app.py</code>
        </div>
      )}

      <div className="grid-2">
        {/* Upload panel */}
        <div className="card">
          <div className="card-title">📁 Upload Eye Image</div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !preview && document.getElementById('fi').click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: preview ? '0' : '3rem 1rem',
              textAlign: 'center',
              cursor: preview ? 'default' : 'pointer',
              transition: 'all 0.2s',
              background: dragOver ? 'rgba(0,200,255,0.06)' : 'rgba(255,255,255,0.02)',
              marginBottom: '1.25rem',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '220px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {preview ? (
              <>
                <img src={preview} alt="preview" style={{ width:'100%', maxHeight:'300px', objectFit:'contain', display:'block', borderRadius:'var(--radius-lg)' }} />
                <button onClick={e => { e.stopPropagation(); reset(); }} style={{ position:'absolute', top:'0.5rem', right:'0.5rem', background:'rgba(0,0,0,0.7)', border:'1px solid var(--border)', borderRadius:'50%', width:'28px', height:'28px', color:'#fff', cursor:'pointer', fontSize:'0.9rem' }}>×</button>
              </>
            ) : (
              <div>
                <div style={{ fontSize:'3rem', marginBottom:'0.75rem', opacity:0.4 }}>👁️</div>
                <div style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Drag & drop a retinal eye image</div>
                <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginTop:'0.4rem' }}>or click to browse</div>
                <div style={{ color:'var(--text-muted)', fontSize:'0.7rem', marginTop:'0.6rem', opacity:0.6 }}>JPG, PNG — must be a retinal/fundus photograph</div>
              </div>
            )}
          </div>

          <input id="fi" type="file" accept="image/*" style={{ display:'none' }}
            onChange={e => handleFile(e.target.files[0])} />

          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <button className="btn btn-secondary" onClick={() => document.getElementById('fi').click()}>
              📂 Browse File
            </button>
            <button className="btn btn-primary" onClick={predict} disabled={!file || loading} style={{ flex:1 }}>
              {loading ? <><div className="spinner" style={{ borderTopColor:'#000' }} /> Analysing…</> : '🔬 Detect Disease'}
            </button>
          </div>

          {error && <div className="alert alert-error" style={{ marginTop:'1rem' }}>{error}</div>}

          {/* Guidance note */}
          <div style={{ marginTop:'1rem', padding:'0.75rem', background:'rgba(0,200,255,0.04)', border:'1px solid rgba(0,200,255,0.12)', borderRadius:'10px' }}>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--accent)' }}>What to upload:</strong> Retinal/fundus photographs (the circular eye images taken by an ophthalmologist's camera). Not regular selfies or eye photos.
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div className="card">
          <div className="card-title">🧪 Analysis Result</div>

          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🔬</div>
              <p>Upload a retinal image and click<br /><strong>Detect Disease</strong></p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <div className="spinner" style={{ width:'40px', height:'40px', margin:'0 auto 1rem' }} />
              <p style={{ color:'var(--text-muted)' }}>Running {apiStatus?.demo_mode ? 'demo' : 'TTA (8×)'} analysis…<br />
                <small style={{ opacity:0.6 }}>{apiStatus?.demo_mode ? 'Demo mode' : 'Averaging 8 augmented passes for accuracy'}</small>
              </p>
            </div>
          )}

          {result && info && (
            <div>
              {/* Low confidence warning */}
              {result.low_confidence_warning && (
                <div className="alert" style={{ background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.35)', color:'#fbbf24', marginBottom:'1rem', fontSize:'0.82rem' }}>
                  ⚠️ {result.low_confidence_warning}
                </div>
              )}

              {/* Diagnosis */}
              <div style={{ background:`${info.color}18`, border:`1px solid ${info.color}40`, borderRadius:'var(--radius-lg)', padding:'1.25rem', marginBottom:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
                  <span style={{ fontSize:'2.5rem' }}>{info.icon}</span>
                  <div>
                    <div style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:'2px' }}>Diagnosis</div>
                    <div style={{ fontSize:'1.5rem', fontWeight:700, color:info.color }}>{result.label}</div>
                  </div>
                  <div style={{ marginLeft:'auto', textAlign:'right' }}>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Confidence</div>
                    <div style={{ fontSize:'1.75rem', fontWeight:700, color:info.color }}>{result.confidence}%</div>
                  </div>
                </div>
                <p style={{ fontSize:'0.85rem', color:'var(--text-dim)', lineHeight:1.6 }}>{info.desc}</p>
              </div>

              {/* Score bars */}
              <div style={{ marginBottom:'1.25rem' }}>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'0.6rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>All Class Scores (TTA avg)</div>
                {Object.entries(result.all_scores || {}).sort((a,b) => b[1]-a[1]).map(([cls, score]) => {
                  const d = DISEASE_INFO[cls] || { color:'var(--accent)' };
                  return (
                    <div key={cls} style={{ marginBottom:'0.5rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:'3px' }}>
                        <span style={{ color: cls === result.label ? d.color : 'var(--text-dim)' }}>{cls}</span>
                        <span className="mono" style={{ color:d.color, fontWeight: cls === result.label ? 700 : 400 }}>{score}%</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width:`${score}%`, background:d.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Eye quality score */}
              {result.eye_score > 0 && (
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'1rem' }}>
                  Eye image quality score: <span style={{ color:'var(--accent)' }}>{result.eye_score}%</span>
                </div>
              )}

              {/* Tips */}
              <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'var(--radius)', padding:'1rem', marginBottom:'1rem' }}>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>💡 Recommendations</div>
                {info.tips.map((t,i) => (
                  <div key={i} style={{ fontSize:'0.82rem', color:'var(--text-dim)', marginBottom:'0.3rem', display:'flex', gap:'0.5rem' }}>
                    <span style={{ color:info.color }}>›</span> {t}
                  </div>
                ))}
              </div>

              {result.demo_mode && (
                <div className="alert alert-info" style={{ fontSize:'0.75rem' }}>
                  ⚡ Demo prediction (random). Train the model (see setup guide Step 5) for real results.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disease info cards */}
      <div className="grid-4" style={{ marginTop:'2rem' }}>
        {Object.entries(DISEASE_INFO).map(([label, d]) => (
          <div key={label} className="card" style={{ padding:'1.25rem' }}>
            <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>{d.icon}</div>
            <div style={{ fontWeight:600, color:d.color, marginBottom:'0.4rem', fontSize:'0.9rem' }}>{label}</div>
            <div style={{ fontSize:'0.77rem', color:'var(--text-muted)', lineHeight:1.5 }}>{d.desc.slice(0,80)}…</div>
          </div>
        ))}
      </div>
    </div>
  );
}
