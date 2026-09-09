# ROADMAP: Guitar Chord & Music Theory App

> **Instructions for the AI agent:** This document is your complete guide to building an Android app (React Native) and a website (React + Redux) for guitar chords and music theory. The app supports **both guitar and piano chord diagrams** with a toggle between instruments. Read each section in order before writing any code. Use the `third-party/` repositories as data sources — use them as reference.

---

## 1. Project overview

Build a guitar/music app with two platforms that share the same API and data model:

| Platform | Technology |
|---|---|
| Android/iOS app | React Native (latest stable) |
| Website | React + Redux (with optional SSR) |
| Shared API | REST JSON (Node.js + Express or similar) |
| Chord database | JSON files from `third-party/` (no external server in v1) |

**Minimum viable features (MVP):**
- Guitar **and piano** chord library (diagram viewer with instrument toggle)
- Search by root note and chord type
- Scale viewer
- Basic music theory (intervals, scales, modes)
- Dark / light mode
- Responsive (web) / mobile-friendly (app)

---

## 2. How to configure third-party submodules

A `third-party/` folder is used to add reference repositories:

chord databases, music theory libraries, manuals, and Flet's own documentation. The idea is that the agent can **read/investigate** these repos as needed, without manually copying their code.

Run from repository root:

```bash
mkdir -p third-party

# --- Guitar chord databases (fingerings) ---

# 1. Most complete and best structured (frets, fingers, barres, MIDI)
git submodule add https://github.com/tombatossals/chords-db.git third-party/chords-db

# 2. Alternative with ~99,230 chord variants in JSON (more coverage, less structure)
git submodule add https://github.com/szaza/guitar-chords-db-json.git third-party/guitar-chords-db-json

# --- Music theory / piano reference ---

# 3. Python music theory library (notes, intervals, scales, chords)
#    Useful as algorithm reference, even if not used directly as dependency.
git submodule add https://github.com/gciruelos/musthe.git third-party/musthe

# 4. Open general music theory manual/interactive (covers piano and keyboard)
git submodule add https://github.com/openmusictheory/openmusictheory.github.io.git third-party/openmusictheory

# 5. Piano technique and practice book (Chuan C. Chang, adapted to Sphinx/reStructuredText)
#    More oriented to "how to practice" than pure theory, but has relevant
#    content on fingering and reading that may serve for future features.
git submodule add https://github.com/gmoe/piano_fundamentals.git third-party/piano_fundamentals

# 6. Reference dataset of scales/chords/intervals, in readable and "parseable" JSON
#    Good for validating or completing CHORD_FORMULAS in chord_engine.py.
git submodule add https://github.com/seancolsen/music-theory-data.git third-party/music-theory-data
```

After adding all:

```bash
git submodule update --init --recursive
git add .gitmodules third-party
git commit -m "Add third-party submodules for research (chords, music theory, Flet docs)"
```

---

## 3. Third-party repository guide

The agent **must read** these repos before implementing any chord logic or music theory.

### 3.1 `third-party/chords-db` — Primary database for guitar AND piano (HIGH PRIORITY)

**Key paths:**
- `third-party/chords-db/lib/guitar.json` — guitar chord positions
- `third-party/chords-db/lib/piano.json` — piano chord positions
- `third-party/chords-db/lib/ukulele.json` — ukulele chord positions

This is the most complete and well-structured JSON. It contains chord positions for guitar, piano, and ukulele. **Both guitar and piano data are already available here** — no external API needed.

#### Guitar chord structure (`guitar.json`):
```json
{
  "key": "C",
  "suffix": "major",
  "positions": [
    {
      "frets": [-1, 3, 2, 0, 1, 0],
      "fingers": [0, 3, 2, 0, 1, 0],
      "baseFret": 1,
      "barres": [],
      "midi": [48, 52, 55, 60, 64]
    }
  ]
}
```

- `frets`: array of 6 strings (low E → high E). `-1` = muted string, `0` = open string.
- `fingers`: finger used on each string (0 = none, 1–4 = index to pinky).
- `baseFret`: base fret position (for positions up the neck).
- `barres`: array of frets where a barre is applied.
- `midi`: MIDI notes that sound.

