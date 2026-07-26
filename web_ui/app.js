// Antigravity Guitar Studio JS Engine
// Professional Guitar Tab Sheet, Real-Time Audio Synchronizer & Interactive Chord Fingering Visualizer

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const ALIASES = { "Db": "C#", "D#": "Eb", "Gb": "F#", "G#": "Ab", "A#": "Bb" };

// Popular Guitar Chord Fingering Database (Frets per string: E A D G B E, 1-based fret numbers)
const GUITAR_CHORD_DATABASE = {
    "C": { frets: ["x", 3, 2, 0, 1, 0], baseFret: 1 },
    "C7": { frets: ["x", 3, 2, 3, 1, 0], baseFret: 1 },
    "Cmaj7": { frets: ["x", 3, 2, 0, 0, 0], baseFret: 1 },
    "C/E": { frets: [0, 3, 2, 0, 1, 0], baseFret: 1 },
    "Dm": { frets: ["x", "x", 0, 2, 3, 1], baseFret: 1 },
    "Dm7": { frets: ["x", "x", 0, 2, 1, 1], baseFret: 1 },
    "Em": { frets: [0, 2, 2, 0, 0, 0], baseFret: 1 },
    "Em7": { frets: [0, 2, 0, 0, 0, 0], baseFret: 1 },
    "E": { frets: [0, 2, 2, 1, 0, 0], baseFret: 1 },
    "E7": { frets: [0, 2, 0, 1, 0, 0], baseFret: 1 },
    "F": { frets: [1, 3, 3, 2, 1, 1], baseFret: 1 },
    "Fmaj7": { frets: ["x", 3, 3, 2, 1, 0], baseFret: 1 },
    "G": { frets: [3, 2, 0, 0, 0, 3], baseFret: 1 },
    "G7": { frets: [3, 2, 0, 0, 0, 1], baseFret: 1 },
    "Gmaj7": { frets: [3, 2, 0, 0, 0, 2], baseFret: 1 },
    "G/B": { frets: ["x", 2, 0, 0, 0, 3], baseFret: 1 },
    "Gsus4": { frets: [3, 2, 0, 0, 1, 3], baseFret: 1 },
    "Am": { frets: ["x", 0, 2, 2, 1, 0], baseFret: 1 },
    "Am7": { frets: ["x", 0, 2, 0, 1, 0], baseFret: 1 },
    "Am7/G": { frets: [3, 0, 2, 0, 1, 0], baseFret: 1 },
    "A": { frets: ["x", 0, 2, 2, 2, 0], baseFret: 1 },
    "A7": { frets: ["x", 0, 2, 0, 2, 0], baseFret: 1 },
    "Bm": { frets: ["x", 2, 4, 4, 3, 2], baseFret: 2 },
    "Bm7": { frets: ["x", 2, 4, 2, 3, 2], baseFret: 2 },
    "Bm7-5": { frets: ["x", 2, 3, 2, 3, "x"], baseFret: 1 },
    "D": { frets: ["x", "x", 0, 2, 3, 2], baseFret: 1 },
    "D7": { frets: ["x", "x", 0, 2, 1, 2], baseFret: 1 },
    "D7/F#": { frets: [2, 0, 0, 2, 1, 2], baseFret: 1 },
    "Dsus4": { frets: ["x", "x", 0, 2, 3, 3], baseFret: 1 },
    "Gm7": { frets: [3, 5, 3, 3, 3, 3], baseFret: 3 },
    "Absus4": { frets: [4, 6, 6, 6, 4, 4], baseFret: 4 },
    "Ab": { frets: [4, 6, 6, 5, 4, 4], baseFret: 4 },
    "C#": { frets: ["x", 4, 6, 6, 6, 4], baseFret: 4 },
    "Fm": { frets: [1, 3, 3, 1, 1, 1], baseFret: 1 },
    "Bbm": { frets: ["x", 1, 3, 3, 2, 1], baseFret: 1 }
};

// Scale Degrees for Jianpu Mode
const JIANPU_DEGREE_MAP = ["1", "1#", "2", "2#", "3", "4", "4#", "5", "5#", "6", "6#", "7"];

// Global App State
let activeData = null;
let currentTranspose = 0;
let currentCapo = 0;
let isAudioPlaying = false;
let currentTrackType = "original";
let currentDisplayMode = "chord"; // "chord" or "jianpu"
let currentEditMode = "view"; // "view" or "edit"
let currentPresetFolder = "web_analysis";

// DOM Elements
let audioElement = null;
let scrubberElement = null;


document.addEventListener("DOMContentLoaded", async () => {
    initUI();
    initAudioPlayer();
    await loadPresetList();
    renderEmptyState();
});


