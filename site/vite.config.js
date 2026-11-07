import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { parseFacts, parseCsv } from './src/facts.js';

// The repo's README.md, docs/tutorial-en.md and docs/phase-matrix.csv are parsed here, at build
// time, so every number on the page comes from the repo's own files. Only the parsed facts reach
// the bundle: the raw markdown (which holds a private network address and an app ID) never ships.
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const facts = parseFacts(read('README.md'), read('docs/tutorial-en.md'));
const phases = parseCsv(read('docs/phase-matrix.csv'));

export default defineConfig({
  base: '/muse-n8n-extraction-101/',
  plugins: [react()],
  define: { __FACTS__: JSON.stringify(facts), __PHASES__: JSON.stringify(phases) },
});
