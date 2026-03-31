@echo off
TITLE EyeAI Setup
color 0b
echo ============================================================
echo   EyeAI Eye Disease Detection System - Windows Setup
echo ============================================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Download from https://python.org
    pause & exit /b 1
)
echo [OK] Python found

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Download from https://nodejs.org
    pause & exit /b 1
)
echo [OK] Node.js found

:: Backend
echo.
echo [1/3] Installing Python packages...
cd backend
pip install -r requirements.txt
if errorlevel 1 ( echo [ERROR] pip install failed & pause & exit /b 1 )
cd ..

:: Web frontend
echo.
echo [2/3] Installing React dependencies...
cd frontend-web
call npm install
if errorlevel 1 ( echo [ERROR] npm install failed & pause & exit /b 1 )
cd ..

:: Desktop
echo.
echo [3/3] Installing Electron dependencies...
cd frontend-desktop
call npm install
if errorlevel 1 ( echo [ERROR] npm install failed & pause & exit /b 1 )
cd ..

echo.
echo ============================================================
echo   Setup complete!
echo ============================================================
echo.
echo NEXT STEPS:
echo  1. Download Kaggle dataset to dataset/ folder
echo  2. Run:  cd backend ^& python augment.py
echo  3. Train model in Google Colab (see colab/ folder)
echo  4. Place eye_disease_model.h5 in backend/model/
echo  5. Start backend:    cd backend ^& python app.py
echo  6. Start web app:    cd frontend-web ^& npm start
echo  7. Start desktop:    cd frontend-desktop ^& npm start
echo.
pause
