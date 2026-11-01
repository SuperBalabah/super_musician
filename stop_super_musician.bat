@echo off
chcp 65001 >nul
echo 🛑 正在關閉 Super Musician 本地伺服器...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ 伺服器已成功關閉。
pause
