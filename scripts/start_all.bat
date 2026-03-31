@echo off
TITLE EyeAI – Start All
color 0b
echo Starting EyeAI services...
echo.

:: Start Flask backend in a new window
start "EyeAI Backend (Flask)" cmd /k "cd /d %~dp0backend && python app.py"
timeout /t 3 /nobreak >nul

:: Start React web app in a new window
start "EyeAI Web (React)" cmd /k "cd /d %~dp0frontend-web && npm start"
timeout /t 3 /nobreak >nul

:: Open browser
start "" "http://localhost:3000"

echo.
echo [INFO] Backend running at  http://localhost:5000
echo [INFO] Web app running at  http://localhost:3000
echo.
echo Press any key to also launch the Desktop app...
pause >nul

:: Start Electron desktop
start "EyeAI Desktop (Electron)" cmd /k "cd /d %~dp0frontend-desktop && npm start"
