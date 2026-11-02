@echo off
title Hentikan Server SiAntri
color 0c

echo ========================================================
echo       MENGHENTIKAN SERVER SIANTRI RESTO
echo ========================================================
echo.
echo Mencari proses yang berjalan di port 3000...

powershell -NoProfile -Command "$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($conn) { foreach ($c in $conn) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host '[SUKSES] Server SiAntri di port 3000 berhasil dihentikan.' -ForegroundColor Green } else { Write-Host '[INFO] Server SiAntri tidak sedang berjalan di port 3000.' -ForegroundColor Yellow }"

echo.
echo Selesai.
timeout /t 3 >nul