// --- Initialize UI Bindings ---
function initUI() {
    // Capo Selector
    const capoSelect = document.getElementById("capo-select");
    if (capoSelect) {
        capoSelect.addEventListener("change", (e) => {
            currentCapo = parseInt(e.target.value);
            renderGuitarSheet();
            renderGuitarChordSidebar();
        });
    }

    // Mode Switchers: Chord vs Jianpu
    const btnChord = document.getElementById("btn-mode-chord");
    const btnJianpu = document.getElementById("btn-mode-jianpu");

    if (btnChord) {
        btnChord.addEventListener("click", () => {
            currentDisplayMode = "chord";
            btnChord.classList.add("active");
            if (btnJianpu) btnJianpu.classList.remove("active");
            renderGuitarSheet();
        });
    }

    if (btnJianpu) {
        btnJianpu.addEventListener("click", () => {
            currentDisplayMode = "jianpu";
            if (btnJianpu) btnJianpu.classList.add("active");
            if (btnChord) btnChord.classList.remove("active");
            renderGuitarSheet();
        });
    }

    // Edit Mode Switchers: View vs Edit
    const btnView = document.getElementById("btn-mode-view");
    const btnEdit = document.getElementById("btn-mode-edit");

    if (btnView) {
        btnView.addEventListener("click", () => {
            currentEditMode = "view";
            document.body.classList.remove("edit-mode");
            btnView.classList.add("active");
            if (btnEdit) btnEdit.classList.remove("active");
            const songTitleEl = document.getElementById("song-title");
            if (songTitleEl) {
                songTitleEl.contentEditable = false;
                songTitleEl.title = "安全瀏覽模式 (切換至編輯模式即可修改歌名)";
            }
            renderGuitarSheet();
        });
    }

    if (btnEdit) {
        btnEdit.addEventListener("click", () => {
            currentEditMode = "edit";
            document.body.classList.add("edit-mode");
            if (btnEdit) btnEdit.classList.add("active");
            if (btnView) btnView.classList.remove("active");
            const songTitleEl = document.getElementById("song-title");
            if (songTitleEl) {
                songTitleEl.contentEditable = true;
                songTitleEl.title = "點擊即可直接修改歌名";
            }
            renderGuitarSheet();
        });
    }


    // Preset Selector
    const presetSelect = document.getElementById("preset-select");
    if (presetSelect) {
        presetSelect.addEventListener("change", (e) => {
            if (e.target.value) {
                loadLatestAnalysis(e.target.value);
            } else {
                renderEmptyState();
            }
        });
    }


    // Transpose Buttons
    const btnDec = document.getElementById("btn-dec");
    const btnInc = document.getElementById("btn-inc");
    const btnReset = document.getElementById("reset-transpose");

    if (btnDec) btnDec.addEventListener("click", () => updateTranspose(currentTranspose - 1));
    if (btnInc) btnInc.addEventListener("click", () => updateTranspose(currentTranspose + 1));
    if (btnReset) btnReset.addEventListener("click", () => updateTranspose(0));

    // Floating Transpose Buttons
    const btnFloatDec = document.getElementById("btn-float-dec");
    const btnFloatInc = document.getElementById("btn-float-inc");
    const btnFloatReset = document.getElementById("reset-float-transpose");

    if (btnFloatDec) btnFloatDec.addEventListener("click", () => updateTranspose(currentTranspose - 1));
    if (btnFloatInc) btnFloatInc.addEventListener("click", () => updateTranspose(currentTranspose + 1));
    if (btnFloatReset) btnFloatReset.addEventListener("click", () => updateTranspose(0));

    initFloatingTransposeObserver();

    // Song Title Edit Listener
    const songTitleEl = document.getElementById("song-title");
    if (songTitleEl) {
        songTitleEl.addEventListener("blur", () => {
            if (activeData) {
                activeData.title = songTitleEl.textContent.trim();
            }
        });
    }

    // YouTube URL Analyze Trigger
    const btnAnalyze = document.getElementById("btn-start-analyze");
    if (btnAnalyze) btnAnalyze.addEventListener("click", handleYTAnalyze);

    // Save, Export & Delete Buttons
    const btnSave = document.getElementById("btn-save-analysis");
    if (btnSave) btnSave.addEventListener("click", handleSaveAnalysis);

    const btnExport = document.getElementById("btn-export-json");
    if (btnExport) btnExport.addEventListener("click", handleExportJSON);

    const btnDeletePreset = document.getElementById("btn-delete-preset");
    if (btnDeletePreset) btnDeletePreset.addEventListener("click", handleDeletePreset);

    initSaveModal();
}

function updateDeleteButtonVisibility() {
    const btnDeletePreset = document.getElementById("btn-delete-preset");
    if (!btnDeletePreset) return;

    if (currentPresetFolder && currentPresetFolder.startsWith("saved_songs/")) {
        btnDeletePreset.style.display = "inline-flex";
    } else {
        btnDeletePreset.style.display = "none";
    }
}

async function handleDeletePreset() {
    if (!currentPresetFolder || !currentPresetFolder.startsWith("saved_songs/")) return;

    const songTitle = activeData ? (activeData.title || "此樂譜") : "此樂譜";
    if (!confirm(`⚠️ 確定要刪除已儲存的樂譜與相關音檔 [${songTitle}] 嗎？\n刪除後檔案將無法復原。`)) {
        return;
    }

    try {
        const res = await fetch("/api/delete-preset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder: currentPresetFolder })
        });

        const body = await res.json();
        if (body.status === "ok") {
            alert(`🗑️ 已成功刪除樂譜檔案 [${songTitle}]！`);
            await loadPresetList();
            await loadLatestAnalysis("web_analysis");
        } else {
            alert("刪除失敗: " + body.error);
        }
    } catch (err) {
        alert("刪除失敗: " + err.message);
    }
}


function initSaveModal() {
    const modal = document.getElementById("save-modal");
    const btnClose = document.getElementById("btn-close-save-modal");
    const btnCancel = document.getElementById("btn-cancel-save");
    const btnConfirm = document.getElementById("btn-confirm-save");

    const optSheet = document.getElementById("opt-card-sheet");
    const optAudio = document.getElementById("opt-card-audio");

    if (optSheet && optAudio) {
        optSheet.addEventListener("click", () => {
            optSheet.classList.add("active");
            optAudio.classList.remove("active");
            const radio = optSheet.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            
            const transContainer = document.getElementById("trans-select-container");
            if (transContainer) transContainer.style.display = "none";
        });
        optAudio.addEventListener("click", () => {
            optAudio.classList.add("active");
            optSheet.classList.remove("active");
            const radio = optAudio.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            
            const transContainer = document.getElementById("trans-select-container");
            const transGrid = document.getElementById("trans-checkboxes-grid");
            if (transContainer && transGrid && transGrid.children.length > 0) {
                transContainer.style.display = "block";
            }
        });
    }

    if (btnClose) btnClose.addEventListener("click", () => { if (modal) modal.style.display = "none"; });
    if (btnCancel) btnCancel.addEventListener("click", () => { if (modal) modal.style.display = "none"; });

    if (btnConfirm) {
        btnConfirm.addEventListener("click", async () => {
            if (!activeData) return;
            const songTitleEl = document.getElementById("song-title");
            if (songTitleEl) activeData.title = songTitleEl.textContent.trim();

            const saveAudioChoice = document.querySelector('input[name="save-audio-choice"]:checked')?.value === "true";
            
            // Collect checked transpositions
            const keepTranspositions = [];
            if (saveAudioChoice) {
                document.querySelectorAll(".trans-choice-cb:checked").forEach(cb => {
                    keepTranspositions.push(parseInt(cb.value));
                });
            }

            btnConfirm.disabled = true;
            btnConfirm.textContent = "儲存中...";

            try {
                const response = await fetch("/api/save-analysis", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        data: activeData, 
                        save_audio: saveAudioChoice,
                        current_folder: currentPresetFolder,
                        keep_transpositions: saveAudioChoice ? keepTranspositions : []
                    })
                });

                const resData = await response.json();
                if (resData.status === "ok") {
                    if (resData.folder) {
                        await loadPresetList();
                        const presetSelect = document.getElementById("preset-select");
                        if (presetSelect) presetSelect.value = resData.folder;
                        currentPresetFolder = resData.folder;
                    }
                    if (!saveAudioChoice && resData.freed_mb !== undefined) {
                        alert(`✅ 吉他譜已成功儲存至曲庫 [${activeData.title}]！已爲您清理釋放 ${resData.freed_mb} MB 本機音檔空間。`);
                    } else if (resData.freed_mb !== undefined && resData.freed_mb > 0) {
                        alert(`✅ 吉他譜與所選音檔已儲存至曲庫 [${activeData.title}]！已爲您清理未選取的變調快取，釋放了 ${resData.freed_mb} MB 空間。`);
                    } else {
                        alert(`✅ 吉他譜與完整離線音檔已成功儲存至曲庫 [${activeData.title}]！`);
                    }
                    if (modal) modal.style.display = "none";
                } else {
                    alert("儲存失敗: " + resData.error);
                }
            } catch (err) {
                alert("儲存失敗: " + err.message);
            } finally {
                btnConfirm.disabled = false;
                btnConfirm.textContent = "確認儲存";
            }
        });
    }
}

