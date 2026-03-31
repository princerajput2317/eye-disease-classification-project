import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { API_BASE } from '../App';

const COLORS = { Normal: '#10b981', Cataract: '#f59e0b', Glaucoma: '#ef4444', 'Diabetic Retinopathy': '#7c3aed' };

export default function AdminPage() {
  const [stats,       setStats]       = useState(null);
  const [health,      setHealth]      = useState(null);
  const [retrain,     setRetrain]     = useState(null);
  const [retrainLog,  setRetrainLog]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, h, rl] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/health`),
        axios.get(`${API_BASE}/retrain/status`),
      ]);
      setStats(s.data);
      setHealth(h.data);
      setRetrainLog(rl.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const triggerRetrain = async () => {
    if (!window.confirm('Start retraining the model? This may take 10–60 minutes on CPU.')) return;
    try {
      const { data } = await axios.post(`${API_BASE}/retrain`);
      setRetrain(data.message);
      setTimeout(load, 3000);
    } catch (e) {
      setRetrain('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  const pieData = stats ? Object.entries(stats.distribution).map(([name, value]) => ({ name, value })) : [];
  const barData = stats ? Object.entries(stats.distribution).map(([name, value]) => ({ name: name.replace('Diabetic Retinopathy', 'Diabetic'), value })) : [];

  const StatCard = ({ icon, label, value, color }) => (
    <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Monitor predictions, dataset stats and trigger model retraining</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading stats…</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <StatCard icon="📊" label="Total Predictions" value={stats?.total_predictions ?? 0} />
            <StatCard icon="🎯" label="Avg Confidence" value={`${stats?.average_confidence ?? 0}%`} color="#f59e0b" />
            <StatCard icon="🧠" label="Model Status" value={health?.model_loaded ? 'Loaded' : 'Not Loaded'} color={health?.model_loaded ? '#10b981' : '#ef4444'} />
            <StatCard icon="⚡" label="Mode" value={health?.demo_mode ? 'Demo' : 'Live'} color={health?.demo_mode ? '#f59e0b' : '#10b981'} />
          </div>

          {/* Charts */}
          {pieData.length > 0 && (
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              <div className="card">
                <div className="card-title">🥧 Disease Distribution</div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Count']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <div className="card-title">📊 Count by Class</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name] || 'var(--accent)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* System info */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <div className="card-title">🖥️ System Info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {health && Object.entries({
                  Status:          health.status,
                  'TF Available':  health.tf_available ? 'Yes' : 'No',
                  'Model Loaded':  health.model_loaded ? 'Yes' : 'No',
                  'Demo Mode':     health.demo_mode ? 'Yes (no model)' : 'No',
                  'API URL':       API_BASE,
                  Timestamp:       new Date(health.timestamp).toLocaleString(),
                }).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Retrain */}
            <div className="card">
              <div className="card-title">🔁 Model Retraining</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Trigger the model to retrain using all images currently in the database. 
                This runs <code style={{ color: 'var(--accent)', background: 'rgba(0,200,255,0.08)', padding: '1px 6px', borderRadius: '4px' }}>train.py</code> in the background.
                CPU training takes ~30–60 min. Use Google Colab for GPU speed.
              </p>
              <button className="btn btn-primary" onClick={triggerRetrain} style={{ marginBottom: '1rem', width: '100%' }}>
                🚀 Start Retraining
              </button>
              {retrain && <div className="alert alert-info">{retrain}</div>}

              {/* Retrain log */}
              {retrainLog.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Recent Retrain Log</div>
                  {retrainLog.map(log => (
                    <div key={log.id} style={{ fontSize: '0.78rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ color: log.status === 'success' ? '#10b981' : log.status === 'started' ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                        {log.status.toUpperCase()}
                      </span>
                      <span style={{ color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</span>
                      <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
