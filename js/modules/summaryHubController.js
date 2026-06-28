// =============================================================================
// Summary hub — topic picker vs detail panels (Topic 2 infographics)
// =============================================================================

import { applyStaticTranslations } from "./langController.js";

const SUMMARY_TOPICS = ["2"];

const PANEL_ID_BY_TOPIC = {
  2: "summary-panel-topic-2",
};

function getShell() {
  return document.getElementById("summary-shell");
}

function hideAllPanels() {
  Object.values(PANEL_ID_BY_TOPIC).forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("hidden", "");
      el.setAttribute("aria-hidden", "true");
    }
  });
}

function showHub() {
  const shell = getShell();
  const hub = document.getElementById("summary-hub");
  if (shell) {
    shell.classList.remove("summary-shell--detail");
    shell.removeAttribute("data-summary-topic");
  }
  if (hub) {
    hub.removeAttribute("hidden");
    hub.setAttribute("aria-hidden", "false");
  }
  hideAllPanels();

  requestAnimationFrame(() => {
    const sp = document.getElementById("settings-page");
    const viewport = document.getElementById("page-settings");
    if (sp) sp.scrollTop = 0;
    if (viewport) viewport.scrollTop = 0;
  });
}

function showDetail(topic) {
  if (!SUMMARY_TOPICS.includes(topic)) return;

  const shell = getShell();
  const hub = document.getElementById("summary-hub");
  const panelId = PANEL_ID_BY_TOPIC[topic];
  const panel = panelId ? document.getElementById(panelId) : null;

  hideAllPanels();

  if (shell) {
    shell.classList.add("summary-shell--detail");
    shell.setAttribute("data-summary-topic", topic);
  }
  if (hub) {
    hub.setAttribute("hidden", "");
    hub.setAttribute("aria-hidden", "true");
  }
  if (panel) {
    panel.removeAttribute("hidden");
    panel.setAttribute("aria-hidden", "false");
  }

  requestAnimationFrame(() => {
    const sp = document.getElementById("settings-page");
    const viewport = document.getElementById("page-settings");
    if (sp) sp.scrollTop = 0;
    if (viewport) viewport.scrollTop = 0;
    window.dispatchEvent(new Event("resize"));
  });
}

function bindShellDelegation(shell) {
  if (!shell || shell.dataset.summaryHubBound === "true") return;

  shell.addEventListener("click", (e) => {
    const card = e.target.closest(".summary-topic-card[data-summary-topic]");
    if (card) {
      showDetail(card.dataset.summaryTopic);
      return;
    }
    if (e.target.closest(".summary-back-btn")) {
      showHub();
    }
  });

  shell.dataset.summaryHubBound = "true";
}

/**
 * Wire hub navigation. Call `resetSummaryHub` when the Summary tab is shown
 * so users always land on the topic picker.
 */
export function initSummaryHub() {
  const shell = getShell();
  bindShellDelegation(shell);

  showHub();
  applyStaticTranslations();

  return {
    resetSummaryHub: showHub,
  };
}