// --- Save & Export Handlers ---
async function handleSaveAnalysis() {
    if (!activeData) return;

    const modal = document.getElementById("save-modal");
    const songTitleEl = document.getElementById("song-title");
    const modalTitleEl = document.getElementById("modal-song-title");
    const modalSizeEl = document.getElementById("modal-audio-size");

    const transContainer = document.getElementById("trans-select-container");
    const transGrid = document.getElementById("trans-checkboxes-grid");
    if (transContainer) transContainer.style.display = "none";
    if (transGrid) transGrid.innerHTML = "";

    if (songTitleEl && modalTitleEl) {
        modalTitleEl.textContent = songTitleEl.textContent.trim();
    }

    try {
        const sizeRes = await fetch(`/api/audio-size?folder=${encodeURIComponent(currentPresetFolder || "web_analysis")}`);
        if (sizeRes.ok) {
            const sizeData = await sizeRes.json();
            if (modalSizeEl && sizeData.total_mb !== undefined) {
                modalSizeEl.textContent = `${sizeData.total_mb} MB (${sizeData.file_count || 0} 個音軌檔案)`;
            }
            
            const transList = sizeData.transpositions || [];
            if (transGrid && transContainer && transList.length > 0) {
                transGrid.innerHTML = transList.map(t => {
                    const label = t > 0 ? `+${t}` : t;
                    return `
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; cursor: pointer; color: var(--text-muted);">
                            <input type="checkbox" class="trans-choice-cb" value="${t}" checked style="accent-color: var(--accent-gold);" />
                            <span>${label} 半音</span>
                        </label>
                    `;
                }).join("");
                
                const saveAudioChoice = document.querySelector('input[name="save-audio-choice"]:checked')?.value === "true";
                if (saveAudioChoice) {
                    transContainer.style.display = "block";
                }
            }
        }
    } catch (e) {
        console.warn("Unable to fetch audio size:", e);
    }

    if (modal) modal.style.display = "flex";
}




// --- Initialize HTML5 Audio Player ---
function initAudioPlayer() {
    audioElement = document.getElementById("main-audio-player");
    scrubberElement = document.getElementById("player-scrubber");
    const playBtn = document.getElementById("btn-simulate-play");

    if (!audioElement) return;

    audioElement.crossOrigin = "anonymous";
    audioElement.src = "/api/audio?track=original";

    // Play / Pause Toggle
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (audioElement.paused) {
                audioElement.play().then(() => {
                    setPlayState(true);
                }).catch(e => console.error("Audio play blocked:", e));
            } else {
                audioElement.pause();
                setPlayState(false);
            }
        });
    }

    // Timeupdate event for Scrubber & Lyric Highlighting
    audioElement.addEventListener("timeupdate", () => {
        const curr = audioElement.currentTime;
        const dur = audioElement.duration || 1;

        if (scrubberElement) scrubberElement.value = (curr / dur) * 100;

        const timeDisplay = document.getElementById("playback-time");
        if (timeDisplay) timeDisplay.textContent = formatTimeSeconds(curr);

        const totalDisplay = document.getElementById("total-time-display");
        if (totalDisplay && !isNaN(dur)) totalDisplay.textContent = formatTimeSeconds(dur);

        highlightCurrentPlayingLine(curr);
    });

    // Scrubber drag event
    if (scrubberElement) {
        scrubberElement.addEventListener("input", (e) => {
            const pct = parseFloat(e.target.value);
            if (audioElement.duration) {
                audioElement.currentTime = (pct / 100) * audioElement.duration;
            }
        });
    }



    // Track Type Switcher (Original / Instrumental / Vocals)
    const trackBtns = document.querySelectorAll(".track-btn");
    trackBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            trackBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentTrackType = btn.dataset.track;
            applyAudioPitchShift();
        });
    });

    // Speed Control (1.0x, 0.8x, 0.6x)
    const speedSelect = document.getElementById("speed-select");
    if (speedSelect) {
        speedSelect.addEventListener("change", (e) => {
            applyAudioPitchShift();
        });
    }

    // Show spinner during server-side pitch shifting
    audioElement.addEventListener("loadstart", () => {
        const urlParams = new URLSearchParams(audioElement.src.split('?')[1] || '');
        const transVal = parseInt(urlParams.get("transpose") || "0");
        if (transVal !== 0) {
            const statusEl = document.getElementById("yt-status-bar");
            const statusTextEl = document.getElementById("yt-status-text");
            if (statusEl && statusTextEl) {
                statusTextEl.textContent = `正在生成高品質即時變調 (${transVal > 0 ? "+" : ""}${transVal} 半音) 音訊，首次處理約需 3~8 秒，請稍候...`;
                statusEl.style.display = "flex";
            }
        }
    });

    audioElement.addEventListener("canplay", () => {
        const statusEl = document.getElementById("yt-status-bar");
        if (statusEl) {
            statusEl.style.display = "none";
        }
    });

    audioElement.addEventListener("error", () => {
        const statusEl = document.getElementById("yt-status-bar");
        if (statusEl) {
            statusEl.style.display = "none";
        }
    });
}

// --- Apply Real-Time Audio Pitch Shift on Transpose ---
function applyAudioPitchShift() {
    if (!audioElement) return;

    try {
        const speedRate = parseFloat(document.getElementById("speed-select")?.value || 1.0);

        // 1. Maintain natural pitch via browser time-stretching for playback speed
        if (typeof audioElement.preservesPitch !== "undefined") {
            audioElement.preservesPitch = true;
        } else if (typeof audioElement.mozPreservesPitch !== "undefined") {
            audioElement.mozPreservesPitch = true;
        } else if (typeof audioElement.webkitPreservesPitch !== "undefined") {
            audioElement.webkitPreservesPitch = true;
        }
        audioElement.playbackRate = speedRate;

        // 2. Perform high-fidelity pitch shifting using Server-Side cached DSP
        updateAudioSource();
    } catch (e) {
        console.warn("Browser audio pitch shift API warning:", e);
    }
}

