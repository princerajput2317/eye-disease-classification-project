import React from 'react';

const STEPS = [
  { n: '01', icon: '📥', title: 'Download Dataset', desc: 'Get the Kaggle eye disease dataset (4 classes × ~1000 images). Extract to dataset/ folder.' },
  { n: '02', icon: '🔄', title: 'Run Augmentation', desc: 'Run python backend/augment.py — generates 5 variants per image = ~20,000 total images in augmented_dataset/.' },
  { n: '03', icon: '🧠', title: 'Train Model', desc: 'Open colab/ notebook in Google Colab with GPU. Upload zip → run cells → download eye_disease_model.h5.' },
  { n: '04', icon: '📁', title: 'Place Model', desc: 'Move eye_disease_model.h5 into backend/model/. The Flask API auto-loads it on startup.' },
  { n: '05', icon: '🚀', title: 'Start Backend', desc: 'cd backend && pip install -r requirements.txt && python app.py — API runs at localhost:5000.' },
  { n: '06', icon: '🌐', title: 'Start Web App', desc: 'cd frontend-web && npm install && npm start — opens at localhost:3000.' },
  { n: '07', icon: '🖥️', title: 'Desktop App', desc: 'cd frontend-desktop && npm install && npm start — opens as native desktop window.' },
];

const TECH = [
  { cat: 'ML / AI', items: ['TensorFlow 2.16', 'EfficientNetB0 (Transfer Learning)', 'Keras ImageDataGenerator', 'NumPy · Pillow · OpenCV'] },
  { cat: 'Backend', items: ['Flask 3.0 (Python)', 'Flask-CORS', 'SQLite (predictions DB)', 'threading (background retrain)'] },
  { cat: 'Frontend Web', items: ['React 18', 'React Router v6', 'Recharts (charts)', 'Axios (API calls)'] },
  { cat: 'Desktop', items: ['Electron.js', 'electron-builder (.exe)', 'Same React UI via localhost'] },
  { cat: 'Training', items: ['Google Colab (free GPU)', 'EfficientNetB0 pretrained on ImageNet', '2-phase training (freeze → fine-tune)', 'EarlyStopping · ReduceLROnPlateau'] },
];

const CLASSES = [
  { name: 'Normal', icon: '✅', color: '#10b981', desc: 'Healthy eye with no pathological features detected.' },
  { name: 'Cataract', icon: '🌫️', color: '#f59e0b', desc: 'Clouding of the natural lens. Most common in older adults. Surgically curable.' },
  { name: 'Glaucoma', icon: '🔴', color: '#ef4444', desc: 'Optic nerve damage due to elevated intraocular pressure. Progressive and irreversible.' },
  { name: 'Diabetic Retinopathy', icon: '⚠️', color: '#7c3aed', desc: 'Retinal vessel damage from chronic high blood glucose. Leading cause of blindness in working adults.' },
];

export default function AboutPage() {
  return (
    <div>
      <h1 className="page-title">About EyeAI</h1>
      <p className="page-sub">B.Tech CSE Project Exhibition 2 – Eye Disease Detection using Deep Learning</p>

      {/* Hero */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(0,200,255,0.08), rgba(124,58,237,0.08))', borderColor: 'rgba(0,200,255,0.25)' }}>
        <div style={{ maxWidth: '700px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>Project Overview</div>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.8, fontSize: '0.9rem' }}>
            EyeAI is a machine-learning system that classifies retinal eye images into four disease categories:
            <strong style={{ color: 'var(--text)' }}> Normal, Cataract, Glaucoma, and Diabetic Retinopathy</strong>.
            The system augments a Kaggle dataset (5× per image), trains an EfficientNetB3 CNN with transfer learning,
            and serves predictions through a REST API consumed by both a React web app and an Electron desktop app.
            New user images are stored and can trigger automatic model retraining.
          </p>
        </div>
      </div>

      {/* Disease classes */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔬 Disease Classes</h2>
        <div className="grid-4">
          {CLASSES.map(c => (
            <div key={c.name} className="card" style={{ borderColor: `${c.color}30` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: c.color, marginBottom: '0.4rem' }}>{c.name}</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Setup steps */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ Setup Steps</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {STEPS.map(s => (
            <div key={s.n} className="card" style={{ display: 'flex', gap: '1.25rem', padding: '1.1rem 1.5rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', background: 'rgba(0,200,255,0.1)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', whiteSpace: 'nowrap', marginTop: '2px' }}>{s.n}</div>
              <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.95rem' }}>{s.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🛠️ Technology Stack</h2>
        <div className="grid-3">
          {TECH.map(t => (
            <div key={t.cat} className="card">
              <div className="card-title">{t.cat}</div>
              {t.items.map(item => (
                <div key={item} style={{ fontSize: '0.82rem', color: 'var(--text-dim)', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent)' }}>›</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <div style={{ marginTop: '2rem' }}>
        <div className="card" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#90EE90', background: '#0d1428' }}>
          <div className="card-title" style={{ fontFamily: 'var(--font-main)' }}>🏗️ Pipeline Architecture</div>
          {[
            '  [Kaggle Dataset: 4000 images, 4 classes]',
            '             ↓',
            '  [augment.py  →  5 variants each  →  ~20,000 images]',
            '             ↓',
            '  [train.py / Colab Notebook]',
            '  [EfficientNetB0 + Custom Head]',
            '  [Phase 1: 10 epochs frozen base]',
            '  [Phase 2: 10 epochs fine-tune top-30]',
            '             ↓',
            '  [eye_disease_model.h5  saved to backend/model/]',
            '             ↓',
            '  [Flask API  ─  localhost:5000]',
            '       ↙              ↘',
            '  [React Web]    [Electron Desktop]',
            '  localhost:3000     desktop window',
            '       ↘              ↙',
            '  [User uploads eye image]',
            '             ↓',
            '  [Preprocess: resize 224×224, normalise /255]',
            '             ↓',
            '  [model.predict → softmax over 4 classes]',
            '             ↓',
            '  [Return label + confidence + all scores]',
            '             ↓',
            '  [Store in SQLite  →  optional retrain trigger]',
          ].map((line, i) => (
            <div key={i} style={{ lineHeight: 1.7, color: line.includes('[') ? '#90EE90' : '#aaa' }}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
