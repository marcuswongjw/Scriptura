// Scriptura course data — lightweight index at startup; full slides load on demand.
// Catalog/stats only need metadata. Lessons call ensureModuleLoaded(id) before play.

import { concentrations } from './content/concentrations.js';
import { moduleIndex } from './content/module-index.js';

export { concentrations };

/** Map chunk name → dynamic import of content/modules/<chunk>.js */
const chunkLoaders = {
  foundations: () => import('./content/modules/foundations.js'),
  genesis: () => import('./content/modules/genesis.js'),
  exodus: () => import('./content/modules/exodus.js'),
  leviticus: () => import('./content/modules/leviticus.js'),
  numbers: () => import('./content/modules/numbers.js'),
  deuteronomy: () => import('./content/modules/deuteronomy.js'),
  historical: () => import('./content/modules/historical.js'),
  chronicles_return: () => import('./content/modules/chronicles_return.js'),
  wisdom: () => import('./content/modules/wisdom.js'),
  prophets: () => import('./content/modules/prophets.js'),
  heaven: () => import('./content/modules/heaven.js'),
  peter: () => import('./content/modules/peter.js'),
  corinthians: () => import('./content/modules/corinthians.js'),
};

const loadedChunks = new Set();
const inflightChunks = new Map();

/**
 * Mutable modules list used across the app.
 * Starts as metadata stubs (slides: null). Hydrated in place when a chunk loads.
 * Custom modules from Firestore are pushed as full objects (with slides).
 */
export const modules = moduleIndex.map((m) => ({
  id: m.id,
  title: m.title,
  category: m.category,
  duration: m.duration,
  description: m.description,
  xpReward: m.xpReward,
  slideCount: m.slideCount,
  slides: null,
  _chunk: m.chunk,
  _lazy: true,
}));

function applyChunkModules(chunkName, fullList) {
  for (const full of fullList) {
    const idx = modules.findIndex((m) => m.id === full.id);
    const hydrated = {
      ...full,
      _chunk: chunkName,
      _lazy: false,
      slideCount: Array.isArray(full.slides) ? full.slides.length : 0,
    };
    if (idx !== -1) modules[idx] = hydrated;
    else modules.push(hydrated);
  }
  loadedChunks.add(chunkName);
}

export async function loadModuleChunk(chunkName) {
  if (!chunkName || loadedChunks.has(chunkName)) return;
  if (inflightChunks.has(chunkName)) return inflightChunks.get(chunkName);

  const loader = chunkLoaders[chunkName];
  if (!loader) {
    console.warn('[modules] unknown chunk', chunkName);
    return;
  }

  const p = loader()
    .then((mod) => {
      const key = Object.keys(mod).find((k) => Array.isArray(mod[k]));
      const list = key ? mod[key] : [];
      applyChunkModules(chunkName, list);
    })
    .catch((err) => {
      console.error('[modules] failed to load chunk', chunkName, err);
      throw err;
    })
    .finally(() => {
      inflightChunks.delete(chunkName);
    });

  inflightChunks.set(chunkName, p);
  return p;
}

/** Ensure a single module's slides are available. Returns the module or null. */
export async function ensureModuleLoaded(moduleId) {
  const stub = modules.find((m) => m.id === moduleId);
  if (!stub) return null;
  // Custom / already hydrated
  if (Array.isArray(stub.slides) && stub.slides.length > 0) return stub;
  if (stub._chunk) {
    await loadModuleChunk(stub._chunk);
  }
  return modules.find((m) => m.id === moduleId) || null;
}

/** Load every static content chunk (admin tools, full exports). */
export async function ensureAllModulesLoaded() {
  await Promise.all(Object.keys(chunkLoaders).map((c) => loadModuleChunk(c)));
  return modules;
}

export function isModuleHydrated(moduleId) {
  const m = modules.find((x) => x.id === moduleId);
  return !!(m && Array.isArray(m.slides) && m.slides.length > 0);
}