function updateAudioSource() {
    if (!audioElement) return;

    const wasPlaying = !audioElement.paused;
    const savedTime = audioElement.currentTime;
    
    // Construct the new source URL with transpose
    const newSrc = `/api/audio?track=${currentTrackType}&folder=${encodeURIComponent(currentPresetFolder || "web_analysis")}&transpose=${currentTranspose}`;
    
    // Check if the source is actually different (to avoid unnecessary reloads)
    const currentUrl = new URL(audioElement.src, window.location.origin);
    const targetUrl = new URL(newSrc, window.location.origin);
    
    if (currentUrl.search !== targetUrl.search || currentUrl.pathname !== targetUrl.pathname) {
        audioElement.src = newSrc;
        
        // Restore time and playback state once metadata is loaded
        audioElement.addEventListener("loadedmetadata", function onLoaded() {
            audioElement.currentTime = savedTime;
            audioElement.removeEventListener("loadedmetadata", onLoaded);
            if (wasPlaying) {
                audioElement.play().catch(e => console.warn("Restore playback blocked:", e));
            }
        });
    }
}

function setPlayState(playing) {
    isAudioPlaying = playing;
    const playSvg = document.getElementById("play-svg");
    const pauseSvg = document.getElementById("pause-svg");

    if (playing) {
        if (playSvg) playSvg.style.display = "none";
        if (pauseSvg) pauseSvg.style.display = "block";
    } else {
        if (playSvg) playSvg.style.display = "block";
        if (pauseSvg) pauseSvg.style.display = "none";
    }
}

// --- Load Latest or Selected Preset Analysis Data ---
async function loadPresetList() {
    const presetSelect = document.getElementById("preset-select");
    if (!presetSelect) return;

    const currentValue = presetSelect.value;

    try {
        const res = await fetch("/api/presets", { cache: "no-store" });
        if (res.ok) {
            const body = await res.json();
            if (body.status === "ok" && body.presets) {
                presetSelect.innerHTML = `<option value="">📁 選擇歷史樂譜存檔...</option>`;
                body.presets.forEach(p => {
                    const opt = document.createElement("option");
                    opt.value = p.folder;
                    opt.textContent = `${p.title} (${p.key || "未知調性"})`;
                    presetSelect.appendChild(opt);
                });

                if (currentValue && presetSelect.querySelector(`option[value="${CSS.escape(currentValue)}"]`)) {
                    presetSelect.value = currentValue;
                } else if (activeData && currentPresetFolder) {
                    presetSelect.value = currentPresetFolder;
                } else {
                    presetSelect.value = "";
                }
            }
        }
    } catch (e) {
        console.warn("Unable to load preset list from server:", e);
    }
}

async function loadLatestAnalysis(presetFolder = null) {
    currentPresetFolder = presetFolder || "web_analysis";
    let fetchedData = null;
    try {
        const url = presetFolder ? `/api/preset?folder=${encodeURIComponent(presetFolder)}` : "/api/latest-analysis";
        const res = await fetch(url);
        if (res.ok) {
            const body = await res.json();
            if (body.status === "ok" && body.data) {
                fetchedData = body.data;
            }
        }
    } catch (e) {
        console.warn("Unable to fetch analysis data, using fallbacks.", e);
    }

    if (fetchedData) {
        activeData = fetchedData;
    } else {
        activeData = getEmbeddedFallback();
    }

    if (audioElement) {
        audioElement.src = `/api/audio?track=${currentTrackType}&folder=${encodeURIComponent(currentPresetFolder)}`;
    }

    currentTranspose = 0;
    updateTranspose(0);
    renderDashboard();
    updateDeleteButtonVisibility();
}



// --- Helper: Ensure Every Song Has Renderable Aligned Lyrics (Fallback for Raw Runs) ---
function getEffectiveAlignedLyrics(data) {
    if (!data) return [];
    if (data.aligned_lyrics && data.aligned_lyrics.length > 0) {
        return data.aligned_lyrics;
    }

    // Fallback for instrumental or raw runs: Chunk chord_timeline into 4-chord lines
    const timeline = data.chord_timeline || [];
    if (timeline.length === 0) return [];

    const generated = [];
    const chunkSize = 4;
    for (let i = 0; i < timeline.length; i += chunkSize) {
        const chunk = timeline.slice(i, i + chunkSize);
        const start = chunk[0].start;
        const end = chunk[chunk.length - 1].end;
        generated.push({
            start: start,
            end: end,
            text: `[和弦演奏小節 ${Math.floor(i / chunkSize) + 1}] (${formatTimeSeconds(start)} ~ ${formatTimeSeconds(end)})`,
            chords: chunk.map(c => ({
                chord: c.chord,
                candidates: c.candidates || [{ chord: c.chord, score: c.score || 0.9 }]
            }))
        });
    }
    data.aligned_lyrics = generated;
    return generated;
}


// --- Transpose Handler ---
function updateTranspose(newTranspose) {
    currentTranspose = Math.max(-6, Math.min(6, newTranspose));
    const display = document.getElementById("semitone-display");
    if (display) display.textContent = (currentTranspose >= 0 ? "+" : "") + currentTranspose;

    const floatDisplay = document.getElementById("float-semitone-display");
    if (floatDisplay) floatDisplay.textContent = (currentTranspose >= 0 ? "+" : "") + currentTranspose;

    // Apply Real-time Pitch Shift to Audio Player!
    applyAudioPitchShift();

    if (activeData) {
        const origKeyName = activeData.estimated_key ? activeData.estimated_key.name : "G major";
        const transKeyName = transposeKey(origKeyName, currentTranspose);
        const transKeyEl = document.getElementById("trans-key");
        if (transKeyEl) transKeyEl.textContent = transKeyName;

        // Update Smart Capo Recommendation
        updateCapoRecommendation(transKeyName);

        renderGuitarSheet();
        renderGuitarChordSidebar();
    }
}

// // --- Smart Capo Recommendation Engine ---
function updateCapoRecommendation(keyName) {
    const capoEl = document.getElementById("capo-recommendation");
    const noteEl = document.getElementById("capo-friendly-note");

    const rootKey = (keyName || "G major").split(" ")[0];
    const normalizedRoot = ALIASES[rootKey] || rootKey;

    const capoMap = {
        "G": "建議 Capo 0 夾 (依 G 大調彈奏)",
        "Ab": "建議 Capo 1 夾 (依 G 大調彈奏)",
        "A": "建議 Capo 2 夾 (依 G 大調彈奏)",
        "Bb": "建議 Capo 3 夾 (依 G 大調彈奏)",
        "B": "建議 Capo 4 夾 (依 G 大調彈奏)",
        "C": "建議 Capo 0 夾 (依 C 大調彈奏)",
        "Db": "建議 Capo 1 夾 (依 C 大調彈奏)",
        "D": "建議 Capo 2 夾 (依 C 大調彈奏)",
        "Eb": "建議 Capo 3 夾 (依 C 大調彈奏)",
        "E": "建議 Capo 0 夾 (依 E 大調彈奏)",
        "F": "建議 Capo 1 夾 (依 E 大調彈奏)",
        "F#": "建議 Capo 2 夾 (依 E 大調彈奏)"
    };

    const text = capoMap[normalizedRoot] || "建議 Capo 0 夾 (依 G 大調彈奏)";
    if (capoEl) capoEl.textContent = text;
    if (noteEl) noteEl.textContent = text;
}


