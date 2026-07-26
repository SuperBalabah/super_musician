# 🎵 super_musician (Pro Studio)

> **專業級 AI 吉他和弦譜分析、彈唱輔助與曲庫管理平台**  
> Local-First Zero-Token Audio Processing & Quiet Luxury Dark Studio Design System.

---

## 🌟 核心亮點與主要功能

1. **全自動樂譜與音訊分析 pipeline**
   - **零 Token 本地音訊處理**：使用 `Librosa` DSP 分析和弦 (Chord Progression)、主音調性 (Key Estimation) 與 節奏 BPM。
   - **Demucs 三軌音訊分離**：自動拆分 **原曲**、**純伴奏 (no_vocals.mp3)** 與 **純人聲 (vocals.mp3)**。
   - **Faster-Whisper ASR 歌詞對齊**：自動識別中英文歌詞並進行毫秒級時間戳與和弦配對 (`aligned_lyrics`)。

2. **🎸 專業吉他彈唱與排版引擎**
   - **Quiet Luxury 靜謐奢華介面**：經典 `#0c0e12` 深灰與 `#c4a475` 香檳金配色，向量 SVG 指法卡片與固定小節對齊 (`sheet-bar-measure`)。
   - **高品質即時移調與自然變調**：支援 `♭6` ~ `♯6` 移調，結合後端 `Librosa` (Phase Vocoder) 變調音軌快取與前端 HTML5 原生時間拉伸（BPM 完美穩定且聽感極其自然無任何電音雜訊）。
   - **智能 Capo 夾音程推薦**：動態依轉調結果推薦 `建議 Capo X 夾 (依 X 大調彈奏)` 並即時轉換開放和弦指法 (Open Chord Shapes)。
   - **滾動定位中央 (Teleprompter Mode)**：播放時，正在唱的歌詞行會自動、平滑地滾動至**螢幕高度垂直正中央**，提供極佳的讀譜與自彈自唱體驗。
   - **左側懸浮移調面板 (Scroll Safety)**：當頂部的主移調工具列滾動出畫面時，左側會自動滑入一個香檳金色懸浮移調面板，供您在播放途中快速升降 Key 或重設。
   - **[ 🎸 和弦譜 ｜ 🎼 級數簡譜 ] 模式切換**：提供級數簡譜對照，方便聽採與寫譜。
   - **[ 👁️ 瀏覽 ｜ ✏️ 編輯 ] 模式切換**：支援直接修改歌名、自由新增/刪除小節和弦、點選相似和弦推薦候選與修改歌詞。編輯模式下支援直接點擊行空白處進行段落跳轉播放。

3. **🏛️ 多曲目獨立資料庫與容量管理 (`runs/saved_songs/`)**
   - **獨立曲庫歸檔**：每一首儲存的歌曲均擁有獨立資料夾 (`runs/saved_songs/{歌名}/`)，且編輯/儲存已存歌曲時具有隔離機制，絕不覆蓋原本已存好的實體音檔。
   - **音訊變調快取 MP3 壓縮**：後端處理完變調後，調用本機 `ffmpeg` 自動將其壓縮為 128k MP3（`*_trans_*.mp3`），使單個快取檔案大小從 12.5MB 驟降至 **1.5MB**（空間節省 88%）。
   - **自訂保留調性**：儲存時會自動向後端取得已生成的變調清單，用戶可透過核取方塊決定只保留哪些調性的音軌快取，未選取的會被自動刪除釋放空間。
   - **開機自動快取清理**：伺服器啟動時，會自動掃描整個 `runs` 目錄並徹底清理過去版本所遺留的大體積 WAV 快取檔，自動釋放硬碟空間。
   - **一鍵硬碟容量清理**：提供「僅存樂譜 JSON」與「保留完整 MP3」雙選項。
   - **一鍵刪除備份檔 (`🗑️ 刪除樂譜`)**：隨時在下拉選單刪除不再需要的舊樂譜與相關音檔。

4. **✨ 台灣繁體中文規範與純淨啟動體驗**
   - **開機純淨空白頁**：開啟系統預設呈現空白歡迎介面，絕不上自動載入舊 `downloaded` 暫存檔。
   - **YouTube 歌名自動擷取**：整合 `yt-dlp` 影片元數據解析真實歌名，並於分析前清空 `web_analysis` 舊目錄。
   - **OpenCC `s2twp` 台灣繁體化**：全系統音訊識別、歌詞配對與歌名導出均採用台灣繁體中文規範。
   - **完全自主關機**：移除了心跳機制，伺服器生命週期由 Terminal（或關閉捷徑最小化視窗）手動掌控，靜置時 CPU 消耗為 0%，內存佔用極低。

---

## 🛠️ 安裝與環境建置

```powershell
# 1. 建立並啟動 Python 虛擬環境
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. 安裝必要套件
pip install -r requirements.txt

# 3. 安裝音訊分離與 ASR 引擎
pip install yt-dlp demucs faster-whisper
```

> **注意**：系統需已安裝 `ffmpeg` 並將其加入系統 PATH 環境變數中以進行分軌與 MP3 壓縮。

---

## 🚀 啟動與使用方式

### 方式 A：雙擊桌面捷徑啟動 (推薦)
直接雙擊您 Windows 桌面上的 **`super_musician`** 音樂捷徑，即可自動啟動伺服器（預設以最小化 Terminal 視窗形式呈現在工作列）並打開瀏覽器進入系統！當要關閉程式時，直接關閉該 Terminal 視窗即可。

### 方式 B：命令列啟動
```powershell
python server.py --port 8765
```
開啟瀏覽器訪問 **`http://localhost:8765`**。

---

## 📁 專案架構目錄

```text
music_analyzer/
├── music_analyzer/        # 核心 AI 分析與音訊處理模組
│   ├── analysis.py        # Librosa 和弦與調性分析
│   ├── stems.py           # Demucs 分軌模組
│   ├── lyrics.py          # Faster-Whisper ASR 歌詞識別
│   └── align.py           # 歌詞與和弦毫秒對齊引擎
├── web_ui/                # Quiet Luxury 靜謐奢華前端 UI
│   ├── index.html         # 主頁面結構、儲存彈窗與左側懸浮移調面板
│   ├── style.css          # 色彩系統、佈局調整與懸浮樣式
│   └── app.js             # 播放器、中心定位滾動、移調綁定與編輯器 logic
├── runs/
│   ├── saved_songs/       # 多曲目獨立歸檔資料庫 ({歌名}/analysis.json, MP3s)
│   └── web_analysis/      # 工作室最新分析暫存區
├── server.py              # super_musician 本地 HTTP API 伺服器
├── start_super_musician.bat # Windows 啟動腳本
└── README.md
```
