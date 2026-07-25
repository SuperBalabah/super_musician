from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from .align import align_chords_and_lyrics
from .analysis import analyze_audio
from .download import download_youtube_audio
from .lyrics import transcribe_lyrics
from .report import write_markdown_report
from .stems import separate_stems


def _write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _copy_source(source: Path, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / f"source{source.suffix.lower()}"
    if source.resolve() != target.resolve():
        shutil.copy2(source, target)
    return target


def command_analyze(args: argparse.Namespace) -> int:
    source = Path(args.audio).expanduser().resolve()
    if not source.exists():
        raise SystemExit(f"Audio file not found: {source}")

    out_dir = Path(args.out).expanduser().resolve()
    local_source = _copy_source(source, out_dir)

    analysis_target = local_source
    vocal_target = None
    stem_info = None

    if args.separate:
        print("Running Demucs stem separation...")
        stem_info = separate_stems(local_source, out_dir / "stems")
        if stem_info.get("instrumental"):
            analysis_target = Path(stem_info["instrumental"])
        if stem_info.get("vocals"):
            vocal_target = Path(stem_info["vocals"])

    title = args.title or source.stem
    from .download import to_traditional
    if title and title != "downloaded":
        title = to_traditional(title)

    print("Analyzing audio (BPM, Key, Chords, Pitch Range)...")
    result = analyze_audio(analysis_target, vocal_path=vocal_target or local_source, title=title)
    result["title"] = to_traditional(result.get("title", title))
    result["source_audio"] = str(local_source)
    result["analysis_target"] = str(analysis_target)
    result["stems"] = stem_info

    # Phase 2: Transcribe lyrics using faster-whisper on vocal track or local source
    print("Transcribing lyrics with faster-whisper...")
    transcription_source = vocal_target if (vocal_target and vocal_target.exists()) else local_source
    lyrics_data = transcribe_lyrics(transcription_source)
    result["lyrics"] = lyrics_data

    # Phase 3: Align chords with lyrics
    print("Aligning chords with lyric timestamps...")
    lyric_segments = lyrics_data.get("segments", []) if isinstance(lyrics_data, dict) else []
    aligned_lyrics = align_chords_and_lyrics(result.get("chord_timeline", []), lyric_segments)
    result["aligned_lyrics"] = aligned_lyrics

    _write_json(out_dir / "analysis.json", result)
    write_markdown_report(out_dir / "summary.md", result)

    print(f"\nAnalysis complete! Results written to: {out_dir}")
    print(f"  - {out_dir / 'analysis.json'}")
    print(f"  - {out_dir / 'summary.md'}")
    return 0


def command_analyze_url(args: argparse.Namespace) -> int:
    out_dir = Path(args.out).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    downloaded, yt_title = download_youtube_audio(args.url, out_dir)

    final_title = args.title or yt_title or "未命名曲目"
    from .download import to_traditional
    final_title = to_traditional(final_title)

    next_args = argparse.Namespace(
        audio=str(downloaded),
        out=str(out_dir),
        separate=args.separate,
        title=final_title,
    )
    return command_analyze(next_args)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="music-analyzer",
        description="Local-first quick song analyzer.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    analyze = sub.add_parser("analyze", help="Analyze a local audio file.")
    analyze.add_argument("audio", help="Path to an audio file.")
    analyze.add_argument("--out", default="runs/latest", help="Output directory.")
    analyze.add_argument("--title", default=None, help="Song title for reports.")
    analyze.add_argument(
        "--separate",
        action="store_true",
        help="Run demucs first and analyze the vocal stem when available.",
    )
    analyze.set_defaults(func=command_analyze)

    analyze_url = sub.add_parser("analyze-url", help="Download YouTube audio and analyze it.")
    analyze_url.add_argument("url", help="YouTube URL.")
    analyze_url.add_argument("--out", default="runs/latest", help="Output directory.")
    analyze_url.add_argument("--title", default=None, help="Song title for reports.")
    analyze_url.add_argument(
        "--separate",
        action="store_true",
        help="Run demucs first and analyze the vocal stem when available.",
    )
    analyze_url.set_defaults(func=command_analyze_url)

    return parser


def main() -> None:
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    parser = build_parser()
    args = parser.parse_args()
    raise SystemExit(args.func(args))

