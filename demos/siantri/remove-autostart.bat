@echo off
title Hapus Auto-Start SiAntri
color 0e

echo ========================================================
echo        HAPUS SIANTRI DARI STARTUP WINDOWS
echo ========================================================
echo.

powershell -NoProfile -Command "$startupPath = [System.Environment]::GetFolderPath('Startup'); $target = \"$startupPath\SiAntri.lnk\"; if (Test-Path $target) { Remove-Item $target -Force; Write-Host '[SUKSES] Shortcut SiAntri berhasil dihapus dari Startup Windows.' -ForegroundColor Green } else { Write-Host '[INFO] Shortcut SiAntri tidak ditemukan di Startup Windows.' -ForegroundColor Yellow }"

echo.
pause
