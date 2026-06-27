let detailPromise = null;
let finallyDataCache = null;

export function loadElementDetailModule() {
  if (!detailPromise) {
    detailPromise = import("../data/elementsDetail.js");
  }
  return detailPromise;
}

export async function getFinallyData() {
  if (finallyDataCache) return finallyDataCache;
  const mod = await loadElementDetailModule();
  finallyDataCache = mod.finallyData;
  return finallyDataCache;
}

export function getFinallyDataSync() {
  return finallyDataCache;
}

export async function getElementDetail(number) {
  const data = await getFinallyData();
  return data[String(number)] || {};
}

export function preloadElementDetail() {
  void loadElementDetailModule();
}
