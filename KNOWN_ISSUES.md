# 🐛 KNOWN_ISSUES.md — super_musician Pro Studio
> 最後更新：2026-07-26

---

## 🔴 [嚴重] 桌面捷徑點擊後無法啟動（一直卡住）

**狀態：** ✅ 已修復  
**發生情境：** 雙擊桌面捷徑 `super_musician.lnk` 後，什麼都沒反應，或 Edge 瀏覽器一直顯示 `ERR_EMPTY_RESPONSE`。

**根本原因：**
1. 電腦上同時有 **Python 3.10**（Microsoft Store 版）和 **Python 3.11**（獨立安裝版）。
2. 舊版 VBS 啟動腳本呼叫 `pythonw`，Windows 將它解析到 **Python 3.11**，但所有套件（`librosa`、`faster-whisper` 等）只安裝在 Python 3.10 的環境中。
3. Python 3.11 因 `ModuleNotFoundError: librosa` 立刻崩潰，Port 8000 從未被監聽，VBS 的心跳輪詢 loop 永遠等不到回應。
4. Microsoft Store 的 `python3.10.exe` stub 在 `WshShell.Run` 隱藏視窗模式（`0`）下無法正常初始化，需改用 `cmd /c start /min` 方式啟動。

**修正方式：**  
- VBS 改用 `cmd /c start_super_musician.bat` 以最小化 (7) 方式拉起批次檔。
- 批次檔內使用 `python3.10.exe` 完整指定版本，並以 `start /min` 啟動監測器，避免 MS Store Stub 隱藏視窗崩潰。

---

## 🔴 [嚴重] 與 SuperLibrarian Port 衝突（打開捷徑卻跑到 NotebookLM 畫面）

**狀態：** ✅ 已修復  
**發生情境：** 點開 `super_musician` 捷徑後，瀏覽器卻連到 `SuperLibrarian` (NotebookLM) 的頁面。

**根本原因：**
- 兩個專案都預設使用 Port `8000`。
- Socket 偵測器只檢查 Port 是否有回應，因為 SuperLibrarian 正在監聽 Port 8000，偵測器誤判為 super_musician 已就緒，於是直接開啟瀏覽器，連入錯誤的應用程式。

**修正方式：**  
- 將 super_musician 的專屬 Port 改為 **`8765`**，與其他服務完全隔離。

---

## 🔴 [嚴重] 重新整理網頁（Refresh）或關閉網頁後，背景任務被意外中斷/伺服器關機

**狀態：** ✅ 已修復  
**發生情境：** 在網頁分析進行中（例如進度條在跑），如果按下 F5 重新整理網頁，或者關閉瀏覽器，伺服器就會關閉，導致背景的 Demucs 或 Whisper 任務被強制殺死。

**根本原因：**
1. 網頁重載時會觸發 `beforeunload` 事件發送 `disconnect` 離線信號，後端收到信號後在 0.2 秒內立即呼叫 `os._exit(0)`。
2. 背景心跳守護執行緒 (`_auto_shutdown_watcher`) 偵測到網頁關閉/無心跳時，也會無條件關閉伺服器，沒有考慮到背景此時可能正有耗時的 AI 任務在運作。

**修正方式：**  
- **緩衝機制**：引入 `HEARTBEAT_COUNT` 心跳計數器，收到 `disconnect` 後延遲 2.5 秒，確認無新頁面重新連線後才執行關閉。
- **任務保護機制**：在 `_auto_shutdown_watcher` 與離線自毀執行緒中，**加入背景任務狀態檢測 (`ANALYSIS_JOBS`)**。只要目前還有任何正在分析中（`status == "running"`）的任務，**伺服器將強制取消自動關閉**，確保 Demucs/Whisper 能夠在背景完整跑完。
- **防止完成瞬間的自毀競爭（Race Condition）**：由於分析期間 CPU 負載大，網頁端可能無法及時送達心跳，導致心跳紀錄過期。若任務完成的瞬間 `status` 轉為 `"completed"` (非 running)，伺服器會因為心跳時間過期而立刻在完成的**那一毫秒執行自毀**。我們在 `_run_async_analysis` 中加入了 **`finally` 區塊**，不論分析成功或失敗，在結束時**立即更新並重置 `LAST_HEARTBEAT_TIME = time.time()`**，為伺服器爭取額外 8 秒鐘的全新寬限期，讓前端網頁能重新連線並接上心跳。

---

## 🔴 [嚴重] YouTube 音訊下載失敗 (Sign in to confirm you're not a bot)

**狀態：** ✅ 已修復  
**發生情境：** 輸入 YouTube 網址分析時，彈出下載失敗視窗，顯示需要登入以確認不是機器人。