#### Piano chord structure (`piano.json`):
```json
{
  "key": "C",
  "suffix": "major",
  "positions": [
    {
      "frets": ["C", "E", "G"],
      "fingers": ["1", "3", "5"],
      "midi": [60, 64, 67]
    }
  ]
}
```

- `frets`: **array of note names** that form the chord (not fret numbers like guitar).
- `fingers`: scale degree of each note (`"1"` = root, `"3"` = third, `"b7"` = flat seventh, etc.).
- `midi`: MIDI note numbers for each key pressed.
- There is only **one position per chord** (unlike guitar which has multiple voicings). The diagram shows which keys to press on the keyboard.

**Available keys (both instruments):** C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B

**Available guitar suffixes:** `major`, `minor`, `dim`, `dim7`, `sus`, `sus2`, `sus4`, `7`, `maj7`, `m7`, `aug`, `5`, `6`, `9`, `maj9`, `m9`, `add9`, and many more (see `lib/guitar.json` for the full list).

**Available piano suffixes:** `major`, `m`, `dim`, `dim7`, `sus2`, `sus4`, `7sus4`, `aug`, `aug7`, `aug9`, `5`, `6`, `69`, `7`, `7b5`, `7b9`, `7sharp9`, `9`, `11`, `13`, `add9`, `maj7`, `maj7b5`, `maj9`, `maj11`, `maj13`, `m6`, `m7`, `m7b5`, `m9`, `m11`, `mmaj7`, `mmaj7b5`, and more (see `lib/piano.json`).

**Agent instruction:** Use `chords-db/lib/guitar.json` for guitar diagrams and `chords-db/lib/piano.json` for piano diagrams. The `instrument` state in Redux (`"guitar"` | `"piano"` | `"ukulele"`) determines which file to load from. **Do not use any external API (e.g. scales-chords.com) for chord data** — everything is available locally.

### 3.2 `third-party/guitar-chords-db-json` — Alternative database (MEDIUM PRIORITY)

**Path:** `third-party/guitar-chords-db-json/{NOTE}/{suffix}.json`

