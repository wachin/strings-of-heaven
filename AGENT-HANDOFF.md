# Agent Handoff — Strings of Heaven

> Este documento describe el estado exacto del proyecto en el momento del traspaso.
> El siguiente agente debe leerlo completo antes de escribir cualquier código.

**Fecha de actualización:** Septiembre 11, 2026  
**Estado:** Web app **publicada y funcionando** en GitHub Pages + editor de catálogo de
escritorio (PyQt6). Pendiente inmediato: que la web lea `shared/data/catalog/`.

---

## 1. Qué es este proyecto

**Strings of Heaven** es una aplicación de referencia musical de código abierto que permite:

- Consultar diagramas de acordes para **guitarra, piano y ukulele**
- Ver escalas sobre el mástil
- **Subir y almacenar canciones** con letra y acordes
- **Transponer acordes** en tiempo real preservando el espaciado
- Ver los diagramas de los acordes que usa una canción
- Modo **estático (GitHub Pages)** o **servidor (API)**

Dos plataformas que comparten el mismo motor y store:
- **Web app** — ✅ React 18 + Vite + Redux Toolkit + Tailwind CSS (FUNCIONANDO)
- **App móvil** — React Native + NativeWind (fase futura)

---

## 2. Estado actual del código

### 2.1 Lo que ya está implementado y funcionando

| Área | Estado | Archivos |
|------|--------|---------|
| **Motor completo** | ✅ Completo + tests | `shared/engine/` |
| Motor de acordes | ✅ Completo + tests | `shared/engine/chord_engine.ts` |
| Motor de teoría musical | ✅ Completo + tests | `shared/engine/music_theory.ts` |
| Parser de canciones | ✅ Completo | `shared/engine/music_theory.ts` |
| Transposición de acordes | ✅ Completo | `shared/engine/music_theory.ts` |
| **Redux store** | ✅ Completo + tests | `shared/store/` |
| **Datos de acordes JSON** | ✅ Generados | `shared/data/` |
| **Web app funcional** | ✅ Funcionando | `web/` |
| Sistema de tipos | ✅ Completo | `shared/types.ts` + `shared/types/song.ts` |
| Páginas web | ✅ 7 páginas completas | `web/src/pages/` |
| Componentes UI | ✅ Navegación + layouts | `web/src/components/` |
| **Sistema de canciones** | ✅ NUEVO - Completo | `shared/types/song.ts` + hooks |
| **Subida de canciones** | ✅ NUEVO - Completo | `web/src/pages/SubmitSongPage.tsx` |
| **Vista individual de canción** | ✅ NUEVO - Completo | `web/src/pages/SongViewPage.tsx` |
| **Renderer de body con acordes clicables** | ✅ NUEVO - Completo | `web/src/components/SongBody.tsx` |
| **Edición in-place (`updateSong`)** | ✅ NUEVO - Corregido | `web/src/hooks/useSongStorage.ts` |
| **localStorage/API storage** | ✅ NUEVO - Completo | `web/src/hooks/useSongStorage.ts` |
| **Autoría compartida (fuente única)** | ✅ NUEVO - Completo + tests | `shared/song/authoring.ts` |
| **Editor de catálogo de escritorio** | ✅ NUEVO - PyQt6 | `tools/song-editor/` |
| **GitHub Pages config** | ✅ NUEVO - Completo | `.github/workflows/deploy.yml` + config |
| Tests (jest) | ✅ 117 pasando | `shared/__tests__/` |
| Tests (vitest) | ✅ 37 pasando | `web/src/__tests__/` |
| TypeScript (shared + tools) | ✅ 0 errores | `npx tsc --noEmit` |
| TypeScript (web) | ✅ 0 errores | `cd web && npx tsc --noEmit` |

### 2.2 Lo que NO existe todavía (próximas fases)

- ⚠️ **La web NO lee `shared/data/catalog/`** — el editor guarda los JSON, pero
  todavía no se ven en el navegador (siguiente tarea)
- **Flujo de moderación** — envío → revisión humana → publicación (diseño acordado, sin construir)
- **Backend Supabase** opcional para envíos compartidos (planificado)
- **Panel de acordes lateral** — widget sticky con pestañas Guitar/Ukulele/Piano (P3)
- **Transposición en vivo en UI** — controles +/- en la página de canción (P4)
- **CapoSelector** — dropdown 0-12 con "sounding key" calculado (P5)
- **Autoscroll** — funcionalidad de scroll automático (P6)
- **Impresión/PDF** — exportar canciones con diagramas (P7)
- **Búsqueda global** — página `/search?q=...` (P8)
- **Importación del catálogo** — migrar `Catalogo/` a localStorage (P9)
- `app/` — directorio de la app React Native (no creado)
- `api/` — backend Node.js/Express (opcional)

### 2.3 Sesiones recientes

Ver **sección 17** para el detalle completo. Resumen:
- ✅ P1/P2: `SongViewPage` + `SongBody`
- ✅ Fix: import roto de `SongEntry` en `@shared/types` (4 errores de tipo)
- ✅ Fix: el modo edición duplicaba canciones (nuevo `updateSong`)
- ✅ Fix: el deploy a GitHub Pages nunca funcionó (3 causas, sección 17.3)
- ✅ Tests: de 11 a 28 en web (vitest)
---

## 3. Estructura de directorios actualizada

