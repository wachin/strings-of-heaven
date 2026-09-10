# Agent Handoff — Strings of Heaven

> Este documento describe el estado exacto del proyecto en el momento del traspaso.
> El siguiente agente debe leerlo completo antes de escribir cualquier código.

---

## 1. Qué es este proyecto

**Strings of Heaven** es una aplicación de referencia musical de código abierto (GPL 3) que permite:

- Consultar diagramas de acordes para **guitarra, piano y ukulele**
- Ver escalas sobre el mástil
- Leer canciones con letra y acordes, transponerlas en tiempo real, y ver los diagramas de los acordes que usa esa canción en un panel lateral (Guitar / Ukulele / Piano)
- Imprimir en PDF la letra con los acordes y sus diagramas encima

Dos plataformas que comparten el mismo motor y store:
- **Web app** — React 18 + Vite + Redux Toolkit + Tailwind CSS
- **App móvil** — React Native + NativeWind (fase futura)

---

## 2. Estado actual del código

### 2.1 Lo que ya está implementado y funcionando

| Área | Estado | Archivos |
|------|--------|---------|
| Motor de acordes | ✅ Completo + tests | `shared/engine/chord_engine.ts` |
| Motor de teoría musical | ✅ Completo + tests | `shared/engine/music_theory.ts` |
| Parser de canciones | ✅ Completo (nuevo) | `shared/engine/music_theory.ts` |
| Transposición de acordes | ✅ Completo (nuevo) | `shared/engine/music_theory.ts` |
| Redux store (chords/scales/ui) | ✅ Completo + tests | `shared/store/` |
| Datos de acordes JSON | ✅ Generados | `shared/data/` |
| Constantes de teoría | ✅ Completo | `shared/constants/theory.ts` |
| Tests (jest) | ✅ 75/75 pasando | `shared/__tests__/` |
| TypeScript | ✅ 0 errores | `npx tsc --noEmit` |

### 2.2 Lo que NO existe todavía (próximas fases)

- `web/` — directorio de la web app React (no creado)
- `app/` — directorio de la app React Native (no creado)
- `api/` — backend Node.js/Express (no creado)
- `catalog/` — base de datos de canciones (no creado)
- Ningún componente UI (ni SVG diagrams, ni páginas, ni nada visual)

### 2.3 Archivos modificados sin commit

```
M  README.md                     (+77 líneas — atribución chord-autoscroll)
M  shared/engine/chord_engine.ts (+133 líneas — song body helpers)
M  shared/engine/music_theory.ts (+345 líneas — parser + transposición)
```

Hacer commit antes de continuar:
```bash
git add README.md shared/engine/chord_engine.ts shared/engine/music_theory.ts
git commit -m "feat(engine): add song body parser and chord transposition"
```

---

## 3. Estructura de directorios

```
strings-of-heaven/
├── shared/                     ✅ Implementado
│   ├── engine/
│   │   ├── chord_engine.ts     # lookup acordes + parser de canciones
│   │   └── music_theory.ts     # notas, escalas, transposición, parser body
│   ├── store/
│   │   ├── index.ts            # configureStore + rootReducer
│   │   ├── chordsSlice.ts      # selectedKey, selectedSuffix, positionIndex
│   │   ├── scalesSlice.ts      # selectedRoot, selectedScale
│   │   ├── uiSlice.ts          # theme, instrument, dataEpoch
│   │   ├── selectors.ts        # memoized selectors (createSelector)
│   │   └── thunks.ts           # selectChordKey, switchInstrument, openChord
│   ├── data/
│   │   ├── guitar_chords.json  # datos procesados de chords-db
│   │   ├── piano_chords.json
│   │   └── ukulele_chords.json
│   ├── constants/
│   │   └── theory.ts           # INTERVALS, SCALES, CHORD_FORMULAS, ALL_KEYS...
│   ├── types.ts                # Instrument, ChordPosition, ProcessedChord...
│   └── __tests__/
│       ├── chord_engine.test.ts
│       ├── music_theory.test.ts
│       ├── diagrams.test.ts
│       └── store.test.ts
├── scripts/
│   └── process_chords.js       # regenera shared/data/*.json desde chords-db
├── third-party/                # submódulos de referencia (solo lectura)
│   ├── chords-db/              # fuente de datos de acordes (MIT)
│   ├── guitar-chords-db-json/  # fuente alternativa (MIT)
│   ├── musthe/                 # referencia de algoritmos (MIT)
│   ├── music-theory-data/      # referencia YAML (CC BY-SA 4.0)
│   ├── openmusictheory/        # referencia educativa (CC BY-SA)
│   ├── piano_fundamentals/     # referencia piano (custom)
│   └── chord-autoscroll/       # referencia parser/transposición (GPL 3)
├── 8vo/                        # material de investigación/referencia UI
│   ├── ANALISIS-UG-Y-ESPECIFICACION.md   # análisis detallado de features
│   └── ultimate-guitar-screenshots/     # capturas de referencia visual
│       ├── PERFECT CHORDS by Simple Plan*.html  # página descargada con Ctrl+S
│       ├── *-GUITAR-GATGET-chords.png   # widget guitar con D,A,Em,G
│       ├── *-UKELELE-GATGET-chords.png  # widget ukulele
│       └── *-PIANO-GATGET-chords.png    # widget piano con D,A,F#m,G
├── package.json                # jest + tsc (sin Vite/React todavía)
├── jest.config.js
├── README.md
├── ROADMAP.md
└── AGENT-HANDOFF.md            # este archivo
```

