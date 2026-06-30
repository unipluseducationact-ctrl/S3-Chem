// =============================================================================
// Lab language bridge — map host hot-bar lang to embedded lab iframe lang
// =============================================================================

export const LAB_TOOL_TYPES = new Set([
  "ionic-compound-puzzle",
  "covalent-bond-puzzle",
  "covalent-properties-sandbox",
]);

/** Host hot-bar: en | zh | zh-Hant → lab iframe: en | zh */
export function hostLangToLabLang(hostLang) {
  return hostLang === "en" ? "en" : "zh";
}

export function isLabToolType(toolType) {
  return LAB_TOOL_TYPES.has(toolType);
}

export function buildLabIframeSrc(toolPath, hostLang) {
  const labLang = hostLangToLabLang(hostLang);
  const url = new URL(toolPath, window.location.href);
  url.searchParams.set("lang", labLang);
  url.searchParams.set("embed", "1");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function applyLabLangToIframe(iframe, hostLang) {
  if (!iframe?.contentWindow) return;
  const labLang = hostLangToLabLang(hostLang);
  iframe.contentWindow.postMessage({ type: "uniplus:setLang", lang: labLang }, "*");
}