// --- Render Main Dashboard ---
function renderDashboard() {
    if (!activeData) return;

    const songTitleEl = document.getElementById("song-title");
    if (songTitleEl) {
        songTitleEl.textContent = activeData.title || "未知曲目";
        songTitleEl.contentEditable = (currentEditMode === "edit");
        songTitleEl.title = (currentEditMode === "edit") ? "點擊即可直接修改歌名" : "安全瀏覽模式 (切換至編輯模式即可修改歌名)";
    }

    const origKeyName = activeData.estimated_key ? activeData.estimated_key.name : "G major";

    document.getElementById("orig-key").textContent = origKeyName;
    const transKeyName = transposeKey(origKeyName, currentTranspose);
    document.getElementById("trans-key").textContent = transKeyName;
    document.getElementById("song-tempo").textContent = Math.round(activeData.tempo_bpm || 70);

    updateCapoRecommendation(transKeyName);

    // Debug footer values
    document.getElementById("song-duration").textContent = formatDuration(activeData.duration_seconds || 0);
    document.getElementById("song-beats").textContent = activeData.beat_count || 0;
    if (activeData.pitch_range) {
        document.getElementById("pitch-low").textContent = activeData.pitch_range.low || "-";
        document.getElementById("pitch-median").textContent = activeData.pitch_range.median || "-";
        document.getElementById("pitch-high").textContent = activeData.pitch_range.high || "-";
    }
    if (activeData.energy) {
        document.getElementById("energy-val").textContent = (activeData.energy.mean || 0).toFixed(4);
    }

    renderGuitarSheet();
    renderGuitarChordSidebar();
}

// --- Helper: Ensure Item Has Fixed Measure Containers ---
function ensureLineMeasures(item) {
    if (item.measures && item.measures.length > 0) return item.measures;

    const chords = item.chords || [];
    const measures = [];
    for (let i = 0; i < chords.length; i += 2) {
        measures.push({
            chords: chords.slice(i, i + 2)
        });
    }
    if (measures.length === 0) {
        measures.push({ chords: [{ chord: "G", candidates: [{ chord: "G", score: 0.9 }] }] });
    }
    item.measures = measures;
    return measures;
}

