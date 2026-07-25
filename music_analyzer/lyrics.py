from __future__ import annotations

from pathlib import Path
from typing import Any


def transcribe_lyrics(
    audio_path: Path,
    model_size: str = "small",
    device: str = "cpu",
    compute_type: str = "int8",
) -> dict[str, Any]:
    """
    Transcribe vocals audio using faster-whisper with timestamped segments.
    """
    audio_path = Path(audio_path)
    if not audio_path.exists():
        return {"status": "error", "error": f"Audio file not found: {audio_path}"}

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return {
            "status": "skipped",
            "reason": "faster-whisper is not installed. Install with: pip install faster-whisper",
            "segments": [],
        }

    try:
        model = WhisperModel(model_size, device=device, compute_type=compute_type)
        segments_gen, info = model.transcribe(
            str(audio_path),
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
        )

        import opencc
        try:
            s2t_converter = opencc.OpenCC("s2twp")
        except Exception:
            s2t_converter = opencc.OpenCC("s2t")

        segments = []
        for seg in segments_gen:
            text = seg.text.strip()
            if text:
                segments.append(
                    {
                        "start": round(seg.start, 2),
                        "end": round(seg.end, 2),
                        "text": s2t_converter.convert(text),
                    }
                )


        return {
            "status": "ok",
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "segments": segments,
        }
    except Exception as exc:
        return {"status": "error", "error": str(exc), "segments": []}
