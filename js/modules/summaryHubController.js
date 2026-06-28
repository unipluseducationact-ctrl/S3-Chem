// =============================================================================
// Summary hub — topic picker vs detail panels (Topic 2 infographics)
// =============================================================================

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

function bindSummaryTopicCard(card) {
  if (!card || card.dataset.summaryHubBound === "true") return;
  const topic = card.dataset.summaryTopic;
  if (!topic || !SUMMARY_TOPICS.includes(topic)) return;

  const open = () => showDetail(topic);

  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    open();
  });

  card.dataset.summaryHubBound = "true";
}

/**
 * Wire hub navigation. Call `resetSummaryHub` when the Summary tab is shown
 * so users always land on the topic picker.
 */
export function initSummaryHub() {
  const shell = getShell();
  if (shell) {
    shell.querySelectorAll(".summary-back-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        showHub();
      });
    });
  }

  document.querySelectorAll(".summary-topic-card[data-summary-topic]").forEach(bindSummaryTopicCard);

  showHub();

  return {
    resetSummaryHub: showHub,
  };
}
