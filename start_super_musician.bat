@echo off
cd /d "%~dp0"
start "super_musician Launcher" /min python3.10.exe -c "import socket,time,webbrowser;[time.sleep(1) for _ in iter(lambda:socket.socket().connect_ex(('127.0.0.1',8765)),0)];webbrowser.open('http://127.0.0.1:8765')"
python3.10.exe server.py --port 8765
