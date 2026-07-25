from __future__ import annotations

from collections import Counter
from pathlib import Path

import librosa
import numpy as np


NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

CHORD_TEMPLATES = {
    "": [0, 4, 7],
    "m": [0, 3, 7],
    "7": [0, 4, 7, 10],
    "m7": [0, 3, 7, 10],
    "maj7": [0, 4, 7, 11],
    "m7-5": [0, 3, 6, 10],
    "dim": [0, 3, 6],
    "sus4": [0, 5, 7],
}

# Popular Slash Chord Profiles (root_note, quality, bass_interval)
SLASH_CHORD_DEFINITIONS = [
    ("G/B", 7, [7, 11, 2], 11),       # G chord over B bass
    ("Am7/G", 9, [9, 0, 4, 7], 7),    # Am7 over G bass
    ("C/E", 0, [0, 4, 7], 4),         # C chord over E bass
    ("D7/F#", 2, [2, 6, 9, 0], 6),    # D7 over F# bass
]

DIATONIC_CHORDS = {
    "C major": {
        "C", "Dm", "Em", "F", "G", "Am", "Bdim",
        "G/B", "Dm7", "Am7", "C/E", "Fmaj7", "Bm7-5",
        "E", "E7", "C7", "D7", "D7/F#", "Gm7", "Am7/G"
    },
    "A minor": {
        "Am", "Bdim", "C", "Dm", "Em", "F", "G",
        "Am7/G", "Dm7", "Bm7-5", "E", "E7", "G/B"
    },
    "D major": {"D", "Em", "F#m", "G", "A", "Bm", "C#dim", "D7/F#", "Em7", "A7"},
    "B minor": {"Bm", "C#dim", "D", "Em", "F#m", "G", "A"},
}


def _normalize(values: np.ndarray) -> np.ndarray:
    values = np.asarray(values, dtype=float)
    total = np.linalg.norm(values)
    if total == 0:
        return values
    return values / total


def _estimate_key(chroma_mean: np.ndarray) -> dict:
    chroma_norm = _normalize(chroma_mean)
    best = {"key": "Unknown", "score": -1.0}
    for root in range(12):
        major = _normalize(np.roll(MAJOR_PROFILE, root))
        minor = _normalize(np.roll(MINOR_PROFILE, root))
        major_score = float(np.corrcoef(chroma_norm, major)[0, 1])
        minor_score = float(np.corrcoef(chroma_norm, minor)[0, 1])
        if major_score > best["score"]:
            best = {"key": f"{NOTE_NAMES[root]} major", "score": major_score}
        if minor_score > best["score"]:
            best = {"key": f"{NOTE_NAMES[root]} minor", "score": minor_score}
    return best


def _midi_to_note(value: float | None) -> str | None:
    if value is None or not np.isfinite(value):
        return None
    return librosa.midi_to_note(float(value), octave=True)


def _estimate_pitch_range(y: np.ndarray, sr: int) -> dict:
    try:
        f0, voiced_flag, voiced_prob = librosa.pyin(
            y,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
            sr=sr,
            hop_length=2048,
        )
    except Exception as exc:
        return {"error": f"pitch estimation failed: {exc}"}

    voiced = f0[np.isfinite(f0)]
    if voiced.size == 0:
        return {"low": None, "high": None, "median": None, "voiced_ratio": 0.0}

    midi = librosa.hz_to_midi(voiced)
    low = float(np.percentile(midi, 5))
    high = float(np.percentile(midi, 95))
    median = float(np.percentile(midi, 50))
    return {
        "low": _midi_to_note(low),
        "high": _midi_to_note(high),
        "median": _midi_to_note(median),
        "voiced_ratio": float(np.mean(voiced_flag)) if voiced_flag is not None else None,
        "mean_confidence": float(np.nanmean(voiced_prob)) if voiced_prob is not None else None,
    }


def _build_chord_template(root: int, quality: str) -> np.ndarray:
    template = np.zeros(12)
    for interval in CHORD_TEMPLATES[quality]:
        template[(root + interval) % 12] = 1.0
    return _normalize(template)


