# 🎸 Super Musician (專業音樂人工作室)

<div align="center">

**專業級 AI 吉他和弦譜分析、音軌分離與自彈自唱練習平台**  
*零 Token 本地音訊處理 • Quiet Luxury 靜謐奢華深色錄音室美學 • 中英雙語即時切換*

[![線上展示](https://img.shields.io/badge/線上體驗-互動式網頁版-D4AF37?style=for-the-badge&logo=googlechrome&logoColor=white)](https://superbalabah.github.io/super_musician/)
[![下載安裝包](https://img.shields.io/badge/下載安裝包-Windows_x64_v1.0.0-0A84FF?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/SuperBalabah/super_musician/releases)
[![License: MIT](https://img.shields.io/badge/授權協議-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[English](README.md) • [繁體中文](README_zh-TW.md)

</div>

---

## 📖 專案簡介

**Super Musician** 是專為吉他手、詞曲創作人與彈唱歌手打造的 AI 全流程音樂工作平台。透過數位訊號處理（DSP）與深度學習音訊模型的結合，Super Musician 能將任意歌曲或 YouTube 影片自動轉化為具備動態和弦指法卡片、即時移調變調、級數簡譜對照與歌詞提詞滾動的互動式吉他譜。

> [!NOTE]
> **線上體驗版與完整桌面版功能說明**：
> - **🌐 線上體驗版（免安裝）**：於現代瀏覽器直接體驗，內建 Adele《Hello》等經典英文展示曲目。支援動態和弦指法、級數簡譜、移調計算與自彈自唱練習。
> - **💻 Windows 完整桌面版（全功能 AI）**：搭載本地 Python 後端，支援貼上任意 YouTube 網址進行 Demucs 三軌音訊分離（原曲 / 伴奏 / 人聲）、Faster-Whisper 歌詞辨識與毫秒級自動對齊。

---

## ✨ 核心特色與功能

1. **AI 音訊分離與毫秒級對齊引擎**
   - **Demucs 三軌分離**：自動將原曲拆分為純伴奏（`no_vocals.mp3`）與純人聲（`vocals.mp3`）。
   - **Faster-Whisper 語音辨識**：自動識別歌詞時間戳，並與和弦按小節精準對齊。
   - **Librosa DSP 和弦採譜**：全自動調性（Key Detection）、速度（BPM）與和弦進程候選計算。

2. **🎸 專業級吉他彈唱與排版介面**
   - **Quiet Luxury 靜謐奢華風格**：經典 `#0c0e12` 深灰與 `#c4a475` 香檳金配色，視覺質感沉穩。
   - **高品質即時移調（-6 ~ +6 半音）**：即時音訊變調，且完全維持原本拍速（BPM），音質自然不失真。
   - **智能 Capo 建議**：轉調後動態提供最適合的變調夾品位（如 Capo 1 夾，依 G/Em 大小調指法彈奏）。
   - **提詞機中心滾動（Teleprompter）**：播放時正在唱的歌詞行自動垂直置中，彈唱讀譜一目了然。
   - **中英雙語切換（EN / 中）**：頂部一鍵即時切換語言，無需重新整理網頁。
   - **[ 和弦譜 ｜ 級數簡譜 ] 雙模式**：可自由切換吉他和弦譜與數字級數簡譜，方便聽採分析。

3. **🏛️ 獨立曲庫與容量清理管理**
   - **獨立曲庫歸檔**：每首歌曲獨立儲存於 `runs/saved_songs/{歌名}/`，不互相干擾。
   - **一鍵清理硬碟容量**：提供「僅存吉他譜 JSON（省空間）」與「保留完整 MP3 音檔」雙選項。

---

## 💻 系統硬體與環境需求

| 硬體組件 | 最低配置 | 建議配置 |
| :--- | :--- | :--- |
| **作業系統** | Windows 10 / 11 64 位元 | Windows 10 / 11 64 位元 |
| **處理器 (CPU)** | Intel Core i5 或 AMD Ryzen 5 | Intel Core i7 或 AMD Ryzen 7 以上 |
| **記憶體 (RAM)** | 8 GB RAM | 16 GB RAM 以上 |
| **顯示卡 (GPU)** | 無強制要求（支援純 CPU 運行） | NVIDIA RTX 顯卡（支援 CUDA，可大幅加速 Demucs 分軌） |
| **Python** | Python 3.10+ | Python 3.10.x |
| **音訊工具** | 需安裝 FFmpeg 並加入 PATH | FFmpeg 6.0+ |

---

## 🚀 快速上手使用指引

### 模式 A：線上免安裝體驗 (Zero Install)

點擊下方連結即可直接在瀏覽器中使用：
- **繁體中文版（預設）**：[https://superbalabah.github.io/super_musician/](https://superbalabah.github.io/super_musician/)
- **英文版（Global / US Reviewers）**：[https://superbalabah.github.io/super_musician/?lang=en](https://superbalabah.github.io/super_musician/?lang=en)

---

### 模式 B：Windows 桌面安裝包 (推薦)

1. 前往 [GitHub Releases](https://github.com/SuperBalabah/super_musician/releases) 下載 **`Super-Musician-v1.0.0-Windows-x64.zip`**。
2. 解壓縮 ZIP 檔案至電腦中的任意資料夾。
3. 雙擊執行 **`Install_Desktop_Shortcut.bat`**（或 `install_shortcut.vbs`）。
   - 系統會自動在桌面建立帶有吉他專屬圖示的 **Super Musician** 桌面捷徑。
4. 雙擊桌面上的 **Super Musician** 圖示，即可自動於瀏覽器中開啟使用！

---

### 模式 C：開發者手動建置

```powershell
# 1. 複製專案庫
git clone https://github.com/SuperBalabah/super_musician.git
cd super_musician

# 2. 建立並啟動 Python 虛擬環境
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. 安裝核心與 AI 依賴套件
pip install -r requirements.txt

# 4. 確認系統已安裝 FFmpeg
ffmpeg -version

# 5. 啟動本機伺服器 (自動分配無衝突 Port 並開啟瀏覽器)
python server.py
```

伺服器將自動避開衝突 Port 並直接在預設瀏覽器開啟。

---

## 📁 專案架構目錄

```text
super_musician/
├── music_analyzer/           # 核心 AI 分析與音訊處理模組
│   ├── analysis.py           # Librosa 和弦、節奏與調性採譜
│   ├── stems.py              # Demucs 音軌分離模組
│   ├── lyrics.py             # Faster-Whisper ASR 歌詞識別
│   └── align.py              # 和弦與歌詞時間戳配對
├── web_ui/                   # 靜謐奢華前端工作台
│   ├── index.html            # 主畫面與工具列
│   ├── style.css             # 錄音室深色奢華美學樣式
│   ├── i18n.js               # 中英雙語國際化字典
│   └── app.js                # 播放器、動態和弦卡片與提詞機
├── runs/
│   ├── saved_songs/          # 永久曲庫存檔 (analysis.json, MP3)
│   └── web_analysis/         # 當前分析快取
├── install_shortcut.vbs      # 捷徑安裝腳本
├── Install_Desktop_Shortcut.bat # 一鍵安裝捷徑
├── start_super_musician.bat  # 啟動腳本
├── start_super_musician.vbs  # 背景靜默啟動器
├── stop_super_musician.bat   # 伺服器關閉腳本
├── super_musician.ico        # 吉他專屬高解析圖示
├── server.py                 # 本機 HTTP API 伺服器
├── requirements.txt          # Python 依賴清單
└── LICENSE                   # MIT 授權條款
```

---

## 📄 授權協議 (License)

本專案採用 **MIT License** 授權。署名：`superbalabah`。詳見 [`LICENSE`](LICENSE) 檔案。
