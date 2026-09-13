#!/usr/bin/env node
/**
 * Generates docs/CHORD_NAMES.md.
 *
 * Bundles scripts/generate_chord_names.ts with the esbuild that ships with Vite
 * — no extra dependency — and writes its output into the docs folder.
 *
 *   npm run docs:chords
 *
 * CI runs this and fails if the committed file differs, so the reference can
 * never drift away from the chord data.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function findEsbuild() {
  const candidates = [
    path.join(root, 'node_modules', '.bin', 'esbuild'),
    path.join(root, 'web', 'node_modules', '.bin', 'esbuild'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

const esbuild = findEsbuild();
if (!esbuild) {
  console.error(
    'esbuild was not found. Install the project dependencies first:\n' +
      '  npm install && (cd web && npm install)',
  );
  process.exit(1);
}

const bundle = path.join(root, 'node_modules', '.cache', 'chord-names.mjs');
fs.mkdirSync(path.dirname(bundle), { recursive: true });

execFileSync(
  esbuild,
  [
    path.join(here, 'generate_chord_names.ts'),
    '--bundle',
    '--platform=node',
    '--format=esm',
    `--outfile=${bundle}`,
    '--log-level=warning',
  ],
  { stdio: 'inherit' },
);

const markdown = execFileSync(process.execPath, [bundle], { encoding: 'utf8' });

const outDir = path.join(root, 'docs');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'CHORD_NAMES.md');
fs.writeFileSync(outFile, markdown);

console.log(`Wrote ${path.relative(root, outFile)} (${markdown.length} bytes)`);