// --- Render Professional Guitar Sheet Line-by-Line ---
function renderGuitarSheet() {
    const container = document.getElementById("lyrics-timeline-container");
    if (!container) return;
    container.innerHTML = "";

    const aligned = getEffectiveAlignedLyrics(activeData);
    if (aligned.length === 0) {

        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">無可用的歌詞與和弦對齊數據</div>`;
        return;
    }

    const currentKeyName = activeData.estimated_key ? activeData.estimated_key.name : "G major";
    const playTranspose = currentTranspose - currentCapo;

    let currentSectionBlock = document.createElement("div");
    currentSectionBlock.className = "sheet-section-block";
    let lastSectionLabel = "";

    aligned.forEach((item, idx) => {
        let sectionLabel = "";
        if (idx === 0) sectionLabel = "[主歌 A]";
        else if (idx === 8) sectionLabel = "[主歌 B / 導歌]";
        else if (idx === 16) sectionLabel = "[副歌]";
        else if (idx === 24) sectionLabel = "[間奏 / 尾奏]";

        if (sectionLabel && sectionLabel !== lastSectionLabel) {
            lastSectionLabel = sectionLabel;
            const secHeader = document.createElement("div");
            secHeader.className = "section-label-header";
            secHeader.textContent = sectionLabel;
            currentSectionBlock.appendChild(secHeader);
        }

        const lineCard = document.createElement("div");
        lineCard.className = "guitar-sheet-line";
        lineCard.dataset.index = idx;
        lineCard.dataset.start = item.start;
        lineCard.dataset.end = item.end;

        const measures = ensureLineMeasures(item);
        let chordRowHTML = "";

        measures.forEach((meas, bIdx) => {
            const mChords = meas.chords || [];
            let measHTML = `<div class="sheet-bar-measure"><span class="sheet-bar-pipe">|</span>`;

            if (mChords.length === 0) {
                measHTML += `<button class="btn-insert-before" data-idx="${idx}" data-bidx="${bIdx}" data-cidx="0" title="在小節內新增和弦">+</button>`;
                measHTML += `<div class="sheet-chord-item"><span class="chord-name-tag">-</span></div>`;
            } else {
                mChords.forEach((c, cIdx) => {
                    const transposed = transposeChord(c.chord, playTranspose);
                    const displayLabel = (currentDisplayMode === "jianpu") ? chordToJianpu(transposed, currentKeyName) : transposed;

                    const candidates = c.candidates || [];
                    const candChipsHTML = candidates.map(cand => {
                        const transCand = transposeChord(cand.chord, playTranspose);
                        const candDisplay = (currentDisplayMode === "jianpu") ? chordToJianpu(transCand, currentKeyName) : transCand;
                        return `<button class="btn-cand-chip" data-idx="${idx}" data-bidx="${bIdx}" data-cidx="${cIdx}" data-chord="${cand.chord}" title="相似度: ${cand.score}">${candDisplay}</button>`;
                    }).join("");

                    measHTML += `<button class="btn-insert-before" data-idx="${idx}" data-bidx="${bIdx}" data-cidx="${cIdx}" title="在小節內前置插入和弦">+</button>`;

                    measHTML += `
                        <div class="sheet-chord-item">
                            <button class="btn-delete-chord" data-idx="${idx}" data-bidx="${bIdx}" data-cidx="${cIdx}" title="刪除此和弦">✕</button>
                            <span class="chord-name-tag" contenteditable="${currentEditMode === 'edit'}" data-idx="${idx}" data-bidx="${bIdx}" data-cidx="${cIdx}">${displayLabel}</span>
                            ${(currentEditMode === 'edit' && candChipsHTML) ? `<div class="cand-popup">${candChipsHTML}</div>` : ""}
                        </div>
                    `;
                });
            }

            measHTML += `</div>`;
            chordRowHTML += measHTML;
        });

        chordRowHTML += `<span class="sheet-bar-pipe">|</span>`;
        chordRowHTML += `<button class="btn-add-measure" data-idx="${idx}" title="在後方新增一個獨立小節">+ 小節</button>`;

        lineCard.innerHTML = `
            <div class="sheet-chords-row">${chordRowHTML}</div>
            <div class="sheet-lyric-row">
                <span class="lyric-text" contenteditable="${currentEditMode === 'edit'}" data-idx="${idx}">${item.text}</span>
                <span class="line-timestamp">(${formatTimeSeconds(item.start)})</span>
            </div>
        `;

        // Edit Mode: Insert Chord Inside Measure Handler
        lineCard.querySelectorAll(".btn-insert-before").forEach(insBtn => {
            insBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const lineIdx = parseInt(insBtn.dataset.idx);
                const bIdx = parseInt(insBtn.dataset.bidx);
                const cIdx = parseInt(insBtn.dataset.cidx);
                if (activeData.aligned_lyrics[lineIdx]) {
                    const meas = ensureLineMeasures(activeData.aligned_lyrics[lineIdx])[bIdx];
                    if (meas) {
                        meas.chords.splice(cIdx, 0, { chord: "G", candidates: [{ chord: "G", score: 0.9 }] });
                        renderGuitarSheet();
                        renderGuitarChordSidebar();
                    }
                }
            });
        });

        // Edit Mode: Delete Chord Handler
        lineCard.querySelectorAll(".btn-delete-chord").forEach(delBtn => {
            delBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const lineIdx = parseInt(delBtn.dataset.idx);
                const bIdx = parseInt(delBtn.dataset.bidx);
                const cIdx = parseInt(delBtn.dataset.cidx);
                if (activeData.aligned_lyrics[lineIdx]) {
                    const meas = ensureLineMeasures(activeData.aligned_lyrics[lineIdx])[bIdx];
                    if (meas && meas.chords) {
                        meas.chords.splice(cIdx, 1);
                        renderGuitarSheet();
                        renderGuitarChordSidebar();
                    }
                }
            });
        });

        // Edit Mode: Add New Measure Handler
        const addMeasBtn = lineCard.querySelector(".btn-add-measure");
        if (addMeasBtn) {
            addMeasBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const lineIdx = parseInt(addMeasBtn.dataset.idx);
                if (activeData.aligned_lyrics[lineIdx]) {
                    const meases = ensureLineMeasures(activeData.aligned_lyrics[lineIdx]);
                    meases.push({ chords: [{ chord: "G", candidates: [{ chord: "G", score: 0.9 }] }] });
                    renderGuitarSheet();
                    renderGuitarChordSidebar();
                }
            });
        }

        // Candidate Chip Clicks
        lineCard.querySelectorAll(".btn-cand-chip").forEach(chip => {
            chip.addEventListener("click", (e) => {
                e.stopPropagation();
                const selectedChord = chip.dataset.chord;
                const lineIdx = parseInt(chip.dataset.idx);
                const bIdx = parseInt(chip.dataset.bidx);
                const cIdx = parseInt(chip.dataset.cidx);
                if (activeData.aligned_lyrics[lineIdx]) {
                    const meas = ensureLineMeasures(activeData.aligned_lyrics[lineIdx])[bIdx];
                    if (meas && meas.chords[cIdx]) {
                        meas.chords[cIdx].chord = selectedChord;
                        renderGuitarSheet();
                        renderGuitarChordSidebar();
                    }
                }
            });
        });

        // Lyric Edits
        const lyricEl = lineCard.querySelector(".lyric-text");
        if (lyricEl) {
            lyricEl.addEventListener("blur", () => {
                const newText = lyricEl.textContent.trim();
                activeData.aligned_lyrics[idx].text = newText;
            });
        }

        // Chord Manual Edits
        lineCard.querySelectorAll(".chord-name-tag").forEach(tagEl => {
            tagEl.addEventListener("blur", () => {
                const newChord = tagEl.textContent.trim();
                const lineIdx = parseInt(tagEl.dataset.idx);
                const bIdx = parseInt(tagEl.dataset.bidx);
                const cIdx = parseInt(tagEl.dataset.cidx);
                if (activeData.aligned_lyrics[lineIdx]) {
                    const meas = ensureLineMeasures(activeData.aligned_lyrics[lineIdx])[bIdx];
                    if (meas && meas.chords[cIdx]) {
                        const origChord = transposeChord(newChord, -playTranspose);
                        meas.chords[cIdx].chord = origChord;
                        renderGuitarChordSidebar();
                    }
                }
            });
        });

        // Click line to jump audio player position
        lineCard.addEventListener("click", (e) => {
            if (e.target.closest("button") || e.target.closest(".chord-name-tag") || e.target.closest(".lyric-text")) {
                return;
            }
            if (audioElement && item.start !== undefined) {
                audioElement.currentTime = item.start;
                audioElement.play();
                setPlayState(true);
            }
        });

        currentSectionBlock.appendChild(lineCard);
    });

    container.appendChild(currentSectionBlock);
}

// --- Chord to Jianpu / Scale Degree Converter ---
function chordToJianpu(chordStr, keyName) {

    if (!chordStr || chordStr === "-") return chordStr;

    const rootKey = (keyName || "G major").split(" ")[0];
    const keyRoot = ALIASES[rootKey] || rootKey;
    const keyIdx = NOTE_NAMES.indexOf(keyRoot);
    if (keyIdx === -1) return chordStr;

    const parts = chordStr.split("/");
    const mainJianpu = singleChordToJianpu(parts[0], keyIdx);
    if (parts.length > 1) {
        const bassJianpu = singleChordToJianpu(parts[1], keyIdx);
        return `${mainJianpu}/${bassJianpu}`;
    }
    return mainJianpu;
}

function singleChordToJianpu(chord, keyIdx) {
    if (!chord) return "";
    let root = "";
    let quality = "";

    if (chord.length >= 2 && (chord[1] === "#" || chord[1] === "b")) {
        root = chord.substring(0, 2);
        quality = chord.substring(2);
    } else {
        root = chord.substring(0, 1);
        quality = chord.substring(1);
    }

    if (ALIASES[root]) root = ALIASES[root];
    const rootIdx = NOTE_NAMES.indexOf(root);
    if (rootIdx === -1) return chord;

    let degreeDiff = (rootIdx - keyIdx + 12) % 12;
    const degreeName = JIANPU_DEGREE_MAP[degreeDiff];

    return degreeName + quality;
}