---

## 4. API pública del motor (lo más importante)

### 4.1 `shared/engine/chord_engine.ts`

```typescript
// Acordes
getChordPositions(note, suffix, instrument)  // → ChordPosition[]
getChordsForKey(note, instrument)            // → ProcessedChord[]
getChord(note, suffix, instrument)           // → ProcessedChord | undefined
getSuffixes(note, instrument)                // → string[]
chordExists(note, suffix, instrument)        // → boolean
findEquivalentSuffix(suffix, note, inst)     // → string (para cambiar de instrumento)
resolveKey(note, instrument)                 // → string (resuelve enarmónicos)
normalizeKey(note)                           // → string ("Csharp" → "C#")
loadChordDatabases(instrument)               // → Promise<ChordDatabase> (lazy load)
setChordDatabases(partial)                   // para tests / native
parseFretString(hexStr)                      // fallback hex → number[]

// Display
chordDisplayName(note, suffix)               // → "C Major"
canonicalTypeForSuffix(suffix)               // → tipo canónico
suffixForCanonicalType(canonicalType)        // → sufijo chords-db

// Canciones — NUEVAS FUNCIONES (fase actual)
getUniqueChordsFromBody(body)                // → string[] en orden de aparición
resolveChordsFromBody(body, instrument)      // → ResolvedChord[] ({ raw, note, suffix })

// Re-exporta desde music_theory.ts:
isChordLine(line)                            // → boolean
parseSongBody(body)                          // → ParsedSongLine[]
parseSongFile(source)                        // → SongFileSections
transposeSongBody(body, semitones, useSharps)// → string
transposeChordName(chord, semitones, useSharps)// → string
transposeChordLine(line, semitones, useSharps)  // → string
CHORD_TOKEN_REGEX                            // RegExp exportado
```

### 4.2 `shared/engine/music_theory.ts`

```typescript
// Notas e intervalos
new Note("C#4")                              // letra, accidental, octava, midi, freq
pitchClassOf(noteName)                       // → 0-11
getInterval(name)                            // → IntervalDef
intervalComplement(name)                     // → string

// Escalas
buildScale(root, scaleName)                  // → string[] de notas
SCALE_NAMES_AVAILABLE                        // lista de escalas disponibles

// Acordes
buildChordNotes(root, chordType)             // → string[] de notas
canonicalChordType(chordType)                // → tipo canónico

// Armonización
harmonizeScale(root, scaleName, includeDom7) // → HarmonizedChord[][]

// Transposición de canciones — NUEVAS
transposeChordName(chord, semitones, useSharps)  // → string
transposeChordLine(line, semitones, useSharps)   // → string (preserva espaciado)
transposeSongBody(body, semitones, useSharps)    // → string (solo transpone chord lines)
isChordLine(line)                            // → boolean (>50% tokens son acordes)
CHORD_TOKEN_REGEX                            // RegExp para detectar acordes

// Parser de canciones — NUEVAS
parseSongBody(body)     // → ParsedSongLine[] (chord | lyric | blank | header)
parseSongFile(source)   // → SongFileSections ({ meta, capo, body })
```

### 4.3 Redux store