```
strings-of-heaven/
├── .github/workflows/          ✅ NUEVO
│   └── deploy.yml              # GitHub Pages deployment automático
├── shared/                     ✅ Implementado y actualizado
│   ├── engine/
│   │   ├── chord_engine.ts     # lookup acordes + parser de canciones + song helpers
│   │   └── music_theory.ts     # notas, escalas, transposición, parser body
│   ├── store/                  # Redux store completo
│   ├── data/                   # Datos de acordes procesados
│   ├── constants/              # Constantes de teoría musical
│   ├── diagrams/               # Geometría SVG para diagramas
│   ├── types.ts                # Tipos base (Instrument, ChordPosition, etc.)
│   ├── types/
│   │   └── song.ts             # ✅ Tipos de canción (SongEntry, SongDraft, labels)
│   ├── song/
│   │   └── authoring.ts        # ✅ NUEVO - validación, slug, parser Catalogo (fuente única)
│   ├── config.ts               # ✅ NUEVO - Feature flags y configuración
│   └── __tests__/              # Tests completos (117 pasando)
├── web/                        ✅ COMPLETO - Web app publicada
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx          # ✅ Página principal
│   │   │   ├── ExplorePage.tsx       # ✅ Explorar acordes  
│   │   │   ├── ChordPage.tsx         # ✅ Vista individual de acorde
│   │   │   ├── ScalesPage.tsx        # ✅ Escalas musicales
│   │   │   ├── TheoryPage.tsx        # ✅ Teoría musical
│   │   │   ├── SongsPage.tsx         # ✅ Lista de canciones guardadas (título → /song/:id)
│   │   │   ├── SongViewPage.tsx      # ✅ NUEVO - Vista individual /song/:id
│   │   │   └── SubmitSongPage.tsx    # ✅ NUEVO - Formulario subida/edición canciones
│   │   ├── hooks/
│   │   │   ├── usePageTitle.ts       # ✅ Hook para títulos
│   │   │   └── useSongStorage.ts     # ✅ NUEVO - Hook localStorage/API (+updateSong)
│   │   ├── components/               # ✅ Componentes UI compartidos
│   │   │   └── SongBody.tsx          # ✅ NUEVO - Body con acordes clicables
│   │   ├── router.ts                 # ✅ NUEVO - basename para el subdirectorio de Pages
│   │   ├── __tests__/                # ✅ Tests web (37 pasando)
│   │   ├── App.tsx                   # ✅ Router + navegación
│   │   └── main.tsx                  # ✅ Entry point
│   ├── dist/                         # Build output (git-ignored)
│   ├── vite.config.ts                # ✅ base path, host IPv4+IPv6, fallback 404.html
│   ├── package.json                  # ✅ Dependencias completas
│   └── tailwind.config.js            # ✅ Tailwind CSS config
├── tools/
│   └── song-editor/            # ✅ NUEVO - Editor de catálogo PyQt6
│       ├── main.py             # GUI: formulario, preview, badges, guardar JSON
│       ├── bridge.py           # Puente Python ↔ Node (subprocess + JSON)
│       ├── engine_cli.ts       # CLI que expone el motor TS real
│       ├── requirements.txt    # PyQt6
│       └── README.md           # Instrucciones y arquitectura
├── Catalogo/                   # 271 canciones legacy (.txt) por revisar
├── scripts/
│   └── process_chords.js       # regenera shared/data/*.json desde chords-db
├── third-party/                # submódulos de referencia (solo lectura)
├── 8vo/                        # material de investigación (git-ignored)
├── README.md                   # ✅ ACTUALIZADO - uso, canciones, deployment
├── ROADMAP.md
└── AGENT-HANDOFF.md            # este archivo
```

---

## 4. NUEVO: Sistema de canciones completo

### 4.1 Tipos y estructura de datos (`shared/types/song.ts`)

```typescript
// Tipo principal para una canción guardada
interface SongEntry {
  id: string;              // UUID generado automáticamente
  title: string;           // "Como el ciervo"
  artist: string;          // "Marcos Witt" 
  type: SongType;          // "worship" | "hymn" | "contemporary" | "traditional"
  capo: number;            // 0-12, capo position
  tuning: string;          // "Standard", "Drop D", etc.
  key: string;             // "G", "Bb", "C#m" (sounding key after capo)
  bpm: number;             // 0 if unknown, or actual BPM
  timeSignature: TimeSignature; // "4/4" | "3/4" | "6/8" | "2/4"
  difficulty: Difficulty;  // "beginner" | "intermediate" | "advanced" | "expert"
  description: string;     // Performance notes, strumming patterns, etc.
  body: string;            // ✅ Letra y acordes en formato texto
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string  
  version: number;         // Para futuras migraciones
}

// Factory function para canciones nuevas
function emptySongEntry(): SongEntry
```
### 4.2 Hook de almacenamiento (`web/src/hooks/useSongStorage.ts`)

```typescript
interface UseSongStorageReturn {
  songs: SongEntry[];
  loading: boolean;
  error: string | null;
  saveSong: (song: SongDraft) => Promise<string>;            // Crea → ID nuevo
  updateSong: (id, song: SongDraft) => Promise<string>;      // ✅ NUEVO - Actualiza in-place
  loadSongs: () => Promise<void>;                            // Carga todas las canciones
  searchSongs: (query) => Promise<SongEntry[]>;              // Búsqueda título/artista/contenido
  getSong: (id) => Promise<SongEntry | null>;                // Obtiene canción por ID
  deleteSong: (id) => Promise<void>;                         // Elimina canción
}

// SongDraft = Omit<SongEntry, 'id' | 'createdAt' | 'updatedAt' | 'version'>
// El storage gestiona id/createdAt/updatedAt/version (saveSong pone version: 1,
// updateSong conserva id+createdAt y hace version + 1).

// Funciona en dos modos:
// 1. STATIC MODE (por defecto) - localStorage
// 2. API MODE (configurable) - backend server (incluye PUT /songs/:id)
```

### 4.3 Página de subida (`web/src/pages/SubmitSongPage.tsx`)

✅ **Completamente funcional** con:
- **Formulario completo** — todos los campos de SongEntry
- **Preview en vivo** — visualiza acordes destacados, headers de sección, letras
- **Extracción de acordes** — muestra automáticamente badges con acordes únicos encontrados
- **Validación** — campos obligatorios, rangos válidos (BPM 0-400, capo 0-12)
- **Estados de carga** — loading, error handling, confirmación de guardado
- **Modo edición** — URL con `?id=songId` para editar canciones existentes

### 4.4 Página de listado (`web/src/pages/SongsPage.tsx`)

✅ **Completamente funcional** con:
- **Lista de canciones** — título, artista, tipo, dificultad, capo, BPM, fecha
- **Búsqueda** — por título o artista
- **Título clicable** — abre `/song/:id` (✅ NUEVO)
- **Acciones** — editar, eliminar (con confirmación)
- **Botón prominente** — "+ Add song" que lleva a `/submit`
- **Estado vacío** — mensaje amigable con enlace a subir primera canción

### 4.5 Página de vista individual (`web/src/pages/SongViewPage.tsx`) — ✅ NUEVO

