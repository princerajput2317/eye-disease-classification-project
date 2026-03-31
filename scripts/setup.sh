#!/bin/bash
# EyeAI – One-command setup for Linux / macOS
set -e

echo "============================================================"
echo "  EyeAI Eye Disease Detection System – Setup"
echo "============================================================"
echo

# Checks
command -v python3 >/dev/null 2>&1 || { echo "[ERROR] python3 not found."; exit 1; }
command -v node    >/dev/null 2>&1 || { echo "[ERROR] node not found. Install from nodejs.org"; exit 1; }
command -v npm     >/dev/null 2>&1 || { echo "[ERROR] npm not found."; exit 1; }

echo "[OK] Python: $(python3 --version)"
echo "[OK] Node:   $(node --version)"
echo

echo "[1/3] Installing Python packages..."
cd backend
pip3 install -r requirements.txt
cd ..

echo "[2/3] Installing React dependencies..."
cd frontend-web
npm install
cd ..

echo "[3/3] Installing Electron dependencies..."
cd frontend-desktop
npm install
cd ..

echo
echo "============================================================"
echo "  Setup complete!"
echo "============================================================"
echo
echo "NEXT STEPS:"
echo "  1. Place Kaggle dataset in: dataset/"
echo "  2. python3 backend/augment.py"
echo "  3. Train model via Google Colab (colab/ folder)"
echo "  4. Place eye_disease_model.h5 in backend/model/"
echo "  5. python3 backend/app.py           # start API"
echo "  6. cd frontend-web && npm start     # web app"
echo "  7. cd frontend-desktop && npm start # desktop app"
