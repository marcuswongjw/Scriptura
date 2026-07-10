#!/usr/bin/env node
/**
 * Mirror deployable app assets from repo root → public/
 * Source of truth lives at the root (app.js, js/, content/, modules.js, …).
 * Firebase Hosting serves `public/` only — always run this before deploy/commit.
 *
 * Usage: node scripts/sync-public.mjs
 */
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dest = join(root, 'public');

const ROOT_FILES = [
  'app.js',
  'modules.js',
  'style.css',
  'index.html',
  'daily_readings.js',
  'firebase-messaging-sw.js',
  'manifest.json',
  'favicon.png',
  'icon-192.png',
  'icon-512.png',
];

const ROOT_DIRS = ['js', 'content'];

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function copyFile(rel) {
  const from = join(root, rel);
  const to = join(dest, rel);
  if (!existsSync(from)) {
    console.warn(`[sync-public] skip missing: ${rel}`);
    return;
  }
  ensureDir(dirname(to));
  cpSync(from, to);
  console.log(`[sync-public] file  ${rel}`);
}

function copyDir(rel) {
  const from = join(root, rel);
  const to = join(dest, rel);
  if (!existsSync(from)) {
    console.warn(`[sync-public] skip missing dir: ${rel}`);
    return;
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  const count = countFiles(to);
  console.log(`[sync-public] dir   ${rel}/  (${count} files)`);
}

function countFiles(dir) {
  let n = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

ensureDir(dest);
for (const f of ROOT_FILES) copyFile(f);
for (const d of ROOT_DIRS) copyDir(d);
console.log('[sync-public] done → public/');
