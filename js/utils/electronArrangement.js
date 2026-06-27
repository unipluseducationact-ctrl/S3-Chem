// Principal-shell electron counts matching ptable.com "Energy levels" view.
// Electrons in nd / nf orbitals count toward shell n (not n+1).

import { shellsByZ } from "../data/elementShells.js";

const _cache = new Map();

export function getShellArrangementByZ(z) {
  if (!Number.isFinite(z) || z <= 0) return [];
  const key = Math.floor(z);
  if (_cache.has(key)) return _cache.get(key);

  const shells = shellsByZ[String(key)] || shellsByZ[key] || [];
  _cache.set(key, shells);
  return shells;
}

export function getElectronArrangementByZ(z) {
  return getShellArrangementByZ(z);
}