Ruta `/song/:id`. Carga la canción con `getSong(id)` y muestra:
- Breadcrumb (My songs / título), título grande y artista
- Chips de metadatos: tipo, dificultad, key, capo (`none` si 0), tempo, compás, tuning, versión
- Bloque "Notes" con la descripción (solo si no está vacía)
- Body renderizado con `SongBody`
- Botones **Edit** (→ `/submit?id=...`) y **All songs**
- Estados: spinner de carga, caja de error roja, mensaje "This song does not exist in this browser."

### 4.6 Renderer de body (`web/src/components/SongBody.tsx`) — ✅ NUEVO

- Usa `parseSongBody()` para clasificar líneas (`chord | lyric | blank | header`)
- **Preserva el espaciado original**: cada token de acorde conserva su columna, así los
  acordes quedan alineados sobre las sílabas correctas
- Acordes en **amber** y clicables → `/chord/:note/:suffix` (resueltos con
  `resolveChordsFromBody()`, p. ej. `Am` → `/chord/A/minor`)
- Headers `[Verse 1]` en **indigo**, letras en texto normal
- Normaliza CRLF y acepta bodies vacíos (muestra placeholder)
- Respeta el instrumento activo del store para resolver el suffix

---

## 5. NUEVO: Configuración GitHub Pages

### 5.1 Deployment automático (`.github/workflows/deploy.yml`)

✅ **Funcionando** - Push a `main` → deploy automático a GitHub Pages:
- Detecta automáticamente nombre del repositorio para base path
- Soporte para git submodules 
- Build optimizado para producción
- Deploy a `https://username.github.io/repository-name/`

### 5.2 Configuración Vite (`web/vite.config.ts`)

```typescript
// Base path automático para GitHub Pages
function getBasePath(): string {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    return `/${repoName}/`;
  }
  return '/';
}
```

### 5.3 Feature flags (`shared/config.ts`)

```typescript
interface AppConfig {
  useApiBackend: boolean;    // false = localStorage, true = API server
  apiBaseUrl: string;        // URL del servidor API
  basePath: string;          // Base path para GitHub Pages
  debug: boolean;            // Modo debug
}

// Por defecto configurado para GitHub Pages (estático)
const config: AppConfig = {
  useApiBackend: false,  // ← Modo estático por defecto
  apiBaseUrl: process.env.VITE_API_BASE_URL || '',
  basePath: process.env.VITE_BASE_PATH || '',
  debug: process.env.NODE_ENV === 'development',
};
```
---

## 6. API pública del motor (actualizada)

### 6.1 `shared/engine/chord_engine.ts` (funciones principales)

```typescript
// ══════════════════════════════════════════════════════════════════
// ACORDES - API principal (sin cambios)
// ══════════════════════════════════════════════════════════════════
getChordPositions(note, suffix, instrument)  // → ChordPosition[]
getChordsForKey(note, instrument)            // → ProcessedChord[]  
getChord(note, suffix, instrument)           // → ProcessedChord | undefined
getSuffixes(note, instrument)                // → string[]
chordExists(note, suffix, instrument)        // → boolean

// ══════════════════════════════════════════════════════════════════
// CANCIONES - API nueva ✅
// ══════════════════════════════════════════════════════════════════
getUniqueChordsFromBody(body: string)                // → string[] acordes únicos en orden
resolveChordsFromBody(body: string, instrument)      // → ResolvedChord[] con {raw, note, suffix}

// Re-exporta desde music_theory.ts:
parseSongBody(body: string)                          // → ParsedSongLine[] clasificadas
transposeSongBody(body: string, semitones, sharps)   // → string transpuesto
isChordLine(line: string)                            // → boolean (>50% threshold)
CHORD_TOKEN_REGEX                                    // RegExp exportado
```

### 6.2 `shared/engine/music_theory.ts` (funciones principales)

```typescript
// ══════════════════════════════════════════════════════════════════
// PARSER Y TRANSPOSICIÓN - Funcionalidad principal ✅
// ══════════════════════════════════════════════════════════════════

// Detección de líneas de acordes (configurable)
isChordLine(line: string): boolean              // >50% palabras son acordes
CHORD_TOKEN_REGEX: RegExp                       // /\b([A-G][#b]?(?:maj|...)[0-9]?...)\b/g

// Parser estructurado del body de una canción
parseSongBody(body: string): ParsedSongLine[]   // → {type: 'chord'|'lyric'|'blank'|'header', raw, tokens?}

// Transposición preservando espaciado
transposeChordName(chord, semitones, sharps)    // "Bb" + 2 → "C" 
transposeChordLine(line, semitones, sharps)     // Preserva alineación de acordes sobre letras
transposeSongBody(body, semitones, sharps)      // Transpone solo las chord lines
```

---

## 7. Formato del archivo de canción (implementado)

El usuario escribe directamente en el formulario web. El formato soportado:

```
[Verse 1] 
G               Em
Como el ciervo busca por las aguas,
      C      G         C    D  
así clama mi alma por ti Señor.

[Chorus]
D           G        Em
Mi alma tiene sed de ti,
      C        G       C     D
solo tu puedes satisfacer.
```

- ✅ `parseSongBody(body)` clasifica cada línea: `chord | lyric | blank | header`
- ✅ `getUniqueChordsFromBody(body)` extrae `["G", "Em", "C", "D"]`  
- ✅ `resolveChordsFromBody(body, "guitar")` mapea a `[{raw:"G", note:"G", suffix:"major"}, ...]`
- ✅ `transposeSongBody(body, 2)` transpone +2 semitonos preservando espaciado

---

## 8. Próximas tareas (en orden de prioridad)

### ALTA PRIORIDAD — Visualización de canciones ✅ COMPLETADA

- [x] **P1** `SongViewPage` (`/song/:id`) — página para mostrar una canción individual
  - Usar `getSong(id)` del hook `useSongStorage`
  - Layout: título, artista, metadata arriba + body renderizado abajo
  - Botón "Edit" que lleva a `/submit?id=xxx`
  - ✅ Hecho: `web/src/pages/SongViewPage.tsx` + ruta en `App.tsx`

