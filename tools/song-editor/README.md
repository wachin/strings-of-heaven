# Desktop catalog editor (PyQt6)

A desktop form **identical to the web one** that writes one JSON file per song
into `shared/data/catalog/`. It exists so songs can be reviewed carefully, one at
a time, and then published to everybody with a normal `git commit` + `git push`.

## Why a desktop app

The web form stores songs in the browser's `localStorage`, which means they only
exist on that one device and browser. This editor writes real files into the
repository instead, so:

- songs are visible on **every** device — phone, tablet, someone else's computer;
- nothing is lost when browsing data is cleared;
- every change is reviewable in a git diff, and reversible.

## Single source of truth

**No music logic is written in Python.** The editor asks the shared TypeScript
engine — the very same modules the web app uses — and only draws the result:

```
PyQt6 (main.py)  ──JSON──▶  Node (engine_cli.ts)  ──▶  shared/engine/*.ts
                 ◀────────                       ◀──  shared/song/authoring.ts
```

`engine_cli.ts` is bundled with esbuild on every launch (esbuild ships with
Vite, so it is already installed). That is why validation rules, chord
detection, slug rules, catalog parsing and even the option labels can never
drift away from the website.

| Concern | Implemented in |
|---|---|
| Validation rules | `shared/song/authoring.ts` → `validateSongDraft` |
| Slug / file name | `shared/song/authoring.ts` → `songSlug`, `catalogFileName` |
| Legacy `.txt` parsing | `shared/song/authoring.ts` → `parseCatalogText` |
| Body parsing, chord detection | `shared/engine/chord_engine.ts`, `music_theory.ts` |
| Option labels | `shared/types/song.ts` |

## Install

```bash
# From the repository root
npm install                                   # for esbuild + the engine
pip install -r tools/song-editor/requirements.txt
```

## Run

```bash
python tools/song-editor/main.py
```

## The workflow

1. **New song** — fill the form (or **Import from Catalogo/\*.txt…** to start from
   one of the legacy files).
2. Watch the **live preview** and the **chords found** badges. If a chord is
   missing, that line was not recognised as a chord line: chords must sit alone
   on their own line, above the lyrics they belong to.
3. Press **Save JSON** (or `Ctrl+S`). The file lands in
   `shared/data/catalog/<slug>.json`.
4. Publish:

   ```bash
   git add shared/data/catalog/
   git commit -m "catalog: add <song>"
   git push
   ```

   GitHub Actions rebuilds and deploys; the song appears for everyone in about a
   minute.

## The body format

```
[Verse 1]
G               Em
Como el ciervo busca por las aguas,
      C      G         C    D
así clama mi alma por ti Señor.
```

- Section headers in square brackets: `[Verse 1]`, `[Chorus]`, `[Bridge]`.
- Chord names alone on their own line, above the matching lyric line.
- Align each chord above the syllable where it changes — the spaces matter.
- A line counts as a chord line when more than half of its words are valid
  chords, which is why chords must not be mixed into a lyric line.

## Importing the legacy catalog

`Import from Catalogo/*.txt…` reads one of the 271 plain-text files and fills the
form using these signals, in order:

1. the **file name** for the key `(D)` and capo `(Capo5)`;
2. the **first non-empty lines of the content** for title and artist, skipping
   `[Section]` headers and chord lines.

It is deliberately best-effort: anything it guessed or skipped is reported in the
status bar, and the point of the editor is that **you** review each song before
saving it.

## Troubleshooting

- **"esbuild was not found"** — run `npm install` in the repository root.
- **"The Node engine did not start"** — check that `node --version` works (Node 18+).
- The bundle is rebuilt on every launch into `tools/song-editor/.build/`, which
  is git-ignored. Delete that folder any time; it is regenerated.
