// =============================================================================
// Translations Module — Aggregator (en eager; other UI locales lazy-loaded)
// =============================================================================

import { enUI } from "./locales/ui/en.js";

/**
 * All UI translations organized by language code.
 * Element and Ion data are loaded dynamically via langController.js.
 */
export const translations = {
  en: enUI,
};

export const UI_LOCALE_LOADERS = {
  zh: async () => (await import("./locales/ui/zh.js")).zhUI,
  "zh-Hant": async () => (await import("./locales/ui/zh-Hant.js")).zhHantUI,
  fr: async () => (await import("./locales/ui/fr.js")).frUI,
  ru: async () => (await import("./locales/ui/ru.js")).ruUI,
  fa: async () => (await import("./locales/ui/fa.js")).faUI,
  ur: async () => (await import("./locales/ui/ur.js")).urUI,
  tl: async () => (await import("./locales/ui/tl.js")).tlUI,
};

export async function loadUILocale(code) {
  if (code === "en" || translations[code]) return translations[code];
  const loader = UI_LOCALE_LOADERS[code];
  if (!loader) return translations.en;
  translations[code] = await loader();
  return translations[code];
}

/** Load every UI locale (for audit/tooling scripts). */
export async function loadAllUILocales() {
  await Promise.all(Object.keys(UI_LOCALE_LOADERS).map((code) => loadUILocale(code)));
  return translations;
}