- [x] **P2** `SongBody` component — renderiza body con acordes clicables
  - Usar `parseSongBody()` para classificar líneas
  - Acordes en color amber, headers en indigo, letras en texto normal
  - Los acordes son clicables → abren `/chord/:note/:suffix`
  - ✅ Hecho: `web/src/components/SongBody.tsx` (preserva columnas del original)

### MEDIA PRIORIDAD — Panel de acordes y controles

- [ ] **P3** `ChordsPanel` component — widget sticky lateral derecho
  - 3 pestañas: Guitar | Ukulele | Piano  
  - Usar `resolveChordsFromBody()` + `getChordPositions()` para mostrar diagramas
  - Integrar con `@tombatossals/react-chords` o implementar SVG custom

- [ ] **P4** `TransposeControls` component — botones +/- 
  - Estado local del componente para semitones transpuestos
  - Llamar a `transposeSongBody()` para actualizar el body mostrado
  - Mostrar "Transposed +2" como feedback visual

- [ ] **P5** `CapoSelector` component — dropdown 0-12
  - Integrar con transposición: capo + transposición = key resultante
  - Mostrar "Sounding key: X" calculado dinámicamente
### BAJA PRIORIDAD — Features avanzadas

- [ ] **P6** `AutoscrollControls` — botón play/pause + slider velocidad
- [ ] **P7** Impresión/PDF — CSS `@media print` + botón "Print"
- [ ] **P8** Búsqueda global — página `/search?q=...` que use `searchSongs()`
- [ ] **P9** Catálogo importado — migrar canciones del directorio `Catalogo/` a localStorage

### FUTURO — React Native app

Ver sección correspondiente en ROADMAP.md.

---

## 9. Navegación actual (funcional)

```
/ (HomePage)           ✅ Página de inicio
/explore (ExplorePage) ✅ Acordes por nota y tipo  
/chord/:key/:suffix    ✅ Vista individual de acorde con diagramas
/scales (ScalesPage)   ✅ Escalas musicales
/theory (TheoryPage)   ✅ Teoría musical
/songs (SongsPage)     ✅ Lista de canciones guardadas + búsqueda + CRUD
/song/:id              ✅ NUEVO - Vista individual de canción (P1/P2)
/submit (SubmitSongPage) ✅ Formulario subida/edición canciones
```

**Falta implementar:**
```
/search?q=...          ← Búsqueda global (BAJA PRIORIDAD, P8)
```

⚠️ **Nota de despliegue (GitHub Pages):** las rutas de arriba son del lado del cliente.
Navegar dentro de la app funciona, pero **abrir/recargar una URL profunda**
(p. ej. `https://wachin.github.io/strings-of-heaven/song/abc`) devuelve 404 porque
GitHub Pages no reescribe a `index.html`. Ver sección 17.3 para las opciones.

---

## 10. Fork-friendly para servidores

El proyecto está **completamente preparado** para que otros desarrolladores hagan fork y añadan un servidor:

### 10.1 Habilitar modo API (para forks)

1. **Cambiar configuración** en `shared/config.ts`:
   ```typescript
   export const config: AppConfig = {
     useApiBackend: true,  // ← Cambiar de false a true
     apiBaseUrl: 'https://tu-servidor.com/api',
     // ...
   };
   ```

2. **Implementar endpoints** que `useSongStorage.ts` espera:
   ```
   GET    /api/songs           → { songs: SongEntry[] }
   POST   /api/songs/upload    → { success: boolean, id: string }
   GET    /api/songs/search?q= → { songs: SongEntry[] }  
   GET    /api/songs/:id       → { song: SongEntry }
   DELETE /api/songs/:id       → { success: boolean }
   PUT    /api/songs/:id       → { success: boolean, id: string }   # ✅ NUEVO (edición)
   ```

3. **Desplegar** en la plataforma preferida:
   - Vercel/Netlify (serverless functions)
   - Railway/Render (full-stack)
   - VPS propio (Docker + nginx)

### 10.2 Documentación incluida

- ✅ **README.md** — sección completa de "Deployment" con GitHub Pages + server options
- ✅ **Comentarios en código** — `useSongStorage.ts` tiene instrucciones detalladas
- ✅ **Ejemplo de stack** — Vercel + Railway + PostgreSQL sugerido

---

## 11. Comandos actualizados

```bash
# ══════════════════════════════════════════════════════════════════
# SETUP INICIAL
# ══════════════════════════════════════════════════════════════════
git clone --recurse-submodules https://github.com/wachin/strings-of-heaven.git  
cd strings-of-heaven
npm install                    # Instala deps del root (jest, typescript)
cd web && npm install          # Instala deps de la web app

# ══════════════════════════════════════════════════════════════════  
# DESARROLLO WEB APP
# ══════════════════════════════════════════════════════════════════
cd web
npm run dev                    # http://127.0.0.1:5173 (desarrollo; escucha IPv4 + IPv6)
npm run build                  # Build para producción → web/dist/
npm run preview                # Preview del build

# ══════════════════════════════════════════════════════════════════
# EDITOR DE CATÁLOGO (escritorio)
# ══════════════════════════════════════════════════════════════════
pip install -r tools/song-editor/requirements.txt   # PyQt6
python tools/song-editor/main.py                    # escribe shared/data/catalog/*.json

# ══════════════════════════════════════════════════════════════════
# TESTS Y VALIDACIÓN  
# ══════════════════════════════════════════════════════════════════
cd ..                          # Volver a la raíz
npx tsc --noEmit              # Type-check shared/ + tools/ (debe ser 0 errores)
npx jest                       # Tests shared/ (117 pasando, ~12s)
cd web && npm run test         # Tests web/ (vitest, 37 pasando)
cd web && npm run typecheck    # ⚠️ Type-check web/ (debe ser 0 errores — usar SIEMPRE)
cd web && npm run build        # Verificar que el build de producción compila

# ══════════════════════════════════════════════════════════════════
# DEPLOYMENT
# ══════════════════════════════════════════════════════════════════
git push origin main           # → Deploy automático a GitHub Pages
```
---

## 12. Tecnologías y dependencias actuales

### 12.1 Root package.json
```json
{
  "devDependencies": {
    "@types/jest": "^29.x",
    "jest": "^29.x", 
    "typescript": "^5.x"
  }
}
```

