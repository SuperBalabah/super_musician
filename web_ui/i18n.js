// Internationalization (i18n) Engine for Super Musician
// Supports English (en) and Traditional Chinese (zh-TW)

const I18N = {
    "zh-TW": {
        docTitle: "Super Musician - 專業吉他和弦譜分析平台",
        brandTagline: "MUSICIAN",
        urlPlaceholder: "貼上 YouTube 網址分析新吉他譜...",
        btnAnalyze: "分析吉他譜",
        btnChordMode: "🎸 和弦譜",
        btnChordModeTitle: "吉他和弦譜模式",
        btnJianpuMode: "🎼 級數簡譜",
        btnJianpuModeTitle: "數字級數簡譜模式",
        btnViewMode: "👁️ 瀏覽",
        btnViewModeTitle: "安全瀏覽模式",
        btnEditMode: "✏️ 編輯",
        btnEditModeTitle: "編輯微調模式",
        presetDefault: "📁 選擇歷史樂譜存檔...",
        btnDeletePreset: "刪除樂譜",
        btnSave: "儲存",
        btnExport: "導出",
        demoNotice: "<strong>線上展示模式：</strong>支援 Adele《Hello》原曲、純伴奏與純人聲三軌完整切換、即時和弦指法與簡譜轉換。若需分析新的 YouTube 歌曲或進行即時音訊 DSP 變調，請下載 Windows 完整桌面版。",
        demoTransposeNotice: "💡 線上展示版已即時轉換樂譜與和弦指法！音訊即時變調 (-6 至 +6 半音) 需搭配 Python 本機 DSP 運算，請下載 Windows 完整版體驗！",
        transDemoHint: "* 線上展示版已同步轉換樂譜；音訊即時變調請下載本機版體驗",
        downloadDesktopLink: "下載 Windows 完整版 →",
        origKey: "原調",
        currKey: "目前調性",
        tempo: "速度",
        capoAdvice: "Capo 建議",
        strumming: "參考刷法",
        transposeLabel: "移調 Key (音檔同步變調)",
        reset: "重設",
        capoLabel: "Capo 變調夾：",
        capoFret: (f) => `Capo ${f} 夾`,
        capoRecommendationText: (capo, key) => `建議 Capo ${capo} 夾 (依 ${key} 彈奏)`,
        pitchRange: "音域範圍:",
        medianPitch: "中音",
        duration: "音樂時長:",
        beats: "拍",
        avgEnergy: "平均 RMS 能量:",
        sidebarTitle: "曲目吉他和弦按法",
        sidebarSubtitle: "點擊上方移調按鈕，指法將同步即時轉換",
        trackOriginal: "原曲",
        trackInstrumental: "伴奏",
        trackVocals: "人聲",
        speedNormal: "1.0x 正常速度",
        speedPractice: "0.8x 練琴慢速",
        speedSlow: "0.6x 超慢速",
        modalTitle: "💾 儲存吉他譜與資源清理管理",
        modalSongTitle: "曲目名稱：",
        modalStorage: "本機音檔佔用空間：",
        modalOptSheetOnlyTitle: "📄 僅儲存吉他譜 JSON (推薦，省空間)",
        modalOptSheetOnlyDesc: "儲存微調後的吉他譜 JSON 結構檔，並自動清理刪除本地暫存音檔 (釋放空間)。",
        modalOptAudioTitle: "🎵 儲存吉他譜 + 保留完整實體音檔",
        modalOptAudioDesc: "保留全套 MP3 音檔 (原曲、伴奏、純人聲)，方便完全離線時邊播邊練習。",
        modalTransKeep: "選擇要保留的變調音檔：",
        btnCancel: "取消",
        btnConfirmSave: "確認儲存",
        floatingTranspose: "🔑 移調",
        saveSuccess: "吉他譜已成功儲存！",
        exportSuccess: "吉他譜 JSON 數據已成功導出！",
        analyzingDefault: "正在分析音樂、分離音軌與產生吉他譜中...",
        strummingPatternVal: "X ↑↑X ↑↑"
    },
    "en": {
        docTitle: "Super Musician - AI Guitar Chord & Tab Studio",
        brandTagline: "MUSICIAN",
        urlPlaceholder: "Paste YouTube URL to analyze guitar chords...",
        btnAnalyze: "Analyze Chords",
        btnChordMode: "🎸 Chords",
        btnChordModeTitle: "Guitar Chord Sheet Mode",
        btnJianpuMode: "🎼 Jianpu",
        btnJianpuModeTitle: "Scale Degree / Jianpu Mode",
        btnViewMode: "👁️ View",
        btnViewModeTitle: "Practice & View Mode",
        btnEditMode: "✏️ Edit",
        btnEditModeTitle: "Edit Chords & Lyrics Mode",
        presetDefault: "📁 Select Saved Songs...",
        btnDeletePreset: "Delete Song",
        btnSave: "Save",
        btnExport: "Export",
        demoNotice: "<strong>Web Preview Mode:</strong> Adele - Hello includes full audio stems (Original, Backing, Vocals), interactive chord fingering, and scale degrees. Real-time audio pitch shifting and analyzing new YouTube URLs require the Windows desktop app.",
        demoTransposeNotice: "💡 Web preview transposes chord sheet & fingering visually! Real-time audio pitch shifting (-6 to +6) requires local Python DSP engine. Download the Windows App for full experience!",
        transDemoHint: "* Web preview transposes chords visually; audio pitch shifting requires desktop app",
        downloadDesktopLink: "Download Windows App →",
        origKey: "Original Key",
        currKey: "Current Key",
        tempo: "Tempo",
        capoAdvice: "Capo Advice",
        strumming: "Strumming",
        transposeLabel: "Transpose Key (Real-Time Pitch Shift)",
        reset: "Reset",
        capoLabel: "Capo Fret:",
        capoFret: (f) => `Capo ${f}`,
        capoRecommendationText: (capo, key) => `Recommended Capo ${capo} (Play in ${key})`,
        pitchRange: "Pitch Range:",
        medianPitch: "median",
        duration: "Duration:",
        beats: "beats",
        avgEnergy: "Avg RMS Energy:",
        sidebarTitle: "Song Guitar Chords",
        sidebarSubtitle: "Chord fingering diagrams update with transposition",
        trackOriginal: "Original",
        trackInstrumental: "Backing",
        trackVocals: "Vocals",
        speedNormal: "1.0x Normal Speed",
        speedPractice: "0.8x Practice Speed",
        speedSlow: "0.6x Slow Speed",
        modalTitle: "💾 Save Guitar Sheet & Resource Cleanup",
        modalSongTitle: "Song Title:",
        modalStorage: "Local Audio Storage:",
        modalOptSheetOnlyTitle: "📄 Save Guitar Sheet JSON Only (Recommended)",
        modalOptSheetOnlyDesc: "Saves refined chord sheet JSON structure and cleans up temporary audio to save disk space.",
        modalOptAudioTitle: "🎵 Save Sheet + Keep Audio Tracks",
        modalOptAudioDesc: "Keeps full MP3 tracks (original, backing, vocals) for complete offline guitar practice.",
        modalTransKeep: "Select transposed audio tracks to keep:",
        btnCancel: "Cancel",
        btnConfirmSave: "Confirm Save",
        floatingTranspose: "🔑 Transpose",
        saveSuccess: "Guitar chord sheet saved successfully!",
        exportSuccess: "Guitar sheet JSON exported successfully!",
        analyzingDefault: "Analyzing music, separating stems, and generating guitar tab...",
        strummingPatternVal: "D DU UD"
    }
};

