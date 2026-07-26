@echo off
chcp 65001 >nul
echo 🛑 正在關閉 super_musician 本地伺服器...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8765 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ 伺服器已成功關閉。
pause
