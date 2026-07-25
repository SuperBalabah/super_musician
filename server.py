from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler


from pathlib import Path
from typing import Any

from music_analyzer.cli import build_parser, command_analyze_url
from music_analyzer.report import write_markdown_report

BASE_DIR = Path(__file__).resolve().parent
WEB_UI_DIR = BASE_DIR / "web_ui"
RUNS_DIR = BASE_DIR / "runs"

import threading
import time

ANALYSIS_JOBS: dict[str, dict[str, Any]] = {}
LAST_HEARTBEAT_TIME = time.time()
SHUTDOWN_TIMEOUT_SECONDS = 8.0
HEARTBEAT_COUNT = 0

def _auto_shutdown_watcher():
    global LAST_HEARTBEAT_TIME
    time.sleep(12)
    while True:
        time.sleep(2)
        if time.time() - LAST_HEARTBEAT_TIME > SHUTDOWN_TIMEOUT_SECONDS:
            is_running_job = any(j.get("status") == "running" for j in ANALYSIS_JOBS.values())
            if is_running_job:
                LAST_HEARTBEAT_TIME = time.time()
                continue
            print("\n[super_musician] 所有瀏覽器頁面已關閉，後端伺服器已自動停止，完全不占用電腦資源。")
            os._exit(0)

def _run_async_analysis(job_id: str, url: str, user_title: str | None):
    try:
        from music_analyzer.download import download_youtube_audio, to_traditional
        from music_analyzer.cli import command_analyze

        out_dir = RUNS_DIR / "web_analysis"
        if out_dir.exists():
            import shutil
            shutil.rmtree(out_dir, ignore_errors=True)
        out_dir.mkdir(parents=True, exist_ok=True)

        ANALYSIS_JOBS[job_id]["progress"] = 15
        ANALYSIS_JOBS[job_id]["step"] = "正在下載 YouTube 高音質音訊與擷取影片標題..."

        downloaded, yt_title = download_youtube_audio(url, out_dir)
        final_title = user_title or yt_title or "未命名曲目"
        final_title = to_traditional(final_title)

        ANALYSIS_JOBS[job_id]["title"] = final_title
        ANALYSIS_JOBS[job_id]["progress"] = 40
        ANALYSIS_JOBS[job_id]["step"] = f"已擷取歌名《{final_title}》，正在使用 Demucs 進行三軌音訊分離 (原曲 / 人聲 / 伴奏)..."

        next_args = argparse.Namespace(
            audio=str(downloaded),
            out=str(out_dir),
            separate=True,
            title=final_title,
        )

        ANALYSIS_JOBS[job_id]["progress"] = 65
        ANALYSIS_JOBS[job_id]["step"] = f"正在使用 Faster-Whisper 識別《{final_title}》歌詞與時間戳 (台灣繁體中文)..."

        command_analyze(next_args)

        analysis_file = out_dir / "analysis.json"
        if analysis_file.exists():
            data = json.loads(analysis_file.read_text(encoding="utf-8"))
            ANALYSIS_JOBS[job_id]["status"] = "completed"
            ANALYSIS_JOBS[job_id]["progress"] = 100
            ANALYSIS_JOBS[job_id]["step"] = f"🎉 《{data.get('title', final_title)}》全自動分析完成！"
            ANALYSIS_JOBS[job_id]["title"] = data.get("title", final_title)
            ANALYSIS_JOBS[job_id]["data"] = data
        else:
            ANALYSIS_JOBS[job_id]["status"] = "error"
            ANALYSIS_JOBS[job_id]["error"] = "分析失敗，未產出樂譜檔案。"
    except Exception as exc:
        print(f"[super_musician] Async Analysis error: {exc}")
        ANALYSIS_JOBS[job_id]["status"] = "error"
        ANALYSIS_JOBS[job_id]["error"] = str(exc)
    finally:
        global LAST_HEARTBEAT_TIME
        LAST_HEARTBEAT_TIME = time.time()


class MusicAnalyzerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_UI_DIR), **kwargs)

    def _sanitize_folder_name(self, name: str) -> str:
        import re
        cleaned = re.sub(r'[\\/:*?"<>|]', "_", name).strip()
        return cleaned or "unnamed_song"

    def _find_audio_file(self, folder_name: str, track_type: str) -> Path | None:
        if folder_name.startswith("saved_songs/"):
            target_dir = RUNS_DIR / folder_name
        elif (RUNS_DIR / "saved_songs" / folder_name).exists():
            target_dir = RUNS_DIR / "saved_songs" / folder_name
        else:
            target_dir = RUNS_DIR / folder_name

        if not target_dir.exists():
            target_dir = RUNS_DIR / "web_analysis"

        if not target_dir.exists():
            return None

        if track_type == "original":
            for name in ["downloaded.mp3", "source.mp3", "downloaded.wav", "source.wav", "original.mp3", "original.wav"]:
                p = target_dir / name
                if p.exists():
                    return p
            for p in target_dir.glob("*"):
                if p.is_file() and p.suffix.lower() in [".mp3", ".wav", ".flac", ".m4a"]:
                    return p

        elif track_type == "vocals":
            for p in target_dir.glob("**/vocals.*"):
                if p.is_file() and p.suffix.lower() in [".mp3", ".wav", ".flac", ".m4a"]:
                    return p

        elif track_type == "instrumental":
            for p in target_dir.glob("**/no_vocals.*"):
                if p.is_file() and p.suffix.lower() in [".mp3", ".wav", ".flac", ".m4a"]:
                    return p

        return None

    def do_GET(self):
        if self.path.startswith("/api/audio?") or self.path == "/api/audio":
            from urllib.parse import parse_qs, urlparse
            query = parse_qs(urlparse(self.path).query)
            track_type = query.get("track", ["original"])[0]
            folder_name = query.get("folder", ["web_analysis"])[0]

            target_file = self._find_audio_file(folder_name, track_type)

            if target_file and target_file.exists():
                content_type = "audio/mpeg" if target_file.suffix.lower() == ".mp3" else "audio/wav"
                content = target_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, f"Audio stem for '{track_type}' not found in {folder_name}")

        elif self.path.startswith("/api/audio-size"):
            from urllib.parse import parse_qs, urlparse
            query = parse_qs(urlparse(self.path).query)
            folder_name = query.get("folder", ["web_analysis"])[0]
            self._handle_get_audio_size(folder_name)
        elif self.path.startswith("/api/presets"):
            self._handle_get_presets()
        elif self.path.startswith("/api/preset"):
            self._handle_get_preset()
        elif self.path.startswith("/api/analysis-status"):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            job_id = params.get("job_id", [None])[0]
            if job_id and job_id in ANALYSIS_JOBS:
                self._send_json_response(200, {"status": "ok", "job": ANALYSIS_JOBS[job_id]})
            else:
                latest_job = list(ANALYSIS_JOBS.values())[-1] if ANALYSIS_JOBS else None
                if latest_job:
                    self._send_json_response(200, {"status": "ok", "job": latest_job})
                else:
                    self._send_json_response(404, {"status": "error", "error": "No active job found"})
        elif self.path.startswith("/api/heartbeat"):
            from urllib.parse import parse_qs, urlparse
            query = parse_qs(urlparse(self.path).query)
            action = query.get("action", [None])[0]

            global LAST_HEARTBEAT_TIME, HEARTBEAT_COUNT
            LAST_HEARTBEAT_TIME = time.time()
            self._send_json_response(200, {"status": "ok"})

            if action == "disconnect":
                is_running_job = any(j.get("status") == "running" for j in ANALYSIS_JOBS.values())
                if is_running_job:
                    print("\n[super_musician] 偵測到背景任務運行中，取消離線自動關機以維護分析進程。")
                else:
                    current_count = HEARTBEAT_COUNT
                    def _delayed_exit(captured_count):
                        time.sleep(2.5)
                        if HEARTBEAT_COUNT == captured_count and not any(j.get("status") == "running" for j in ANALYSIS_JOBS.values()):
                            print("\n[super_musician] 收到關閉視窗離線信號，未偵測到新連線，後端伺服器立即關機並釋放資源。")
                            os._exit(0)
                    threading.Thread(target=_delayed_exit, args=(current_count,), daemon=True).start()
            else:
                HEARTBEAT_COUNT += 1
        elif self.path == "/api/latest-analysis":
            analysis_file = RUNS_DIR / "web_analysis" / "analysis.json"
            if analysis_file.exists():
                data = json.loads(analysis_file.read_text(encoding="utf-8"))
                self._send_json_response(200, {"status": "ok", "data": data})
            else:
                self._send_json_response(404, {"status": "error", "error": "No analysis file found yet"})
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/heartbeat"):
            from urllib.parse import parse_qs, urlparse
            query = parse_qs(urlparse(self.path).query)
            action = query.get("action", [None])[0]

            global LAST_HEARTBEAT_TIME, HEARTBEAT_COUNT
            LAST_HEARTBEAT_TIME = time.time()
            self._send_json_response(200, {"status": "ok"})

            if action == "disconnect":
                is_running_job = any(j.get("status") == "running" for j in ANALYSIS_JOBS.values())
                if is_running_job:
                    print("\n[super_musician] 偵測到背景任務運行中，取消離線自動關機以維護分析進程。")
                else:
                    current_count = HEARTBEAT_COUNT
                    def _delayed_exit(captured_count):
                        time.sleep(2.5)
                        if HEARTBEAT_COUNT == captured_count and not any(j.get("status") == "running" for j in ANALYSIS_JOBS.values()):
                            print("\n[super_musician] 收到關閉視窗離線信號，未偵測到新連線，後端伺服器立即關機並釋放資源。")
                            os._exit(0)
                    threading.Thread(target=_delayed_exit, args=(current_count,), daemon=True).start()
            else:
                HEARTBEAT_COUNT += 1
        elif self.path == "/api/analyze-url":
            self._handle_analyze_url()
        elif self.path == "/api/save-analysis":
            self._handle_save_analysis()
        elif self.path == "/api/delete-preset":
            self._handle_delete_preset()
        else:
            self.send_error(404, "Endpoint not found")

    def _handle_delete_preset(self):
        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len)
        try:
            payload = json.loads(post_data.decode("utf-8"))
            folder_name = payload.get("folder")
            if not folder_name or not folder_name.startswith("saved_songs/"):
                self._send_json_response(400, {"status": "error", "error": "Invalid folder parameter for deletion"})
                return

            target_dir = RUNS_DIR / folder_name
            if target_dir.exists() and target_dir.is_dir():
                import shutil
                shutil.rmtree(target_dir, ignore_errors=True)
                self._send_json_response(200, {"status": "ok", "message": f"Successfully deleted preset {folder_name}"})
            else:
                self._send_json_response(404, {"status": "error", "error": f"Folder {folder_name} not found"})
        except Exception as exc:
            self._send_json_response(500, {"status": "error", "error": str(exc)})

    def _send_json_response(self, status_code: int, data: dict[str, Any]):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _get_associated_audio_files(self, folder_name: str = "web_analysis") -> list[Path]:
        if folder_name.startswith("saved_songs/"):
            out_dir = RUNS_DIR / folder_name
        elif (RUNS_DIR / "saved_songs" / folder_name).exists():
            out_dir = RUNS_DIR / "saved_songs" / folder_name
        else:
            out_dir = RUNS_DIR / folder_name

        audio_files = set()
        if out_dir.exists():
            for f in out_dir.glob("**/*"):
                if f.is_file() and f.suffix.lower() in [".mp3", ".wav", ".flac", ".m4a"]:
                    audio_files.add(f)
            analysis_file = out_dir / "analysis.json"
            if analysis_file.exists():
                try:
                    data = json.loads(analysis_file.read_text(encoding="utf-8", errors="replace"))
                    ref_file = data.get("file")
                    if ref_file:
                        ref_path = Path(ref_file)
                        if not ref_path.is_absolute():
                            ref_path = (BASE_DIR / ref_path).resolve()
                        if ref_path.exists():
                            audio_files.add(ref_path)
                            parent = ref_path.parent
                            while parent != BASE_DIR and parent != RUNS_DIR and parent != parent.parent:
                                for f in parent.glob("**/*"):
                                    if f.is_file() and f.suffix.lower() in [".mp3", ".wav", ".flac", ".m4a"]:
                                        audio_files.add(f)
                                parent = parent.parent
                except Exception as e:
                    print(f"[super_musician] Warning checking audio ref: {e}")
        return list(audio_files)

    def _handle_get_audio_size(self, folder_name: str = "web_analysis"):
        try:
            audio_files = self._get_associated_audio_files(folder_name)
            total_bytes = sum(f.stat().st_size for f in audio_files if f.exists())
            total_mb = round(total_bytes / (1024 * 1024), 2)
            self._send_json_response(200, {
                "status": "ok",
                "total_bytes": total_bytes,
                "total_mb": total_mb,
                "file_count": len(audio_files)
            })
        except Exception as exc:
            self._send_json_response(500, {"status": "error", "error": str(exc)})

    def _handle_get_presets(self):
        presets = []
        # 1. Scan saved_songs directory
        saved_dir = RUNS_DIR / "saved_songs"
        if saved_dir.exists():
            for folder in saved_dir.iterdir():
                if folder.is_dir():
                    analysis_file = folder / "analysis.json"
                    if analysis_file.exists():
                        try:
                            content = analysis_file.read_text(encoding="utf-8", errors="replace")
                            data = json.loads(content)
                            title = data.get("title") or folder.name
                            key_name = data.get("estimated_key", {}).get("name", "")
                            presets.append({
                                "folder": f"saved_songs/{folder.name}",
                                "title": f"💾 {title}",
                                "key": key_name
                            })
                        except Exception as e:
                            print(f"[super_musician] Presets scan error: {e}")

        # 2. Check active running job or web_analysis directory
        active_jobs = [j for j in ANALYSIS_JOBS.values() if j.get("status") == "running"]
        if active_jobs:
            latest = active_jobs[-1]
            presets.append({
                "folder": "web_analysis",
                "title": f"⏳ 正在分析: {latest.get('title', '新曲目')} ({latest.get('progress', 0)}%)",
                "key": "分析中"
            })
        else:
            web_dir = RUNS_DIR / "web_analysis"
            if web_dir.exists() and (web_dir / "analysis.json").exists():
                try:
                    content = (web_dir / "analysis.json").read_text(encoding="utf-8", errors="replace")
                    data = json.loads(content)
                    title = data.get("title") or "最新分析曲目"
                    key_name = data.get("estimated_key", {}).get("name", "")
                    presets.append({
                        "folder": "web_analysis",
                        "title": f"⚡ {title} (工作室暫存)",
                        "key": key_name
                    })
                except Exception:
                    pass

        self._send_json_response(200, {"status": "ok", "presets": presets})

    def _handle_get_preset(self):
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        folder_name = params.get("folder", ["web_analysis"])[0]

        if folder_name.startswith("saved_songs/"):
            target_dir = RUNS_DIR / folder_name
        elif (RUNS_DIR / "saved_songs" / folder_name).exists():
            target_dir = RUNS_DIR / "saved_songs" / folder_name
        else:
            target_dir = RUNS_DIR / folder_name

        analysis_file = target_dir / "analysis.json"
        if not analysis_file.exists():
            analysis_file = target_dir / "analysis" / "analysis.json"

        if analysis_file.exists():
            try:
                content = analysis_file.read_text(encoding="utf-8", errors="replace")
                data = json.loads(content)
                self._send_json_response(200, {"status": "ok", "data": data})
            except Exception as e:
                self._send_json_response(500, {"status": "error", "error": f"Failed to load preset: {str(e)}"})
        else:
            self._send_json_response(404, {"status": "error", "error": f"Preset {folder_name} not found"})

    def _handle_analyze_url(self):
        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len)
        try:
            payload = json.loads(post_data.decode("utf-8"))
            url = payload.get("url")
            if not url:
                self._send_json_response(400, {"status": "error", "error": "URL parameter is required"})
                return

            job_id = f"job_{int(time.time() * 1000)}"
            ANALYSIS_JOBS[job_id] = {
                "job_id": job_id,
                "status": "running",
                "progress": 5,
                "step": "已接收網址，正在啟動背景下載...",
                "title": "新曲目",
                "url": url,
                "data": None,
                "error": None
            }

            thread = threading.Thread(target=_run_async_analysis, args=(job_id, url, payload.get("title")), daemon=True)
            thread.start()

            self._send_json_response(200, {
                "status": "ok",
                "job_id": job_id,
                "message": "背景分析任務已啟動！您可以自由切換樂譜、瀏覽歷史存檔。"
            })
        except Exception as exc:
            self._send_json_response(500, {"status": "error", "error": str(exc)})

    def _handle_save_analysis(self):
        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len)
        try:
            payload = json.loads(post_data.decode("utf-8"))
            data = payload.get("data")
            save_audio = payload.get("save_audio", True)
            if not data:
                self._send_json_response(400, {"status": "error", "error": "Missing data payload"})
                return

            title = data.get("title", "未命名曲目")
            folder_name = self._sanitize_folder_name(title)

            save_dir = RUNS_DIR / "saved_songs" / folder_name
            save_dir.mkdir(parents=True, exist_ok=True)

            # Copy active audio files from web_analysis if save_dir is new
            active_dir = RUNS_DIR / "web_analysis"
            if active_dir.exists() and active_dir.resolve() != save_dir.resolve():
                for f in active_dir.glob("**/*"):
                    if f.is_file():
                        rel = f.relative_to(active_dir)
                        dst = save_dir / rel
                        dst.parent.mkdir(parents=True, exist_ok=True)
                        if not dst.exists() or f.stat().st_mtime > dst.stat().st_mtime:
                            import shutil
                            shutil.copy2(f, dst)

            analysis_file = save_dir / "analysis.json"
            analysis_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            write_markdown_report(save_dir / "summary.md", data)

            freed_bytes = 0
            if not save_audio:
                audio_files = self._get_associated_audio_files(f"saved_songs/{folder_name}")
                for f in audio_files:
                    if f.exists():
                        freed_bytes += f.stat().st_size
                        try:
                            f.unlink()
                        except Exception as e:
                            print(f"[super_musician] Warning: could not delete {f}: {e}")


            freed_mb = round(freed_bytes / (1024 * 1024), 2)
            self._send_json_response(200, {
                "status": "ok",
                "message": f"Saved successfully to {save_dir}",
                "folder": f"saved_songs/{folder_name}",
                "saved_audio": save_audio,
                "freed_mb": freed_mb
            })
        except Exception as exc:
            self._send_json_response(500, {"status": "error", "error": str(exc)})


def run_server(port: int = 8765):
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    watcher_thread = threading.Thread(target=_auto_shutdown_watcher, daemon=True)
    watcher_thread.start()

    server_address = ("", port)
    httpd = HTTPServer(server_address, MusicAnalyzerHandler)
    print(f"🎵 super_musician Server running at http://localhost:{port}")
    httpd.serve_forever()



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="super_musician Local Server")
    parser.add_argument("--port", type=int, default=8765, help="Port to bind server")
    args = parser.parse_args()
    run_server(args.port)

