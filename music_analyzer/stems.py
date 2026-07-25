from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


import sys


def separate_stems(source: Path, out_dir: Path) -> dict:
    demucs_cmd = [shutil.which("demucs")] if shutil.which("demucs") else [sys.executable, "-m", "demucs"]

    out_dir.mkdir(parents=True, exist_ok=True)
    command = demucs_cmd + ["--two-stems=vocals", "--mp3", "-o", str(out_dir), str(source)]
    try:
        subprocess.run(command, check=True)
    except Exception as exc:
        return {
            "status": "error",
            "reason": f"demucs execution failed: {exc}",
            "vocals": None,
            "instrumental": None,
        }

    stem_root = out_dir / "htdemucs" / source.stem
    vocals_mp3 = stem_root / "vocals.mp3"
    vocals_wav = stem_root / "vocals.wav"
    no_vocals_mp3 = stem_root / "no_vocals.mp3"
    no_vocals_wav = stem_root / "no_vocals.wav"

    vocals = vocals_mp3 if vocals_mp3.exists() else (vocals_wav if vocals_wav.exists() else None)
    instrumental = no_vocals_mp3 if no_vocals_mp3.exists() else (no_vocals_wav if no_vocals_wav.exists() else None)

    return {
        "status": "ok",
        "vocals": str(vocals) if vocals else None,
        "instrumental": str(instrumental) if instrumental else None,
    }

