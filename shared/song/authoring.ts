/**
 * Song authoring — the single source of truth shared by the web form and the
 * desktop catalog editor (tools/song-editor).
 *
 * Nothing here touches React, the DOM or Node APIs: it is pure TypeScript, so
 * the web app, Jest and the PyQt6 editor (through a Node bridge) all run the
 * exact same validation, slug rules and catalog parsing.
 */

import type { SongDraft } from '../types/song';
import { emptySongEntry } from '../types/song';
import { isChordLine } from '../engine/music_theory';

// ── Validation ────────────────────────────────────────────────────────────────

/** Field-keyed validation messages, ready to render next to each input. */
export type SongDraftErrors = Partial<Record<keyof SongDraft, string>>;

export interface ValidationLimits {
  maxBpm: number;
  maxCapo: number;
  maxBodyLength: number;
}

export const DEFAULT_LIMITS: ValidationLimits = {
  maxBpm: 400,
  maxCapo: 12,
  maxBodyLength: 50000,
};

/**
 * Validate a draft. Returns an empty object when the draft is valid.
 *
 * These are the same rules the web form has always applied; they now live here
 * so the desktop editor cannot drift away from the browser.
 */
export function validateSongDraft(
  draft: SongDraft,
  limits: ValidationLimits = DEFAULT_LIMITS,
): SongDraftErrors {
  const errors: SongDraftErrors = {};

  if (!draft.title.trim()) errors.title = 'Title is required.';
  if (!draft.artist.trim()) errors.artist = 'Artist is required.';
  if (!draft.body.trim()) errors.body = 'Song body cannot be empty.';
  if (draft.bpm < 0 || draft.bpm > limits.maxBpm) {
    errors.bpm = `BPM must be between 0 and ${limits.maxBpm}.`;
  }
  if (draft.capo < 0 || draft.capo > limits.maxCapo) {
    errors.capo = `Capo must be between 0 and ${limits.maxCapo}.`;
  }
  if (draft.body.length > limits.maxBodyLength) {
    errors.body = `Song body is too large (max ${limits.maxBodyLength} characters).`;
  }

  return errors;
}

export function isValidDraft(draft: SongDraft, limits: ValidationLimits = DEFAULT_LIMITS): boolean {
  return Object.keys(validateSongDraft(draft, limits)).length === 0;
}

// ── Draft factory ─────────────────────────────────────────────────────────────

/** A blank draft with sensible defaults, ready to bind to a form. */
export function emptySongDraft(): SongDraft {
  const entry = emptySongEntry();
  return {
    title: entry.title,
    artist: entry.artist,
    type: entry.type,
    capo: entry.capo,
    tuning: entry.tuning,
    key: entry.key,
    bpm: entry.bpm,
    timeSignature: entry.timeSignature,
    difficulty: entry.difficulty,
    description: entry.description,
    body: entry.body,
  };
}

// ── Slugs and file names ──────────────────────────────────────────────────────

/**
 * Lowercase, accent-free, dash-separated slug.
 * "A quién iré" → "a-quien-ire"
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Stable slug for a song: title plus artist, so different authors differ. */
export function songSlug(draft: Pick<SongDraft, 'title' | 'artist'>): string {
  const parts = [draft.title, draft.artist].map((p) => p.trim()).filter(Boolean);
  return slugify(parts.join(' ')) || 'untitled';
}

/** File name for one song inside shared/data/catalog/. */
export function catalogFileName(draft: Pick<SongDraft, 'title' | 'artist'>): string {
  return `${songSlug(draft)}.json`;
}

// ── Import from the legacy Catalogo/*.txt files ───────────────────────────────

export interface CatalogImport {
  /** Parsed draft; the caller reviews and edits it before saving. */
  draft: SongDraft;
  /** Human-readable notes about anything the parser guessed or skipped. */
  warnings: string[];
}

