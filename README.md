# 🎸 Strings Of Heaven

> A cross-platform guitar, piano, and ukulele chord reference app — built with React Native and React.

Strings Of Heaven is an open-source music reference tool that lets musicians look up chord diagrams, explore scales, and learn music theory fundamentals. It runs as a **native Android/iOS app** (React Native) and as a **progressive web app** (React + Redux), both sharing the same data engine and Redux store.

---

## Features

- **Chord library** — browse all chords for any root note across guitar, piano, and ukulele
- **Instrument toggle** — switch between guitar, piano, and ukulele diagrams for the same chord in one tap
- **Guitar diagrams** — accurate fret-grid SVG diagrams with finger positions, barres, muted strings, and multiple voicings per chord
- **Piano diagrams** — keyboard SVG with highlighted keys and scale-degree labels per chord
- **Scale viewer** — visualize notes of any scale on the fretboard (major, natural minor, harmonic minor, pentatonic, and all 7 Greek modes)
- **Music theory** — reference for intervals, chord formulas, scale harmonization, and modes
- **Dark / light mode**
- **Offline-first** — all chord data is bundled locally; no external API calls required

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native + TypeScript |
| Web app | React 18 + Redux Toolkit + Vite + TypeScript |
| Shared logic | Pure TypeScript (`shared/engine/`) |
| State management | Redux Toolkit (same store shape on both platforms) |
| SVG diagrams (web) | Custom SVG components (React) |
| SVG diagrams (native) | `react-native-svg` (planned, Phase 3) |
| Styling (web) | Tailwind CSS |
| Styling (native) | NativeWind |
| Navigation | React Navigation (stack + bottom tabs) |

---

## Deployment

### GitHub Pages (Static Deployment)

This project is configured for **GitHub Pages** deployment out of the box. The web app runs entirely in the browser with no backend required.

#### Automatic Deployment

1. **Enable GitHub Pages** in your repository settings:
   - Go to `Settings` → `Pages`
   - Set Source to `GitHub Actions`

2. **Push to main branch** — the deployment workflow (`.github/workflows/deploy.yml`) will automatically:
   - Build the web app with the correct base path
   - Deploy to `https://<username>.github.io/<repository-name>/`

#### Manual Configuration

If you need to customize the deployment:

```bash
# Set custom base path (optional)
export VITE_BASE_PATH="/my-custom-path/"

# Build for production
cd web
npm run build

# The built files will be in web/dist/
```

The `web/vite.config.ts` automatically detects the repository name from `GITHUB_REPOSITORY` environment variable and sets the correct base path.

#### Configuration Files

- **Workflow**: `.github/workflows/deploy.yml` — GitHub Actions deployment
- **Base path**: `web/vite.config.ts` — auto-configured for GitHub Pages
- **Feature flags**: `shared/config.ts` — controls static vs API mode

---

### Server Deployment (Fork-Friendly)

**Want to use a backend server instead of GitHub Pages?** This project is designed to be fork-friendly for server deployments.

#### Quick Server Setup

1. **Fork this repository**

2. **Enable API mode** in `shared/config.ts`:
   ```typescript
   export const config: AppConfig = {
     useApiBackend: true,  // ← Change from false to true
     apiBaseUrl: 'https://your-server.com/api',  // ← Your API endpoint
     // ... rest of config
   };
   ```

3. **Implement the backend API** — the frontend expects these endpoints:
   ```
   GET    /api/songs           # List all songs
   POST   /api/songs/upload    # Upload new song
   GET    /api/songs/search    # Search songs
   GET    /api/songs/:id       # Get specific song
   ```

4. **Deploy** to your preferred hosting provider:
   - **Vercel/Netlify**: Frontend deployment with serverless functions
   - **Railway/Render**: Full-stack deployment
   - **AWS/GCP**: Container or serverless deployment
   - **VPS**: Docker + nginx setup

#### API Interface

When `useApiBackend: true`, the app will use `useSongStorage.ts` to call your API instead of localStorage. The expected request/response format is documented in the hook file.

#### Database Options

Choose your preferred database:
- **PostgreSQL**: For production apps with user accounts
- **MongoDB**: For document-based song storage
- **SQLite**: For simple self-hosted setups
- **Supabase/Firebase**: For serverless backends

#### Example Server Stack

```
Frontend: React (this repo) → Vercel/Netlify
Backend:  Node.js + Express → Railway/Render  
Database: PostgreSQL       → Railway/Supabase
```

**Need help setting up a server?** Check the `api/` directory (coming in Phase 4) for a reference Node.js implementation, or implement your own in any language.

---

## Project structure

