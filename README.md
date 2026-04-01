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
EYE-DISEASE-PROJECT
├── backend/
│   ├── __pycache__/
│   ├── augmented_dataset/
│   ├── dataset/
│   ├── model/
│   │   ├── .gitkeep
│   │   ├── best.keras
│   │   ├── classes.json
│   │   └── eye_disease_model.keras
│   ├── uploads/
│   ├── app.py
│   ├── augment.py
│   ├── database.db
│   ├── eye_validator.py
│   ├── requirements.txt
│   └── train.py
├── frontend-desktop/
│   ├── dist/
│   ├── node_modules/
│   ├── index.html
│   ├── main.js
│   ├── package-lock.json
│   └── package.json
├── frontend-web/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── package-lock.json
│   └── package.json
├── scripts/
├── venv/
├── .gitignore
├── classes.json
├── README.md
└── render.yaml

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
[EfficientNetB3 CNN → eye_disease_model.h5]
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

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | TensorFlow 2.16 + EfficientNetB3 |
| Training | Google Colab (free GPU) |
| Backend | Flask 3.0 + SQLite |
| Web Frontend | React 18 + Recharts |
| Desktop | Electron.js |
| Augmentation | Keras ImageDataGenerator |

---

## 📊 Model Performance (Expected)

- Architecture: EfficientNetB3 + Custom Head
- Training: 2-phase (frozen base → fine-tune top-30 layers)
- Expected Accuracy: **85–95%** on validation set
- Input Size: 224×224×3
- Output: Softmax over 4 classes

---

## 👨‍💻 Author

B.Tech CSE Student Project
Backend and deploying - Prince Rajput (24BCE10966)
Backend - Nikhil (24BCE10524)
Frontend web - Hardik Lamba (24BCE10592)
Frontend desktop - Harsh Yadav (24BCE10563)
Machine learning and deploying - Kunal pandey (24BCE10137)
Dataset: Kaggle Eye Diseases Classification by Gunavenkat Doddi
