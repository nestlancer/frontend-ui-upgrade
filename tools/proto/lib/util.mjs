// ============================================================================
// Nestlancer prototype — tiny utilities
// ============================================================================
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const ROOT = new URL('../../../', import.meta.url).pathname;

export const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Write a file relative to repo root, creating parents. */
export function emit(relPath, content) {
  const abs = join(ROOT, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  return relPath;
}

/** Relative prefix from a route path (e.g. "apps/web/blog/[slug]/") back to repo root. */
export function relRoot(routePath) {
  const segs = routePath.split('/').filter(Boolean);
  return segs.length ? '../'.repeat(segs.length) : './';
}

/** Build a link to another route from the current route. Accepts a route path
   *  string or a route object ({ path }). */
export function linkTo(fromRoute, target) {
  if (typeof fromRoute === 'object' && fromRoute !== null) fromRoute = fromRoute.path;
  if (target.startsWith('http') || target.startsWith('#') || target.startsWith('mailto:')) return target;
  const abs = target.startsWith('/') ? target.slice(1) : target;
  const withIndex = abs.endsWith('/') ? abs + 'index.html' : abs.endsWith('.html') ? abs : abs + '/index.html';
  const fromParts = fromRoute.split('/').filter(Boolean);
  const toParts = withIndex.split('/').filter(Boolean);
  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) i++;
  const ups = '../'.repeat(fromParts.length - i);
  return (ups || './') + toParts.slice(i).join('/');
}

/** Indian-number-format rupees. */
export const inr = (n, dec = 2) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const initials = (name) =>
  name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/** Deterministic pseudo-random for charts. */
export function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
