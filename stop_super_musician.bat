@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
echo Stopping Super Musician local server...

:: 1. Check .server_port file if present
if exist ".server_port" (
    set /p PORT=<.server_port
    if defined PORT (
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr :!PORT! ^| findstr LISTENING') do (
            taskkill /F /PID %%a >nul 2>&1
        )
    )
    del /f /q ".server_port" >nul 2>&1
)

:: 2. Check standard safe port range 8920-8930 as fallback
for /l %%p in (8920, 1, 8930) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo Super Musician server has been stopped.