```typescript
// State shape
{
  chords: { selectedKey, selectedSuffix, currentPositionIndex },
  scales: { selectedRoot, selectedScale },
  ui:     { theme, instrument, dataEpoch }
}

// Thunks principales
selectChordKey(key)          // cambia key, revalida suffix
switchInstrument(instrument) // cambia instrumento, revalida suffix
openChord(key, suffix)       // apertura directa (desde URL)
nextPosition() / prevPosition()

// Selectores memoizados
selectSelectedChord, selectSelectedPositions, selectCurrentPosition
selectAllSuffixes, selectScaleNotes, selectHarmonizedChords
```

---

## 5. Formato del archivo de canción

El formato de texto que el usuario escribe (y que el motor ya sabe parsear):

```
~~~
Perfect Chords by Simple Plan
Author: rocker_kitty
Difficulty: Absolute Beginner
~~~

~~~capo
Capo: 2nd fret
~~~

~~~body
[Intro]
D  A  Em  G

[Verse 1]
D
 Hey dad look at me
A
 Think back and talk to me
      Em                   G
Did I grow up according to plan?
~~~
```

- `parseSongFile(source)` devuelve `{ meta, capo: 2, body }`.
- `parseSongBody(body)` clasifica cada línea en `chord | lyric | blank | header`.
- `getUniqueChordsFromBody(body)` extrae `["D", "A", "Em", "G"]`.
- `resolveChordsFromBody(body, "guitar")` mapea a `[{raw:"D", note:"D", suffix:"major"}, ...]`.
- `transposeSongBody(body, 2)` transpone todas las chord lines 2 semitonos arriba.

---

## 6. Próximas tareas (en orden de prioridad)

### FASE A — Completar el motor de canciones (shared/)

- [ ] **A5** Crear estructura del catálogo de canciones:
  ```
  catalog/
  ├── index.json              # { artists: [{slug, name, songCount}] }
  └── artists/
      └── simple-plan/
          ├── artist.json     # { name, slug, bio? }
          └── perfect/
              ├── meta.json   # { versions: [{id, type, author, difficulty, rating, views}] }
              └── chords-v1.txt  # archivo en formato ~~~
  ```
- [ ] **A6** `CatalogService` — funciones para leer el catálogo (buscar artista, canción, versión)

### FASE B — Web app (web/) — PRIORIDAD ALTA

Crear `web/` con Vite + React 18 + Redux + Tailwind:

```bash
cd strings-of-heaven
npm create vite@latest web -- --template react-ts
cd web && npm install
npm install @reduxjs/toolkit react-redux react-router-dom tailwindcss
```

Componentes a implementar en orden:

- [ ] **B1** `SongBody` — renderiza body con acordes clicables (usa `parseSongBody`)
- [ ] **B2** `ChordsPanel` — panel derecho sticky con 3 pestañas Guitar/Ukulele/Piano
         y los diagramas de los acordes únicos de la canción (usa `resolveChordsFromBody` + `getChordPositions`)
- [ ] **B3** `TransposeControl` — botones +/- que llaman a `transposeSongBody`
- [ ] **B4** `CapoSelector` — dropdown 0-12
- [ ] **B5** `AutoscrollControl` — botón + slider de velocidad
- [ ] **B6** `VersionsList` — sidebar izquierdo con las versiones de una canción
- [ ] **B7** `SongRating` — estrellas 1-5

Páginas en orden:

- [ ] **D1** `SongPage` (`/tab/:artist/:song-:id`) — la más importante, usa B1-B7
- [ ] **D5** `HomePage` (`/`) — búsqueda + trending
- [ ] **D3** `ExplorePage` (`/explore`) — lista filtrable
- [ ] **D2** `ArtistPage` (`/artist/:slug`) — canciones de un artista
- [ ] **D4** `SearchPage` (`/search?q=...`) — resultados
- [ ] **D6** `SubmitTabPage` (`/submit`) — formulario de subida

### FASE C — Impresión/PDF

- [ ] **C1** CSS `@media print` para la SongPage
- [ ] **C2** `PrintView` — layout con diagramas arriba + body abajo
- [ ] **C3** Botón "Download PDF" (`window.print()` o `html2pdf.js`)

### FASE D — App React Native (app/) — FASE FUTURA

Ver ROADMAP.md sección PHASE 3.

---

## 7. Diseño de la página de canción (referencia visual)

El archivo `8vo/ANALISIS-UG-Y-ESPECIFICACION.md` contiene el análisis detallado.
El `8vo/ultimate-guitar-screenshots/` tiene capturas de referencia visual.

Layout de tres columnas:

```
┌──────────────────┬──────────────────────────┬──────────────────┐
│ SIDEBAR IZQUIERDO│ CONTENIDO CENTRAL         │ PANEL DERECHO    │
│                  │                           │ (sticky)         │
│ Versiones:       │ Título + Artista           │                  │
│ • Ver 1 ★4.7 ←  │ Autor | Dificultad | Vistas│ "Chords"         │
│ • Ver 2 ★4.6    │                           │ [Guitar][Uke][Piano]
│ • Ver 3 ★4.8    │ [Autoscroll] Speed [Transp]│                  │
│ • Ver 4 ★4.3    │ Capo: 2nd fret            │ Diagrama D       │
│                  │                           │ Diagrama A       │
│                  │ ── cuerpo de la canción ──│ Diagrama Em      │
│                  │ D                         │ Diagrama G       │
│                  │  Hey dad look at me       │                  │
│                  │ A                         │                  │
│                  │  Think back and talk to me│                  │
│                  │       Em            G     │                  │
│                  │ Did I grow up...          │                  │
│                  │                           │                  │
│                  │ [Print] [Correction]       │                  │
│                  │ Rating ★★★★☆ 4.6 (87)     │                  │
│                  │ Related tabs              │                  │
│                  │ Comments                  │                  │
└──────────────────┴──────────────────────────┴──────────────────┘
```

**Comportamiento del widget de acordes (panel derecho):**
- Al cambiar pestaña Guitar→Ukulele→Piano: los diagramas se actualizan sin recargar
- Los acordes mostrados son los únicos de ESA canción, extraídos con `getUniqueChordsFromBody`
- Piano muestra las notas reales (con capo aplicado): si hay capo 2 y el acorde es Em, el piano muestra F#m
- Al hacer clic/hover en un acorde del body: se resalta el diagrama correspondiente

**Comportamiento de impresión:**
```
PDF:
  Título — Artista
  Capo: 2nd fret | Dificultad: Absolute Beginner
  
  [Diagrama D] [Diagrama A] [Diagrama Em] [Diagrama G]
  
  [Verse 1]
  D
   Hey dad look at me
  ...
```

---

## 8. Dependencias recomendadas para la web app

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@reduxjs/toolkit": "^2.x",
    "react-redux": "^9.x",
    "react-router-dom": "^6.x",
    "@tombatossals/react-chords": "^1.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "@vitejs/plugin-react": "^4.x",
    "vitest": "^1.x",
    "@testing-library/react": "^14.x"
  }
}
```

> `@tombatossals/react-chords` renderiza SVG para guitarra, ukulele **y piano**
> con el mismo formato de datos que ya tenemos en `shared/data/`. Es la opción
> recomendada para la web. En React Native hay que renderizar con `react-native-svg`.

---

## 9. Comandos útiles

```bash
# Desde la raíz del proyecto
npx tsc --noEmit          # type-check del shared/
npx jest                  # tests (75 tests, ~11s)
npx jest --no-coverage --silent  # más rápido

# Regenerar los JSON de acordes si se actualiza chords-db
node scripts/process_chords.js

# Clonar el repo en el nuevo ordenador
git clone --recurse-submodules https://github.com/wachin/strings-of-heaven.git
cd strings-of-heaven
npm install

# Si ya clonado sin submodules
git submodule update --init --recursive
```

---

## 10. Convenciones de código

- TypeScript estricto en todo el codebase
- Componentes funcionales con hooks (sin clases)
- Redux Toolkit con `createSlice` y `createAsyncThunk`
- Nombres: `camelCase` variables/funciones, `PascalCase` componentes, `UPPER_SNAKE_CASE` constantes
- Web: Tailwind CSS
- Native: NativeWind
- Tests: jest (shared), vitest (web)
- `shared/engine/` debe ser **puro TypeScript sin imports de React** — funciona tanto en web como en native

---

## 11. Notas importantes del propietario del proyecto

- Las referencias de diseño visual de otras aplicaciones de acordes se añadirán
  al README al final del desarrollo. No mencionar nombres de aplicaciones de
  referencia en el código ni en la documentación hasta ese momento.
- El catálogo de canciones es propio del proyecto (carpeta `catalog/`).
- La canción "Perfect" de Simple Plan (con acordes D, A, Em, G, capo 2) es el
  caso de prueba de referencia para todos los componentes de la página de canción.
- Licencia del proyecto: **GPL 3**.