### 12.2 Web package.json  
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^2.x",
    "react-redux": "^9.x", 
    "react-router-dom": "^6.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x", 
    "vitest": "^1.x",
    "@testing-library/react": "^14.x"
  }
}
```

### 12.3 Consideraciones futuras

Para el **panel de acordes** (siguiente tarea prioritaria):
```bash
# Opción recomendada para diagramas SVG
npm install @tombatossals/react-chords

# O implementación custom con
npm install react-svg-chord-diagram  
```

---

## 13. Convenciones de código actuales

- ✅ **TypeScript estricto** en todo el codebase
- ✅ **Componentes funcionales** con hooks (sin clases)  
- ✅ **Redux Toolkit** con `createSlice` y `createSelector`
- ✅ **Tailwind CSS** — utility-first, dark mode con `dark:` prefix
- ✅ **Nombres consistentes**:
  - `camelCase` variables/funciones
  - `PascalCase` componentes/tipos
  - `UPPER_SNAKE_CASE` constantes exportadas
- ✅ **Estructura de archivos**:
  - `shared/` — TypeScript puro, sin imports de React
  - `web/src/pages/` — páginas completas
  - `web/src/components/` — componentes reutilizables  
  - `web/src/hooks/` — custom hooks

---

## 14. Estado de deployment actual

### 14.1 GitHub Pages — ✅ FUNCIONANDO (verificado 11 sept 2026)

**URL en vivo: `https://wachin.github.io/strings-of-heaven/`**

Historia: durante mucho tiempo este handoff afirmó que el deploy funcionaba, pero
**nunca se había publicado** (los 4 primeros runs del workflow fallaron). Ver
**sección 17.3** para las 3 causas y los arreglos. Estado actual verificado contra
la URL real:

| Comprobación | Resultado |
|---|---|
| `index.html` | HTTP 200, contiene `<div id="root">` |
| Entry JS (`/assets/index-*.js`) | HTTP 200 |
| Entry CSS (`/assets/index-*.css`) | HTTP 200 |
| Deep link (`/song/prueba`) | sirve la app (`404.html` idéntico a `index.html`) |
| Deployment en GitHub | estado `success` |

Configuración:
- Workflow: `.github/workflows/deploy.yml` (10 pasos: instala raíz + web,
  typecheck y tests de ambos, build, upload)
- Trigger: push a `main` branch, o manual con `workflow_dispatch`
- Base path: `VITE_BASE_PATH=/strings-of-heaven/` en el workflow (vite.config.ts
  también sabe auto-detectarlo desde `GITHUB_REPOSITORY`)
- Fallback SPA: `dist/404.html` + `dist/.nojekyll` generados por el plugin
  `spaFallback()` de `vite.config.ts`
- ⚙️ Ajuste del repo (ya hecho): `Settings → Pages → Source → GitHub Actions`

⚠️ Tras un deploy, el CDN de Pages puede tardar uno o dos minutos en servir todos
los assets: justo después de un deploy es normal ver 404 en `/assets/...`.

### 14.2 Para deployments custom

La configuración está **completamente preparada** para otros tipos de deployment:

```bash
# Deployment manual
cd web
npm run build
# Subir web/dist/ a:
# - Netlify (drag & drop)
# - Vercel (CLI o git integration)  
# - Apache/nginx (copiar archivos)
# - Servidor propio (Docker)

# Variables de entorno opcionales:
VITE_BASE_PATH=/custom-path/        # Para subdirectorios
VITE_API_BASE_URL=https://api.com   # Para modo servidor
```

---

## 15. Notas importantes del propietario

- ✅ **Licencia:** GPL 3 (especificada en LICENSE)
- ✅ **Propósito:** Plataforma para compartir canciones cristianas en español
- ✅ **Modelo de negocio:** GitHub Pages (gratis) + publicidad mínima
- ✅ **Catálogo propio:** Directorio `Catalogo/` con canciones a migrar
- ✅ **Fork-friendly:** Preparado para que otros desarrolladores añadan servidor
- ✅ **Caso de prueba:** "Perfect" de Simple Plan (D, A, Em, G, capo 2)  
- 📝 **Referencias visuales:** Se añadirán al README al final del desarrollo
---

## 16. Siguiente agente — Tareas inmediatas sugeridas

### 🔴 SIGUIENTE (bloquea todo lo demás): que la web lea el catálogo

`tools/song-editor` ya escribe `shared/data/catalog/<slug>.json`, pero **la web
todavía no los carga**. Sin esto, las canciones publicadas no se ven en el
navegador ni en el móvil.

1. Cargar los JSON con `import.meta.glob` (o un índice generado) desde
   `shared/data/catalog/`.
2. Mezclarlos con las canciones locales en `SongsPage` / `SongViewPage` /
   `useSongStorage`.
3. **Decisión ya tomada por el propietario:** las canciones del catálogo son
   **públicas y de solo lectura** — se muestran con una etiqueta "Catalog" y
   **sin** Edit/Delete. Las locales mantienen Edit/Delete. Las ediciones a una
   canción publicada irán por un flujo de **"Sugerir cambio" → revisión humana**.
4. Tests: catálogo + locales mezclados, y que un `id` del catálogo no ofrezca
   editar ni borrar.

### 🔵 DESPUÉS: flujo de moderación (envío → revisión humana → publicación)

Requisito del propietario, como en las webs de acordes: nada se publica sin que
una persona lo revise. Diseño acordado:

- Estados: `pending` → `approved` | `rejected` (con motivo visible).
- Dos tipos: **canción nueva** y **sugerencia de edición** sobre una existente.
- Tres caminos posibles (ver sección 18.5 en cuanto se decida):
  1. **Pull Requests de GitHub** (gratis, sin infra, diff visible) — bueno si los
     colaboradores se manejan con git.
  2. **Supabase** con RLS: el colaborador solo puede insertar `pending`; **la
     propia base de datos impide publicar** sin ser moderador.
  3. **Híbrido**: envío por Supabase + publicación al catálogo de git.
- **Pendiente de responder:** ¿los 3 colaboradores usan git o necesitan una web
  con cuenta?

### 🟢 Cuando lo anterior esté: features de la vista de canción

- **P3** `ChordsPanel` — panel lateral con Guitar/Ukulele/Piano. Reutilizar los
  SVG custom existentes (`ChordDiagram.tsx`) antes de instalar nada.
