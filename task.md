# 📝 Task Checklist - super_musician Pro Studio

- [x] **Phase 1: 基礎分析與分軌驗證**
  - [x] 驗證本地音訊與 YouTube URL 的 Librosa DSP 分析邏輯 (`BPM`, `Key`, `Chord`)
  - [x] 測試 Demucs (`stems.py`) 伴奏/人聲分離結果

- [x] **Phase 2: ASR 語音轉歌詞模組開發**
  - [x] 建立 `music_analyzer/lyrics.py` 整合 `faster-whisper`
  - [x] 實作 CPU-INT8 量化推論模式
  - [x] 測試中英文夾雜歌詞識別與時間戳導出

- [x] **Phase 3: 時間軸對齊引擎**
  - [x] 開發和弦-歌詞時間戳配對演算法 (`align.py`)
  - [x] 更新 `analysis.json` 導出對齊後的歌詞和弦數據

- [x] **Phase 4: Web UI 視覺化介面與奢華設計**
  - [x] 打造 Quiet Luxury 靜謐奢華暗色調 UI（深灰底、香檳金、向量指法卡片）
  - [x] 實作 [ 🎸 和弦譜 ｜ 🎼 級數簡譜 ] 模式動態轉換

- [x] **Phase 5: 彈唱編輯與音訊變調**
  - [x] 實作 Web Audio `preservesPitch = false` 0 延遲即時音訊變調
  - [x] 開發智能 Capo 推薦引擎與親和按法提示 (`建議 Capo X 夾 (依 X 大調彈奏)`)
  - [x] 開發 [ 👁️ 瀏覽 ｜ ✏️ 編輯 ] 模式、小節固定容器與增刪和弦功能
  - [x] 實作歌名標題點擊動態編輯功能 (編輯模式下解鎖)

- [x] **Phase 6: 多曲目獨立資料庫與捷徑建置**
  - [x] 建立多曲目獨立檔案庫架構 (`runs/saved_songs/{歌名}/`)
  - [x] 實作儲存彈窗與一鍵刪除實體音檔清理機制
  - [x] 新增 [ 🗑️ 刪除樂譜 ] 按鈕與 API 介面
  - [x] 自動創建 Windows 桌面啟動捷徑 (`super_musician.lnk`)

- [x] **Phase 7: 開機空白頁、YouTube 真實歌名與台灣繁體中文全流程維護**
  - [x] 首頁啟動預設純淨空白狀態，不再自動讀取 `downloaded` 舊暫存
  - [x] 整合 `yt-dlp` 真實影片標題擷取，新歌分析前強制重置 `web_analysis` 暫存區
  - [x] 全系統整合 OpenCC `s2twp`，強制歌名、Whisper 歌詞與對齊和弦均為台灣繁體中文
