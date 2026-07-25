from __future__ import annotations

from pathlib import Path


def _fmt_time(seconds: float) -> str:
    m = int(seconds // 60)
    s = seconds % 60
    return f"{m}:{s:04.1f}"


def compact_summary_payload(result: dict) -> dict:
    return {
        "title": result.get("title"),
        "duration": _fmt_time(result.get("duration_seconds", 0)),
        "tempo_bpm": result.get("tempo_bpm"),
        "estimated_key": result.get("estimated_key"),
        "pitch_range": result.get("pitch_range"),
        "likely_progression": result.get("likely_progression"),
        "first_chords": result.get("chord_timeline", [])[:16],
        "notes": result.get("notes", []),
    }


def write_markdown_report(path: Path, result: dict) -> None:
    summary = compact_summary_payload(result)
    key = summary.get("estimated_key") or {}
    pitch = summary.get("pitch_range") or {}
    progression = summary.get("likely_progression") or []

    lines = [
        f"# {summary.get('title') or 'Music Analysis'}",
        "",
        "## Quick Results",
        "",
        f"- Duration: {summary.get('duration')}",
        f"- Tempo: {summary.get('tempo_bpm')} BPM",
        f"- Estimated key: {key.get('name')} (confidence {key.get('confidence')})",
        f"- Pitch range: {pitch.get('low')} to {pitch.get('high')} (median {pitch.get('median')})",
        f"- Likely progression: {' - '.join(progression) if progression else 'Unknown'}",
        "",
        "## Chord Timeline",
        "",
    ]

    for item in summary.get("first_chords", []):
        lines.append(
            f"- {_fmt_time(item['start'])}-{_fmt_time(item['end'])}: "
            f"{item['chord']} (score {item['score']})"
        )

    aligned_lyrics = result.get("aligned_lyrics", [])
    if aligned_lyrics:
        lines.extend(["", "## Aligned Chords & Lyrics", ""])
        for item in aligned_lyrics:
            lines.append(f"- **{_fmt_time(item['start'])}**: {item.get('formatted', '')}")

    lines.extend(
        [
            "",
            "## LLM Prompt Payload",
            "",
            "Use this compact payload if you want an LLM-written explanation:",
            "",
            "```json",
            _to_json_block(summary),
            "```",
        ]
    )


    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def _to_json_block(data: dict) -> str:
    import json

    return json.dumps(data, ensure_ascii=False, indent=2)
