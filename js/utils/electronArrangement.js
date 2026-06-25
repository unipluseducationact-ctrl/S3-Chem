// Principal-shell electron counts matching ptable.com "Energy levels" view.
// Electrons in nd / nf orbitals count toward shell n (not n+1).

import { finallyData } from "../data/elementsData.js";

const SUPERSCRIPT_TO_DIGIT = {
  "\u2070": "0", "\u00b9": "1", "\u00b2": "2", "\u00b3": "3", "\u2074": "4",
  "\u2075": "5", "\u2076": "6", "\u2077": "7", "\u2078": "8", "\u2079": "9",
};

const NOBLE_GAS_EXPANDED = {
  He: "1s\u00b2",
  Ne: "1s\u00b2 2s\u00b2 2p\u2076",
  Ar: "1s\u00b2 2s\u00b2 2p\u2076 3s\u00b2 3p\u2076",
  Kr: "1s\u00b2 2s\u00b2 2p\u2076 3s\u00b2 3p\u2076 3d\u2071\u2070 4s\u00b2 4p\u2076",
  Xe: "1s\u00b2 2s\u00b2 2p\u2076 3s\u00b2 3p\u2076 3d\u2071\u2070 4s\u00b2 4p\u2076 4d\u2071\u2070 5s\u00b2 5p\u2076",
  Rn: "1s\u00b2 2s\u00b2 2p\u2076 3s\u00b2 3p\u2076 3d\u2071\u2070 4s\u00b2 4p\u2076 4d\u2071\u2070 5s\u00b2 5p\u2076 4f\u2071\u2074 5d\u2071\u2070 6s\u00b2 6p\u2076",
};

function superscriptToInt(str) {
  if (!str) return 0;
  const normalized = str.replace(/[\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079]/g, (ch) => SUPERSCRIPT_TO_DIGIT[ch] ?? ch);
  const n = parseInt(normalized, 10);
  return Number.isFinite(n) ? n : 0;
}

function expandNobleGasShorthand(config) {
  let expanded = config.trim();
  for (const [symbol, inner] of Object.entries(NOBLE_GAS_EXPANDED)) {
    expanded = expanded.replace(new RegExp(`\\[${symbol}\\]`, "g"), inner);
  }
  return expanded;
}

export function parseShellArrangementFromConfig(config) {
  if (!config || typeof config !== "string") return [];

  const full = expandNobleGasShorthand(
    config.replace(/\[[^\]]*\]/g, (match) => {
      const inner = match.slice(1, -1);
      if (NOBLE_GAS_EXPANDED[inner]) return NOBLE_GAS_EXPANDED[inner];
      return "";
    }).replace(/\s+/g, " ").trim()
  );

  const shellCounts = {};
  const orbitalRe = /(\d)([spdf])([\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079]+|\d+)/g;
  let match;
  while ((match = orbitalRe.exec(full)) !== null) {
    const n = parseInt(match[1], 10);
    const count = superscriptToInt(match[3]);
    if (n > 0 && count > 0) {
      shellCounts[n] = (shellCounts[n] || 0) + count;
    }
  }

  const maxN = Math.max(0, ...Object.keys(shellCounts).map(Number));
  if (maxN === 0) return [];

  const out = [];
  for (let n = 1; n <= maxN; n++) {
    out.push(shellCounts[n] || 0);
  }
  return out;
}

const _cache = new Map();

export function getShellArrangementByZ(z) {
  if (!Number.isFinite(z) || z <= 0) return [];
  const key = Math.floor(z);
  if (_cache.has(key)) return _cache.get(key);

  const entry = finallyData[String(key)];
  const config = entry?.level3_properties?.electronic?.configuration;
  const shells = parseShellArrangementFromConfig(config || "");
  _cache.set(key, shells);
  return shells;
}

export function getElectronArrangementByZ(z) {
  return getShellArrangementByZ(z);
}
