from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


import sys


def to_traditional(text: str | None) -> str | None:
    if not text:
        return text
    try:
        import opencc
        try:
            converter = opencc.OpenCC("s2twp")
        except Exception:
            converter = opencc.OpenCC("s2t")
        return converter.convert(text)
    except Exception:
        return text


def fetch_youtube_title(url: str) -> str | None:
    yt_dlp_cmd = [shutil.which("yt-dlp")] if shutil.which("yt-dlp") else [sys.executable, "-m", "yt_dlp"]
    # android client bypasses bot detection without needing cookies
    cmd = yt_dlp_cmd + ["--print", "title", "--no-warnings",
                        "--extractor-args", "youtube:player_client=android", url]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore", timeout=20)
        if res.returncode == 0 and res.stdout.strip():
            lines = [l.strip() for l in res.stdout.strip().splitlines() if l.strip() and not l.startswith("Deprecated")]
            if lines:
                return to_traditional(lines[-1])
    except Exception:
        pass
    return None


def download_youtube_audio(url: str, out_dir: Path) -> tuple[Path, str | None]:
    yt_dlp_cmd = [shutil.which("yt-dlp")] if shutil.which("yt-dlp") else [sys.executable, "-m", "yt_dlp"]

    out_dir.mkdir(parents=True, exist_ok=True)
    output_template = str(out_dir / "downloaded.%(ext)s")
    base_args = [
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
        "-o",
        output_template,
        "--no-warnings",
    ]

    title = fetch_youtube_title(url)

    # Primary: android client (bypasses bot check without cookies)
    try:
        command = yt_dlp_cmd + base_args + ["--extractor-args", "youtube:player_client=android", url]
        subprocess.run(command, check=True)
    except Exception as e:
        # Fallback: default web client
        try:
            command = yt_dlp_cmd + base_args + [url]
            subprocess.run(command, check=True)
        except Exception:
            raise RuntimeError(f"YouTube 音訊下載失敗 (網址無效或被限制): {e}")

    matches = sorted(out_dir.glob("downloaded.*"))
    if not matches:
        raise RuntimeError("yt-dlp 下載完成但未找到音訊檔案。")
    return matches[0], title