- **P4/P5** `TransposeControls` + `CapoSelector` — el motor ya expone
  `transposeSongBody`; "Sounding key" calculado.
- **P6** Autoscroll · **P7** Impresión/PDF · **P8** Búsqueda global.
- **Opción D (antigua P9)** — revisar las 271 canciones de `Catalogo/` con el
  editor de escritorio (importar `.txt` → revisar → guardar JSON).

**Recomendación:** **Opción B** (panel de acordes) o **Opción C** (transposición), que
completan la experiencia de la vista de canción recién creada.

---

## 17. Sesión del 11 sept 2026 — cambios y hallazgos

### 17.1 Completado (Opción A)
- `web/src/components/SongBody.tsx` — render con acordes clicables, preservando columnas
- `web/src/pages/SongViewPage.tsx` — vista `/song/:id` con metadatos, notas y acciones
- `web/src/App.tsx` — ruta `/song/:id`
- `web/src/pages/SongsPage.tsx` — el título de cada canción enlaza a su vista
- `web/src/pages/SubmitSongPage.tsx` — tras guardar navega a `/song/:id`
- Tests nuevos (14): `SongBody.test.tsx` (6), `SongViewPage.test.tsx` (4),
  `useSongStorage.test.tsx` (4)

### 17.2 Bugs corregidos

**Bug 1 — El handoff afirmaba "TypeScript: 0 errores", pero la web NO compilaba limpio.**
`web/src/hooks/useSongStorage.ts` importaba `SongEntry` desde `@shared/types`, pero
no existía `shared/types/index.ts` y el alias resuelve a `shared/types.ts`, que no lo
exportaba. Efectos: `SongEntry` era `any` (silenciando más errores) y 4 errores TS.
- **Fix:** `shared/types.ts` ahora hace `export * from './types/song'`.
- Al arreglarlo apareció que `version` faltaba en el payload → se añadió el tipo
  exportado `SongDraft` (`Omit<SongEntry, 'id'|'createdAt'|'updatedAt'|'version'>`).

**Bug 2 — El modo edición DUPLICABA canciones.**
`SubmitSongPage` con `?id=xxx` llamaba a `saveSong()`, que siempre hace `push` con un
id nuevo: editar creaba una segunda copia y la original quedaba intacta.
- **Fix:** nuevo `updateSong(id, song)` en `useSongStorage` (localStorage + API `PUT`).
  Conserva `id` y `createdAt`, actualiza `updatedAt` y hace `version + 1`
  (coherente con el modelo documentado en `SongEntry`).

### 17.3 Despliegue: por qué GitHub Pages nunca funcionó (corregido)

⚠️ **El handoff afirmaba "GitHub Pages ✅ funcionando" en
`https://wachin.github.io/strings-of-heaven/`. Era FALSO: no se había publicado
nunca.** Los 4 runs del workflow habían fallado. Tres causas encadenadas:

**Bug 3 — El workflow no instalaba las dependencias de la raíz.**
`deploy.yml` hacía `npm ci` **solo dentro de `web/`**, pero el paso
"Type-check shared engine" ejecuta `tsc --noEmit` en la raíz, que necesita
`typescript`, `@types/node` y `@types/jest` del `package.json` raíz. Sin
`node_modules` en la raíz ese paso fallaba **siempre**, y el build/upload/deploy
quedaban *skipped*. Nunca se subió nada.
- **Fix:** paso `Install root dependencies` (`npm ci` en la raíz) + caché con
  ambos lockfiles. Además el CI ahora ejecuta `npm run typecheck` y
  `npm run test` en la raíz **y** en `web/`, para que los errores de tipo de la
  web no vuelvan a llegar a `main` sin detectarse.

**Bug 4 — `BrowserRouter` sin `basename`: la app se salía del subdirectorio.**
`main.tsx` montaba `<BrowserRouter>` sin `basename`. Publicada en
`/strings-of-heaven/`, la ruta `/strings-of-heaven/` no coincidía con nada, así
que el catch-all `<Navigate to="/" />` saltaba a `/`, es decir **al sitio Hugo
del propietario**. El deploy podría haber "funcionado" y la app seguiría rota.
- **Fix:** `web/src/router.ts` → `routerBasename(import.meta.env.BASE_URL)`
  (quita la barra final; `""` en despliegue raíz) y se pasa a `BrowserRouter`.
- **Test de regresión:** `web/src/__tests__/spaRouting.test.tsx` monta la app en
  `/strings-of-heaven/song/:id` y verifica que resuelve la canción y que
  `pathname` no se mueve. Verificado por mutación: con `basename=""` el test
  falla con `expected '/' to be '/strings-of-heaven/song/song-9'`.

**Bug 5 — Sin fallback SPA: recargar una URL profunda daba 404.**
- **Fix:** plugin `spaFallback()` en `web/vite.config.ts` (hook `closeBundle`)
  que copia `dist/index.html` → `dist/404.html` y crea `dist/.nojekyll`.
  Es **agnóstico del base path**: la copia conserva las URLs absolutas de los
  assets, así que al abrir `/strings-of-heaven/song/abc` GitHub Pages sirve
  404.html, la app arranca en esa URL y el router (con basename) la resuelve.
  No usa el truco de `sessionStorage` ni redirecciones.

**Requisito del propietario — ✅ HECHO:** `Settings → Pages → Source` está en
**GitHub Actions**. El deploy pasó a verde tras activar Pages y el sitio quedó
publicado. (Nota: `GET /repos/.../pages` por API sin autenticar sigue devolviendo
404 aunque Pages esté activo; no es un indicador fiable.)

### 17.4 Licencia — corregida ✅

El footer de `web/src/App.tsx` decía *"open source, MIT licensed"*, lo que
contradecía a `LICENSE`, `package.json` (`GPL-3.0-only`) y la sección 15. El
propietario confirmó (11 sept 2026) que **la licencia correcta es GPL-3.0**, así
que el footer ahora dice *"open source, GPL-3.0 licensed"*.

`README.md` ya era correcto: su sección *License* declara GPL-3.0 para el proyecto
y solo menciona MIT para los datos de terceros (`chords-db`), que es correcto.