const PARENTHETICAL = /\(([^)]*)\)/g;
/** Bare keys like "D", "Bb", "C#m", "F#". */
const KEY_ONLY = /^[A-G][#b]?(?:m|maj|min)?$/;
const CAPO_ONLY = /^capo\s*(\d{1,2})$/i;
const SECTION_HEADER = /^\s*\[.+\]\s*$/;
/** Trailing revision markers such as "v2" or "v.2". */
const VERSION_SUFFIX = /\s+v\.?\d+$/i;

/**
 * Pull "(D)" / "(Bb)" keys and "(Capo5)" out of a file name fragment.
 * Anything else in parentheses is kept as part of the text (e.g. "(v2)").
 */
function splitParentheticals(raw: string): { text: string; key: string; capo?: number } {
  let key = '';
  let capo: number | undefined;

  const text = raw.replace(PARENTHETICAL, (_match, inner: string) => {
    const value = String(inner).trim();

    const capoMatch = CAPO_ONLY.exec(value);
    if (capoMatch) {
      capo = Number(capoMatch[1]);
      return ' ';
    }
    if (KEY_ONLY.test(value)) {
      key = value;
      return ' ';
    }
    return ` ${value} `;
  });

  return { text: text.replace(/\s+/g, ' ').trim(), key, capo };
}

/**
 * Best-effort parser for the legacy `Catalogo/*.txt` files.
 *
 * The reliable signals are, in order:
 *   1. the file name, for the key `(D)` and capo `(Capo5)`;
 *   2. the first non-empty lines of the content, for title and artist
 *      (structural lines — `[Section]` headers and chord lines — are skipped).
 *
 * File names such as `Title - Artist (Key).txt` are used as a fallback when the
 * content has no usable header lines. Everything guessed or skipped is reported
 * in `warnings`: the desktop editor exists precisely so a human reviews it.
 */
export function parseCatalogText(text: string, fileName = ''): CatalogImport {
  const warnings: string[] = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const trimmed = lines.map((line) => line.trimEnd());

  // ── 1. Metadata from the file name ────────────────────────────────────────
  const baseName = fileName.replace(/\.[^./\\]+$/, '');
  const dashParts = baseName.split(/\s+-\s+/);
  const nameHasArtist = dashParts.length >= 2;
  const nameTitlePart = splitParentheticals(nameHasArtist ? dashParts[0] : baseName);
  const nameArtistPart = nameHasArtist
    ? splitParentheticals(dashParts.slice(1).join(' - '))
    : { text: '', key: '', capo: undefined as number | undefined };

  // ── 2. Title and artist from the content ──────────────────────────────────
  const candidates = trimmed
    .map((line, index) => ({ text: line.trim(), index }))
    .filter(
      (entry) =>
        entry.text !== '' && !SECTION_HEADER.test(entry.text) && !isChordLine(entry.text),
    );

  const contentTitle = candidates[0];
  const contentArtist = candidates[1];

  const draft = emptySongDraft();

  if (contentTitle) {
    draft.title = contentTitle.text;
  } else {
    draft.title = nameTitlePart.text;
  }

  if (contentArtist) {
    draft.artist = contentArtist.text;
    if (!nameHasArtist) {
      warnings.push('Artist taken from the file content (the file name has no artist).');
    }
  } else {
    draft.artist = nameArtistPart.text.replace(VERSION_SUFFIX, '').trim();
    if (nameArtistPart.text !== draft.artist) {
      warnings.push(`Removed a revision marker from the artist name ("${nameArtistPart.text}").`);
    }
  }

  draft.key = nameTitlePart.key || nameArtistPart.key || '';
  const capo = nameTitlePart.capo ?? nameArtistPart.capo;
  if (capo !== undefined) draft.capo = capo;

  // ── 3. Body ───────────────────────────────────────────────────────────────
  const headerIndex = trimmed.findIndex((line) => SECTION_HEADER.test(line));
  let bodyStart: number;
  if (headerIndex >= 0) {
    bodyStart = headerIndex;
  } else {
    bodyStart = (contentArtist?.index ?? contentTitle?.index ?? -1) + 1;
    warnings.push('No [Section] header found — the whole remainder was used as the body.');
  }

  draft.body = trimmed
    .slice(bodyStart)
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '');

  if (!draft.title) warnings.push('Could not determine a title.');
  if (!draft.body.trim()) warnings.push('Could not determine a body.');
  if (!draft.key) warnings.push('No key found — set it by hand if you know it.');

  return { draft, warnings };
}
