/**
 * SubmitSongPage — form to add or edit a song in the local catalogue.
 *
 * Features:
 *  - All fields from SongEntry: title, artist, type, capo, tuning, key,
 *    BPM, time signature, difficulty, description, and body.
 *  - Live preview of the body: chord lines are highlighted in amber,
 *    section headers ([Verse], [Chorus]…) in indigo, lyrics in default text.
 *  - Unique chord list extracted from the body shown as badges.
 *  - Save to localStorage (swappable for a REST API — see useSongStorage.ts).
 *  - Edit existing song when ?id=<songId> is in the URL.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DIFFICULTY_LABELS,
  SONG_TYPE_LABELS,
  TIME_SIGNATURE_LABELS,
  emptySongEntry,
  type Difficulty,
  type SongEntry,
  type SongType,
  type TimeSignature,
} from '@shared/types/song';
import { getUniqueChordsFromBody, parseSongBody } from '@shared/engine/chord_engine';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSongStorage } from '../hooks/useSongStorage';

// ── Small reusable field wrapper ─────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Shared input / select class strings ──────────────────────────────────────

const INPUT =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
  'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

const SELECT = INPUT;

// ── Live body preview ────────────────────────────────────────────────────────

function BodyPreview({ body }: { body: string }) {
  if (!body.trim()) {
    return (
      <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
        The preview will appear here as you type the song body.
      </p>
    );
  }

  const lines = parseSongBody(body);

  return (
    <div className="font-mono text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.type === 'blank') {
          return <div key={i} className="h-3" />;
        }
        if (line.type === 'header') {
          return (
            <div key={i} className="mt-3 font-semibold text-indigo-600 dark:text-indigo-400">
              {line.raw}
            </div>
          );
        }
        if (line.type === 'chord') {
          return (
            <div key={i} className="whitespace-pre text-amber-600 dark:text-amber-400">
              {line.raw}
            </div>
          );
        }
        // lyric
        return (
          <div key={i} className="whitespace-pre text-slate-800 dark:text-slate-200">
            {line.raw}
          </div>
        );
      })}
    </div>
  );
}

// ── Chord badges extracted from the body ─────────────────────────────────────

function ChordBadges({ body }: { body: string }) {
  const chords = getUniqueChordsFromBody(body);
  if (chords.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Chords found in this song ({chords.length}):
      </p>
      <div className="flex flex-wrap gap-1.5">
        {chords.map((chord) => (
          <span
            key={chord}
            className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          >
            {chord}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export function SubmitSongPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEditing = Boolean(editId);
  usePageTitle(isEditing ? 'Edit song — Strings Of Heaven' : 'Submit a song — Strings Of Heaven');

  const navigate = useNavigate();
  const { saveSong, getSongById } = useSongStorage();

  const [form, setForm] = useState<SongEntry>(emptySongEntry);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SongEntry, string>>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Load existing entry when editing
  useEffect(() => {
    if (editId) {
      const entry = getSongById(editId);
      if (entry) setForm(entry);
    }
  }, [editId, getSongById]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  function set<K extends keyof SongEntry>(key: K, value: SongEntry[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: Partial<Record<keyof SongEntry, string>> = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.artist.trim()) next.artist = 'Artist is required.';
    if (!form.body.trim()) next.body = 'Song body cannot be empty.';
    if (form.bpm < 0 || form.bpm > 400) next.bpm = 'BPM must be between 0 and 400.';
    if (form.capo < 0 || form.capo > 12) next.capo = 'Capo must be between 0 and 12.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const saved = saveSong(form);
    setForm(saved);
    setSaved(true);
    // Navigate to the saved song's view after a short delay
    setTimeout(() => navigate(`/songs/${saved.id}`), 900);
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit song' : 'Submit a song'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEditing
              ? 'Update the song details below and save.'
              : 'Fill in the details and paste the chords + lyrics in the body field.'}
          </p>
        </div>
        <Link
          to="/songs"
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          ← My songs
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* ── Section 1: Identity ─────────────────────────────────────────── */}
        <fieldset className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Song info
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title *" htmlFor="title">
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Como el ciervo"
                className={INPUT}
                aria-required="true"
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-xs text-red-600 dark:text-red-400">
                  {errors.title}
                </p>
              )}
            </Field>

            <Field label="Artist *" htmlFor="artist">
              <input
                id="artist"
                type="text"
                value={form.artist}
                onChange={(e) => set('artist', e.target.value)}
                placeholder="e.g. Marcos Witt"
                className={INPUT}
                aria-required="true"
                aria-describedby={errors.artist ? 'artist-error' : undefined}
              />
              {errors.artist && (
                <p id="artist-error" className="text-xs text-red-600 dark:text-red-400">
                  {errors.artist}
                </p>
              )}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Content type" htmlFor="type">
              <select
                id="type"
                value={form.type}
                onChange={(e) => set('type', e.target.value as SongType)}
                className={SELECT}
              >
                {(Object.keys(SONG_TYPE_LABELS) as SongType[]).map((t) => (
                  <option key={t} value={t}>
                    {SONG_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Difficulty" htmlFor="difficulty">
              <select
                id="difficulty"
                value={form.difficulty}
                onChange={(e) => set('difficulty', e.target.value as Difficulty)}
                className={SELECT}
              >
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        {/* ── Section 2: Musical settings ─────────────────────────────────── */}
        <fieldset className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Musical settings
          </legend>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Capo"
              htmlFor="capo"
              hint="0 = no capo. Chords in the body are written as if the capo is the nut."
            >
              <input
                id="capo"
                type="number"
                min={0}
                max={12}
                value={form.capo}
                onChange={(e) => set('capo', Number(e.target.value))}
                className={INPUT}
                aria-describedby={errors.capo ? 'capo-error' : undefined}
              />
              {errors.capo && (
                <p id="capo-error" className="text-xs text-red-600 dark:text-red-400">
                  {errors.capo}
                </p>
              )}
            </Field>

            <Field
              label="Key (sounding)"
              htmlFor="key"
              hint="Key as heard, after applying the capo. Optional."
            >
              <input
                id="key"
                type="text"
                value={form.key}
                onChange={(e) => set('key', e.target.value)}
                placeholder="e.g. G, Bb, C#m"
                className={INPUT}
              />
            </Field>

            <Field label="Tuning" htmlFor="tuning" hint="Standard, Drop D, Open G…">
              <input
                id="tuning"
                type="text"
                value={form.tuning}
                onChange={(e) => set('tuning', e.target.value)}
                placeholder="Standard"
                className={INPUT}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="BPM"
              htmlFor="bpm"
              hint="Tempo in beats per minute. Leave 0 if unknown."
            >
              <input
                id="bpm"
                type="number"
                min={0}
                max={400}
                value={form.bpm === 0 ? '' : form.bpm}
                onChange={(e) =>
                  set('bpm', e.target.value === '' ? 0 : Number(e.target.value))
                }
                placeholder="e.g. 72"
                className={INPUT}
                aria-describedby={errors.bpm ? 'bpm-error' : undefined}
              />
              {errors.bpm && (
                <p id="bpm-error" className="text-xs text-red-600 dark:text-red-400">
                  {errors.bpm}
                </p>
              )}
            </Field>

            <Field label="Time signature" htmlFor="timeSignature">
              <select
                id="timeSignature"
                value={form.timeSignature}
                onChange={(e) => set('timeSignature', e.target.value as TimeSignature)}
                className={SELECT}
              >
                {(Object.keys(TIME_SIGNATURE_LABELS) as TimeSignature[]).map((ts) => (
                  <option key={ts} value={ts}>
                    {TIME_SIGNATURE_LABELS[ts]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        {/* ── Section 3: Description ──────────────────────────────────────── */}
        <fieldset className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Notes (optional)
          </legend>
          <Field
            label="Performance notes"
            htmlFor="description"
            hint="Strumming pattern, tips for beginners, recommended pick style, etc."
          >
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="e.g. Use down strokes on the verse, slow strum on the chorus…"
              className={`${INPUT} resize-y`}
            />
          </Field>
        </fieldset>

        {/* ── Section 4: Body ─────────────────────────────────────────────── */}
        <fieldset className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Song body *
          </legend>

          {/* Format reminder */}
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
            <p className="font-semibold">Format guide:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>Put section headers in square brackets: <code>[Verse 1]</code>, <code>[Chorus]</code></li>
              <li>Write chord names alone on their own line, above the matching lyric line</li>
              <li>Align each chord directly above the syllable where it changes</li>
              <li>Leave a blank line between sections</li>
            </ul>
            <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-xs dark:bg-slate-900">
{`[Verse 1]
G               Em
Como el ciervo busca por las aguas,
      C      G         C    D
así clama mi alma por ti Señor.`}
            </pre>
          </div>

          <Field label="Lyrics and chords *" htmlFor="body">
            <textarea
              id="body"
              rows={20}
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              placeholder={`[Verse 1]\nG               Em\nComo el ciervo busca por las aguas,\n      C      G         C    D\nasí clama mi alma por ti Señor.`}
              className={`${INPUT} resize-y font-mono text-xs leading-relaxed`}
              spellCheck={false}
              aria-required="true"
              aria-describedby={errors.body ? 'body-error' : undefined}
            />
            {errors.body && (
              <p id="body-error" className="text-xs text-red-600 dark:text-red-400">
                {errors.body}
              </p>
            )}
          </Field>

          {/* Chord badges */}
          <ChordBadges body={form.body} />

          {/* Preview toggle */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {showPreview ? '▲ Hide preview' : '▼ Show live preview'}
            </button>

            {showPreview && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Preview
                </p>
                <BodyPreview body={form.body} />
              </div>
            )}
          </div>
        </fieldset>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/songs"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ✓ Saved!
              </span>
            )}
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-slate-950"
            >
              {isEditing ? 'Save changes' : 'Save song'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
