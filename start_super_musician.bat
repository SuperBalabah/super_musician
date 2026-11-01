@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

:: Auto-detect Python executable
set "PY_CMD="
python --version >nul 2>&1 && set "PY_CMD=python"
if not defined PY_CMD python3 --version >nul 2>&1 && set "PY_CMD=python3"
if not defined PY_CMD py --version >nul 2>&1 && set "PY_CMD=py"
if not defined PY_CMD python3.10 --version >nul 2>&1 && set "PY_CMD=python3.10"

if not defined PY_CMD (
    echo [ERROR] Python not found in system PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

:: Auto open browser when port 8000 is listening
start "" /min %PY_CMD% -c "import socket,time,webbrowser;[time.sleep(0.5) for _ in iter(lambda:socket.socket().connect_ex(('127.0.0.1',8000)),0)];webbrowser.open('http://127.0.0.1:8000')"

:: Launch Super Musician HTTP Server
%PY_CMD% server.py --port 8000
