"""Bridge from the PyQt6 editor to the shared TypeScript engine.

The editor implements **no** music logic of its own. This module keeps a
long-lived Node child process running the bundled engine
(`tools/song-editor/engine_cli.ts`, built with esbuild) and exchanges
newline-delimited JSON with it.

Keeping the process alive matters: esbuild-free startup is ~50 ms, so the live
preview can ask the engine on every keystroke (debounced) without lag.
"""

from __future__ import annotations

import json
import queue
import subprocess
import threading
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
TOOL_DIR = Path(__file__).resolve().parent
ENTRY_FILE = TOOL_DIR / "engine_cli.ts"
BUNDLE_FILE = TOOL_DIR / ".build" / "engine_cli.mjs"

DEFAULT_TIMEOUT = 20.0


class EngineError(RuntimeError):
    """Raised when the Node engine cannot be built, started or queried."""


def _find_esbuild() -> Path | None:
    """esbuild ships with Vite, so it is normally already installed."""
    for candidate in (
        REPO_ROOT / "node_modules" / ".bin" / "esbuild",
        REPO_ROOT / "web" / "node_modules" / ".bin" / "esbuild",
    ):
        if candidate.exists():
            return candidate
    return None


def build_bundle() -> Path:
    """Bundle the TypeScript engine into a single runnable .mjs file."""
    esbuild = _find_esbuild()
    if esbuild is None:
        raise EngineError(
            "esbuild was not found.\n\n"
            "Install the project dependencies first:\n"
            f"    cd {REPO_ROOT} && npm install"
        )

    BUNDLE_FILE.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [
            str(esbuild),
            str(ENTRY_FILE),
            "--bundle",
            "--platform=node",
            "--format=esm",
            f"--outfile={BUNDLE_FILE}",
            "--log-level=warning",
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise EngineError(
            "Could not build the TypeScript engine:\n\n"
            f"{result.stderr.strip() or result.stdout.strip()}"
        )
    return BUNDLE_FILE


class EngineBridge:
    """Long-lived JSON-over-stdio connection to the shared engine."""

    def __init__(self) -> None:
        self._process: subprocess.Popen[str] | None = None
        self._pending: dict[int, queue.Queue[dict[str, Any]]] = {}
        self._write_lock = threading.Lock()
        self._next_id = 0
        self._ready = threading.Event()
        self._startup_error: str | None = None

    # ── Lifecycle ────────────────────────────────────────────────────────────

    def start(self) -> None:
        if self._process is not None:
            return

        bundle = build_bundle()
        self._process = subprocess.Popen(
            ["node", str(bundle)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            bufsize=1,
        )
        threading.Thread(target=self._read_stdout, daemon=True).start()
        threading.Thread(target=self._read_stderr, daemon=True).start()

        if not self._ready.wait(timeout=DEFAULT_TIMEOUT):
            self.close()
            detail = f"\n\n{self._startup_error}" if self._startup_error else ""
            raise EngineError(f"The Node engine did not start in time.{detail}")

    def close(self) -> None:
        process, self._process = self._process, None
        if process is None:
            return
        try:
            if process.stdin:
                process.stdin.close()
            process.terminate()
            process.wait(timeout=5)
        except Exception:  # noqa: BLE001 - shutting down is best-effort
            process.kill()

    def _read_stdout(self) -> None:
        process = self._process
        if process is None or process.stdout is None:
            return
        for line in process.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                message = json.loads(line)
            except json.JSONDecodeError:
                continue

            if message.get("event") == "ready":
                self._ready.set()
                continue

            inbox = self._pending.get(message.get("id"))
            if inbox is not None:
                inbox.put(message)

        # stdout closed: unblock anyone still waiting.
        self._ready.set()
        for inbox in list(self._pending.values()):
            inbox.put({"ok": False, "error": "The Node engine stopped unexpectedly."})

    def _read_stderr(self) -> None:
        process = self._process
        if process is None or process.stderr is None:
            return
        for line in process.stderr:
            if line.strip():
                self._startup_error = line.strip()

    # ── Requests ─────────────────────────────────────────────────────────────

    def request(self, op: str, timeout: float = DEFAULT_TIMEOUT, **payload: Any) -> dict[str, Any]:
        process = self._process
        if process is None or process.stdin is None:
            raise EngineError("The Node engine is not running.")

        with self._write_lock:
            self._next_id += 1
            request_id = self._next_id
            inbox: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=1)
            self._pending[request_id] = inbox
            try:
                process.stdin.write(json.dumps({"id": request_id, "op": op, **payload}) + "\n")
                process.stdin.flush()
            except (BrokenPipeError, ValueError) as error:
                self._pending.pop(request_id, None)
                raise EngineError(f"The Node engine is not accepting requests: {error}") from error

        try:
            message = inbox.get(timeout=timeout)
        except queue.Empty as error:
            raise EngineError(f'The engine did not answer "{op}" in {timeout:.0f}s.') from error
        finally:
            self._pending.pop(request_id, None)

        if not message.get("ok"):
            raise EngineError(message.get("error") or f'"{op}" failed.')
        return message.get("result") or {}

    # ── Typed helpers ────────────────────────────────────────────────────────

    def analyze(self, body: str, instrument: str = "guitar") -> dict[str, Any]:
        return self.request("analyze", body=body, instrument=instrument)

    def validate(self, draft: dict[str, Any]) -> dict[str, Any]:
        return self.request("validate", draft=draft)

    def slug(self, title: str, artist: str) -> dict[str, Any]:
        return self.request("slug", title=title, artist=artist)

    def import_catalog(self, text: str, file_name: str) -> dict[str, Any]:
        return self.request("importCatalog", text=text, fileName=file_name)

    def transpose(self, body: str, semitones: int, sharps: bool = True) -> dict[str, Any]:
        return self.request("transpose", body=body, semitones=semitones, sharps=sharps)