### 17.5 Dev server: `localhost:5173` no respondía

**Síntoma:** `npm run dev` arrancaba bien, pero el navegador no podía abrir
`http://localhost:5173/`.

**Causa:** Node resolvía `localhost` a IPv6, así que Vite escuchaba **solo** en
`[::1]:5173` (`LISTEN 0 511 [::1]:5173`). `curl http://localhost:5173/` funcionaba
(porque curl también prefería IPv6) pero `http://127.0.0.1:5173/` daba
conexión rechazada — y el navegador iba por IPv4.

**Fix:** `server.host: true` en `web/vite.config.ts` → escucha en `*:5173`, es
decir IPv4 e IPv6. Verificado: `127.0.0.1`, `localhost` y `[::1]` responden 200.

⚠️ Ojo: `host: true` también expone el dev server a la LAN (puerto 5173 en la IP
local). Es lo habitual en desarrollo, pero si se quiere solo loopback, usar
`host: '127.0.0.1'`.

**Lección para el próximo agente:** al verificar un servidor, comprobar la
dirección que usará el usuario, no solo `localhost`. Un `localhost` que resuelve
a IPv6 puede dar 200 mientras `127.0.0.1` falla.

### 17.6 Dev server: página en blanco por `process.env` (⚠️ bug importante)

**Síntoma:** con el puerto ya accesible, `http://127.0.0.1:5173/` cargaba pero
mostraba una **página totalmente en blanco**, en Chrome y en Firefox. El log de
Vite no mostraba nada, porque el fallo es en el navegador.

**Diagnóstico:** se reprodujo con Chromium headless (`--dump-dom` +
`--enable-logging=stderr`) y apareció el error real:

```
Uncaught ReferenceError: process is not defined
  source: .../shared/config.ts
```

`shared/config.ts` lee `process.env.VITE_API_BASE_URL` y `process.env.VITE_BASE_PATH`.
**`process` no existe en el navegador**, así que el módulo lanzaba al evaluarse,
el grafo de módulos se rompía y `#root` quedaba vacío — sin ningún error en el
servidor.

**Por qué solo afectaba a dev:** el build de producción **sí** sustituye esas
referencias (el bundle no contiene ni un `process.env.`), por eso el sitio en vivo
funcionaba. En dev Vite no las sustituía.

**Fix:** declararlas en `define` de `web/vite.config.ts`:

```ts
'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL ?? ''),
'process.env.VITE_BASE_PATH':     JSON.stringify(process.env.VITE_BASE_PATH ?? ''),
```

**Nota de arquitectura:** *no* cambiar `shared/config.ts` a `import.meta.env`,
porque ese archivo también se ejecuta en Node (Jest, `module: commonjs`) y
`import.meta` no es válido ahí. `define` es la vía que mantiene ambos mundos.
Cuidado: si alguien añade un `process.env.X` nuevo en código que llega al
navegador, hay que declararlo también en `define` o la página volverá a quedar
en blanco **sin error visible en el servidor**.

**Cómo diagnosticar esto en el futuro (receta que funcionó):**

```bash
google-chrome --headless=new --no-sandbox --user-data-dir=/tmp/cp \
  --virtual-time-budget=10000 --enable-logging=stderr --v=0 \
  --dump-dom http://127.0.0.1:5173/ >/tmp/dom.html 2>/tmp/err.txt
grep -iE "CONSOLE|Uncaught" /tmp/err.txt
```

Sirve para cualquier «página en blanco»: `--dump-dom` muestra si `#root` quedó
vacío y el stderr trae el error de consola.

---

## 18. El problema del almacenamiento, y el editor de escritorio (11 sept 2026)

### 18.1 Por qué las canciones no aparecían en el móvil

`useSongStorage` guarda **solo en `localStorage`** (`useApiBackend: false`) y no
existía ningún catálogo empaquetado. Como `localStorage` es *por dispositivo +
navegador + origen*, una canción añadida en el PC **no existe** en el móvil, y
se pierde al limpiar los datos del navegador.

Decisión del propietario: **no** importar de golpe las 271 canciones de
`Catalogo/`, sino revisarlas **una a una** antes de publicarlas.

### 18.2 `shared/song/authoring.ts` — fuente única de verdad

Nuevo módulo puro (sin React, sin DOM, sin Node) que ahora comparten la web y el
editor de escritorio:

| Función | Para qué |
|---|---|
| `validateSongDraft(draft)` | Las mismas reglas que tenía el formulario web (title/artist/body obligatorios, BPM 0-400, capo 0-12, tamaño máximo del body) |
| `songSlug` / `catalogFileName` | `a-quien-ire-luis-enrrique-espinosa.json` |
| `emptySongDraft()` | Draft en blanco |
| `parseCatalogText(text, fileName)` | Parser *best-effort* de `Catalogo/*.txt` + `warnings` |

`SongDraft` se movió a `shared/types/song.ts`. `SubmitSongPage.tsx` ya **no**
tiene reglas propias: llama a `validateSongDraft` (así el editor no puede
divergir de la web). Tests: `shared/__tests__/authoring.test.ts`.

### 18.3 `tools/song-editor/` — editor de escritorio en PyQt6

**PyQt6 no es un problema para llamar al motor TS**: el lenguaje de la UI es
irrelevante, se hace con `subprocess` + JSON por stdin/stdout.

```
PyQt6 (main.py) ──JSON──▶ Node (engine_cli.ts) ──▶ shared/engine/*.ts
                ◀────────                     ◀── shared/song/authoring.ts
```

- `engine_cli.ts` — CLI con protocolo JSON por líneas (`ping`, `labels`,
  `validate`, `analyze`, `slug`, `importCatalog`, `transpose`). Proceso Node
  **persistente** para que la preview en vivo no tenga latencia de arranque.
- `bridge.py` — compila el CLI con **esbuild** (ya viene con Vite, en
  `web/node_modules/.bin`; no hay dependencia nueva), lo lanza y gestiona las
  peticiones por id con un hilo lector.
- `main.py` — el formulario idéntico a la web + **preview en vivo** (acordes en
  ámbar, cabeceras en índigo, columnas preservadas) + **badges de acordes** +
  **Import from `Catalogo/*.txt`** + lista del catálogo publicado + `Ctrl+S`.
