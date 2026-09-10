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

#### 7.1 Lógica de referencia: cómo funciona `chord_autoscroll.py`

El programa tiene dos responsabilidades centrales que fueron portadas a esta plataforma:

**A) Detectar si una línea es de acordes o de letra**

La lógica es la siguiente: si más del 50 % de las "palabras" de una línea
coinciden con el patrón de un nombre de acorde, la línea se considera una
línea de acordes. De lo contrario es letra normal.

```python
# third-party/chord-autoscroll/chord_autoscroll.py
# Patrón que reconoce un token de acorde individual:
chord_pattern = r'\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]?(?!\w)'

def is_chord_line(line):
    words = line.split()
    matches = [bool(re.fullmatch(chord_pattern, word)) for word in words]
    # La línea es de acordes si MÁS DEL 50% de sus palabras son acordes
    return sum(matches) > len(words) / 2
```

Ejemplos de lo que considera línea de acordes:
```
"D  A  Em  G"          → True  (4 de 4 palabras son acordes)
"      Em          G"  → True  (2 de 2 palabras son acordes)
"D                 A"  → True  (2 de 2 palabras son acordes)
```

Ejemplos de lo que considera línea de letra:
```
"Hey dad look at me"   → False (0 de 5 palabras son acordes)
"[Verse 1]"            → False (0 de 2 palabras son acordes)
"Did I grow up..."     → False (0 de 4+ palabras son acordes)
```

**B) Transponer los acordes preservando el espaciado**

La clave del diseño es que los acordes deben permanecer alineados encima de
las sílabas correctas aunque el nombre transpuesto tenga distinta longitud
(p.ej. `Bb` → `A`, un carácter menos).

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
    # Busca el índice actual en chord_base
    current_index = next(
        i for i, group in enumerate(chord_base) if root + accidental in group
    )
    new_index = (current_index + semitones) % len(chord_base)
    # Elige sostenido o bemol según la configuración
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

#### 7.2 Cómo se implementó en Strings of Heaven

Las funciones anteriores fueron traducidas a TypeScript y distribuidas en dos
archivos:

**`shared/engine/music_theory.ts`** — lógica pura de teoría musical:

```typescript
// shared/engine/music_theory.ts

// Equivalente a chord_base en Python:
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

// Equivalente a chord_pattern en Python, extendido para sufijos compuestos
// y acordes de bajo (slash chords: G/B, Am/E):
export const CHORD_TOKEN_REGEX =
  /\b([A-G][#b]?(?:maj|min|m|dim|aug|sus|add)?[0-9]?(?:b[0-9]|#[0-9])?(?:\/[A-G][#b]?)?)\b/g;

// Equivalente a is_chord_line() en Python:
// El umbral del 50% está en `words.length / 2` — ver sección 7.3
export function isChordLine(line: string): boolean {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const chordCount = words.filter((w) => CHORD_TOKEN_SINGLE.test(w)).length;
  return chordCount > words.length / 2;  // <-- umbral configurable (ver 7.3)
}

// Equivalente a transpose_chord() en Python:
export function transposeChordName(
  chord: string,
  semitones: number,
  useSharps = true,
): string {
  if (semitones === 0) return chord;
  // Manejo de slash chords: "G/B" → transpone ambas partes por separado
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

// Equivalente a process_line() en Python — preserva el espaciado
// compensando la diferencia de longitud del nombre transpuesto:
export function transposeChordLine(
  line: string,
  semitones: number,
  useSharps = true,
): string {
  // ... localiza tokens, transpone cada uno, ajusta espacios
}

// Equivalente a transpose_text() en Python:
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

**`shared/engine/chord_engine.ts`** — helpers de alto nivel para canciones:

```typescript
// shared/engine/chord_engine.ts

// Extrae los acordes únicos de una canción en orden de aparición.
// Usado para poblar el panel Guitar / Ukulele / Piano de la SongPage.
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

