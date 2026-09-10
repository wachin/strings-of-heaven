# Agent Handoff — Strings of Heaven

> Este documento describe el estado exacto del proyecto en el momento del traspaso.
> El siguiente agente debe leerlo completo antes de escribir cualquier código.

**Fecha de actualización:** Septiembre 10, 2026  
**Estado:** Web app funcional con sistema de subida de canciones + GitHub Pages configurado

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
| **localStorage/API storage** | ✅ NUEVO - Completo | `web/src/hooks/useSongStorage.ts` |
| **GitHub Pages config** | ✅ NUEVO - Completo | `.github/workflows/deploy.yml` + config |
| Tests (jest) | ✅ Pasando | `shared/__tests__/` + `web/src/__tests__/` |
| TypeScript | ✅ 0 errores | Todo tipado |

### 2.2 Lo que NO existe todavía (próximas fases)

- **Visualización individual de canciones** — `SongViewPage` para mostrar una canción guardada
- **Panel de acordes lateral** — widget sticky con pestañas Guitar/Ukulele/Piano 
- **Transposición en vivo en UI** — controles +/- en la página de canción
- **Autoscroll** — funcionalidad de scroll automático
- **Impresión/PDF** — exportar canciones con diagramas
- `app/` — directorio de la app React Native (no creado)
- `api/` — backend Node.js/Express (opcional)

### 2.3 Archivos limpios - NO hay cambios sin commit

El proyecto está completamente limpio. Todos los cambios recientes están committeados:
- ✅ GitHub Pages configuration
- ✅ Song submission system 
- ✅ Storage hooks and types
- ✅ Web app enhancements
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
│   │   │   ├── SongsPage.tsx         # ✅ Lista de canciones guardadas
│   │   │   └── SubmitSongPage.tsx    # ✅ NUEVO - Formulario subida canciones
│   │   ├── hooks/
│   │   │   ├── usePageTitle.ts       # ✅ Hook para títulos
│   │   │   └── useSongStorage.ts     # ✅ NUEVO - Hook localStorage/API
│   │   ├── components/               # ✅ Componentes UI compartidos
│   │   ├── __tests__/                # ✅ Tests web
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
  saveSong: (song) => Promise<string>;     // Retorna ID de la canción guardada
  loadSongs: () => Promise<void>;          // Carga todas las canciones
  searchSongs: (query) => Promise<SongEntry[]>; // Búsqueda por título/artista/contenido
  getSong: (id) => Promise<SongEntry | null>;   // Obtiene canción por ID
  deleteSong: (id) => Promise<void>;       // Elimina canción
}

// Funciona en dos modos:
// 1. STATIC MODE (por defecto) - localStorage
// 2. API MODE (configurable) - backend server
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
- **Acciones** — editar, eliminar (con confirmación)
- **Botón prominente** — "+ Add song" que lleva a `/submit`
- **Estado vacío** — mensaje amigable con enlace a subir primera canción

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

### ALTA PRIORIDAD — Visualización de canciones

- [ ] **P1** `SongViewPage` (`/song/:id`) — página para mostrar una canción individual
  - Usar `getSong(id)` del hook `useSongStorage`
  - Layout: título, artista, metadata arriba + body renderizado abajo
  - Botón "Edit" que lleva a `/submit?id=xxx`

- [ ] **P2** `SongBody` component — renderiza body con acordes clicables
  - Usar `parseSongBody()` para classificar líneas
  - Acordes en color amber, headers en indigo, letras en texto normal
  - Los acordes son clicables → abren `/chord/:note/:suffix`

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
/submit (SubmitSongPage) ✅ Formulario subida/edición canciones
```

**Falta implementar:**
```
/song/:id              ← Vista individual de canción (ALTA PRIORIDAD)
/search?q=...          ← Búsqueda global (BAJA PRIORIDAD)
```

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
npx jest                       # Tests shared/ (~11s, todos pasando)
cd web && npm run test         # Tests web/ (vitest)

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

### 14.1 GitHub Pages (funcionando)

✅ **Deploy automático configurado**
- URL: `https://wachin.github.io/strings-of-heaven/`
- Workflow: `.github/workflows/deploy.yml` 
- Trigger: push a `main` branch
- Base path: auto-detectado desde `GITHUB_REPOSITORY`

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

### Opción A: Visualización de canciones (recomendado)
1. Crear `SongViewPage` (`/song/:id`)
2. Componente `SongBody` para renderizar con acordes clicables  
3. Agregar navegación desde `SongsPage` → click en canción → abrir `/song/:id`

### Opción B: Panel de acordes lateral  
1. Instalar `@tombatossals/react-chords`
2. Crear componente `ChordsPanel` 
3. Integrar en layout con pestañas Guitar/Ukulele/Piano

### Opción C: Migración del catálogo
1. Explorar estructura del directorio `Catalogo/`
2. Crear script para convertir archivos existentes a `SongEntry[]`
3. Función "Import from catalog" en la UI

**Recomendación:** Comenzar con **Opción A** (visualización) ya que es la funcionalidad más demandada por los usuarios.

---

**Estado: LISTO PARA CONTINUAR** ✅