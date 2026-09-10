import {
  CHORD_FORMULAS,
  CHORD_TYPE_INFO,
  GREEK_MODES,
  INTERVALS,
  SCALE_NAMES,
  SCALES,
} from '@shared/constants/theory';
import { buildChordNotes, buildScale } from '@shared/engine/music_theory';
import { usePageTitle } from '../hooks/usePageTitle';

const SIMPLE_INTERVALS = Object.values(INTERVALS).filter((i) => i.number <= 8);

export function TheoryPage() {
  usePageTitle('Music theory — Strings Of Heaven');

  const cMajor = buildScale('C', 'major').join(' – ');
  const harmonizedExample = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Music theory</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          A compact reference for the concepts used across the app: intervals, chord formulas,
          scales and modes, and how chords grow out of scales.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Intervals</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Intervals are the distance between two notes, measured in diatonic steps (the number)
          and semitones (the quality).
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 lg:grid-cols-4">
          {SIMPLE_INTERVALS.map((interval) => (
            <div key={interval.name} className="flex justify-between border-b border-slate-100 py-0.5 dark:border-slate-800">
              <span className="font-mono font-semibold">{interval.name}</span>
              <span className="text-slate-500 dark:text-slate-400">{interval.semitones} st</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Chord formulas</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Chords are built by stacking intervals above the root. The example column shows the
          notes of each chord built on C.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-4 font-medium">Chord</th>
                <th className="py-1 pr-4 font-medium">Formula</th>
                <th className="py-1 font-medium">Example in C</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CHORD_FORMULAS).map(([type, formula]) => (
                <tr key={type} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1 pr-4 font-medium">
                    {CHORD_TYPE_INFO[type]?.name ?? type}
                  </td>
                  <td className="py-1 pr-4 font-mono text-slate-600 dark:text-slate-300">
                    {formula.join(' ')}
                  </td>
                  <td className="py-1 font-mono">{buildChordNotes('C', type).join(' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Scales and modes</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          The C major scale is {cMajor}. Each Greek mode starts the same set of notes on a
          different degree, which changes its character.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-4 font-medium">Mode</th>
                <th className="py-1 pr-4 font-medium">Degree</th>
                <th className="py-1 pr-4 font-medium">Formula</th>
                <th className="py-1 font-medium">Notes in C</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(GREEK_MODES).map(([degree, mode]) => (
                <tr key={mode} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1 pr-4 font-medium">{SCALE_NAMES[mode]}</td>
                  <td className="py-1 pr-4">{degree}</td>
                  <td className="py-1 pr-4 font-mono text-slate-600 dark:text-slate-300">
                    {SCALES[mode].join(' ')}
                  </td>
                  <td className="py-1 font-mono">{buildScale('C', mode).join(' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Harmonizing a scale</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Stack the notes of a scale in thirds and each degree produces a chord. Harmonizing
          C major yields the familiar sequence:
        </p>
        <p className="mt-2 flex flex-wrap gap-2">
          {harmonizedExample.map((type, i) => (
            <span
              key={type}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-sm dark:bg-slate-800"
            >
              {i + 1}. {buildChordNotes('C', type).join(' ')}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}