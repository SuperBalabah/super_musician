from __future__ import annotations

from typing import Any


def align_chords_and_lyrics(
    chord_timeline: list[dict[str, Any]],
    lyric_segments: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Align chord timeline intervals with lyric timestamped segments.
    """
    if not lyric_segments:
        return []

    aligned = []
    for seg in lyric_segments:
        l_start = seg.get("start", 0.0)
        l_end = seg.get("end", 0.0)
        text = seg.get("text", "")

        # Find overlapping chords
        overlapping = []
        for c in chord_timeline:
            c_start = c.get("start", 0.0)
            c_end = c.get("end", 0.0)
            overlap_start = max(c_start, l_start)
            overlap_end = min(c_end, l_end)
            if overlap_start < overlap_end:
                overlapping.append(
                    {
                        "chord": c.get("chord"),
                        "start": c_start,
                        "end": c_end,
                        "score": c.get("score"),
                        "candidates": c.get("candidates", []),
                    }
                )




        # Build inline formatted string for display
        # e.g., "[C] Lyric line text"
        chord_names = list(dict.fromkeys(item["chord"] for item in overlapping if item.get("chord")))
        chord_prefix = f"[{' / '.join(chord_names)}] " if chord_names else ""
        formatted = f"{chord_prefix}{text}"

        aligned.append(
            {
                "start": l_start,
                "end": l_end,
                "text": text,
                "chords": overlapping,
                "formatted": formatted,
            }
        )

    return aligned
