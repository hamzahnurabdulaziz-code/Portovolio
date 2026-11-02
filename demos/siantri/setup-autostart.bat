@echo off
title Pasang Auto-Start SiAntri
color 0b

echo ========================================================
echo     PASANG SIANTRI AUTO-START WINDOWS (JANGKA PANJANG)
echo ========================================================
echo.
echo Menyiapkan shortcut otomatis di folder Startup Windows...

powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $startupPath = [System.Environment]::GetFolderPath('Startup'); $shortcut = $ws.CreateShortcut(\"$startupPath\SiAntri.lnk\"); $scriptDir = (Get-Item -Path .).FullName; $shortcut.TargetPath = \"$scriptDir\start-background.vbs\"; $shortcut.WorkingDirectory = \"$scriptDir\"; $shortcut.Description = \"SiAntri Resto Server Background\"; $shortcut.Save(); Write-Host '[SUKSES] SiAntri telah ditambahkan ke Startup Windows!' -ForegroundColor Green; Write-Host 'Setiap kali komputer dinyalakan, server SiAntri akan aktif otomatis di latar belakang.' -ForegroundColor Cyan"

echo.
echo Siap digunakan untuk operasional jangka panjang toko/resto!
pause
