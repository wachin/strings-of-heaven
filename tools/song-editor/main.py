#!/usr/bin/env python3
"""Strings of Heaven — desktop catalog editor (PyQt6).

The same form as the web page, but it writes one JSON file per song into
``shared/data/catalog/`` so the songs can be reviewed carefully, committed and
published for every device.

All music logic — validation, chord detection, catalog parsing, option labels —
comes from the shared TypeScript engine through ``bridge.py``. This file only
builds the UI and writes files.

    python tools/song-editor/main.py
"""

from __future__ import annotations

import html
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QAction, QFont, QFontDatabase, QKeySequence
from PyQt6.QtWidgets import (
    QApplication,
    QComboBox,
    QFileDialog,
    QFormLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QMainWindow,
    QMessageBox,
    QPlainTextEdit,
    QPushButton,
    QSpinBox,
    QSplitter,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from bridge import REPO_ROOT, EngineBridge, EngineError

CATALOG_DIR = REPO_ROOT / "shared" / "data" / "catalog"
LEGACY_DIR = REPO_ROOT / "Catalogo"

DEBOUNCE_MS = 250

STATUS_OK = "color:#15803d; font-weight:600"
STATUS_BAD = "color:#b91c1c; font-weight:600"
STATUS_WARN = "color:#b45309; font-weight:600"


# ── Preview rendering (mirrors web/src/components/SongBody.tsx) ──────────────


def _esc(text: str) -> str:
    return html.escape(text)


def _display(path: Path) -> str:
    """Path relative to the repository when possible, absolute otherwise."""
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def _spaced(text: str) -> str:
    """Escape text and keep every space visible in Qt's rich text."""
    return _esc(text).replace(" ", "&nbsp;")


def _chord_line_html(line: dict[str, Any]) -> str:
    """Rebuild a chord line span by span, preserving the original columns."""
    raw = line.get("raw", "")
    tokens = line.get("tokens") or []
    parts: list[str] = []
    cursor = 0

    for token in tokens:
        column = int(token.get("column", 0))
        chord = str(token.get("chord", ""))
        if column > cursor:
            parts.append(_spaced(raw[cursor:column]))
        parts.append(f'<span style="color:#b45309; font-weight:bold">{_esc(chord)}</span>')
        cursor = column + len(chord)

    if cursor < len(raw):
        parts.append(_spaced(raw[cursor:]))
    return "".join(parts)


def build_preview_html(lines: list[dict[str, Any]]) -> str:
    blocks: list[str] = []
    for line in lines:
        kind = line.get("type")
        if kind == "blank":
            blocks.append("<div>&nbsp;</div>")
        elif kind == "header":
            blocks.append(
                '<div style="margin-top:12px; color:#4f46e5; font-weight:bold">'
                f'{_esc(line.get("raw", ""))}</div>'
            )
        elif kind == "chord":
            blocks.append(f'<div>{_chord_line_html(line)}</div>')
        else:
            blocks.append(f'<div>{_spaced(line.get("raw", ""))}</div>')
    return "".join(blocks)


# ── Main window ──────────────────────────────────────────────────────────────


class SongEditor(QMainWindow):
    def __init__(self, engine: EngineBridge, labels: dict[str, dict[str, str]]) -> None:
        super().__init__()
        self.engine = engine
        self.labels = labels
        self.current_path: Path | None = None
        self.current_meta: dict[str, Any] = {}
        self.dirty = False

        self.setWindowTitle("Strings of Heaven — Catalog editor")
        self.resize(1280, 860)

        self._build_ui()
        self._wire_shortcuts()

        self.debounce = QTimer(self)
        self.debounce.setSingleShot(True)
        self.debounce.setInterval(DEBOUNCE_MS)
        self.debounce.timeout.connect(self._refresh_live)

        self.refresh_catalog_list()
        self._refresh_live()

    # ── UI construction ──────────────────────────────────────────────────────

    def _build_ui(self) -> None:
        mono = QFontDatabase.systemFont(QFontDatabase.SystemFont.FixedFont)

        # Left: the catalog already in the repository.
        self.catalog_list = QListWidget()
        self.catalog_list.currentItemChanged.connect(self._on_catalog_selected)

        new_button = QPushButton("＋ New song")
        new_button.clicked.connect(self.new_song)
        import_button = QPushButton("Import from Catalogo/*.txt…")
        import_button.clicked.connect(self.import_legacy)
        refresh_button = QPushButton("Refresh list")
        refresh_button.clicked.connect(self.refresh_catalog_list)

        left = QWidget()
        left_layout = QVBoxLayout(left)
        left_layout.addWidget(QLabel("<b>Published catalog</b>"))
        left_layout.addWidget(
            QLabel(f"<small>{_display(CATALOG_DIR)}</small>")
        )
        left_layout.addWidget(self.catalog_list, 1)
        left_layout.addWidget(new_button)
        left_layout.addWidget(import_button)
        left_layout.addWidget(refresh_button)

        # Right — metadata form.
        self.title_edit = QLineEdit()
        self.artist_edit = QLineEdit()
        self.type_combo = QComboBox()
        self.difficulty_combo = QComboBox()
        self.capo_spin = QSpinBox()
        self.capo_spin.setRange(0, 12)
        self.key_edit = QLineEdit()
        self.key_edit.setPlaceholderText("e.g. G, Bb, C#m")
        self.tuning_edit = QLineEdit()
        self.tuning_edit.setPlaceholderText("Standard")
        self.bpm_spin = QSpinBox()
        self.bpm_spin.setRange(0, 400)
        self.time_combo = QComboBox()
        self.desc_edit = QPlainTextEdit()
        self.desc_edit.setFixedHeight(70)

        for combo, key in (
            (self.type_combo, "songType"),
            (self.difficulty_combo, "difficulty"),
            (self.time_combo, "timeSignature"),
        ):
            for value, label in self.labels[key].items():
                combo.addItem(label, value)

        meta_group = QGroupBox("Song info & musical settings")
        meta = QFormLayout(meta_group)
        meta.addRow("Title *", self.title_edit)
        meta.addRow("Artist *", self.artist_edit)
        meta.addRow("Content type", self.type_combo)
        meta.addRow("Difficulty", self.difficulty_combo)
        meta.addRow("Capo (0 = none)", self.capo_spin)
        meta.addRow("Key (sounding)", self.key_edit)
        meta.addRow("Tuning", self.tuning_edit)
        meta.addRow("BPM (0 = unknown)", self.bpm_spin)
        meta.addRow("Time signature", self.time_combo)
        meta.addRow("Performance notes", self.desc_edit)

        # Right — body editor.
        self.body_edit = QPlainTextEdit()
        self.body_edit.setFont(mono)
        self.body_edit.setTabStopDistance(4 * self.body_edit.fontMetrics().horizontalAdvance(" "))
        self.body_edit.setPlaceholderText(
            "[Verse 1]\nG               Em\nComo el ciervo busca por las aguas,"
        )

        body_group = QGroupBox("Song body * (chords on their own line, above the lyrics)")
        body_layout = QVBoxLayout(body_group)
        body_layout.addWidget(self.body_edit)

        # Right — preview and chord badges.
        self.preview = QTextEdit()
        self.preview.setReadOnly(True)
        self.preview.setFont(mono)
        self.preview.setStyleSheet("background:#ffffff; color:#1e293b;")
        self.chord_badges = QLabel("—")
        self.chord_badges.setWordWrap(True)

        preview_group = QGroupBox("Live preview")
        preview_layout = QVBoxLayout(preview_group)
        preview_layout.addWidget(self.chord_badges)
        preview_layout.addWidget(self.preview, 1)

        editor_split = QSplitter(Qt.Orientation.Horizontal)
        editor_split.addWidget(body_group)
        editor_split.addWidget(preview_group)
        editor_split.setSizes([520, 480])

        right_split = QSplitter(Qt.Orientation.Vertical)
        right_split.addWidget(meta_group)
        right_split.addWidget(editor_split)
        right_split.setSizes([330, 480])

        # Bottom — actions and status.
        self.save_button = QPushButton("Save JSON")
        self.save_button.clicked.connect(self.save_song)
        self.save_next_button = QPushButton("Save && new")
        self.save_next_button.clicked.connect(lambda: self.save_song(then_new=True))

        self.status = QLabel("Ready.")
        self.status.setWordWrap(True)

        actions = QHBoxLayout()
        actions.addWidget(QLabel("Target file:"))
        self.target_label = QLabel("—")
        self.target_label.setTextInteractionFlags(
            Qt.TextInteractionFlag.TextSelectableByMouse
        )
        actions.addWidget(self.target_label, 1)
        actions.addWidget(self.save_button)
        actions.addWidget(self.save_next_button)

        right = QWidget()
        right_layout = QVBoxLayout(right)
        right_layout.addWidget(right_split, 1)
        right_layout.addLayout(actions)
        right_layout.addWidget(self.status)

        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.addWidget(left)
        splitter.addWidget(right)
        splitter.setSizes([280, 1000])
        self.setCentralWidget(splitter)

        # Live feedback: validate and analyse while typing.
        for widget in (self.title_edit, self.artist_edit, self.key_edit, self.tuning_edit):
            widget.textChanged.connect(self._schedule_refresh)
        for widget in (self.desc_edit, self.body_edit):
            widget.textChanged.connect(self._schedule_refresh)
        for widget in (self.capo_spin, self.bpm_spin):
            widget.valueChanged.connect(self._schedule_refresh)
        for widget in (self.type_combo, self.difficulty_combo, self.time_combo):
            widget.currentIndexChanged.connect(self._schedule_refresh)

    def _wire_shortcuts(self) -> None:
        save = QAction("Save", self)
        save.setShortcut(QKeySequence.StandardKey.Save)
        save.triggered.connect(self.save_song)
        self.addAction(save)

    # ── Draft <-> form ───────────────────────────────────────────────────────

    def current_draft(self) -> dict[str, Any]:
        return {
            "title": self.title_edit.text().strip(),
            "artist": self.artist_edit.text().strip(),
            "type": self.type_combo.currentData(),
            "capo": self.capo_spin.value(),
            "tuning": self.tuning_edit.text().strip() or "Standard",
            "key": self.key_edit.text().strip(),
            "bpm": self.bpm_spin.value(),
            "timeSignature": self.time_combo.currentData(),
            "difficulty": self.difficulty_combo.currentData(),
            "description": self.desc_edit.toPlainText(),
            "body": self.body_edit.toPlainText(),
        }

    def load_draft(self, draft: dict[str, Any], meta: dict[str, Any] | None = None) -> None:
        self.current_meta = meta or {}

        def set_combo(combo: QComboBox, value: Any) -> None:
            index = combo.findData(value)
            if index >= 0:
                combo.setCurrentIndex(index)

        self.title_edit.setText(draft.get("title", ""))
        self.artist_edit.setText(draft.get("artist", ""))
        set_combo(self.type_combo, draft.get("type", "chords"))
        set_combo(self.difficulty_combo, draft.get("difficulty", "beginner"))
        set_combo(self.time_combo, draft.get("timeSignature", "4/4"))
        self.capo_spin.setValue(int(draft.get("capo", 0) or 0))
        self.key_edit.setText(draft.get("key", ""))
        self.tuning_edit.setText(draft.get("tuning", "Standard"))
        self.bpm_spin.setValue(int(draft.get("bpm", 0) or 0))
        self.desc_edit.setPlainText(draft.get("description", ""))
        self.body_edit.setPlainText(draft.get("body", ""))

    def new_song(self) -> None:
        if not self._confirm_discard():
            return
        self.current_path = None
        self.load_draft({"title": "", "artist": "", "body": ""})
        self.catalog_list.clearSelection()
        self.title_edit.setFocus()
        self._refresh_live()

    # ── Live preview + validation ────────────────────────────────────────────

    def _schedule_refresh(self) -> None:
        self.dirty = True
        self.debounce.start()

    def _refresh_live(self) -> None:
        draft = self.current_draft()

        # Preview and chord badges come from the real engine.
        try:
            analysis = self.engine.analyze(draft["body"])
            self.preview.setHtml(build_preview_html(analysis.get("lines", [])))
            chords = analysis.get("uniqueChords", [])
            if chords:
                self.chord_badges.setText(
                    f"<b>Chords found ({len(chords)}):</b> "
                    + " ".join(
                        f'<span style="color:#b45309; font-weight:bold">{_esc(c)}</span>'
                        for c in chords
                    )
                )
            else:
                self.chord_badges.setText(
                    '<span style="color:#b45309">No chords detected — '
                    "keep them on their own line, above the lyrics.</span>"
                )
        except EngineError as error:
            self.preview.setPlainText(f"(engine error)\n{error}")

        # Validation uses the same rules as the web form.
        try:
            report = self.engine.validate(draft)
        except EngineError as error:
            self.status.setStyleSheet(STATUS_BAD)
            self.status.setText(f"Engine error: {error}")
            return

        if report.get("valid"):
            self.status.setStyleSheet(STATUS_OK)
            suffix = " (modified)" if self.dirty else ""
            self.status.setText(f"✓ Ready to save{suffix}")
        else:
            self.status.setStyleSheet(STATUS_BAD)
            problems = " · ".join(str(m) for m in (report.get("errors") or {}).values())
            self.status.setText(f"✗ {problems}")

        self._update_target_label()

    def _update_target_label(self) -> None:
        draft = self.current_draft()
        try:
            info = self.engine.slug(draft["title"], draft["artist"])
        except EngineError:
            self.target_label.setText("—")
            return
        name = info.get("fileName", "—")
        if self.current_path:
            self.target_label.setText(_display(self.current_path))
        else:
            self.target_label.setText(_display(CATALOG_DIR / name))

    # ── Catalog list ─────────────────────────────────────────────────────────

    def refresh_catalog_list(self) -> None:
        self.catalog_list.blockSignals(True)
        self.catalog_list.clear()
        if CATALOG_DIR.exists():
            for path in sorted(CATALOG_DIR.glob("*.json")):
                item = QListWidgetItem(path.name)
                item.setData(Qt.ItemDataRole.UserRole, str(path))
                self.catalog_list.addItem(item)
        self.catalog_list.blockSignals(False)
        self.catalog_list.setToolTip(f"{self.catalog_list.count()} song(s)")

    def _on_catalog_selected(self, current: QListWidgetItem | None, _previous=None) -> None:
        if current is None:
            return
        if not self._confirm_discard():
            self.refresh_catalog_list()
            return
        self.open_catalog_file(Path(current.data(Qt.ItemDataRole.UserRole)))

    def open_catalog_file(self, path: Path) -> None:
        try:
            entry = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            QMessageBox.critical(self, "Cannot open", f"{path.name}\n\n{error}")
            return

        self.load_draft(entry, meta=entry)
        self.current_path = path
        self.dirty = False
        self.status.setStyleSheet(STATUS_OK)
        self.status.setText(f"Opened {path.name}")
        self._refresh_live()

    # ── Legacy import ────────────────────────────────────────────────────────

    def import_legacy(self) -> None:
        start_dir = str(LEGACY_DIR if LEGACY_DIR.exists() else REPO_ROOT)
        file_name, _ = QFileDialog.getOpenFileName(
            self, "Open a Catalogo/*.txt file", start_dir, "Text files (*.txt)"
        )
        if not file_name:
            return
        if not self._confirm_discard():
            return

        path = Path(file_name)
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError as error:
            QMessageBox.critical(self, "Cannot read", f"{path.name}\n\n{error}")
            return

        try:
            result = self.engine.import_catalog(text, path.name)
        except EngineError as error:
            QMessageBox.critical(self, "Engine error", str(error))
            return

        self.current_path = None
        self.load_draft(result.get("draft", {}))
        self.dirty = True

        warnings = result.get("warnings") or []
        if warnings:
            self.status.setStyleSheet(STATUS_WARN)
            self.status.setText("⚠ " + " · ".join(warnings))
        else:
            self.status.setStyleSheet(STATUS_OK)
            self.status.setText(f"Imported {path.name} — review it, then save.")
        self._refresh_live()
        self.title_edit.setFocus()

    # ── Saving ───────────────────────────────────────────────────────────────

    def save_song(self, then_new: bool = False) -> None:
        draft = self.current_draft()

        try:
            report = self.engine.validate(draft)
        except EngineError as error:
            QMessageBox.critical(self, "Engine error", str(error))
            return

        if not report.get("valid"):
            problems = "\n".join(f"• {m}" for m in (report.get("errors") or {}).values())
            QMessageBox.warning(self, "Fix these first", problems)
            return

        if self.current_path is not None:
            target = self.current_path
        else:
            try:
                info = self.engine.slug(draft["title"], draft["artist"])
            except EngineError as error:
                QMessageBox.critical(self, "Engine error", str(error))
                return
            target = CATALOG_DIR / info.get("fileName", "song.json")

        if self.current_path is None and target.exists():
            answer = QMessageBox.question(
                self,
                "Already exists",
                f"{target.name} already exists.\n\nOverwrite it?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            )
            if answer != QMessageBox.StandardButton.Yes:
                return

        now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
        entry = {
            "id": self.current_meta.get("id") or target.stem,
            "title": draft["title"],
            "artist": draft["artist"],
            "type": draft["type"],
            "capo": draft["capo"],
            "tuning": draft["tuning"],
            "key": draft["key"],
            "bpm": draft["bpm"],
            "timeSignature": draft["timeSignature"],
            "difficulty": draft["difficulty"],
            "description": draft["description"],
            "body": draft["body"],
            "createdAt": self.current_meta.get("createdAt") or now,
            "updatedAt": now,
            "version": int(self.current_meta.get("version") or 1) + (1 if self.current_path else 0),
        }

        try:
            CATALOG_DIR.mkdir(parents=True, exist_ok=True)
            target.write_text(
                json.dumps(entry, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
            )
        except OSError as error:
            QMessageBox.critical(self, "Cannot write", f"{target}\n\n{error}")
            return

        self.current_path = target
        self.current_meta = entry
        self.dirty = False
        self.refresh_catalog_list()
        self._select_path(target)
        self._update_target_label()
        self.status.setStyleSheet(STATUS_OK)
        self.status.setText(
            f"✓ Saved {_display(target)} — now commit and push to publish it."
        )

        if then_new:
            self.new_song()

    def _select_path(self, path: Path) -> None:
        for row in range(self.catalog_list.count()):
            item = self.catalog_list.item(row)
            if item and item.data(Qt.ItemDataRole.UserRole) == str(path):
                self.catalog_list.blockSignals(True)
                self.catalog_list.setCurrentItem(item)
                self.catalog_list.blockSignals(False)
                return

    def _confirm_discard(self) -> bool:
        if not self.dirty:
            return True
        answer = QMessageBox.question(
            self,
            "Unsaved changes",
            "This song has unsaved changes.\n\nDiscard them?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )
        return answer == QMessageBox.StandardButton.Yes

    def closeEvent(self, event) -> None:  # noqa: N802 - Qt naming
        if self._confirm_discard():
            self.engine.close()
            event.accept()
        else:
            event.ignore()


def main() -> int:
    app = QApplication(sys.argv)
    app.setApplicationName("Strings of Heaven — Catalog editor")
    app.setFont(QFont(app.font().family(), 10))

    engine = EngineBridge()
    try:
        engine.start()
        labels = engine.request("labels")
    except EngineError as error:
        QMessageBox.critical(None, "Cannot start the engine", str(error))
        return 1

    window = SongEditor(engine, labels)
    window.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
