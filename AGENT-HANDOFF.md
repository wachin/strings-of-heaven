# Agent Handoff — Strings of Heaven

> Este documento describe el estado exacto del proyecto en el momento del traspaso.
> El siguiente agente debe leerlo completo antes de escribir cualquier código.

**Fecha de actualización:** Septiembre 11, 2026  
**Estado:** Web app funcional + visualización individual de canciones (P1/P2 completadas)

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
| **GitHub Pages config** | ✅ NUEVO - Completo | `.github/workflows/deploy.yml` + config |
| Tests (jest) | ✅ 75 pasando | `shared/__tests__/` |
| Tests (vitest) | ✅ 28 pasando | `web/src/__tests__/` |
| TypeScript (shared) | ✅ 0 errores | `npx tsc --noEmit` |
| TypeScript (web) | ✅ 0 errores | `cd web && npx tsc --noEmit` |

### 2.2 Lo que NO existe todavía (próximas fases)

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
│   │   └── song.ts             # ✅ NUEVO - Tipos completos para canciones
│   ├── config.ts               # ✅ NUEVO - Feature flags y configuración
│   └── __tests__/              # Tests completos
├── web/                        ✅ COMPLETO - Web app funcionando
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
│   │   ├── __tests__/                # ✅ Tests web (22 pasando)
│   │   ├── App.tsx                   # ✅ Router + navegación
│   │   └── main.tsx                  # ✅ Entry point
│   ├── dist/                         # ✅ Build output (GitHub Pages)
│   ├── vite.config.ts                # ✅ NUEVO - Config con base path automático
│   ├── package.json                  # ✅ Dependencias completas
│   └── tailwind.config.js            # ✅ Tailwind CSS config
├── scripts/
│   └── process_chords.js       # regenera shared/data/*.json desde chords-db
├── third-party/                # submódulos de referencia (solo lectura)
├── 8vo/                        # material de investigación/referencia UI
├── README.md                   # ✅ ACTUALIZADO - documentación completa + deployment
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
npm run dev                    # http://localhost:5173 (desarrollo)
npm run build                  # Build para producción → web/dist/
npm run preview                # Preview del build

# ══════════════════════════════════════════════════════════════════
# TESTS Y VALIDACIÓN  
# ══════════════════════════════════════════════════════════════════
cd ..                          # Volver a la raíz
npx tsc --noEmit              # Type-check shared/ (debe ser 0 errores)
npx jest                       # Tests shared/ (75 pasando, ~11s)
cd web && npm run test         # Tests web/ (vitest, 22 pasando)
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

### ✅ Opción A: Visualización de canciones — COMPLETADA (11 sept 2026)
1. ~~Crear `SongViewPage` (`/song/:id`)~~ ✅
2. ~~Componente `SongBody` para renderizar con acordes clicables~~ ✅
3. ~~Agregar navegación desde `SongsPage` → click en canción → abrir `/song/:id`~~ ✅

### Opción B: Panel de acordes lateral (SIGUIENTE RECOMENDADA — P3)
1. Decidir si reutilizar los SVG custom existentes (`ChordDiagram.tsx` ya funciona)
   en lugar de instalar `@tombatossals/react-chords`
2. Crear componente `ChordsPanel` (pestañas Guitar/Ukulele/Piano)
3. Integrar en `SongViewPage` como columna lateral sticky

### Opción C: Transposición + capo en la vista de canción (P4/P5)
1. `TransposeControls` con estado local de semitonos → `transposeSongBody()`
2. `CapoSelector` 0-12 + "Sounding key" calculado
   - El motor ya expone `transposeSongBody`, `transposeChordName` y `transposeChordLine`

### Opción D: Migración del catálogo (P9)
1. Explorar estructura del directorio `Catalogo/`
2. Crear script para convertir archivos existentes a `SongEntry[]`
3. Función "Import from catalog" en la UI

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

---

**Estado: LISTO PARA CONTINUAR** ✅