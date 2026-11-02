@echo off
title SiAntri Resto & Toko Server
color 0a

echo ========================================================
echo       SIANTRI RESTO ^& TOKO - SISTEM ANTREAN UMKM
echo ========================================================
echo.
echo Memeriksa instalasi Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak terdeteksi!
    echo Silakan install Node.js dari https://nodejs.org/ terlebih dahulu.
    pause
    exit /b 1
)

echo [OK] Node.js terdeteksi.
echo.
echo Menjalankan server SiAntri di port 3000...
echo Tekan Ctrl+C untuk menghentikan server jika jendela ini ditutup.
echo.

start "" "http://localhost:3000"

node server.js
pause