// Resuelve cada nombre de acorde al par { note, suffix } que acepta
// getChordPositions(), para obtener los diagramas del instrumento activo.
export function resolveChordsFromBody(
  body: string,
  instrument: Instrument = 'guitar',
): ResolvedChord[] { ... }
```

---

#### 7.3 El umbral del 50 %: qué es y cómo ajustarlo

La función `isChordLine` usa un umbral que determina cuántas palabras de una
línea deben ser acordes para que la línea entera se trate como línea de acordes.
Actualmente está fijado en **más del 50 %** (`chordCount > words.length / 2`).

Este valor **se puede cambiar libremente** en `shared/engine/music_theory.ts`:

```typescript
// shared/engine/music_theory.ts  — función isChordLine
export function isChordLine(line: string): boolean {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const chordCount = words.filter((w) => CHORD_TOKEN_SINGLE.test(w)).length;

  // UMBRAL CONFIGURABLE:
  // Cambia el denominador o el operador para ajustar la sensibilidad.
  // Ejemplos:
  //   words.length / 2     → más del 50 % (valor actual)
  //   words.length / 3     → más del 33 %
  //   words.length * 0.75  → más del 75 %
  //   words.length         → el 100 % (todas las palabras deben ser acordes)
  return chordCount > words.length / 2;
}
```

**Qué pasa si se baja el umbral (más permisivo)**

| Umbral | Efecto |
|--------|--------|
| > 33 % (`/ 3`) | La mayoría de líneas con al menos un acorde se detectarán como chord lines. Funciona bien cuando las canciones mezclan letra y acordes en la misma línea (formato inline). Puede causar falsos positivos: una línea de letra que contenga una palabra que casualmente parezca un acorde (p.ej. "A man named G" → detectaría "A" y "G" como acordes). Mínimo razonable: **25 %**. |
| > 25 % (`/ 4`) | Extremadamente permisivo. Cualquier línea con una palabra parecida a un acorde se transpone. Solo útil si el formato de la canción mezcla acordes dentro de la prosa. Por debajo de este punto los falsos positivos son frecuentes y la transposición destruye el texto. |

**Qué pasa si se sube el umbral (más estricto)**

| Umbral | Efecto |
|--------|--------|
| > 75 % (`* 0.75`) | Solo se detectan como chord lines las que tienen casi exclusivamente acordes. Ignora líneas con un solo acorde delante de texto breve, como `D  Hey dad`. Correcto para formatos muy limpios donde los acordes siempre van solos en su línea. |
| > 100 % (`>= words.length`) | Solo se detectan líneas donde **todas** las palabras son acordes. Más preciso pero pierde las líneas con comentarios junto a los acordes, como `G  (strumming hard)`. |

**Recomendación:** el valor actual del 50 % es el equilibrio más robusto para
el formato estándar de canciones con acordes (acordes en línea propia, letra
debajo). No se recomienda bajar de 33 % ni subir de 75 % sin hacer pruebas
exhaustivas con el catálogo completo.

---

#### 7.4 Segunda opción: detección y transposición basada en teoría musical

Como alternativa al enfoque de `chord_autoscroll.py` (regex + umbral estadístico),
los repositorios de referencia del proyecto permiten implementar un enfoque
completamente distinto basado en teoría musical formal. Este está disponible como
opción para quien no quiera usar el umbral estadístico.

**Fundamento:** `third-party/music-theory-data/EqualTemperament/12-Tone/Chords.yaml`
define todos los tipos de acorde con sus bitmasks de 12 bits. Un acorde es
cualquier token cuyas notas formen un conjunto de pitch classes reconocido.

**Cómo funcionaría:**

1. **Detección de token de acorde** — en vez de regex, se parsea el token a
   `{ root, suffix }` y se verifica que el suffix exista en la base de datos
   de acordes (`shared/data/guitar_chords.json` o `Chords.yaml`). Si existe,
   es un acorde; si no, es texto.

2. **Detección de línea de acordes** — en vez del umbral del 50 %, se itera
   cada token de la línea separado por espacios y se verifica individualmente.
   Si todos los tokens no vacíos son acordes válidos, la línea es de acordes.
   Es un criterio binario (100 %), no estadístico.

3. **Transposición** — en vez de mover índices en el array `CHROMATIC`, se usa
   la clase `Note` y el método `transpose(intervalName)` que ya está implementado
   en `shared/engine/music_theory.ts`. Por ejemplo, subir 2 semitonos es
   `note.transpose('M2')`.

**Esquema de implementación:**

```typescript
// OPCIÓN 2 — detección y transposición basada en teoría musical
// (alternativa al enfoque chord_autoscroll)