```
/
├── app/              # React Native — Android & iOS  (Phase 3, not created yet)
├── web/              # React + Redux SPA  ✓ built (Vite)
│   └── src/          # pages, components, hooks, tests
├── shared/           # ✓ platform-agnostic code (used by web and future app)
│   ├── engine/
│   │   ├── chord_engine.ts     # chord lookup, position parsing, lazy data load
│   │   └── music_theory.ts     # notes, intervals, scales, harmonization
│   ├── store/       # Redux Toolkit store, slices, selectors, thunks
│   ├── diagrams/     # pure geometry for fretboard & piano SVG
│   ├── data/        # processed chord JSON (guitar / piano / ukulele)
│   ├── constants/theory.ts
│   └── __tests__/   # jest tests (engine, store, diagrams)
├── scripts/
│   └── process_chords.js       # regenerates shared/data/*.json from chords-db
├── api/              # Node.js / Express REST API (optional, later phase)
├── third-party/      # Reference submodules (read-only — see below)
├── ROADMAP.md        # Full implementation plan for AI-assisted development
└── README.md
```

---

## Chord data sources

All chord data is bundled locally from open-source databases. No external API is called at runtime.

| Submodule | Content | Used for | Source files |
|---|---|---|---|
| [`tombatossals/chords-db`](https://github.com/tombatossals/chords-db) | Guitar, piano, ukulele JSON — primary database | Chord diagrams (all instruments) | `third-party/chords-db/lib/{guitar,piano,ukulele}.json` → processed by `scripts/process_chords.js` into `shared/data/{guitar,piano,ukulele}_chords.json` |
| [`szaza/guitar-chords-db-json`](https://github.com/szaza/guitar-chords-db-json) | ~99,230 guitar chord variants | Fallback for rare guitar voicings | `third-party/guitar-chords-db-json/` |
| [`seancolsen/music-theory-data`](https://github.com/seancolsen/music-theory-data) | Chords, scales, intervals in YAML with bitmasks | Theory reference & chord naming | — |
| [`gciruelos/musthe`](https://github.com/gciruelos/musthe) | Python music theory library | Algorithm reference for `music_theory.ts` | — |
| [`openmusictheory`](https://github.com/openmusictheory/openmusictheory.github.io) | Interactive music theory textbook | Educational content reference | — |
| [`gmoe/piano_fundamentals`](https://github.com/gmoe/piano_fundamentals) | Chuan C. Chang's piano practice book | Piano feature reference | — |

### Chord data format

**Guitar** (`guitar.json`) — fret positions as integers:
```json
{
  "key": "C", "suffix": "major",
  "positions": [
    { "frets": [-1, 3, 2, 0, 1, 0], "fingers": [0, 3, 2, 0, 1, 0], "baseFret": 1, "barres": [], "midi": [48, 52, 55, 60, 64] }
  ]
}
```

**Piano** (`piano.json`) — keys as note name strings:
```json
{
  "key": "C", "suffix": "major",
  "positions": [
    { "frets": ["C", "E", "G"], "fingers": ["1", "3", "5"], "midi": [60, 64, 67] }
  ]
}
```

### Known data caveat: enharmonic keys

The processed datasets are sourced verbatim from `chords-db`. Some instruments
spell certain keys with flats instead of sharps, so a few sharp keys are simply
**absent** from the data:

- **Ukulele** (`third-party/chords-db/lib/ukulele.json` → `shared/data/ukulele_chords.json`) does **not** include `C#` or `F#`. It spells them as `Db` and `Gb` instead.
- This also affects other sharp spellings when the source omits them.

To keep the UI consistent (a user can still pick `C#`), the engine resolves a
selected key to an enharmonic equivalent before lookup. Implemented in
`shared/engine/chord_engine.ts` via `resolveKey()` (and `ENHARMONIC` map); it is
used by `getChord`, `getChordsForKey`, `getChordPositions`, and `getSuffixes`.
The displayed name still uses the user's chosen spelling (e.g. "C# Major"), while
the underlying diagram is the `Db` chord.

To regenerate the datasets after a `chords-db` update, run `scripts/process_chords.js`.

---

## Third-party attributions & references

Strings Of Heaven stands on the shoulders of several open-source music projects.
This section gives **proper credit** to each one, lists the **exact files that
were consulted**, shows a **small excerpt** of their content, and explains **how
each was adapted** into this codebase. Every submodule lives under
`third-party/` (see `git submodule status`).

### License summary

| Repository | Author(s) | License | How it is used here |
|---|---|---|---|
| [`tombatossals/chords-db`](https://github.com/tombatossals/chords-db) | David Rubert | **MIT** | Primary chord datasets (guitar / piano / ukulele) — bundled data |
| [`szaza/guitar-chords-db-json`](https://github.com/szaza/guitar-chords-db-json) | Zoltán Szabó | **MIT** | Fallback hex fret-string format reference |
| [`seancolsen/music-theory-data`](https://github.com/seancolsen/music-theory-data) | Sean Colsen | **CC BY-SA 4.0** | Theory reference only (chord/scale/interval definitions) — *not* redistributed as data |
| [`gciruelos/musthe`](https://github.com/gciruelos/musthe) | Gonzalo Ciruelos | **MIT** | Algorithm reference for `music_theory.ts` |
| [`openmusictheory`](https://github.com/openmusictheory/openmusictheory.github.io) | Kris Shaffer, Bryn Hughes, Brian Jarvis, Robin Wharton et al. | **CC BY-SA** (Creative Commons) | Educational content reference for the Theory page |
| [`gmoe/piano_fundamentals`](https://github.com/gmoe/piano_fundamentals) | Chuan C. Chang | **Custom permission** (© 2009 — "Copy permitted if author's name, Chuan C. Chang, and this copyright statement are included") | Conceptual piano reference |
| [`wachin/chord-autoscroll`](https://github.com/wachin/py_chord_autoscroll) | Washington Indacochea Delgado | **GPL 3** | Algorithm reference for chord-line detection, body parser, and transposition engine in `music_theory.ts` |

> **Note on CC BY-SA:** `music-theory-data` and `openmusictheory` are used
> **only as conceptual/algorithmic references** to inform our own TypeScript
> implementations. We do **not** copy or redistribute their data files; the
> chord data shipped in `shared/data/` originates from `chords-db` (MIT). Credit
> is given here in the spirit of attribution regardless.

---

### 1. `tombatossals/chords-db` — MIT — David Rubert

**Files consulted**
- `third-party/chords-db/lib/guitar.json` — raw guitar dataset
- `third-party/chords-db/lib/piano.json` — raw piano dataset
- `third-party/chords-db/lib/ukulele.json` — raw ukulele dataset
- `third-party/chords-db/lib/instruments.json` — instrument/tuning metadata
- `third-party/chords-db/src/db/` — TypeScript schema used to generate the JSON
- `third-party/chords-db/readme.md` — format documentation

**Excerpt** (`third-party/chords-db/lib/guitar.json`, schema):
```json
{"main":{"strings":6,"fretsOnChord":4,"name":"guitar"},
 "tunings":{"standard":["E2","A2","D3","G3","B3","E4"]},
 "keys":["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
 "suffixes":["major","minor","dim","dim7","sus","7","maj7","m7", ...],
 "chords":{ "C":{ "major":{ "positions":[
   {"frets":[-1,3,2,0,1,0],"fingers":[0,3,2,0,1,0],"baseFret":1,"barres":[],"midi":[48,52,55,60,64]},
   {"frets":[-1,1,3,3,3,1],"fingers":[0,1,2,3,4,1],"barres":[1],"capo":true,"baseFret":3,"midi":[48,55,60,64,67]}
 ] } } }
```

**How it was adapted**
- `scripts/process_chords.js` reads these three JSON files and writes the flat,
  app-ready `shared/data/{guitar,piano,ukulele}_chords.json` consumed by
  `shared/engine/chord_engine.ts`.
- The position shape (`frets` / `fingers` / `baseFret` / `barres` / `midi`) maps
  directly onto the `ChordPosition` type in `shared/types.ts`.
- Keys are normalized (e.g. `"Csharp"` → `"C#"`) and enharmonic fallback
  (`C#` ↔ `Db`, `F#` ↔ `Gb`) is applied — see `resolveKey()` in
  `shared/engine/chord_engine.ts`. (The ukulele set omits `C#`/`F#`; it uses
  `Db`/`Gb`.)
- This is the **only** submodule whose data is redistributed in the app.

---

### 2. `szaza/guitar-chords-db-json` — MIT — Zoltán Szabó

**Files consulted**
- `third-party/guitar-chords-db-json/<RootNote>/<chord>.json` (e.g. `C/major.json`,
  `D/9_c.json`) — ~99k guitar chord variants encoded as hex fret strings.

**Excerpt** (`third-party/guitar-chords-db-json/C/major.json`):
```json
{ "key": "C", "suffix": "major",
  "positions": [
    { "frets": "x32010", "fingers": "032010" },
    { "frets": "x35553", "fingers": "012341", "barres": "3", "capo": "true" },
    { "frets": "8aa988", "fingers": "134211", "barres": "8", "capo": "true" }
  ]
}
```

**How it was adapted**
- This hex-string convention (`x` = muted, digits 0-9 = fret, letters `a`–`c` =
  frets 10-12) informed `parseFretString()` in `shared/engine/chord_engine.ts`,
  kept as a **fallback decoder** for rare guitar voicings not present in
  `chords-db`. It is not the primary data source.

---

### 3. `seancolsen/music-theory-data` — CC BY-SA 4.0 — Sean Colsen

**Files consulted**
- `third-party/music-theory-data/EqualTemperament/12-Tone/Chords.yaml`
- `third-party/music-theory-data/EqualTemperament/12-Tone/Scales.yaml`
- `third-party/music-theory-data/EqualTemperament/12-Tone/Intervals.yaml`
- `third-party/music-theory-data/EqualTemperament/12-Tone/Notes.yaml`

**Excerpt** (`.../Chords.yaml`):
```yaml
- binary: 137
  names: [Minor]
  abbreviations: [min]
  symbols: [m, '−']
- binary: 145
  names: [Major]
  abbreviations: [maj]
```
(`.../Intervals.yaml`):
```yaml
- id: 0  abbreviation: "1"  names: [Tonal Center, Unison, Tonic]
- id: 1  abbreviation: "♭2" names: [Minor Second, Half Step]
- id: 2  abbreviation: "2"  names: [Major Second, Whole Step]
```

**How it was adapted**
- The binary bitmask definitions were the basis for the canonical chord-type
  list and scale formulas in `shared/constants/theory.ts`:
  - `CHORD_FORMULAS` (a chord type → array of semitone intervals),
  - `SCALES` (scale id → semitone intervals),
  - `INTERVALS` (id → name / abbreviation),
  - `SUFFIX_TO_CANONICAL`, `CANONICAL_TO_SUFFIX`, `CHORD_TYPE_INFO` — the
    mapping between `chords-db` suffixes (e.g. `m7`) and canonical theory types
    (e.g. `min7`).
- Used as a **reference only**; no YAML is shipped in the app.

---

### 4. `gciruelos/musthe` — MIT — Gonzalo Ciruelos

**Files consulted**
- `third-party/musthe/musthe/musthe.py` — the `Note`, `Interval`, `Chord` and
  `Scale` classes.
- `third-party/musthe/examples/harmonize_list.py`, `harmonize_dict.py` — usage examples.

**Excerpt** (`.../musthe/musthe.py`, the `Note` parser and `Scale.harmonize`):
```python
class Note:
    """The note class. ..."""
    pattern = re.compile(r'([A-G])(b{0,3}|#{0,3})(\d{0,1})$')
    # accidental_value('#') -> 1, 'b' -> -1

def harmonize(self, include_dom7=True):
    """Find chords matching each Note in the scale ..."""
    chords = [None for _ in range(len(self.notes))]
    for i, note in enumerate(self.notes):
        for ch in Chord.all(root=Note(str(note))):
            search_notes = [str(sn) for sn in self.notes]
            if include_dom7:
                search_notes.append(str(note + Interval('m7')))
            if set(str(n) for n in ch.notes) <= set(search_notes):
                chords_for_note.append(ch)
```

**How it was adapted**
- `musthe.py` was the **algorithm reference** for `shared/engine/music_theory.ts`,
  reimplemented in pure TypeScript (no Python dependency, fully portable to web
  and React Native):
  - note name parsing / accidental values → `Note` helpers and `pitchClassOf`,
  - `note + Interval(...)` → `getInterval` / semitone math,
  - `Scale.harmonize` (stack thirds over each scale degree, optionally adding the
    dominant 7th) → `harmonizeScale(root, scale)`,
  - `buildScale` from a scale's interval formula.
- The code was rewritten from scratch in TS; no Python was copied.

---

### 5. `openmusictheory` — CC BY-SA — Shaffer, Hughes, Jarvis, Wharton et al.

**Files consulted** (educational reference for the Theory page prose)
- `third-party/openmusictheory/intervals.md` — chromatic vs. diatonic intervals
- `third-party/openmusictheory/scales.md`, `scales2.md` — scales & modes
- `third-party/openmusictheory/appliedChords.md` — chord construction
- `third-party/openmusictheory/about.md` — license / "open-source textbook" statement

**Excerpt** (`.../intervals.md`):
> An *interval* is the distance between two pitches, usually measured as a number
> of steps on a scale. ... The simplest way to measure intervals ... is to count
> the number of half-steps, or *semitones*, between two pitches.

**How it was adapted**
- Informed the **structure and wording** of `web/src/pages/TheoryPage.tsx`
  (Intervals, Chord formulas, Scales and modes, Harmonizing a scale).
- No code or data was copied — purely conceptual/editorial reference.

---

### 6. `gmoe/piano_fundamentals` — Custom permission — Chuan C. Chang

**Files consulted**
- `third-party/piano_fundamentals/source/about.rst` — copyright notice
- `third-party/piano_fundamentals/source/chapter1/...` — piano technique/reference
- `third-party/piano_fundamentals/README.md`

**Excerpt** (`.../source/about.rst`):
```
Copyright © 2009. Copy permitted if author’s name, Chuan C. Chang, and this
copyright statement are included.  Order this book at BookSurge or Amazon.
This entire book can be downloaded free ...
```

**How it was adapted**
- Served as a **conceptual reference** for the piano chord-diagram feature and
  the piano-related content on the Theory page.
- No code or data was copied. Credit is given here per the author's stated
  permission terms (name + copyright statement included).

---

### 7. `wachin/chord-autoscroll` — GPL 3 — Washington Indacochea Delgado

**Repository:** [`https://github.com/wachin/py_chord_autoscroll`](https://github.com/wachin/py_chord_autoscroll)

**Files consulted**
- `third-party/chord-autoscroll/chord_autoscroll.py` — full source of the PyQt6 desktop app

---

#### 7.1 Reference logic: how `chord_autoscroll.py` works

The program has two core responsibilities that were ported to this platform:

**A) Detecting whether a line contains chords or lyrics**

The logic is: if more than 50% of the "words" in a line match the pattern of
a chord name, the line is treated as a chord line. Otherwise it is plain lyrics.

```python
# third-party/chord-autoscroll/chord_autoscroll.py
# Pattern that recognises a single chord token:
chord_pattern = r'\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]?(?!\w)'

def is_chord_line(line):
    words = line.split()
    matches = [bool(re.fullmatch(chord_pattern, word)) for word in words]
    # The line is a chord line if MORE THAN 50% of its words are chords
    return sum(matches) > len(words) / 2
```

Examples classified as chord lines:
```
"D  A  Em  G"          → True  (4 out of 4 words are chords)
"      Em          G"  → True  (2 out of 2 words are chords)
"D                 A"  → True  (2 out of 2 words are chords)
```

Examples classified as lyric lines:
```
"Hey dad look at me"   → False (0 out of 5 words are chords)
"[Verse 1]"            → False (0 out of 2 words are chords)
"Did I grow up..."     → False (0 out of 4+ words are chords)
```

**B) Transposing chords while preserving whitespace alignment**

The key design constraint is that chords must remain aligned above the correct
syllables even when the transposed name has a different length
(e.g. `Bb` → `A`, one character shorter).

```python
# third-party/chord-autoscroll/chord_autoscroll.py

chord_base = [
    ['C'], ['C#', 'Db'], ['D'], ['D#', 'Eb'], ['E'], ['F'],
    ['F#', 'Gb'], ['G'], ['G#', 'Ab'], ['A'], ['A#', 'Bb'], ['B']
]

def transpose_chord(chord, spaces_after):
    root = chord[0]
    accidental = '#' if '#' in chord else 'b' if 'b' in chord else ''
    suffix = chord[len(root + accidental):]
    # Find the current index in chord_base
    current_index = next(
        i for i, group in enumerate(chord_base) if root + accidental in group
    )
    new_index = (current_index + semitones) % len(chord_base)
    # Choose sharp or flat spelling based on user preference
    new_root = chord_base[new_index][0] if self.config.get('use_sharps', True) \
               else chord_base[new_index][-1]
    return new_root + suffix, ' ' * spaces_after

def process_line(line):
    chord_positions = list(re.finditer(chord_pattern, line))
    if not chord_positions:
        return line
    new_line = []
    last_end = 0
    for i, match in enumerate(chord_positions):
        new_line.append(line[last_end:match.start()])
        next_pos = chord_positions[i + 1].start() \
                   if i + 1 < len(chord_positions) else len(line)
        spaces_after = next_pos - match.end()
        new_chord, new_spaces = transpose_chord(match.group(), spaces_after)
        new_line.append(new_chord + new_spaces)
        last_end = next_pos
    new_line.append(line[last_end:])
    return ''.join(new_line)

def transpose_text(self, text, semitones):
    lines = text.split('\n')
    transposed_lines = [
        process_line(line) if is_chord_line(line) else line
        for line in lines
    ]
    return '\n'.join(transposed_lines)
```

---

#### 7.2 How it was implemented in Strings of Heaven

The functions above were translated to TypeScript and split across two files:

**`shared/engine/music_theory.ts`** — pure music theory logic:

```typescript
// shared/engine/music_theory.ts

// Equivalent to chord_base in Python:
const CHROMATIC: readonly (readonly string[])[] = [
  ['C'],
  ['C#', 'Db'],
  ['D'],
  ['D#', 'Eb'],
  ['E'],
  ['F'],
  ['F#', 'Gb'],
  ['G'],
  ['G#', 'Ab'],
  ['A'],
  ['A#', 'Bb'],
  ['B'],
] as const;

// Equivalent to chord_pattern in Python, extended to cover compound suffixes
// and slash chords (G/B, Am/E):
export const CHORD_TOKEN_REGEX =
  /\b([A-G][#b]?(?:maj|min|m|dim|aug|sus|add)?[0-9]?(?:b[0-9]|#[0-9])?(?:\/[A-G][#b]?)?)\b/g;

// Equivalent to is_chord_line() in Python.
// The 50% threshold lives in `words.length / 2` — see section 7.3
export function isChordLine(line: string): boolean {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const chordCount = words.filter((w) => CHORD_TOKEN_SINGLE.test(w)).length;
  return chordCount > words.length / 2;  // <-- configurable threshold (see 7.3)
}

// Equivalent to transpose_chord() in Python:
export function transposeChordName(
  chord: string,
  semitones: number,
  useSharps = true,
): string {
  if (semitones === 0) return chord;
  // Slash chords: "G/B" → transpose both parts independently
  const slashIdx = chord.indexOf('/');
  if (slashIdx !== -1) {
    const upper = transposeChordName(chord.slice(0, slashIdx), semitones, useSharps);
    const lower = transposeChordName(chord.slice(slashIdx + 1), semitones, useSharps);
    return `${upper}/${lower}`;
  }
  const rootMatch = /^([A-G][#b]?)(.*)$/.exec(chord);
  if (!rootMatch) return chord;
  const root = rootMatch[1];
  const suffix = rootMatch[2];
  const currentIndex = CHROMATIC_INDEX[root];
  if (currentIndex === undefined) return chord;
  const newIndex = ((currentIndex + semitones) % 12 + 12) % 12;
  const group = CHROMATIC[newIndex];
  const newRoot = group.length === 1 ? group[0] : useSharps ? group[0] : group[1];
  return newRoot + suffix;
}

// Equivalent to process_line() in Python — preserves whitespace alignment
// by compensating for length differences in the transposed chord name:
export function transposeChordLine(
  line: string,
  semitones: number,
  useSharps = true,
): string {
  // ... locates tokens, transposes each one, adjusts spacing
}

// Equivalent to transpose_text() in Python:
export function transposeSongBody(
  body: string,
  semitones: number,
  useSharps = true,
): string {
  if (semitones === 0) return body;
  return body
    .split('\n')
    .map((line) => (isChordLine(line) ? transposeChordLine(line, semitones, useSharps) : line))
    .join('\n');
}
```

**`shared/engine/chord_engine.ts`** — higher-level song helpers:

```typescript
// shared/engine/chord_engine.ts

// Returns the unique chord names found in a song body, in order of appearance.
// Used to populate the Guitar / Ukulele / Piano panel on the SongPage.
export function getUniqueChordsFromBody(body: string): string[] {
  const lines = parseSongBody(body);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    if (line.type === 'chord') {
      for (const token of line.tokens) {
        if (!seen.has(token.chord)) {
          seen.add(token.chord);
          result.push(token.chord);
        }
      }
    }
  }
  return result;
}

// Resolves each chord name to the { note, suffix } pair accepted by
// getChordPositions(), so the active instrument's diagrams can be fetched.
export function resolveChordsFromBody(
  body: string,
  instrument: Instrument = 'guitar',
): ResolvedChord[] { ... }
```

---

#### 7.3 The 50% threshold: what it is and how to adjust it

`isChordLine` uses a threshold that decides how many words in a line must be
chord tokens for the whole line to be treated as a chord line.
The current value is **more than 50%** (`chordCount > words.length / 2`).

This value **can be freely changed** in `shared/engine/music_theory.ts`:

```typescript
// shared/engine/music_theory.ts — isChordLine function
export function isChordLine(line: string): boolean {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const chordCount = words.filter((w) => CHORD_TOKEN_SINGLE.test(w)).length;

  // CONFIGURABLE THRESHOLD:
  // Change the divisor or operator to adjust sensitivity.
  // Examples:
  //   words.length / 2     → more than 50% (current value)
  //   words.length / 3     → more than 33%
  //   words.length * 0.75  → more than 75%
  //   words.length         → 100% (every word must be a chord)
  return chordCount > words.length / 2;
}
```

**What happens when the threshold is lowered (more permissive)**

| Threshold | Effect |
|-----------|--------|
| > 33% (`/ 3`) | Most lines containing at least one chord will be detected as chord lines. Works well when songs mix lyrics and chords on the same line (inline format). May produce false positives: a lyric line containing a word that happens to look like a chord (e.g. "A man named G" — "A" and "G" would be detected as chords). Recommended minimum: **25%**. |
| > 25% (`/ 4`) | Extremely permissive. Any line with a chord-like word gets transposed. Only useful if the song format mixes chords inside prose. Below this point false positives are frequent and transposition corrupts the lyrics. |

**What happens when the threshold is raised (more strict)**

| Threshold | Effect |
|-----------|--------|
| > 75% (`* 0.75`) | Only lines consisting almost entirely of chords are detected. Misses lines with a single chord followed by brief text, such as `D  Hey dad`. Correct for very clean formats where chords always appear alone on their own line. |
| >= 100% (`>= words.length`) | Only detects lines where **every** word is a chord. More precise, but misses lines that mix chords with annotations such as `G  (strumming hard)`. |

**Recommendation:** the current 50% value is the most robust balance for the
standard song-with-chords format (chords on their own line, lyrics below).
Going below 33% or above 75% is not recommended without thorough testing against
the full song catalogue.

---

#### 7.4 Alternative approach: detection and transposition based on music theory

As an alternative to the `chord_autoscroll.py` approach (regex + statistical
threshold), the project's reference repositories make it possible to implement
a completely different strategy based on formal music theory. This is available
as an option for anyone who does not want to use the statistical threshold.

**Foundation:** `third-party/music-theory-data/EqualTemperament/12-Tone/Chords.yaml`
defines all chord types with their 12-bit bitmasks. A chord is any token whose
notes form a recognised set of pitch classes.

**How it would work:**

1. **Chord token detection** — instead of regex, each token is parsed into
   `{ root, suffix }` and the suffix is validated against the chord database
   (`shared/data/guitar_chords.json` or `Chords.yaml`). If found, it is a chord;
   otherwise it is plain text.

2. **Chord line detection** — instead of the 50% threshold, each
   whitespace-separated token on the line is validated individually. If every
   non-empty token is a valid chord, the line is a chord line. This is a binary
   criterion (100%), not a statistical one.

3. **Transposition** — instead of shifting indices in the `CHROMATIC` array, the
   existing `Note` class and its `transpose(intervalName)` method (already
   implemented in `shared/engine/music_theory.ts`) are used. For example, raising
   by 2 semitones is `note.transpose('M2')`.

**Implementation sketch:**

```typescript
// OPTION 2 — detection and transposition based on music theory
// (alternative to the chord_autoscroll approach)

import { Note } from './music_theory';
import { chordExists } from './chord_engine';

// A token is a chord if its root + suffix exist in the database
function isChordToken(token: string): boolean {
  const m = /^([A-G][#b]?)(.*)$/.exec(token);
  if (!m) return false;
  const [, note, rawSuffix] = m;
  const suffix = rawSuffix === '' ? 'major' : rawSuffix === 'm' ? 'minor' : rawSuffix;
  return chordExists(note, suffix, 'guitar');
}

// A line is a chord line if ALL its tokens are valid chords in the database
// (100% criterion, not statistical)
function isChordLineStrict(line: string): boolean {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  return words.every(isChordToken);
}

// Transposition using the interval engine from music_theory.ts
// instead of the CHROMATIC array
const SEMITONE_TO_INTERVAL: Record<number, string> = {
  1: 'm2', 2: 'M2', 3: 'm3', 4: 'M3', 5: 'P4',
  6: 'A4', 7: 'P5', 8: 'm6', 9: 'M6', 10: 'm7', 11: 'M7', 12: 'P8',
};

function transposeChordTheory(chord: string, semitones: number): string {
  const m = /^([A-G][#b]?)(.*)$/.exec(chord);
  if (!m) return chord;
  const [, rootName, suffix] = m;
  const normalizedSemitones = ((semitones % 12) + 12) % 12;
  if (normalizedSemitones === 0) return chord;
  const interval = SEMITONE_TO_INTERVAL[normalizedSemitones];
  const newRoot = new Note(rootName).transpose(interval).toString();
  return newRoot + suffix;
}
```

**When to use each option:**

| | Option 1 (current — `chord_autoscroll`) | Option 2 (music theory) |
|---|---|---|
| **Detection** | Regex + statistical threshold (50%) | Validation against chord database |
| **Transposition** | CHROMATIC array + index shift | `Note` class + intervals |
| **Speed** | Very fast (no database access) | Slower (queries the JSON database) |
| **Accuracy** | High for standard formats | Perfect, but requires the database to be loaded |
| **Works offline / without DB** | Yes | No (requires the JSON files to be loaded) |
| **False positives** | Possible with text containing letters A–G | None |
| **Recommended for** | Plain text files, lightweight editor | Strict validation, web interface |

Reference resources for a full implementation of Option 2:
- `third-party/musthe/musthe/musthe.py` — `Note`, `Interval`, transposition
- `third-party/music-theory-data/EqualTemperament/12-Tone/Chords.yaml` — chord types
- `shared/engine/music_theory.ts` — `Note` class and `getInterval` already implemented

---

#### 7.5 Full Python → TypeScript equivalence table

| Python (`chord_autoscroll.py`) | TypeScript (`strings-of-heaven`) | File |
|---|---|---|
| `chord_base` (list of 12 groups) | `CHROMATIC` | `shared/engine/music_theory.ts` |
| `chord_pattern` (regex) | `CHORD_TOKEN_REGEX` | `shared/engine/music_theory.ts` |
| `is_chord_line(line)` | `isChordLine(line)` | `shared/engine/music_theory.ts` |
| `transpose_chord(chord, spaces)` | `transposeChordName(chord, n, useSharps)` | `shared/engine/music_theory.ts` |
| `process_line(line)` | `transposeChordLine(line, n, useSharps)` | `shared/engine/music_theory.ts` |
| `transpose_text(text, semitones)` | `transposeSongBody(body, n, useSharps)` | `shared/engine/music_theory.ts` |
| _(did not exist)_ | `parseSongBody(body)` | `shared/engine/music_theory.ts` |
| _(did not exist)_ | `parseSongFile(source)` | `shared/engine/music_theory.ts` |
| _(did not exist)_ | `getUniqueChordsFromBody(body)` | `shared/engine/chord_engine.ts` |
| _(did not exist)_ | `resolveChordsFromBody(body, instrument)` | `shared/engine/chord_engine.ts` |

**Differences from the original:**
- `CHORD_TOKEN_REGEX` covers compound suffixes (`m7b5`, `maj13`, `sus2`, `sus4`,
  `add9`, `7#9`) and slash chords (`G/B`, `Am/E`) that the original did not handle.
- `transposeChordLine` compensates for length changes when the transposed chord
  name is shorter or longer, keeping alignment with the lyric line below.
- `parseSongBody` and `parseSongFile` are new functions the original desktop
  program did not need (it worked with plain `.txt` files, without `~~~` section
  markers).

**License note**

`chord_autoscroll.py` is released under the **GNU General Public License v3.0**.
The algorithms were translated to TypeScript and adapted into this project, which
is also licensed under GPL 3. No Python code was copied verbatim; the logic was
reimplemented in TypeScript.

---

## Getting started

### Prerequisites

- Node.js 20+
- React Native CLI + Android SDK / Xcode (for the mobile app)
- Git with submodule support

### Clone with submodules

```bash
git clone --recurse-submodules https://github.com/wachin/strings-of-heaven.git
cd strings-of-heaven
```

If you already cloned without `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

### Run the web app

```bash
cd web
npm install      # only needed the first time
npm run dev      # starts Vite at http://localhost:5173/
```

Open http://localhost:5173/ in your browser. Vite hot-reloads on file changes.

#### Stopping the dev server

Press **Ctrl + C** in the terminal where `npm run dev` is running. If it does
not respond (e.g. it was started in the background), kill it from another terminal:

```bash
pkill -f vite                 # stops any running Vite process
# or, by port:
lsof -ti:5173 | xargs kill    # macOS / Linux
```

#### Useful commands

From the repo root (shared engine + store) and from `web/`:

```bash
# Type-check
npx tsc --noEmit                 # repo root (shared)
cd web && npx tsc --noEmit       # web app

# Tests
npx jest                         # root: engine, store, diagrams (75 tests)
cd web && npx vitest run         # web: component tests (8 tests)
cd web && npx vitest             # web: watch mode

# Production build
cd web && npm run build          # outputs to web/dist/

# Preview the production build
cd web && npm run preview
```

### Run the Android app

```bash
cd app
npm install
npx react-native run-android
```

### Add third-party submodules (first-time setup)

```bash
mkdir -p third-party

git submodule add https://github.com/tombatossals/chords-db.git third-party/chords-db
git submodule add https://github.com/szaza/guitar-chords-db-json.git third-party/guitar-chords-db-json
git submodule add https://github.com/gciruelos/musthe.git third-party/musthe
git submodule add https://github.com/openmusictheory/openmusictheory.github.io.git third-party/openmusictheory
git submodule add https://github.com/gmoe/piano_fundamentals.git third-party/piano_fundamentals
git submodule add https://github.com/seancolsen/music-theory-data.git third-party/music-theory-data

# Song body parser and transposition reference (GPL 3)
git submodule add https://github.com/wachin/py_chord_autoscroll.git third-party/chord-autoscroll

git submodule update --init --recursive
```

---

## Redux store shape

Both the web app and the mobile app use the same Redux store structure:

```ts
{
  chords: {
    selectedKey: "C",            // root note (e.g. "C", "C#", "F")
    selectedSuffix: "major",     // chosen chord type (e.g. "major", "m7")
    currentPositionIndex: 0      // active voicing when a chord has several
  },
  scales: {
    selectedRoot: "C",           // scale root note
    selectedScale: "major"       // scale id (see SCALE_NAMES)
  },
  ui: {
    theme: "dark" | "light",
    instrument: "guitar" | "piano" | "ukulele",
    dataEpoch: number            // bumped when a chord dataset finishes loading
  }
}
```

`allSuffixes` and `allKeys` are **derived** via selectors (they are not stored in
state). The `ui.instrument` field drives which diagram component is rendered
everywhere; switching it via `InstrumentToggle` updates all diagrams instantly
without changing the selected chord.

#### Lazy-loaded chord data

The three datasets (`guitar_chords.json`, `piano_chords.json`,
`ukulele_chords.json`) are **not** bundled into the initial web payload. The
engine loads each instrument's data on demand via `loadChordDatabases(instrument)`
(a dynamic `import`), so Vite emits one chunk per instrument. `ui.dataEpoch` is
bumped once a dataset arrives so memoized selectors (`selectAllSuffixes`,
`selectSelectedChord`, `selectSelectedPositions`) recompute.

---

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) for the full implementation plan, including:

- Phase-by-phase task breakdown (data engine → UI components → app → web → API)
- Detailed guide to every third-party submodule and how to use each one
- Data model specifications
- Code conventions
- MVP acceptance criteria

---

## Contributing

Contributions are welcome. Before opening a pull request:

1. Read `ROADMAP.md` to understand the intended architecture.
2. Keep the `shared/engine/` logic platform-agnostic (pure TypeScript, no React imports).
3. Follow the code conventions in section 7 of the ROADMAP.
4. Add or update tests for any changes to `chord_engine.ts` or `music_theory.ts`.

---

## License

This project is licensed under the **GNU General Public License v3.0** — see
[LICENSE](./LICENSE) for the full text.

Chord data from [`tombatossals/chords-db`](https://github.com/tombatossals/chords-db)
is MIT licensed. Music theory reference from
[`seancolsen/music-theory-data`](https://github.com/seancolsen/music-theory-data)
is CC BY-SA 4.0 licensed. `gmoe/piano_fundamentals` is © 2009 Chuan C. Chang
(copy permitted with attribution). Each third-party submodule retains its own
license; see [Third-party attributions & references](#third-party-attributions--references)
for details.