// --- Highlight Active Playing Line in Real Time ---
function highlightCurrentPlayingLine(currentTime) {
    const lines = document.querySelectorAll(".guitar-sheet-line");
    let activeLine = null;

    lines.forEach(line => {
        const start = parseFloat(line.dataset.start);
        const end = parseFloat(line.dataset.end);

        if (currentTime >= start && currentTime <= end) {
            line.classList.add("active-playing");
            activeLine = line;
        } else {
            line.classList.remove("active-playing");
        }
    });

    if (activeLine && isAudioPlaying) {
        activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

// --- Render Right Sidebar Guitar Chord Fingering Charts (SVG) ---
function renderGuitarChordSidebar() {
    const container = document.getElementById("chord-diagrams-container");
    if (!container) return;
    container.innerHTML = "";

    const playTranspose = currentTranspose - currentCapo;
    const allChords = new Set();
    (activeData.aligned_lyrics || []).forEach(item => {
        (item.chords || []).forEach(c => {
            if (c.chord) {
                const transposed = transposeChord(c.chord, playTranspose);
                allChords.add(transposed);
            }
        });
    });


    if (allChords.size === 0) {
        allChords.add("G"); allChords.add("D/F#"); allChords.add("Em"); allChords.add("Bm"); allChords.add("C"); allChords.add("Am"); allChords.add("D");
    }

    allChords.forEach(chordName => {
        const chordCard = document.createElement("div");
        chordCard.className = "guitar-chord-card";
        chordCard.innerHTML = `
            <div class="chord-card-title">${chordName}</div>
            ${generateGuitarChordSVG(chordName)}
        `;
        container.appendChild(chordCard);
    });
}

// --- SVG Guitar Chord Diagram Generator ---
function generateGuitarChordSVG(chordName) {
    const baseChord = transposeChord(chordName, -currentTranspose);
    const chordInfo = GUITAR_CHORD_DATABASE[chordName] || GUITAR_CHORD_DATABASE[baseChord] || { frets: ["x", 0, 2, 2, 1, 0], baseFret: 1 };

    const frets = chordInfo.frets;
    const baseFret = chordInfo.baseFret || 1;

    const width = 80;
    const height = 100;

    let svg = `<svg class="fretboard-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    const startX = 15;
    const endX = 65;
    const startY = 22;
    const endY = 85;
    const stringSpacing = (endX - startX) / 5;
    const fretSpacing = (endY - startY) / 4;

    if (baseFret === 1) {
        svg += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${startY}" stroke="#c4a475" stroke-width="4" />`;
    } else {
        svg += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${startY}" stroke="#8c95a4" stroke-width="2" />`;
        svg += `<text x="4" y="${startY + 12}" fill="#c4a475" font-size="10" font-weight="bold">${baseFret}fr</text>`;
    }

    for (let f = 1; f <= 4; f++) {
        const y = startY + f * fretSpacing;
        svg += `<line x1="${startX}" y1="${y}" x2="${endX}" y2="${y}" stroke="#323a48" stroke-width="1.2" />`;
    }

    for (let s = 0; s < 6; s++) {
        const x = startX + s * stringSpacing;
        svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${endY}" stroke="#505a6b" stroke-width="1.2" />`;

        const fretVal = frets[s];
        if (fretVal === "x") {
            svg += `<text x="${x}" y="14" fill="#8c95a4" font-size="11" text-anchor="middle">×</text>`;
        } else if (fretVal === 0) {
            svg += `<circle cx="${x}" cy="12" r="3.5" fill="none" stroke="#c4a475" stroke-width="1.5" />`;
        } else if (typeof fretVal === "number") {
            const relFret = fretVal - baseFret + 1;
            if (relFret >= 1 && relFret <= 4) {
                const circleY = startY + (relFret - 0.5) * fretSpacing;
                svg += `<circle cx="${x}" cy="${circleY}" r="5.5" fill="#c4a475" />`;
            }
        }
    }

    svg += `</svg>`;
    return svg;
}

let activePollInterval = null;

async function handleYTAnalyze() {
    const urlInput = document.getElementById("yt-url-input");
    const url = urlInput ? urlInput.value.trim() : "";
    if (!url) {
        alert("請輸入有效的 YouTube 網址！");
        return;
    }

    const statusBar = document.getElementById("yt-status-bar");
    const statusText = document.getElementById("yt-status-text");
    const btnAnalyze = document.getElementById("btn-start-analyze");

    if (statusBar) statusBar.style.display = "flex";
    if (statusText) statusText.textContent = "🚀 已啟動背景分析任務！您可以自由切換與瀏覽過往存檔...";
    if (btnAnalyze) btnAnalyze.disabled = true;

    try {
        const response = await fetch("/api/analyze-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: url })
        });

        const resData = await response.json();
        if (resData.status === "ok" && resData.job_id) {
            if (urlInput) urlInput.value = "";
            if (btnAnalyze) btnAnalyze.disabled = false;
            startPollingJob(resData.job_id);
        } else {
            alert("分析啟動失敗: " + (resData.error || "未知錯誤"));
            if (statusBar) statusBar.style.display = "none";
            if (btnAnalyze) btnAnalyze.disabled = false;
        }
    } catch (err) {
        alert("無法連線至本地分析伺服器，請確保 server.py 已啟動！\n錯誤: " + err.message);
        if (statusBar) statusBar.style.display = "none";
        if (btnAnalyze) btnAnalyze.disabled = false;
    }
}

function startPollingJob(jobId) {
    if (activePollInterval) clearInterval(activePollInterval);

    const statusBar = document.getElementById("yt-status-bar");
    const statusText = document.getElementById("yt-status-text");

    activePollInterval = setInterval(async () => {
        try {
            const res = await fetch(`/api/analysis-status?job_id=${encodeURIComponent(jobId)}`);
            if (!res.ok) return;

            const body = await res.json();
            if (body.status === "ok" && body.job) {
                const job = body.job;
                if (statusText) {
                    statusText.textContent = `⏳ 背景分析進行中 (${job.progress}%): ${job.step} （您可自由切換與瀏覽舊樂譜）`;
                }

                await loadPresetList();

                if (job.status === "completed") {
                    clearInterval(activePollInterval);
                    activePollInterval = null;
                    if (statusBar) statusBar.style.display = "none";

                    await loadPresetList();
                    const presetSelect = document.getElementById("preset-select");
                    if (presetSelect) presetSelect.value = "web_analysis";

                    await loadLatestAnalysis("web_analysis");
                    alert(`🎉 歌名《${job.title || "新曲目"}》全自動分析完成！已自動載入至畫面上。`);
                } else if (job.status === "error") {
                    clearInterval(activePollInterval);
                    activePollInterval = null;
                    if (statusBar) statusBar.style.display = "none";
                    alert(`❌ 分析失敗: ${job.error || "未知錯誤"}`);
                }
            }
        } catch (e) {
            console.warn("Polling status warning:", e);
        }
    }, 2500);
}

