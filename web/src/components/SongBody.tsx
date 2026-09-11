/**
 * SongBody — renders a song body (lyrics + chord lines) with clickable chords.
 *
 * Lines are classified by the shared parser (`parseSongBody`). Each chord token
 * keeps its original character column, so the chords stay aligned above the
 * syllables they belong to — exactly as the submitter typed them.
 *
 * Clicking a chord opens its diagram at /chord/:key/:suffix, resolved through
 * `resolveChordsFromBody` (shorthand suffixes such as "m" → "minor" are mapped
 * to the spelling used by the chord database).
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { parseSongBody, resolveChordsFromBody } from '@shared/engine/chord_engine';
import type { ParsedSongLine } from '@shared/engine/chord_engine';
import { selectInstrument } from '@shared/store';
import { useAppSelector } from '../hooks';

interface SongBodyProps {
  /** Raw song body text, as stored in `SongEntry.body`. */
  body: string;
  /** Optional extra classes for the outer container. */
  className?: string;
}

const CHORD_LINK =
  'text-amber-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-400';
const CHORD_PLAIN = 'text-amber-600 dark:text-amber-400';

/** One piece of a chord line: either filler whitespace/text or a chord token. */
interface Segment {
  text: string;
  /** Present when this segment is a chord token. */
  chord?: string;
  /** Diagram URL; absent when the chord could not be resolved. */
  href?: string;
}

/**
 * Split a parsed chord line into ordered segments without losing any
 * whitespace, so the rendered line matches the source layout column by column.
 */
function segmentChordLine(line: ParsedSongLine, hrefs: Map<string, string>): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  for (const token of line.tokens) {
    if (token.column > cursor) {
      segments.push({ text: line.raw.slice(cursor, token.column) });
    }
    segments.push({
      text: token.chord,
      chord: token.chord,
      href: hrefs.get(token.chord),
    });
    cursor = token.column + token.chord.length;
  }

  if (cursor < line.raw.length) {
    segments.push({ text: line.raw.slice(cursor) });
  }

  return segments;
}

export function SongBody({ body, className = '' }: SongBodyProps) {
  const instrument = useAppSelector(selectInstrument);

  // Normalise CRLF so column positions match what the user sees.
  const normalized = useMemo(() => body.replace(/\r\n?/g, '\n'), [body]);
  const lines = useMemo(() => parseSongBody(normalized), [normalized]);

  /** Chord as written ("Em", "G/B") → diagram URL for the current instrument. */
  const hrefs = useMemo(() => {
    const map = new Map<string, string>();
    for (const { raw, note, suffix } of resolveChordsFromBody(normalized, instrument)) {
      map.set(raw, `/chord/${encodeURIComponent(note)}/${encodeURIComponent(suffix)}`);
    }
    return map;
  }, [normalized, instrument]);

  if (!normalized.trim()) {
    return (
      <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`}>
        This song has no body yet.
      </p>
    );
  }

  return (
    <div className={`font-mono text-sm leading-relaxed ${className}`}>
      {lines.map((line, i) => {
        if (line.type === 'blank') {
          return <div key={i} className="h-3" aria-hidden="true" />;
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
            <div key={i} className="whitespace-pre">
              {segmentChordLine(line, hrefs).map((segment, j) =>
                segment.chord && segment.href ? (
                  <Link
                    key={j}
                    to={segment.href}
                    title={`${segment.chord} chord diagram`}
                    className={CHORD_LINK}
                  >
                    {segment.text}
                  </Link>
                ) : (
                  <span key={j} className={segment.chord ? CHORD_PLAIN : undefined}>
                    {segment.text}
                  </span>
                ),
              )}
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

export default SongBody;