import { Note } from './music_theory';
import { chordExists } from './chord_engine';

// Un token es acorde si su root+suffix existen en la base de datos
function isChordToken(token: string): boolean {
  const m = /^([A-G][#b]?)(.*)$/.exec(token);
  if (!m) return false;
  const [, note, rawSuffix] = m;
  const suffix = rawSuffix === '' ? 'major' : rawSuffix === 'm' ? 'minor' : rawSuffix;
  return chordExists(note, suffix, 'guitar');
}

// Una línea es de acordes si TODOS sus tokens son acordes válidos en la BD
// (criterio 100%, no estadístico)
function isChordLineStrict(line: string): boolean {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  return words.every(isChordToken);
}

// Transposición usando el motor de intervalos de music_theory.ts
// en vez del array CHROMATIC
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

**Cuándo usar cada opción:**

| | Opción 1 (actual — `chord_autoscroll`) | Opción 2 (teoría musical) |
|---|---|---|
| **Detección** | Regex + umbral estadístico (50 %) | Validación en base de datos de acordes |
| **Transposición** | Array CHROMATIC + índice | Clase `Note` + intervalos |
| **Velocidad** | Muy rápida (sin acceso a BD) | Más lenta (consulta la BD) |
| **Precisión** | Alta para formatos estándar | Perfecta, pero requiere BD cargada |
| **Funciona offline/sin BD** | Sí | No (necesita los JSON cargados) |
| **Falsos positivos** | Posibles con texto que contiene letras A–G | Ninguno |
| **Recomendado para** | Archivos de texto plano, editor ligero | Validación estricta, interfaz web |

Los recursos de referencia para implementar la opción 2 completa están en:
- `third-party/musthe/musthe/musthe.py` — `Note`, `Interval`, transposición
- `third-party/music-theory-data/EqualTemperament/12-Tone/Chords.yaml` — tipos de acorde
- `shared/engine/music_theory.ts` — clase `Note` y `getInterval` ya implementados

---

#### 7.5 Tabla completa de equivalencias Python → TypeScript

| Python (`chord_autoscroll.py`) | TypeScript (`strings-of-heaven`) | Archivo |
|---|---|---|
| `chord_base` (lista de 12 grupos) | `CHROMATIC` | `shared/engine/music_theory.ts` |
| `chord_pattern` (regex) | `CHORD_TOKEN_REGEX` | `shared/engine/music_theory.ts` |
| `is_chord_line(line)` | `isChordLine(line)` | `shared/engine/music_theory.ts` |
| `transpose_chord(chord, spaces)` | `transposeChordName(chord, n, useSharps)` | `shared/engine/music_theory.ts` |
| `process_line(line)` | `transposeChordLine(line, n, useSharps)` | `shared/engine/music_theory.ts` |
| `transpose_text(text, semitones)` | `transposeSongBody(body, n, useSharps)` | `shared/engine/music_theory.ts` |
| _(no existía)_ | `parseSongBody(body)` | `shared/engine/music_theory.ts` |
| _(no existía)_ | `parseSongFile(source)` | `shared/engine/music_theory.ts` |
| _(no existía)_ | `getUniqueChordsFromBody(body)` | `shared/engine/chord_engine.ts` |
| _(no existía)_ | `resolveChordsFromBody(body, instrument)` | `shared/engine/chord_engine.ts` |

**Diferencias respecto al original:**
- `CHORD_TOKEN_REGEX` cubre sufijos compuestos (`m7b5`, `maj13`, `sus2`, `sus4`,
  `add9`, `7#9`) y slash chords (`G/B`, `Am/E`) que el original no contemplaba.
- `transposeChordLine` compensa la diferencia de longitud cuando el nombre
  transpuesto es más corto o más largo, manteniendo la alineación con la letra.
- `parseSongBody` y `parseSongFile` son funciones nuevas que el programa de
  escritorio original no necesitaba (trabajaba con archivos `.txt` sin marcadores
  de sección `~~~`).

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