Organized by note folders (A, A#, B, C, ...) and files by chord type. It has more variants (~99,230 positions) but with a different format:

```json
{
  "key": "A",
  "suffix": "major",
  "positions": [
    {
      "frets": "x02220",
      "fingers": "001230"
    },
    {
      "frets": "577655",
      "fingers": "134211",
      "barres": "5",
      "capo": "true"
    }
  ]
}
```

- `frets` as a hex string (`x` = muted, `0`–`9`, `a`=10, `b`=11, etc.).
- Useful as a fallback or for rare chords not found in `chords-db`.

**Agent instruction:** Use it as a supplement. If a chord has no positions in `chords-db`, look here. You will need a parser to convert the hex fret string to a number array.

### 3.3 `third-party/musthe` — Python music theory library (ALGORITHM REFERENCE)

**Path:** `third-party/musthe/musthe/musthe.py`

Python library that models: `Note`, `Letter`, `Interval`, `Chord`, `Scale`. Although it will not be used directly in JS/TS, its code is the **algorithm reference** for implementing music theory logic in JavaScript.

**What it implements and that the agent must replicate in JS:**

- **Notes:** C, D, E, F, G, A, B with accidentals (b, #) and octave.
- **Intervals:** P1, m2, M2, m3, M3, P4, A4, d5, P5, A5, m6, M6, m7, M7, P8. With semitones defined.
- **Scales:** `major`, `natural_minor`, `harmonic_minor`, `melodic_minor`, `major_pentatonic`, `minor_pentatonic`, and the 7 Greek modes (ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian).
- **Chords with interval formulas:**
  ```
  maj:    [P1, M3, P5]
  min:    [P1, m3, P5]
  aug:    [P1, M3, A5]
  dim:    [P1, m3, d5]
  dom7:   [P1, M3, P5, m7]
  min7:   [P1, m3, P5, m7]
  maj7:   [P1, M3, P5, M7]
  dim7:   [P1, m3, d5, d7]
  sus2:   [P1, P5, P8, M2]
  sus4:   [P1, P5, P8, P4]
  dom9:   [P1, M3, P5, m7, M9]
  ...
  ```
- **`Scale.harmonize()`**: given a scale, returns the chords for each degree. Very useful for the "scale chords" section.

**Agent instruction:** Read `musthe.py` in full before implementing `chord_engine.js` / `music_theory.js`. The interval formulas and chord recipes are the source of truth.

### 3.4 `third-party/music-theory-data` — YAML theory dataset (DATA REFERENCE)

**Paths:**
- `third-party/music-theory-data/EqualTemperament/12-Tone/Chords.yaml`
- `third-party/music-theory-data/EqualTemperament/12-Tone/Scales.yaml`
- `third-party/music-theory-data/EqualTemperament/12-Tone/Intervals.yaml`
- `third-party/music-theory-data/EqualTemperament/12-Tone/Notes.yaml`

Contains formal chord definitions with their binary representation (12-bit bitmask), alternative names, abbreviations, HTML symbols, and Wikipedia links. Example:

```yaml
- binary: 145
  names:
    - Major
  abbreviations:
    - Maj
  symbols:
    - M
    - Δ
  links:
    - 'https://en.wikipedia.org/wiki/Major_chord'
```

It also includes `Scales.yaml` with hundreds of world scales (Indian ragas, Greek modes, African scales, etc.) with their bitmask.

**Agent instruction:** Use this dataset to enrich the UI with alternative chord names, symbols, and descriptions. The binary bitmask is useful for chord detection by notes.

### 3.5 `third-party/openmusictheory` — Music theory textbook (PEDAGOGICAL REFERENCE)

Interactive music theory textbook (Open Music Theory). Covers: notation, intervals, scales, chords, tonal harmony, modes, etc.

**Agent instruction:** Consult this repo when writing the educational descriptions and texts for each musical concept shown in the UI. Do not copy text directly; use it as a content guide.

### 3.6 `third-party/piano_fundamentals` — Piano fundamentals (PEDAGOGICAL REFERENCE)

Chuan C. Chang's book on piano technique and practice. Useful for a "how to practice" section and potential piano features in the future.

**Agent instruction:** Consult this repo if piano/keyboard features are added to the app. For the guitar MVP, it is a secondary reference.

---

## 4. Project architecture

```
/
├── app/                    # React Native (Android + iOS)
│   ├── src/
│   │   ├── components/     # UI components (ChordDiagram, FretBoard, etc.)
│   │   ├── screens/        # Screens (Home, ChordLibrary, Scales, Theory)
│   │   ├── navigation/     # React Navigation
│   │   ├── store/          # Redux store, slices, selectors
│   │   ├── services/       # API calls
│   │   ├── engine/         # chord_engine.js, music_theory.js (pure logic)
│   │   └── data/           # Pre-processed chord JSONs from third-party/
│   └── package.json
│
├── web/                    # React + Redux (SPA or SSR)
│   ├── src/
│   │   ├── components/     # Same components as app/ (adapted for DOM)
│   │   ├── pages/          # Home, Explore, ChordDetail, Theory
│   │   ├── store/          # Redux store shared with app/ where possible
│   │   ├── services/       # Same endpoints as app/
│   │   └── engine/         # Same chord_engine.js, music_theory.js files
│   └── package.json
│
├── shared/                 # Code 100% shared between app and web
│   ├── engine/
│   │   ├── chord_engine.js     # Chord parser and logic (guitar + piano)
│   │   └── music_theory.js     # Notes, intervals, scales (based on musthe)
│   ├── data/
│   │   ├── guitar_chords.json  # Processed from chords-db/lib/guitar.json
│   │   ├── piano_chords.json   # Processed from chords-db/lib/piano.json
│   │   └── ukulele_chords.json # Processed from chords-db/lib/ukulele.json
│   └── constants/
│       └── theory.js           # Intervals, chord formulas, names
│
├── api/                    # Node.js/Express backend (optional in v1)
│   ├── routes/
│   └── index.js
│
└── third-party/            # Reference submodules (read-only)
    ├── chords-db/
    ├── guitar-chords-db-json/
    ├── musthe/
    ├── music-theory-data/
    ├── openmusictheory/
    └── piano_fundamentals/
```

---

## 5. Implementation tasks

### PHASE 1 — Data engine (shared/)

- [ ] **T1.1** Read `third-party/chords-db/lib/guitar.json` and generate a clean, optimized `shared/data/guitar_chords.json` (no redundant data).
- [ ] **T1.1b** Read `third-party/chords-db/lib/piano.json` and generate `shared/data/piano_chords.json`. Note: piano positions use note names (`["C", "E", "G"]`) instead of fret numbers — the processing logic is different from guitar.
- [ ] **T1.1c** Read `third-party/chords-db/lib/ukulele.json` and generate `shared/data/ukulele_chords.json`.
- [ ] **T1.2** Implement `shared/engine/music_theory.js`:
  - `Note` class/object (name, octave, MIDI, frequency)
  - `INTERVALS` object with semitones (based on `musthe.py`)
  - `buildScale(root, scaleName)` function → note array
  - `buildChordNotes(root, chordType)` function → note array
  - Support for scales: major, natural_minor, harmonic_minor, pentatonic, and 7 Greek modes
- [ ] **T1.3** Implement `shared/engine/chord_engine.js`:
  - `getChordsForKey(note, instrument)` function → list of available chords for the given instrument
  - `getChordPositions(note, suffix, instrument)` function → diagram positions from the appropriate JSON (`guitar_chords.json`, `piano_chords.json`, or `ukulele_chords.json`)
  - `parseFretString(hexStr)` function → converts hex format from `guitar-chords-db-json` to number array (fallback, guitar only)
  - `getScaleDegreeChords(root, scaleName)` function → scale harmonization (based on `Scale.harmonize()` from musthe)

### PHASE 2 — Shared UI components

- [ ] **T2.0** `InstrumentToggle` component:
  - A button/tab bar that switches between `"guitar"`, `"piano"`, and `"ukulele"`.
  - Updates the `ui.instrument` slice in the Redux store.
  - Placement: visible on all chord detail pages and the chord library.
  
- [ ] **T2.1** `GuitarChordDiagram` component:
  - Renders a "nut"-style chord diagram with 6 strings and N frets.
  - Shows finger position dots, barres, and open/muted strings.
  - Parameters: `frets[]`, `fingers[]`, `baseFret`, `barres[]`.
  - In React Native: use `react-native-svg`.
  - On Web: use `@tombatossals/react-chords` (supports guitar and piano) or inline SVG.

- [ ] **T2.2** `PianoChordDiagram` component:
  - Renders a piano keyboard (one octave minimum, two recommended) with highlighted keys.
  - Input: `frets: string[]` (note names, e.g. `["C", "E", "G"]`) and `fingers: string[]` (scale degrees, e.g. `["1", "3", "5"]`).
  - Highlighted keys must be visually distinct for white vs black keys.
  - Show the scale degree label on each pressed key (optional but useful).
  - On Web: use `@tombatossals/react-chords` with `instrument={{ name: 'Piano' }}` — it renders piano SVG diagrams out of the box using the `piano.json` data format.
  - In React Native: build a custom SVG keyboard using `react-native-svg`, or port the `@tombatossals/react-chords` piano renderer.
  - **Do NOT use any external image API** for piano diagrams. Use local data.

- [ ] **T2.3** `ChordDiagram` (smart wrapper):
  - A single component that reads `ui.instrument` from Redux and renders either `GuitarChordDiagram` or `PianoChordDiagram` (or `UkuleleChordDiagram` in v2).
  - This is what all screens should use — they never render the instrument-specific component directly.

- [ ] **T2.4** `FretBoard` component (full guitar neck, optional for v2)
- [ ] **T2.5** `ScaleViewer` component — shows scale notes on the neck
- [ ] **T2.6** `ChordCard` component — card with name, suffix, and diagram (uses `ChordDiagram` wrapper)
- [ ] **T2.7** `NoteSelector` component — root note picker (C, C#, D, ...)
- [ ] **T2.8** `ChordTypeSelector` component — chord type picker (major, minor, 7, maj7, ...)

### PHASE 3 — React Native app

- [ ] **T3.1** Set up React Native project with TypeScript
- [ ] **T3.2** Configure React Navigation (stack + tabs)
- [ ] **T3.3** Configure Redux Toolkit store
- [ ] **T3.4** `HomeScreen` — quick chord search
- [ ] **T3.5** `ChordLibraryScreen` — chord grid filterable by note and type
- [ ] **T3.6** `ChordDetailScreen` — diagrams of all positions for a chord
- [ ] **T3.7** `ScalesScreen` — scale selector and viewer
- [ ] **T3.8** `TheoryScreen` — explanations of intervals, chords, and modes
- [ ] **T3.9** Dark mode with `@react-navigation/native` and styled-components or NativeWind

### PHASE 4 — Web React + Redux

- [ ] **T4.1** Set up React project with Vite + TypeScript
- [ ] **T4.2** Configure Redux Toolkit store (same shape as the app)
- [ ] **T4.3** `HomePage` — hero section + chord search
- [ ] **T4.4** `ExplorePage` — full chord library with filters
- [ ] **T4.5** `ChordPage` — detail page with all SVG diagrams
- [ ] **T4.6** `ScalesPage` — scale explorer
- [ ] **T4.7** `TheoryPage` — music theory guide
- [ ] **T4.8** Responsive design (mobile-first)
- [ ] **T4.9** Basic SEO + meta tags per page

### PHASE 5 — API (optional for v1, required for v2)

- [ ] **T5.1** Set up Node.js + Express
- [ ] **T5.2** `GET /api/chords` — list all available chords
- [ ] **T5.3** `GET /api/chords/:note/:suffix` — positions for a specific chord
- [ ] **T5.4** `GET /api/scales/:root/:name` — notes of a scale
- [ ] **T5.5** `GET /api/theory/harmonize/:root/:scale` — chords for each scale degree

---

## 6. Data model (JSON)

### Processed chord (output of T1.1)

```json
{
  "key": "C",
  "suffix": "major",
  "displayName": "C Major",
  "aliases": ["CM", "CΔ"],
  "positions": [
    {
      "frets": [-1, 3, 2, 0, 1, 0],
      "fingers": [0, 3, 2, 0, 1, 0],
      "baseFret": 1,
      "barres": [],
      "midi": [48, 52, 55, 60, 64]
    }
  ]
}
```

### Redux state (store shape)

```js
{
  chords: {
    selectedKey: "C",
    selectedSuffix: "major",
    currentPositionIndex: 0,       // guitar can have multiple positions; piano has 1
    allSuffixes: [...],
    allKeys: ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
  },
  scales: {
    selectedRoot: "C",
    selectedScale: "major",
    notes: [...],
    harmonizedChords: [...]
  },
  ui: {
    theme: "dark" | "light",
    instrument: "guitar" | "piano" | "ukulele"  // controls which diagram is shown
  }
}
```

**Important:** The `ui.instrument` field is the single source of truth for which diagram type is displayed across the entire app. Changing it (via `InstrumentToggle`) must re-render all active chord diagrams with the correct instrument's data.

---

## 7. Code conventions

- Strict TypeScript throughout the entire codebase.
- Functional components with hooks. No class components.
- Redux Toolkit with `createSlice` and `createAsyncThunk`. No traditional Redux with manual reducers.
- Naming: `camelCase` for variables/functions, `PascalCase` for components, `UPPER_SNAKE_CASE` for constants.
- Styles in React Native: StyleSheet or NativeWind. On web: CSS Modules or Tailwind.
- Unit tests for `chord_engine.js` and `music_theory.js` (jest).

---

## 8. Specific instructions for the agent

1. **Read the third-party repos first** before writing any musical logic. Recommended order: `musthe/musthe/musthe.py` → `chords-db/lib/guitar.json` (first 200 lines) → `chords-db/lib/piano.json` (first 100 lines) → `music-theory-data/EqualTemperament/12-Tone/Chords.yaml`.

2. **Do not copy the Python code from musthe directly.** Translate it to JavaScript/TypeScript. The interval formulas are the same.

3. **The primary data source for guitar diagrams is `chords-db/lib/guitar.json`** and for piano diagrams is **`chords-db/lib/piano.json`**. Both are in the same submodule already present in the repo. Use `guitar-chords-db-json` only as a fallback for rare guitar chords not found in the first.

4. **Do NOT use scales-chords.com or any external chord image API.** That site offers a JS widget that returns images — it creates an external dependency, adds network latency, and can be blocked or rate-limited. All chord data is available locally.

5. **The `ChordDiagram` wrapper component (T2.3) is the core of the UI.** Implement it first. It delegates to `GuitarChordDiagram` or `PianoChordDiagram` based on Redux state. Everything else uses this wrapper.

6. **Piano vs Guitar data format difference is critical:**
   - Guitar: `frets` is an array of integers (fret positions on strings).
   - Piano: `frets` is an array of note name strings (e.g. `["C", "E", "G"]`). The word "frets" is reused for API consistency, but it means "keys to press" for piano.
   - The rendering logic is completely different: guitar draws a grid, piano draws a keyboard.

7. **The web and the app share the same Redux store** (same slices, same action types). The only difference is in the presentation components (SVG vs react-native-svg).

8. **For the web**, the SSR hydration pattern we need, make a inject the initial Redux state into a `<div data-store='...'>` element, then hydrate with React on the client. Implement this if SSR is required.

9. **Accessibility:** SVG diagrams must have a descriptive `aria-label` (e.g. `"C major chord on guitar, open position: frets x32010"` or `"C major chord on piano: press C, E, G"`). Selectors must be keyboard-navigable.

10. **Chord naming in the UI:** Use the `displayName` field from the data model. For suffixes, use the abbreviations from `music-theory-data/EqualTemperament/12-Tone/Chords.yaml` as reference (e.g. `Maj`, `m`, `dim`, `aug`, `7`, `m7`, `Maj7`).

---

## 9. Recommended dependencies

### React Native (app/)

```json
{
  "dependencies": {
    "react-native": "latest",
    "@react-navigation/native": "^6.x",
    "@react-navigation/stack": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@reduxjs/toolkit": "^2.x",
    "react-redux": "^9.x",
    "react-native-svg": "^15.x",
    "nativewind": "^4.x"
  }
}
```

### Web (web/)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@reduxjs/toolkit": "^2.x",
    "react-redux": "^9.x",
    "react-router-dom": "^6.x",
    "tailwindcss": "^3.x",
    "@tombatossals/react-chords": "^1.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "typescript": "^5.x"
  }
}
```

> **Note on `@tombatossals/react-chords`:** This library renders SVG chord diagrams for guitar, ukulele, **and piano** from the same `chords-db` data format. It is the recommended renderer for the web. In React Native the piano keyboard must be rendered manually with `react-native-svg` since the library targets the DOM.
```

---

## 10. MVP acceptance criteria

- [ ] A chord can be searched by root note + type and its diagram is displayed.
- [ ] The guitar diagram correctly shows: frets, fingers, muted/open strings, barres, and base fret.
- [ ] The piano diagram correctly shows: a keyboard with the chord's keys highlighted and scale degree labels.
- [ ] The `InstrumentToggle` button switches between guitar and piano diagrams for the same chord without changing the selected note or type.
- [ ] At least 2 different positions of the same guitar chord can be navigated (piano has a single position).
- [ ] Notes of any scale can be viewed (major, minor, pentatonic, modes).
- [ ] The website works correctly on mobile (responsive).
- [ ] The app runs on Android (physical device or emulator).
- [ ] Guitar data comes from `third-party/chords-db/lib/guitar.json` and piano data from `third-party/chords-db/lib/piano.json` (not hardcoded, no external API).
- [ ] The `music_theory.js` engine has passing tests for at least: C major scale, Am natural minor, C major chord notes, Am7 chord notes.