- Guarda **un JSON por canción** en `shared/data/catalog/<slug>.json` (un archivo
  por canción ⇒ diffs limpios y sin conflictos en git).
- `.build/` está en `.gitignore`; se regenera en cada arranque.
- `tools/**/*` se añadió al `include` del `tsconfig.json` raíz para que el CI
  typechequee el CLI.

Uso y flujo completo: `tools/song-editor/README.md`.

⚠️ **Pendiente inmediato:** la web **todavía no lee** `shared/data/catalog/`.
Los JSON se guardan correctamente, pero hasta que `SongsPage`/`SongViewPage` los
carguen (con `import.meta.glob`) y los mezclen con las canciones locales, esas
canciones no se verán en el navegador. Hay que decidir además cómo se muestran:
entradas de catálogo en **solo lectura** (sin Edit/Delete) frente a las locales.

### 18.4 Plan acordado para compartir canciones (Supabase)

Segundo camino, para que 3 personas de la iglesia colaboren sin tocar git:
**Supabase free** (verificado ago 2026): 2 proyectos, 500 MB, Auth hasta 50.000
usuarios, REST + GraphQL, 1 GB de storage. Dos avisos: **el proyecto se pausa
tras 1 semana sin actividad** (restauración manual) y **no hay backups** en free
→ hacer `pg_dump` periódicos. Seguridad: usar la clave `anon` + **RLS**
(lectura pública, escritura solo autenticados); **nunca** la `service_role` en el
frontend.

Alternativas evaluadas: Neon (no se pausa, despierta solo, pero sin Realtime ni
editor de datos), Firebase, Appwrite (recortó el free), Render/Railway/Cloud Run.

---

## 19. Pestaña Explore: búsqueda y filtro por tipo (11 sept 2026)

Reportado por el propietario. Los tres problemas se confirmaron leyendo el código
**antes** de tocar nada:

**Bug 6 — La búsqueda solo aceptaba el nombre largo o el sufijo crudo.**
`ExplorePage` comparaba `displayName` ("C Minor") y `suffix` ("minor"), así que
escribir `Cm`, `Cdim7` o `C7/G` — como se escriben en las webs de acordes — no
encontraba nada.

**Bug 7 — Los botones de tipo no hacían absolutamente nada.**
`ExplorePage` filtraba **solo** por `query`; el `selectedSuffix` del store se
actualizaba pero nunca se usaba para filtrar.

**Bug 8 — "Major" salía marcado al entrar.**
El estado del store arranca con `selectedSuffix: 'major'`, y Explore pintaba ese
valor como seleccionado aunque no filtrara nada.

### Arreglos

- **`shared/engine/chord_engine.ts`**: nuevas `suffixSymbol(suffix)` y
  `chordShorthand(note, suffix)` → `C`, `Cm`, `Cdim7`, `C7/G`, `Csus2sus4`. Usa
  `CHORD_TYPE_INFO` para los que tienen símbolo y cae al propio sufijo para los
  que no (`sus`, `alt`, `69`, `7/G`…), que ya se escriben así.
- **`shared/engine/chord_search.ts`** (nuevo): `normalizeChordQuery`,
  `chordSearchAliases`, `chordSearchScore` y `filterChordsByQuery`. Cada acorde
  tiene alias (nombre largo, nombre de web, sufijo, símbolo, nombre del tipo) y la
  coincidencia se puntúa: **exacta > prefijo > subcadena**. Si hay coincidencia
  exacta, **solo** se devuelve esa (así `Cm` no arrastra Cmaj7 ni Cm6). Escribir
  solo la raíz (`C`) **no** filtra, porque la página ya está acotada a esa raíz.
- **`ExplorePage.tsx`**: el filtro de tipo pasa a ser **estado local** (`null` por
  defecto ⇒ ningún chip marcado). Clic en un chip filtra; clic otra vez lo quita.
  Se combina con la búsqueda. Si el sufijo no existe para la nueva raíz, el filtro
  se descarta solo. Añadidos: contador con el filtro activo, botón **Clear
  filters**, estado vacío con ejemplos y placeholder `(Cm, Cdim7, C7/G, Csus4)`.
  Ya **no** usa el `selectedSuffix` global, así que Explore no altera el acorde
  que ChordPage tenga seleccionado.
- **Bug extra encontrado al escribir los tests**: `chordDisplayName('C','7/G')`
  devolvía **"C 7/G"** (el `note + ' ' + suffix` naive). Ahora los slash chords se
  muestran como **"C7/G"**, **"Cm/A"**, **"C/G"**. Corregido también en
  `scripts/process_chords.js`, que es quien escribía `displayName: 'C 7/G'` en los
  JSON (el generador no puede importar el motor, así que lleva una copia pequeña y
  comentada; hay que mantenerlas en sync).

### Verificación (navegador real, no solo tests)

Se condujo **Chrome real por DevTools Protocol** (Python + `websockets`) sobre
`http://127.0.0.1:5173/explore`:

| Acción | Resultado observado |
|---|---|
| Al entrar | 70 acordes, **ningún** chip marcado |
| Buscar `Cm` | 1 → `C Minor` |
| Buscar `C7/G` | 1 → `C7/G` |
| Buscar `Cdim7` | 1 → `C Diminished 7th` |
| Buscar `C Diminished 7th` | 1 → el mismo |
| Clic `Minor` | marcado, 1 → `C Minor` |
| Clic `Minor` otra vez | desmarcado, vuelven los 70 |
| Clic `alt` | marcado, 1 → `C alt` |
| Buscar `zzz` | 0 |

Tests: `shared/__tests__/chord_search.test.ts` (28 casos, incluye **todas** las
grafías pedidas), `chord_engine.test.ts` (slash chords) y
`web/src/__tests__/ExplorePage.test.tsx` (9). Totales: **117 jest + 37 vitest**.

**Receta reutilizable** para probar interacción real (no solo `--dump-dom`):
lanzar `google-chrome --headless=new --remote-debugging-port=9224`, conectar por
websocket al target `type == 'page'`, y para escribir en un input de React usar el
setter nativo:
```js
const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
s.call(input, 'Cm'); input.dispatchEvent(new Event('input', {bubbles:true}));
```

---

**Estado: LISTO PARA CONTINUAR** ✅