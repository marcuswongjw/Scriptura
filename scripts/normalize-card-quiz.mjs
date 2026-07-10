#!/usr/bin/env node
/**
 * Normalize legacy card-quiz slides to the questions[] shape.
 * Old: { type:'card-quiz', question, correctAnswer, explanation }
 * New: { type:'card-quiz', questions: [{ question, correctAnswer, explanation }] }
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const modulesDir = join(root, 'content', 'modules');

function normalizeSlide(slide) {
  if (!slide || slide.type !== 'card-quiz') return { slide, changed: false };
  if (Array.isArray(slide.questions) && slide.questions.length > 0) {
    return { slide, changed: false };
  }
  if (slide.question == null) return { slide, changed: false };

  const next = { ...slide };
  const q = {
    question: slide.question,
    correctAnswer: slide.correctAnswer,
    explanation: slide.explanation || '',
  };
  next.questions = [q];
  delete next.question;
  delete next.correctAnswer;
  delete next.explanation;
  return { slide: next, changed: true };
}

async function normalizeFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const mod = await import(pathToFileURL(filePath).href + `?t=${Date.now()}`);
  const exportName = Object.keys(mod).find((k) => Array.isArray(mod[k]));
  if (!exportName) {
    console.warn('no array export', filePath);
    return 0;
  }

  let total = 0;
  const next = mod[exportName].map((moduleObj) => {
    if (!Array.isArray(moduleObj.slides)) return moduleObj;
    const slides = moduleObj.slides.map((s) => {
      const r = normalizeSlide(s);
      if (r.changed) total += 1;
      return r.slide;
    });
    return { ...moduleObj, slides };
  });

  if (total === 0) {
    console.log(`[normalize] ${filePath.split('/').pop()}: no changes`);
    return 0;
  }

  const headerMatch = raw.match(/^([\s\S]*?export const \w+Modules\s*=\s*)/);
  const header = headerMatch
    ? headerMatch[1]
    : `export const ${exportName} = `;

  const out = `${header}${JSON.stringify(next, null, 2)};\n`;
  writeFileSync(filePath, out);
  console.log(`[normalize] ${filePath.split('/').pop()}: ${total} card-quiz slide(s)`);
  return total;
}

const files = readdirSync(modulesDir).filter((f) => f.endsWith('.js'));
let sum = 0;
for (const f of files) {
  sum += await normalizeFile(join(modulesDir, f));
}
console.log(`[normalize] total slides fixed: ${sum}`);
