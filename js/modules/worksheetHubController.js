// =============================================================================
// Worksheet hub — type picker vs detail panels (equation + embedded Ch.5 sheets)
// =============================================================================

import { getLang, onLangChange } from "./langController.js";

const WORKSHEET_SUBTYPES = ["equation", "atomic-structure", "isotope-ram", "cursor-chem", "microscopic-world-1"];

const EMBED_IFRAME_SEL = "#worksheet-shell iframe.worksheet-embed-fs-frame";

/**
 * Map hot-bar language (en | zh | zh-Hant) to each embedded worksheet’s ?lang= value.
 */
function langQueryForWorksheetPath(pathname, hostLang) {
  const p = (pathname || "").toLowerCase();
  if (p.includes("cursor-chem")) {
    return hostLang === "en" ? "en" : "zh-Hant";
  }
  if (p.includes("ram_calculation") || p.includes("ch5-isotope-ram")) {
    return hostLang === "en" ? "en" : "zh";
  }
  if (p.includes("ch5-atomic-structure")) {
    return hostLang === "en" ? "en" : "zh";
  }
  if (p.includes("ch2-microscopic-world-1")) {
    return hostLang === "en" ? "en" : "zh";
  }
  return hostLang === "en" ? "en" : "zh-Hant";
}

/** Point embedded worksheet iframes at the current hot-bar language (reloads iframe when param changes). */
export function applyWorksheetEmbedIframesLang() {
  const host = getLang();
  document.querySelectorAll(EMBED_IFRAME_SEL).forEach((frame) => {
    const attr = frame.getAttribute("src");
    if (!attr) return;
    let url;
    try {
      url = new URL(attr, window.location.href);
    } catch {
      return;
    }
    const want = langQueryForWorksheetPath(url.pathname, host);
    if (url.searchParams.get("lang") === want) return;
    url.searchParams.set("lang", want);
    frame.setAttribute("src", `${url.pathname}${url.search}${url.hash}`);
  });
}

const PANEL_ID_BY_SUBTYPE = {
  equation: "worksheet-panel-equation",
  "atomic-structure": "worksheet-panel-atomic-structure",
  "isotope-ram": "worksheet-panel-isotope-ram",
  "cursor-chem": "worksheet-panel-cursor-chem",
  "microscopic-world-1": "worksheet-panel-microscopic-world-1",
};

function getShell() {
  return document.getElementById("worksheet-shell");
}

function hideAllPanels() {
  Object.values(PANEL_ID_BY_SUBTYPE).forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("hidden", "");
      el.setAttribute("aria-hidden", "true");
    }
  });
}

function showHub() {
  const shell = getShell();
  const hub = document.getElementById("worksheet-hub");
  if (shell) {
    shell.classList.remove("worksheet-shell--detail");
    shell.removeAttribute("data-worksheet-panel");
  }
  if (hub) {
    hub.removeAttribute("hidden");
  }
  hideAllPanels();
}

function showDetail(subtype) {
  if (!WORKSHEET_SUBTYPES.includes(subtype)) return;

  const shell = getShell();
  const hub = document.getElementById("worksheet-hub");
  const panelId = PANEL_ID_BY_SUBTYPE[subtype];
  const panel = panelId ? document.getElementById(panelId) : null;

  hideAllPanels();

  if (shell) {
    shell.classList.add("worksheet-shell--detail");
    shell.setAttribute("data-worksheet-panel", subtype);
  }
  if (hub) {
    hub.setAttribute("hidden", "");
  }
  if (panel) {
    panel.removeAttribute("hidden");
    panel.setAttribute("aria-hidden", "false");
  }

  if (subtype === "equation" && typeof window.ensureWorksheetReady === "function") {
    void window
      .ensureWorksheetReady()
      .then(() => {
        requestAnimationFrame(() => window.initWorksheetGenerator?.());
      })
      .catch((err) => console.error("Worksheet lazy init error:", err));
  }

  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function bindWorksheetTypeCard(card) {
  if (!card || card.dataset.worksheetHubBound === "true") return;
  const subtype = card.dataset.worksheetSubtype;
  if (!subtype || !WORKSHEET_SUBTYPES.includes(subtype)) return;

  const open = () => showDetail(subtype);

  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    open();
  });

  card.dataset.worksheetHubBound = "true";
}

/**
 * Wire hub navigation. Call `resetWorksheetHub` when the Worksheets tab is shown
 * so users always land on the type picker.
 */
export function initWorksheetHub() {
  const shell = getShell();
  if (shell) {
    shell.querySelectorAll(".worksheet-back-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        showHub();
      });
    });
  }

  document.querySelectorAll(".worksheet-type-card[data-worksheet-subtype]").forEach(bindWorksheetTypeCard);

  showHub();

  applyWorksheetEmbedIframesLang();
  onLangChange(() => applyWorksheetEmbedIframesLang());

  return {
    resetWorksheetHub: showHub,
  };
}
