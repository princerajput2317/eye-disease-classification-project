# 👁️ EyeAI – Eye Disease Detection System

**B.Tech CSE Project** · Web App + Desktop App · TensorFlow + Flask + React + Electron

---

## 🏥 Disease Classes
| Class | Description |
|-------|-------------|
| ✅ Normal | Healthy eye |
| 🌫️ Cataract | Lens clouding – surgically curable |
| 🔴 Glaucoma | Optic nerve damage – requires urgent care |
| ⚠️ Diabetic Retinopathy | Retinal vessel damage from diabetes |

---

## 📁 Project Structure

```
eye-disease-project/
├── backend/
│   ├── app.py              ← Flask REST API
│   ├── train.py            ← CNN training script
│   ├── augment.py          ← Dataset augmentation (5× per image)
│   ├── requirements.txt    ← Python dependencies
│   ├── model/              ← Place eye_disease_model.h5 here
│   └── uploads/            ← User uploaded images (auto-created)
├── frontend-web/           ← React web application
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── DetectPage.js
│   │   │   ├── HistoryPage.js
│   │   │   ├── AdminPage.js
│   │   │   └── AboutPage.js
│   │   └── App.css
│   └── package.json
├── frontend-desktop/       ← Electron desktop application
│   ├── main.js             ← Electron main process
│   ├── index.html          ← Self-contained desktop UI
│   └── package.json
├── colab/
│   └── EyeDisease_Training_Colab.ipynb  ← Google Colab training notebook
├── scripts/
│   ├── setup.sh            ← Linux/Mac one-command setup
│   └── setup.bat           ← Windows one-command setup
└── README.md
```

---

## ⚡ Quick Start (Step by Step)

### Step 1 – Install Prerequisites

| Tool | Download |
|------|----------|
| Python 3.10+ | https://python.org |
| Node.js 18+ | https://nodejs.org |
| Git | https://git-scm.com |

### Step 2 – Download Dataset from Kaggle

1. Go to: https://www.kaggle.com/datasets/gunavenkatdoddi/eye-diseases-classification
2. Download and extract to `eye-disease-project/dataset/`

Folder structure must be:
```
dataset/
  Normal/         (~1000 images)
  Cataract/       (~1000 images)
  Glaucoma/       (~1000 images)
  diabetic_retinopathy/  (~1000 images)
```

### Step 3 – Run Augmentation

```bash
cd eye-disease-project/backend
python augment.py
```
This generates `augmented_dataset/` with ~20,000 images (5× per original).

### Step 4 – Train the Model

**Option A: Google Colab (Recommended – Free GPU)**
1. Open https://colab.research.google.com
2. Upload `colab/EyeDisease_Training_Colab.ipynb`
3. Runtime → Change runtime type → T4 GPU
4. Upload `augmented_dataset.zip` to Google Drive
5. Run all cells
6. Download `eye_disease_model.h5` and place in `backend/model/`

**Option B: Local Training (slow on CPU)**
```bash
cd eye-disease-project/backend
python train.py
```

### Step 5 – Start the Backend

```bash
cd eye-disease-project/backend
pip install -r requirements.txt
python app.py
```
API runs at: http://localhost:5000

### Step 6 – Start the Web App

```bash
cd eye-disease-project/frontend-web
npm install
npm start
```
Opens at: http://localhost:3000

### Step 7 – Start the Desktop App

```bash
cd eye-disease-project/frontend-desktop
npm install
npm start
```

---

## 🏗️ Architecture

```
[Kaggle Dataset 4000 images]
         ↓ augment.py (5×)
[~20,000 labeled images]
         ↓ train.py / Colab
[EfficientNetB0 CNN → eye_disease_model.h5]
         ↓
[Flask API – localhost:5000]
    ↙          ↘
[React Web]  [Electron Desktop]
    ↘          ↙
[Upload eye image → Predict → Store in SQLite]
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Upload image, get prediction |
| GET | `/history` | All past predictions |
| DELETE | `/history/:id` | Delete a record |
| GET | `/stats` | Dashboard statistics |
| POST | `/retrain` | Trigger model retraining |
| GET | `/retrain/status` | Check retrain progress |
| GET | `/health` | API health check |

---

## 🖥️ Build Desktop Installer (.exe)

```bash
cd frontend-desktop
npm install
npm run build-win    # Windows .exe
npm run build-mac    # macOS .dmg
npm run build-linux  # Linux AppImage
```
Installer appears in `frontend-desktop/dist/`

---

## ☁️ Deploy to Web (Free)

**Backend → Render.com**
1. Push code to GitHub
2. Connect repo to render.com
3. Start command: `python backend/app.py`
4. Add `requirements.txt` to backend/

**Frontend → Vercel**
1. `cd frontend-web && npm run build`
2. `npx vercel --prod`
3. Set env var: `REACT_APP_API_URL=https://your-app.onrender.com`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | TensorFlow 2.16 + EfficientNetB0 |
| Training | Google Colab (free GPU) |
| Backend | Flask 3.0 + SQLite |
| Web Frontend | React 18 + Recharts |
| Desktop | Electron.js |
| Augmentation | Keras ImageDataGenerator |

---

## 📊 Model Performance (Expected)

- Architecture: EfficientNetB0 + Custom Head
- Training: 2-phase (frozen base → fine-tune top-30 layers)
- Expected Accuracy: **85–95%** on validation set
- Input Size: 224×224×3
- Output: Softmax over 4 classes

---

## 👨‍💻 Author

B.Tech CSE Student Project
Dataset: Kaggle Eye Diseases Classification by Gunavenkat Doddi
