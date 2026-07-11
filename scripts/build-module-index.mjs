#!/usr/bin/env node
/**
 * Regenerate content/module-index.js from full content/modules/*.js files.
 * Run after adding/editing lesson content: node scripts/build-module-index.mjs
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const modulesDir = join(root, 'content', 'modules');

const CHUNK_FILES = [
  'foundations', 'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
  'historical', 'chronicles_return', 'wisdom', 'prophets', 'heaven', 'peter', 'corinthians',
];

const index = [];
for (const chunk of CHUNK_FILES) {
  const path = join(modulesDir, `${chunk}.js`);
  const mod = await import(pathToFileURL(path).href + `?t=${Date.now()}`);
  const key = Object.keys(mod).find((k) => Array.isArray(mod[k]));
  const arr = key ? mod[key] : [];
  for (const m of arr) {
    index.push({
      id: m.id,
      title: m.title,
      category: m.category || '',
      duration: m.duration || '',
      description: m.description || '',
      xpReward: m.xpReward || 0,
      chunk,
      slideCount: Array.isArray(m.slides) ? m.slides.length : 0,
    });
  }
}

const out = `// Auto-generated module metadata (no slides). Regenerate via scripts/build-module-index.mjs
// Used for catalog/list UIs; full slides load on demand from content/modules/*.js

export const moduleIndex = ${JSON.stringify(index, null, 2)};
`;
writeFileSync(join(root, 'content', 'module-index.js'), out);
console.log(`[build-module-index] ${index.length} modules → content/module-index.js (${out.length} bytes)`);