function renderEmptyState() {
    activeData = null;
    currentPresetFolder = "";

    const songTitleEl = document.getElementById("song-title");
    if (songTitleEl) songTitleEl.textContent = "尚未載入樂譜";

    const origKeyEl = document.getElementById("orig-key");
    if (origKeyEl) origKeyEl.textContent = "-";

    const transKeyEl = document.getElementById("trans-key");
    if (transKeyEl) transKeyEl.textContent = "-";

    const tempoEl = document.getElementById("song-tempo");
    if (tempoEl) tempoEl.textContent = "-";

    const capoEl = document.getElementById("capo-recommendation");
    if (capoEl) capoEl.textContent = "建議 Capo 0 夾";

    const capoNoteEl = document.getElementById("capo-friendly-note");
    if (capoNoteEl) capoNoteEl.textContent = "Capo 0 夾 (預設)";

    const pitchLowEl = document.getElementById("pitch-low");
    if (pitchLowEl) pitchLowEl.textContent = "-";

    const pitchHighEl = document.getElementById("pitch-high");
    if (pitchHighEl) pitchHighEl.textContent = "-";

    const pitchMedianEl = document.getElementById("pitch-median");
    if (pitchMedianEl) pitchMedianEl.textContent = "-";

    const songDurEl = document.getElementById("song-duration");
    if (songDurEl) songDurEl.textContent = "-";

    const songBeatsEl = document.getElementById("song-beats");
    if (songBeatsEl) songBeatsEl.textContent = "-";

    const energyEl = document.getElementById("energy-val");
    if (energyEl) energyEl.textContent = "-";

    const timelineContainer = document.getElementById("lyrics-timeline-container");
    if (timelineContainer) {
        timelineContainer.innerHTML = `
            <div class="empty-welcome-card" style="padding: 54px 32px; text-align: center; background: rgba(255, 255, 255, 0.015); border: 1px dashed rgba(196, 164, 117, 0.25); border-radius: 16px; margin: 20px 0;">
                <div class="empty-icon-wrapper" style="width: 64px; height: 64px; margin: 0 auto 20px; background: rgba(196, 164, 117, 0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(196, 164, 117, 0.2);">
                    <svg style="width: 32px; height: 32px; color: var(--accent-gold);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                </div>
                <h2 style="color: var(--accent-gold); font-size: 1.35rem; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 12px;">SUPER_MUSICIAN PRO STUDIO</h2>
                <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 480px; margin: 0 auto; line-height: 1.7;">
                    貼上 YouTube 網址開始全自動 AI 和弦與歌詞分析，<br>或從右上方下拉選單載入過往儲存的吉他譜庫。
                </p>
            </div>
        `;
    }

    const chordGridContainer = document.getElementById("chord-diagrams-container");
    if (chordGridContainer) {
        chordGridContainer.innerHTML = `
            <div style="padding: 48px 16px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px;">
                <div style="width: 48px; height: 48px; margin-bottom: 14px; background: rgba(196, 164, 117, 0.06); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(196, 164, 117, 0.18);">
                    <svg style="width: 24px; height: 24px; color: var(--accent-gold);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <rect x="4" y="4" width="16" height="16" rx="3"></rect>
                        <path d="M8 9h8M8 15h8M12 4v16"></path>
                    </svg>
                </div>
                <span style="font-weight: 600; color: var(--text-main); font-size: 0.92rem; margin-bottom: 6px; letter-spacing: 0.02em;">和弦指法圖庫面板</span>
                <span style="font-size: 0.82rem; color: var(--text-muted); white-space: nowrap;">載入樂譜後自動顯示吉他和弦圖</span>
            </div>
        `;
    }

    if (audioElement) {
        audioElement.src = "";
    }
}

function handleExportJSON() {

    if (!activeData) return;
    const blob = new Blob([JSON.stringify(activeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(activeData.title || "guitar_sheet").replace(/[^a-z0-9_-]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- Helper Functions ---
function transposeChord(chordStr, semitones) {
    if (!chordStr || chordStr === "-" || semitones === 0) return chordStr;
    const parts = chordStr.split("/");
    const mainTrans = transposeSingleChord(parts[0], semitones);
    if (parts.length > 1) {
        const bassTrans = transposeSingleChord(parts[1], semitones);
        return `${mainTrans}/${bassTrans}`;
    }
    return mainTrans;
}

function transposeSingleChord(chord, semitones) {
    if (!chord) return "";
    let root = "";
    let quality = "";

    if (chord.length >= 2 && (chord[1] === "#" || chord[1] === "b")) {
        root = chord.substring(0, 2);
        quality = chord.substring(2);
    } else {
        root = chord.substring(0, 1);
        quality = chord.substring(1);
    }

    if (ALIASES[root]) root = ALIASES[root];
    const idx = NOTE_NAMES.indexOf(root);
    if (idx === -1) return chord;

    let newIdx = (idx + semitones) % 12;
    if (newIdx < 0) newIdx += 12;

    return NOTE_NAMES[newIdx] + quality;
}

function transposeKey(keyName, semitones) {
    if (!keyName || semitones === 0) return keyName;
    const parts = keyName.split(" ");
    const newRoot = transposeSingleChord(parts[0], semitones);
    return `${newRoot} ${parts.slice(1).join(" ")}`;
}

function formatTimeSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} 分 ${secs} 秒`;
}

function getEmbeddedFallback() {
    return {
        "title": "你不知道的事",
        "duration_seconds": 223.0,
        "tempo_bpm": 70,
        "estimated_key": { "name": "G major" },
        "aligned_lyrics": [
            {
                "start": 14.54, "end": 21.39,
                "text": "無心過問你的心裡我的溫",
                "chords": [
                    { "chord": "G", "candidates": [{ "chord": "G", "score": 0.94 }, { "chord": "Gmaj7", "score": 0.88 }] },
                    { "chord": "D7/F#", "candidates": [{ "chord": "D7/F#", "score": 0.83 }, { "chord": "D7", "score": 0.81 }] },
                    { "chord": "Em", "candidates": [{ "chord": "Em", "score": 0.88 }, { "chord": "Em7", "score": 0.82 }] },
                    { "chord": "Bm", "candidates": [{ "chord": "Bm", "score": 0.88 }, { "chord": "G/B", "score": 0.80 }] }
                ]
            },
            {
                "start": 21.39, "end": 24.49,
                "text": "厭倦我的虧欠 代替你說愛的人",
                "chords": [
                    { "chord": "C", "candidates": [{ "chord": "C", "score": 0.81 }, { "chord": "Cmaj7", "score": 0.79 }] },
                    { "chord": "G", "candidates": [{ "chord": "G", "score": 0.87 }, { "chord": "Dsus4", "score": 0.84 }] },
                    { "chord": "Am7", "candidates": [{ "chord": "Am7", "score": 0.80 }, { "chord": "Am", "score": 0.78 }] },
                    { "chord": "D", "candidates": [{ "chord": "D", "score": 0.90 }, { "chord": "D7", "score": 0.85 }] }
                ]
            }
        ]
    };
}

function initFloatingTransposeObserver() {
    const originalBar = document.querySelector(".transpose-quick-bar");
    const floatingBar = document.getElementById("floating-transpose-bar");
    if (!originalBar || !floatingBar) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                floatingBar.classList.remove("show");
            } else {
                floatingBar.classList.add("show");
            }
        });
    }, {
        threshold: 0,
        rootMargin: "-80px 0px 0px 0px"
    });

    observer.observe(originalBar);
}


