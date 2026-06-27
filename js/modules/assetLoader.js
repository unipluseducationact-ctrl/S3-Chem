const loadedStyles = new Set();

export function loadStylesheet(href) {
  if (loadedStyles.has(href)) return Promise.resolve();
  const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
  if (existing) {
    loadedStyles.add(href);
    return Promise.resolve();
  }
  loadedStyles.add(href);
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
    document.head.appendChild(link);
  });
}

export function loadDeferredStylesheets(hrefs) {
  return Promise.all(hrefs.map((href) => loadStylesheet(href)));
}