def _estimate_chords(chroma: np.ndarray, beats: np.ndarray, sr: int, hop_length: int, key_name: str = "") -> list[dict]:
    if chroma.size == 0:
        return []

    import scipy.ndimage

    templates = []
    # Standard Triads and 7ths
    for root in range(12):
        for quality in CHORD_TEMPLATES:
            name = f"{NOTE_NAMES[root]}{quality}"
            templates.append((name, _build_chord_template(root, quality)))

    # Slash Chords
    for name, root, intervals, bass_pitch in SLASH_CHORD_DEFINITIONS:
        tpl = np.zeros(12)
        for pit in intervals:
            tpl[pit % 12] = 1.0
        tpl[bass_pitch % 12] += 0.5  # Boost bass note weighting
        templates.append((name, _normalize(tpl)))

    diatonics = DIATONIC_CHORDS.get(key_name, set())

    # Interpolate beats to half-beat resolution to capture fast chord changes (e.g., Bm7-5 E)
    orig_beats = list(beats)
    beat_frames = []
    for i in range(len(orig_beats) - 1):
        beat_frames.append(orig_beats[i])
        beat_frames.append((orig_beats[i] + orig_beats[i + 1]) // 2)
    if orig_beats:
        beat_frames.append(orig_beats[-1])

    if len(beat_frames) < 2:
        sec_per_frame = hop_length / sr
        frames_per_pseudo_beat = max(1, round(0.25 / sec_per_frame))
        beat_frames = list(range(0, chroma.shape[1], frames_per_pseudo_beat))
        if len(beat_frames) == 0:
            beat_frames = [0, chroma.shape[1]]
        elif beat_frames[-1] < chroma.shape[1]:
            beat_frames.append(chroma.shape[1])
    else:
        if beat_frames[0] > 0:
            beat_frames.insert(0, 0)
        if beat_frames[-1] < chroma.shape[1]:
            beat_frames.append(chroma.shape[1])

    # Sync chroma per half-beat
    chroma_sync = librosa.util.sync(chroma, beat_frames, aggregate=np.mean)
    chroma_smoothed = scipy.ndimage.median_filter(chroma_sync, size=(1, 3))


    chords = []
    last_name = None

    for i in range(chroma_smoothed.shape[1]):
        col = _normalize(chroma_smoothed[:, i])
        scores = []

        for name, template in templates:
            score = float(np.dot(col, template))
            if name in diatonics:
                score += 0.12
            scores.append((name, score))

        scores.sort(key=lambda item: item[1], reverse=True)
        best_name, best_score = scores[0]

        # Top 3 unique candidates
        top_candidates = []
        seen = set()
        for name, sc in scores:
            if name not in seen:
                seen.add(name)
                top_candidates.append({"chord": name, "score": round(sc, 3)})
            if len(top_candidates) == 3:
                break

        start_frame = beat_frames[i]
        end_frame = beat_frames[i + 1]
        start_time = float(librosa.frames_to_time(start_frame, sr=sr, hop_length=hop_length))
        end_time = float(librosa.frames_to_time(end_frame, sr=sr, hop_length=hop_length))

        if best_name == last_name and chords:
            chords[-1]["end"] = round(end_time, 2)
            chords[-1]["score"] = round(max(chords[-1]["score"], best_score), 3)
        else:
            chords.append(
                {
                    "chord": best_name,
                    "start": round(start_time, 2),
                    "end": round(end_time, 2),
                    "score": round(best_score, 3),
                    "candidates": top_candidates,
                }
            )
            last_name = best_name


    # Filter out short spurious sus4 transients (< 0.6s)
    filtered = []
    for c in chords:
        dur = c["end"] - c["start"]
        if "sus4" in c["chord"] and dur < 0.6 and filtered:
            filtered[-1]["end"] = c["end"]
        else:
            filtered.append(c)

    return filtered




def _top_progression(chords: list[dict], limit: int = 8) -> list[str]:
    names = [item["chord"] for item in chords]
    compact = []
    for name in names:
        if not compact or compact[-1] != name:
            compact.append(name)
    if len(compact) <= limit:
        return compact
    counts = Counter(compact)
    return [name for name, _ in counts.most_common(limit)]


def analyze_audio(path: Path, vocal_path: Path | None = None, title: str | None = None) -> dict:
    path = Path(path)
    y, sr = librosa.load(path, sr=22050, mono=True)
    duration = float(librosa.get_duration(y=y, sr=sr))
    hop_length = 512

    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=hop_length)
    tempo_value = float(np.asarray(tempo).reshape(-1)[0]) if np.size(tempo) else None

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop_length)
    chroma_mean = np.mean(chroma, axis=1)
    key = _estimate_key(chroma_mean)
    chords = _estimate_chords(chroma, beats, sr=sr, hop_length=hop_length, key_name=key["key"])

    # Halve tempo if beat tracking picked up double-time / 8th-note grid (>110 BPM for slow ballad)
    if tempo_value and tempo_value > 110.0:
        tempo_value = tempo_value / 2.0


    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    energy = {
        "mean": float(np.mean(rms)),
        "p25": float(np.percentile(rms, 25)),
        "p75": float(np.percentile(rms, 75)),
    }

    # If vocal path is given, estimate pitch range from isolated vocal stem
    if vocal_path and Path(vocal_path).exists():
        y_vocal, sr_vocal = librosa.load(vocal_path, sr=22050, mono=True)
        pitch_range = _estimate_pitch_range(y_vocal, sr_vocal)
    else:
        pitch_range = _estimate_pitch_range(y, sr)

    return {
        "title": title or path.stem,
        "file": str(path),
        "duration_seconds": round(duration, 2),
        "sample_rate": sr,
        "tempo_bpm": round(tempo_value, 1) if tempo_value else None,
        "beat_count": int(len(beats)),
        "estimated_key": {
            "name": key["key"],
            "confidence": round(float(key["score"]), 3),
        },
        "pitch_range": pitch_range,
        "energy": energy,
        "likely_progression": _top_progression(chords),
        "chord_timeline": chords,
        "notes": [
            "Chord estimates are approximate template matches over chroma features.",
            "Pitch range is more reliable when analyzing an isolated vocal stem.",
        ],
    }

