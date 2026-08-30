@echo off
title Recipe Companion - Full Stack Launcher
color 0A

echo.
echo  ====================================================
echo      RECIPE COMPANION - Starting Full Stack App
echo  ====================================================
echo.

:: Kill any previous instances on these ports
echo [0/3] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

:: Start Backend Server (port 5000)
echo [1/3] Starting Backend API Server on port 5000...
start "Recipe Companion - Backend API" cmd /k "cd /d "%~dp0server" && node server.js"

:: Wait for backend to initialize
timeout /t 4 /nobreak >nul

:: Start Frontend Dev Server (port 5173)
echo [2/3] Starting Frontend Dev Server on port 5173...
start "Recipe Companion - Frontend" cmd /k "cd /d "%~dp0client" && npm.cmd run dev -- --host --port 5173"

:: Wait for frontend to boot
timeout /t 6 /nobreak >nul

:: Open browser
echo [3/3] Opening browser...
start "" "http://localhost:5173"

echo.
echo  ====================================================
echo   App is LIVE!
echo   >> Website  : http://localhost:5173
echo   >> Backend  : http://localhost:5000/api
echo   >> WiFi Net : http://192.168.1.4:5173
echo  ====================================================
echo.
echo  Demo Login: demo@recipecompanion.com / password123
echo.
echo  Close the two server windows to stop the app.
pause
