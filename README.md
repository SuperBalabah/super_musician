# 🎸 Super Musician (Pro Studio)

<div align="center">

**AI-Powered Guitar Chord & Tab Studio, Audio Stem Separation & Interactive Practice Companion**  
*Zero-Token Local-First Audio Engine • Quiet Luxury Dark Studio Aesthetics • Bilingual i18n*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Interactive_Web_App-D4AF37?style=for-the-badge&logo=googlechrome&logoColor=white)](https://superbalabah.github.io/super_musician/?lang=en)
[![Download Release](https://img.shields.io/badge/Download-Windows_x64_v1.0.0-0A84FF?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/SuperBalabah/super_musician/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[English](README.md) • [繁體中文](README_zh-TW.md)

</div>

---

## 📖 Overview

**Super Musician** is an end-to-end AI music workspace tailored for songwriters, guitarists, and vocalists. By fusing digital signal processing (DSP) with state-of-the-art deep learning models, Super Musician transforms any song or YouTube video into a live, interactive guitar tab sheet with chord diagrams, real-time audio pitch transposition, scale degree (Jianpu) analysis, and synchronized teleprompter playback.

> [!NOTE]
> **Web Preview vs. Desktop Edition**:
> - **🌐 Web Preview Mode (Zero Install)**: Runs client-side in any modern browser with pre-analyzed showcase tracks (e.g., Adele's *"Hello"*). Includes interactive chords, scale degrees, and audio player.
> - **💻 Windows Desktop Edition (Full AI)**: Runs local Python backend with Demucs 3-stem separation (Original, Backing, Vocals), Faster-Whisper lyrics ASR, and custom YouTube song analysis.

---

## ✨ Key Features

1. **AI Audio Stem Separation & Alignment**
   - **Demucs 3-Stem Decomposition**: Isolates source audio into pure accompaniment (`no_vocals.mp3`) and vocal stem (`vocals.mp3`).
   - **Faster-Whisper Timestamped ASR**: Transcribes multilingual lyrics and aligns chords to vocal timestamps with millisecond precision.
   - **Librosa DSP Harmonization**: Automatic key detection, BPM estimation, and chord progression candidate scoring.

2. **Professional Guitar Tab & Practice UI**
   - **Quiet Luxury Aesthetic**: High-contrast, dark studio palette (`#0c0e12` charcoal and `#c4a475` champagne gold).
   - **Real-Time Pitch Shifting (`-6` to `+6` semitones)**: Transposes audio tracks on-the-fly without altering playback speed or tempo.
   - **Smart Capo Recommendations**: Automatically suggests optimal Capo frets for open chord fingerings (e.g. Capo 1 for G/Em shapes).
   - **Synchronized Teleprompter Scrolling**: Actively centered lyric row follows playback in real time for effortless stage or studio reading.
   - **Bilingual Interface (EN / 中)**: Instant toggle between English and Traditional Chinese without page reload.
   - **Dual Display Modes**: Seamlessly switch between standard Guitar Chords and Numbered Scale Degrees (Jianpu / Nashville System).

3. **Storage & Library Management**
   - **Isolated Song Library**: Each analyzed song is packaged into `runs/saved_songs/{title}/`.
   - **Storage Optimization**: Option to save pure JSON chord structures (freeing up hundreds of megabytes of audio cache) or keep full offline MP3 stems.

---

## 💻 System & Hardware Requirements

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Windows 10 / 11 64-bit | Windows 10 / 11 64-bit |
| **Processor** | Intel Core i5 / AMD Ryzen 5 | Intel Core i7 / AMD Ryzen 7 or better |
| **Memory (RAM)** | 8 GB RAM | 16 GB RAM |
| **Graphics (GPU)** | Not required (CPU mode supported) | NVIDIA RTX Series with CUDA (accelerates Demucs) |
| **Python** | Python 3.10+ | Python 3.10.x |
| **Audio Backend** | FFmpeg installed and in system PATH | FFmpeg 6.0+ |

---

## 🚀 Quick Start Guide

### Option 1: Instant Web Preview (Zero Install)

Visit the live deployment directly in your browser:
- **English**: [https://superbalabah.github.io/super_musician/?lang=en](https://superbalabah.github.io/super_musician/?lang=en)
- **Traditional Chinese**: [https://superbalabah.github.io/super_musician/](https://superbalabah.github.io/super_musician/)

---

### Option 2: Windows Desktop Standalone Package (Recommended)

1. Download **`Super-Musician-v1.0.0-Windows-x64.zip`** from [GitHub Releases](https://github.com/SuperBalabah/super_musician/releases).
2. Extract the ZIP archive to any folder on your PC.
3. Double-click **`Install_Desktop_Shortcut.bat`** (or `install_shortcut.vbs`).
   - A dedicated **Super Musician** desktop shortcut with custom icon will be generated automatically.
4. Double-click the **Super Musician** desktop icon to launch the studio in your default browser.

---

### Option 3: Manual Developer Setup

```powershell
# 1. Clone the repository
git clone https://github.com/SuperBalabah/super_musician.git
cd super_musician

# 2. Create and activate a Python 3.10 virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Install core and AI dependencies
pip install -r requirements.txt

# 4. Verify FFmpeg installation
ffmpeg -version

# 5. Launch the local server
python server.py --port 8000
```

Navigate to `http://localhost:8000` in any modern web browser.

---

## 📁 Repository Structure

```text
super_musician/
├── music_analyzer/           # Core AI & DSP Analysis Engine
│   ├── analysis.py           # Librosa chord, tempo & key estimation
│   ├── stems.py              # Demucs stem separation pipeline
│   ├── lyrics.py             # Faster-Whisper ASR transcription
│   └── align.py              # Chord-lyric timestamp alignment
├── web_ui/                   # Frontend Web Studio
│   ├── index.html            # Studio workspace layout & controls
│   ├── style.css             # Quiet luxury design system & responsive layout
│   ├── i18n.js               # Bilingual internationalization engine
│   └── app.js                # Audio engine, chord visualizer & teleprompter
├── runs/
│   ├── saved_songs/          # Persistent song library (analysis.json, MP3 stems)
│   └── web_analysis/         # Active workspace cache
├── install_shortcut.vbs      # Windows desktop shortcut installer
├── Install_Desktop_Shortcut.bat # One-click shortcut batch script
├── start_super_musician.bat  # Server & browser launcher
├── start_super_musician.vbs  # Silent background launcher
├── stop_super_musician.bat   # Clean server shutdown script
├── super_musician.ico        # Custom gold guitar app icon
├── server.py                 # Local HTTP server & REST API
├── requirements.txt          # Python package requirements
└── LICENSE                   # MIT License
```

---

## 📄 License

Distributed under the **MIT License**. Author: `superbalabah`. See [`LICENSE`](LICENSE) for full details.
