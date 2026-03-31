import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import DetectPage from './pages/DetectPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import './App.css';

export const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001';

export default function App() {
  const [demoMode, setDemoMode] = useState(false);
  const location = useLocation();

  return (
    <div className="app">
      {/* ── Animated background ── */}
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* ── Navigation ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="eye-icon">👁</span>
          <span className="brand-text">EyeAI</span>
          <span className="brand-sub">Disease Detector</span>
        </div>
        <div className="navbar-links">
          {[
            { to: '/',        label: 'Detect',  icon: '🔬' },
            { to: '/history', label: 'History', icon: '📋' },
            { to: '/admin',   label: 'Admin',   icon: '⚙️'  },
            { to: '/about',   label: 'About',   icon: 'ℹ️'  },
          ].map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            } end={to === '/'}>
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
        {demoMode && (
          <div className="demo-badge">⚡ Demo Mode (no model)</div>
        )}
      </nav>

      {/* ── Pages ── */}
      <main className="main-content">
        <Routes>
          <Route path="/"        element={<DetectPage  onDemoMode={setDemoMode} />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/admin"   element={<AdminPage />} />
          <Route path="/about"   element={<AboutPage />} />
        </Routes>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <span>EyeAI © 2024  ·  B.Tech CSE Project  ·  TensorFlow + Flask + React</span>
      </footer>
    </div>
  );
}