let currentLang = "zh-TW";

function getInitialLanguage() {
    // Check URL parameters first: ?lang=en or ?lang=zh-TW
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get("lang");
    if (langParam) {
        return langParam.toLowerCase().startsWith("en") ? "en" : "zh-TW";
    }

    // Next check localStorage
    const saved = localStorage.getItem("super_musician_lang");
    if (saved && (saved === "en" || saved === "zh-TW")) {
        return saved;
    }

    // Default to zh-TW for local use, but if browser is purely en, support en
    return "zh-TW";
}

function setLanguage(lang) {
    if (!I18N[lang]) lang = "zh-TW";
    currentLang = lang;
    localStorage.setItem("super_musician_lang", lang);
    document.documentElement.lang = lang;

    // Apply translations to DOM elements
    applyTranslations();

    // Notify listeners (e.g. app.js re-render)
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
}

function t(key, ...args) {
    const dict = I18N[currentLang] || I18N["zh-TW"];
    const val = dict[key];
    if (typeof val === "function") {
        return val(...args);
    }
    return val !== undefined ? val : (I18N["zh-TW"][key] || key);
}

function applyTranslations() {
    const dict = I18N[currentLang];
    if (!dict) return;

    // Title
    document.title = dict.docTitle;

    // URL input
    const urlInput = document.getElementById("yt-url-input");
    if (urlInput) urlInput.placeholder = dict.urlPlaceholder;

    // Analyze button
    const btnAnalyze = document.getElementById("btn-start-analyze");
    if (btnAnalyze) {
        const span = btnAnalyze.querySelector("span");
        if (span) span.textContent = dict.btnAnalyze;
    }

    // Mode buttons
    const btnChord = document.getElementById("btn-mode-chord");
    if (btnChord) {
        btnChord.textContent = dict.btnChordMode;
        btnChord.title = dict.btnChordModeTitle;
    }
    const btnJianpu = document.getElementById("btn-mode-jianpu");
    if (btnJianpu) {
        btnJianpu.textContent = dict.btnJianpuMode;
        btnJianpu.title = dict.btnJianpuModeTitle;
    }
    const btnView = document.getElementById("btn-mode-view");
    if (btnView) {
        btnView.textContent = dict.btnViewMode;
        btnView.title = dict.btnViewModeTitle;
    }
    const btnEdit = document.getElementById("btn-mode-edit");
    if (btnEdit) {
        btnEdit.textContent = dict.btnEditMode;
        btnEdit.title = dict.btnEditModeTitle;
    }

    // Preset dropdown default option
    const presetSelect = document.getElementById("preset-select");
    if (presetSelect && presetSelect.options.length > 0) {
        presetSelect.options[0].textContent = dict.presetDefault;
    }

    // Delete preset button
    const btnDel = document.getElementById("btn-delete-preset");
    if (btnDel) {
        const span = btnDel.querySelector("span");
        if (span) span.textContent = dict.btnDeletePreset;
    }

    // Save & Export
    const btnSave = document.getElementById("btn-save-analysis");
    if (btnSave) {
        const span = btnSave.querySelector("span");
        if (span) span.textContent = dict.btnSave;
    }
    const btnExport = document.getElementById("btn-export-json");
    if (btnExport) {
        const span = btnExport.querySelector("span");
        if (span) span.textContent = dict.btnExport;
    }

    // Demo Notice Banner
    const noticeText = document.getElementById("demo-notice-text");
    if (noticeText) noticeText.innerHTML = dict.demoNotice;
    const downloadLink = document.getElementById("demo-download-link");
    if (downloadLink) downloadLink.textContent = dict.downloadDesktopLink;

    // Meta Badge Labels
    document.querySelectorAll(".badge-label").forEach((el) => {
        const text = el.textContent.trim();
        if (text === "原調" || text === "Original Key") el.textContent = dict.origKey;
        else if (text === "目前調性" || text === "Current Key") el.textContent = dict.currKey;
        else if (text === "速度" || text === "Tempo") el.textContent = dict.tempo;
        else if (text === "Capo 建議" || text === "Capo Advice") el.textContent = dict.capoAdvice;
        else if (text === "參考刷法" || text === "Strumming") el.textContent = dict.strumming;
    });

    // Transpose label & reset
    const ctrlLabels = document.querySelectorAll(".ctrl-label");
    ctrlLabels.forEach((el) => {
        if (el.textContent.includes("移調 Key") || el.textContent.includes("Transpose Key")) {
            el.textContent = dict.transposeLabel;
        } else if (el.textContent.includes("Capo")) {
            el.textContent = dict.capoLabel;
        } else if (el.textContent.includes("移調") || el.textContent.includes("Transpose")) {
            el.textContent = dict.floatingTranspose;
        }
    });

    const resetTrans = document.getElementById("reset-transpose");
    if (resetTrans) resetTrans.textContent = dict.reset;
    const resetFloatTrans = document.getElementById("reset-float-transpose");
    if (resetFloatTrans) resetFloatTrans.textContent = dict.reset;

    // Capo select options
    const capoSelect = document.getElementById("capo-select");
    if (capoSelect) {
        for (let i = 0; i < capoSelect.options.length; i++) {
            capoSelect.options[i].textContent = dict.capoFret(i);
        }
    }

    // Sidebar titles
    const sidebarTitle = document.querySelector(".sidebar-title span");
    if (sidebarTitle) sidebarTitle.textContent = dict.sidebarTitle;
    const sidebarSubtitle = document.querySelector(".sidebar-subtitle");
    if (sidebarSubtitle) sidebarSubtitle.textContent = dict.sidebarSubtitle;

    // Audio Player Track Buttons
    document.querySelectorAll(".track-btn").forEach((btn) => {
        const track = btn.dataset.track;
        if (track === "original") btn.textContent = dict.trackOriginal;
        else if (track === "instrumental") btn.textContent = dict.trackInstrumental;
        else if (track === "vocals") btn.textContent = dict.trackVocals;
    });

    // Speed options
    const speedSelect = document.getElementById("speed-select");
    if (speedSelect) {
        if (speedSelect.options[0]) speedSelect.options[0].textContent = dict.speedNormal;
        if (speedSelect.options[1]) speedSelect.options[1].textContent = dict.speedPractice;
        if (speedSelect.options[2]) speedSelect.options[2].textContent = dict.speedSlow;
    }

    // Modal
    const modalTitle = document.querySelector(".modal-title");
    if (modalTitle) modalTitle.textContent = dict.modalTitle;
    const songTitleLabel = document.querySelectorAll(".info-label");
    songTitleLabel.forEach((el) => {
        if (el.textContent.includes("曲目名稱") || el.textContent.includes("Song Title")) {
            el.textContent = dict.modalSongTitle;
        } else if (el.textContent.includes("本機音檔") || el.textContent.includes("Storage")) {
            el.textContent = dict.modalStorage;
        }
    });

    const optSheetTitle = document.querySelector("#opt-card-sheet .opt-title");
    if (optSheetTitle) optSheetTitle.textContent = dict.modalOptSheetOnlyTitle;
    const optSheetDesc = document.querySelector("#opt-card-sheet .opt-desc");
    if (optSheetDesc) optSheetDesc.textContent = dict.modalOptSheetOnlyDesc;

    const optAudioTitle = document.querySelector("#opt-card-audio .opt-title");
    if (optAudioTitle) optAudioTitle.textContent = dict.modalOptAudioTitle;
    const optAudioDesc = document.querySelector("#opt-card-audio .opt-desc");
    if (optAudioDesc) optAudioDesc.textContent = dict.modalOptAudioDesc;

    const btnCancelSave = document.getElementById("btn-cancel-save");
    if (btnCancelSave) btnCancelSave.textContent = dict.btnCancel;
    const btnConfirmSave = document.getElementById("btn-confirm-save");
    if (btnConfirmSave) btnConfirmSave.textContent = dict.btnConfirmSave;

    // Footer Sheet Meta Info
    const lblPitch = document.getElementById("lbl-pitch-range");
    if (lblPitch) lblPitch.textContent = dict.pitchRange;
    const lblMedian = document.getElementById("lbl-pitch-median");
    if (lblMedian) lblMedian.textContent = dict.medianPitch;
    const lblDuration = document.getElementById("lbl-duration");
    if (lblDuration) lblDuration.textContent = dict.duration;
    const lblBeats = document.getElementById("lbl-beats");
    if (lblBeats) lblBeats.textContent = dict.beats;
    const lblEnergy = document.getElementById("lbl-energy");
    if (lblEnergy) lblEnergy.textContent = dict.avgEnergy;

    // Strumming Pattern
    const strummingEl = document.getElementById("strumming-pattern");
    if (strummingEl) strummingEl.textContent = dict.strummingPatternVal;

    // Transpose demo hint
    const transDemoHintEl = document.getElementById("trans-demo-hint");
    if (transDemoHintEl) transDemoHintEl.textContent = dict.transDemoHint;

    // Language Toggle Button UI (Shows CURRENT language: EN or 中)
    updateLanguageToggleBtn();
}

function updateLanguageToggleBtn() {
    const btnToggle = document.getElementById("btn-lang-toggle");
    if (btnToggle) {
        if (currentLang === "en") {
            btnToggle.innerHTML = '<span class="gold-text" style="font-weight:700;">EN</span>';
            btnToggle.title = "點擊切換為繁體中文 (Click to switch to Chinese)";
        } else {
            btnToggle.innerHTML = '<span class="gold-text" style="font-weight:700;">中</span>';
            btnToggle.title = "Click to switch to English (切換至英文)";
        }
    }
}

// Export globally
window.I18N_ENGINE = {
    t,
    setLanguage,
    getInitialLanguage,
    getCurrentLang: () => currentLang,
    updateUI: applyTranslations
};

