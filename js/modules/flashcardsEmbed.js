// Microscopic World I flashcards — iframe language switcher for #flashcards-page

const CACHE_BUST = "v=20260630";
const BASE = "./public/flashcards/microscopic-world-i";

const LOCALES = {
  en: `${BASE}/en/flashcards-study.html?${CACHE_BUST}`,
  zh: `${BASE}/zh-hk/flashcards-study.html?${CACHE_BUST}`,
};

export function initFlashcardsEmbed() {
  if (window.__flashcardsEmbedInited) return;
  window.__flashcardsEmbedInited = true;

  const frame = document.getElementById("fc-embed-frame");
  const btnEn = document.getElementById("fc-embed-lang-en");
  const btnZh = document.getElementById("fc-embed-lang-zh");
  if (!frame || !btnEn || !btnZh) return;

  function setLocale(locale) {
    const isEn = locale === "en";
    frame.src = isEn ? LOCALES.en : LOCALES.zh;
    btnEn.classList.toggle("active", isEn);
    btnZh.classList.toggle("active", !isEn);
    btnEn.setAttribute("aria-pressed", isEn ? "true" : "false");
    btnZh.setAttribute("aria-pressed", isEn ? "false" : "true");
  }

  btnEn.addEventListener("click", () => setLocale("en"));
  btnZh.addEventListener("click", () => setLocale("zh"));
}