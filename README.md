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
| SVG diagrams (web) | `@tombatossals/react-chords` |
| SVG diagrams (native) | `react-native-svg` |
| Styling (web) | Tailwind CSS |
| Styling (native) | NativeWind |
| Navigation | React Navigation (stack + bottom tabs) |

---

## Project structure

```
/
├── app/              # React Native — Android & iOS
├── web/              # React + Redux — SPA / SSR
├── shared/
│   ├── engine/
│   │   ├── chord_engine.ts     # chord lookup, position parsing (guitar + piano + ukulele)
│   │   └── music_theory.ts     # notes, intervals, scales, harmonization
│   ├── data/
│   │   ├── guitar_chords.json
│   │   ├── piano_chords.json
│   │   └── ukulele_chords.json
│   └── constants/
│       └── theory.ts
├── api/              # Node.js / Express REST API (optional in v1)
├── third-party/      # Reference submodules (read-only — see below)
├── ROADMAP.md        # Full implementation plan for AI-assisted development
└── README.md
```

---

## Chord data sources

All chord data is bundled locally from open-source databases. No external API is called at runtime.

| Submodule | Content | Used for |
|---|---|---|
| [`tombatossals/chords-db`](https://github.com/tombatossals/chords-db) | Guitar, piano, ukulele JSON — primary database | Chord diagrams (all instruments) |
| [`szaza/guitar-chords-db-json`](https://github.com/szaza/guitar-chords-db-json) | ~99,230 guitar chord variants | Fallback for rare guitar voicings |
| [`seancolsen/music-theory-data`](https://github.com/seancolsen/music-theory-data) | Chords, scales, intervals in YAML with bitmasks | Theory reference & chord naming |
| [`gciruelos/musthe`](https://github.com/gciruelos/musthe) | Python music theory library | Algorithm reference for `music_theory.ts` |
| [`openmusictheory`](https://github.com/openmusictheory/openmusictheory.github.io) | Interactive music theory textbook | Educational content reference |
| [`gmoe/piano_fundamentals`](https://github.com/gmoe/piano_fundamentals) | Chuan C. Chang's piano practice book | Piano feature reference |

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
npm install
npm run dev
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

git submodule update --init --recursive
```

---

## Redux store shape

Both the web app and the mobile app use the same Redux store structure:

```ts
{
  chords: {
    selectedKey: "C",
    selectedSuffix: "major",
    currentPositionIndex: 0,
    allSuffixes: string[],
    allKeys: string[]
  },
  scales: {
    selectedRoot: "C",
    selectedScale: "major",
    notes: string[],
    harmonizedChords: Chord[][]
  },
  ui: {
    theme: "dark" | "light",
    instrument: "guitar" | "piano" | "ukulele"
  }
}
```

The `ui.instrument` field drives which diagram component is rendered everywhere. Switching it via `InstrumentToggle` updates all diagrams instantly without changing the selected chord.

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

MIT — see [LICENSE](./LICENSE) for details.

Chord data from [`tombatossals/chords-db`](https://github.com/tombatossals/chords-db) is MIT licensed.
Music theory data from [`seancolsen/music-theory-data`](https://github.com/seancolsen/music-theory-data) is MIT licensed.