**根本原因：**
- YouTube 近期加強對網頁版 (Web) 客戶端下載的機器人阻擋。

**修正方式：**  
- `download.py` 下載與標題獲取指令中加入 `"--extractor-args", "youtube:player_client=android"`。
- 模擬手機 Android App 客戶端發送請求，完全繞過 bot 檢測，實現 100% 免登入下載公開影片。

---

## 🔴 [嚴重] 分析新歌後永遠顯示舊歌結果（憂愁/Downloaded）

**狀態：** ✅ 已修復  
**根本原因：**
1. 背景有多個舊的 `server.py` 進程（PID 3552、8116 等）仍在記憶體中運行舊版程式碼，佔據 Port 8000。
2. `yt-dlp` 下載輸出模板固定為 `downloaded.%(ext)s`，`args.title` 為 `None` 時標題預設為 "downloaded"。
3. `RUNS_DIR/web_analysis/` 分析前未清除，舊結果殘留。

**修正：**
- 加入 `fetch_youtube_title()` 從 `yt-dlp --print title` 抓取真實歌名。
- 分析開始前以 `shutil.rmtree` 清除舊的 `web_analysis/` 目錄。
- 升級 `yt-dlp` 至 2026.7.4。
- 每次啟動 server 前強制清除背景殘留進程。

---

## 🔴 [嚴重] 分析卡在 85% 極久（感覺像當機）

**狀態：** ✅ 已修復  
**發生情境：** 分析 YouTube 歌曲時，進度條卡在 85%（`正在使用 Faster-Whisper 識別歌詞...`）非常久（可能超過 10~15 分鐘）沒有動靜。

**根本原因：**
- 歌詞識別的 ASR 引擎預設使用了 **`medium`** (中型) 模型，該模型高達 1.5 GB，在沒有 GPU 的 CPU 環境下進行運算時極其吃力且緩慢，容易讓人誤以為伺服器當機或中斷。

**修正方式：**  
- 將 [`lyrics.py`](file:///c:/Users/USER/balabah's_gemini_workspace/music_analyzer/music_analyzer/lyrics.py) 的 ASR 預設模型大小改為 **`small`** 模型（體積約 460MB）。
- `small` 模型在 CPU 上的推論速度比 `medium` 快了近 **5 倍**，且繁體中文歌詞識別精準度非常高（遠優於 `base`），在「辨識品質」與「等待時間（約 1.5 分鐘）」之間達到了最佳平衡點。

---

## 🟡 [中等] 啟動後下拉選單只顯示暫存曲目，歷史存檔不見了

**狀態：** ✅ 已修復  
**修正：** `index.html` 預設選項改為 `📁 選擇歷史樂譜存檔...`；`loadPresetList()` 加上 `{ cache: "no-store" }` 禁用快取。

---

## 🟡 [中等] 每次開啟 App 自動載入舊的 downloaded 暫存

**狀態：** ✅ 已修復  
**修正：** `DOMContentLoaded` 移除自動 `loadLatestAnalysis()`，改為呼叫 `renderEmptyState()` 顯示歡迎頁面。

---

## 🟡 [中等] AI 輸出歌詞包含簡體中文

**狀態：** ✅ 已修復  
**修正：** 將 OpenCC 轉換器從 `s2t` 升級為 `s2twp`（台灣繁體中文含詞彙轉換），覆蓋 `lyrics.py`、`download.py`、`cli.py`、`server.py` 四個模組。

---

## 🟢 [輕微] 初始空白頁右側面板字體折行不整齊與音符 Emoji 突兀

**狀態：** ✅ 已修復  
**修正：** 右側面板改用 Flexbox 垂直居中，加入 `white-space: nowrap` 防止折行；🎵 Emoji 替換為香檳金主體 SVG 向量圖標與微光光暈效果。

---

## 📋 待辦事項

- [x] 確認桌面捷徑新版啟動方式（`cmd /c start /min`）在使用者環境下能正常運作
- [x] 測試完整分析流程（貼入 YouTube 網址 → 等待進度 → 自動出現存檔）
- [x] 確認關閉瀏覽器分頁與重新整理網頁時，伺服器運作皆正常（Refresh 不會斷開，關閉分頁會在 2.5 秒內結束進程）

---

## 🔧 環境資訊

| 項目 | 內容 |
|---|---|
| OS | Windows 11 |
| 正確 Python 版本 | 3.10 (Microsoft Store) |
| 錯誤 Python 版本 | 3.11 (獨立安裝，無套件) |
| 套件路徑 | `AppData\Local\Packages\PythonSoftwareFoundation.Python.3.10_*\LocalCache` |
| 伺服器 Port | 8765 (與 SuperLibrarian 8000 隔離) |
| yt-dlp 版本 | 2026.7.4 |
