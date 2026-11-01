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

:: Launch Super Musician Server (automatically allocates a free port and opens default browser)
%PY_CMD% server.py
