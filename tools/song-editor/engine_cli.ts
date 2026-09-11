/**
 * engine_cli — bridges the desktop editor (Python/PyQt6) to the real engine.
 *
 * This file imports the *actual* shared TypeScript modules the web app uses, so
 * validation, chord detection and catalog parsing have exactly one
 * implementation. Python never re-implements any of it: it sends JSON requests
 * and renders what comes back.
 *
 * Protocol: newline-delimited JSON on stdin/stdout.
 *
 *   → {"id":1,"op":"analyze","body":"G  Em\nLetra","instrument":"guitar"}
 *   ← {"id":1,"ok":true,"result":{"lines":[…],"chords":[…],"uniqueChords":[…]}}
 *
 * It is designed to run as a long-lived child process (the Python bridge keeps
 * one alive), so replies are fast enough for a live preview.
 *
 * Build (the Python bridge does this automatically):
 *   esbuild tools/song-editor/engine_cli.ts --bundle --platform=node \
 *     --format=esm --outfile=tools/song-editor/.build/engine_cli.mjs
 */

import { createInterface } from 'node:readline';
import {
  getUniqueChordsFromBody,
  loadChordDatabases,
  parseSongBody,
  resolveChordsFromBody,
  transposeSongBody,
} from '../../shared/engine/chord_engine';
import {
  catalogFileName,
  parseCatalogText,
  songSlug,
  validateSongDraft,
} from '../../shared/song/authoring';
import type { SongDraft } from '../../shared/types/song';
import {
  DIFFICULTY_LABELS,
  SONG_TYPE_LABELS,
  TIME_SIGNATURE_LABELS,
} from '../../shared/types/song';
import type { Instrument } from '../../shared/types';

interface Request {
  id?: number;
  op: string;
  body?: string;
  instrument?: Instrument;
  semitones?: number;
  sharps?: boolean;
  draft?: SongDraft;
  title?: string;
  artist?: string;
  text?: string;
  fileName?: string;
}

function write(payload: unknown): void {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

/** Validate a draft with the shared rules. */
function handleValidate(request: Request) {
  const draft = (request.draft ?? {}) as SongDraft;
  const errors = validateSongDraft(draft);
  return { errors, valid: Object.keys(errors).length === 0 };
}

/** Parse a body for the live preview and list the chords it contains. */
async function handleAnalyze(request: Request) {
  const body = request.body ?? '';
  const instrument: Instrument = request.instrument ?? 'guitar';

  // The chord database is needed to map shorthand suffixes ("Am" → minor).
  let chords: ReturnType<typeof resolveChordsFromBody> = [];
  try {
    await loadChordDatabases(instrument);
    chords = resolveChordsFromBody(body, instrument);
  } catch {
    chords = [];
  }

  return {
    lines: parseSongBody(body),
    chords,
    uniqueChords: getUniqueChordsFromBody(body),
    instrument,
  };
}

function handleSlug(request: Request) {
  const title = request.title ?? '';
  const artist = request.artist ?? '';
  return {
    slug: songSlug({ title, artist }),
    fileName: catalogFileName({ title, artist }),
  };
}

function handleImportCatalog(request: Request) {
  return parseCatalogText(request.text ?? '', request.fileName ?? '');
}

function handleTranspose(request: Request) {
  return {
    body: transposeSongBody(request.body ?? '', Number(request.semitones) || 0, Boolean(request.sharps)),
  };
}

const HANDLERS: Record<string, (request: Request) => unknown | Promise<unknown>> = {
  ping: () => ({ pong: true, node: process.version }),
  /**
   * Option lists for the combo boxes. Sent from here so the desktop editor
   * shows exactly the same choices and wording as the web form.
   */
  labels: () => ({
    songType: SONG_TYPE_LABELS,
    difficulty: DIFFICULTY_LABELS,
    timeSignature: TIME_SIGNATURE_LABELS,
  }),
  validate: handleValidate,
  analyze: handleAnalyze,
  slug: handleSlug,
  importCatalog: handleImportCatalog,
  transpose: handleTranspose,
};

const input = createInterface({ input: process.stdin });

input.on('line', (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let request: Request;
  try {
    request = JSON.parse(trimmed) as Request;
  } catch {
    write({ ok: false, error: 'Request was not valid JSON.' });
    return;
  }

  const handler = HANDLERS[request.op];
  if (!handler) {
    write({ id: request.id, ok: false, error: `Unknown op "${request.op}".` });
    return;
  }

  Promise.resolve()
    .then(() => handler(request))
    .then((result) => write({ id: request.id, ok: true, result }))
    .catch((error: unknown) => {
      write({
        id: request.id,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    });
});

input.on('close', () => process.exit(0));

// Tell the Python side the engine is loaded and ready to take requests.
write({ event: 'ready', node: process.version, ops: Object.keys(HANDLERS) });
