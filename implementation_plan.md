# 📋 Implementation Plan - super_musician Pro Studio

## ✅ Completed Milestones

1. **AI 音訊分析與 AI 分軌引擎**
   - 整合 `librosa` 估算和弦、原調調性與 BPM。
   - 整合 `demucs` 進行音訊分離 (原曲、純伴奏 `no_vocals.mp3`、純人聲 `vocals.mp3`)。
   - 整合 `faster-whisper` (CPU-INT8) 識別中英文歌詞與毫秒級時間戳。
   - 實作 `align.py` 將歌詞與 chroma 和弦數據完美對齊。

2. **Quiet Luxury 靜謐奢華 UI 設計**
   - 全新現代極簡視覺：`#0c0e12` 深灰底色、`#c4a475` 香檳金高光。
   - 提供右手 Chord Sidebar 展示和弦向量 SVG 指法圖。
   - 提供底部固定 HTML5 音訊控制列、隨動 Scrub 巡航與音軌切換按鈕。

3. **實用彈唱互動與編輯器**
   - 支援 `♭6` ~ `♯6` 移調與 HTML5 `preservesPitch = false` 即時音訊升降調。
   - 智能 Capo 夾音程推薦（格式：`建議 Capo X 夾 (依 X 大調彈奏)`）並動態轉換開放指法。
   - 支援 `[ 🎸 和弦譜 ｜ 🎼 級數簡譜 ]` 動態轉換。
   - 支援 `[ 👁️ 瀏覽 ｜ ✏️ 編輯 ]` 模式切換。
   - 採用固定小節卡片 (`.sheet-bar-measure`)，確保跨小節插入/刪除和弦時小節線 100% 固定不跑位。
   - 支援歌名標題直接點擊打字修改。

4. **多曲目獨立資料庫與容量管理**
   - 建立 `runs/saved_songs/{歌名}/` 獨立曲库歸檔目錄，徹底解決檔名碰撞問題。
   - 儲存時顯示實體音檔佔用空間，並提供「僅存樂譜 JSON (清理 MP3 釋放空間)」與「保存完整音檔」雙選項。
   - 新增 `🗑️ 刪除樂譜` 功能按鈕與 `POST /api/delete-preset` 後端 API。
   - 創建 Windows 桌面一鍵啟動捷徑 (`super_musician.lnk`)。

5. **開機空白頁、YouTube 真實歌名擷取與台灣繁體中文流轉**
   - 前端啟動時預設顯示純淨空白狀態，擺脫開啟 App 自動預載舊 `downloaded` 暫存的困擾。
   - `download.py` 與 `cli.py` 整合 `yt-dlp` 真實影片標題擷取，新歌分析前強制重置 `runs/web_analysis/`。
   - 全系統整合 OpenCC `s2twp`，確保歌名、Whisper 歌詞、對齊和弦與報告全數轉為純繁體中文。

---

## 🔮 Post-MVP Roadmap (未來升級規劃)

1. **人聲和聲訓練模式 (Vocal Harmony Trainer Mode)**
   - 針對 Demucs 分離出的 `vocals.mp3`，透過音高調變生成 `+3` 度、`-3` 度、`+5` 度和聲音軌。
   - 供合音歌手與和聲練習者單獨反覆聆聽與配唱練習。

2. **MIDI / Guitar Pro 檔案匯出 (GP5 / MIDI Export)**
   - 將對齊好的和弦與小節線數據打包導出為 `.mid` 或 `.gp5` 樂譜檔。

3. **拍子記號自動識別 (4/4, 3/4, 6/8 Time Signature Detection)**
   - 增加節奏型態判讀與小節拍數標記。
