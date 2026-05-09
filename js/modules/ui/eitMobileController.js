/**
 * Mobile / narrow-viewport EIT wizard — floating launcher + two-step sheets.
 * Dispatches only through createEITController public API (no direct cell access).
 */
import { t, onLangChange } from "../langController.js";

const MEDIA_Q = "(pointer: coarse), (max-width: 1024px)";

/** @type {(() => void) | null} */
let langUnsub = null;

function matchesEitMobile() {
  return typeof window !== "undefined" && window.matchMedia(MEDIA_Q).matches;
}

function isPeriodicTablePageActive(tableContainer) {
  if (!tableContainer) return false;
  // Periodic table is the base page; other pages are full-screen overlays with `.blank-page.active`.
  // We only want the "View by" launcher on the periodic table page across all languages.
  const overlayActive = !!document.querySelector(".blank-page.active");
  if (overlayActive) return false;
  return tableContainer.id === "periodic-table";
}

function getEitChrome() {
  const eitRoot = document.getElementById("eit-controller");
  const modeGroup = document.getElementById("eit-mode-group");
  const sliderSection = document.getElementById("eit-slider-section");
  return { eitRoot, modeGroup, sliderSection };
}

/** Move mode group + slider back under #eit-controller (desktop order: slider, mode, reset). */
export function restoreEitMobileReparentedChrome() {
  const { eitRoot, modeGroup, sliderSection } = getEitChrome();
  if (!eitRoot || !modeGroup || !sliderSection) return;
  const resetBtn = eitRoot.querySelector("#eit-reset-btn");
  if (!resetBtn) return;
  if (sliderSection.parentElement !== eitRoot) {
    eitRoot.insertBefore(sliderSection, resetBtn);
  }
  if (modeGroup.parentElement !== eitRoot) {
    eitRoot.insertBefore(modeGroup, resetBtn);
  }
}

function labelForProperty(config) {
  if (!config) return "";
  return (config.labelKey ? t(config.labelKey) : "") || config.label || "";
}

function chipMarkupForPropertyKey(key) {
  const chip = document.querySelector(`#eit-controller .eit-chip[data-property="${key}"]`);
  return chip ? chip.innerHTML : "";
}

function escapeHtmlAttrish(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function rowLabelTools(key) {
  switch (key) {
    case "first20":
      return t("eit.first20");
    case "electronLayout":
      return t("eit.style.electrons");
    case "s3":
      return "S3 mode";
    case "reset":
      return t("eit.reset");
    default:
      return key;
  }
}

function isToolsRowActive(key, snapshot) {
  if (key === "first20") return snapshot.first20;
  if (key === "electronLayout") return snapshot.electronLayout;
  if (key === "s3") return snapshot.s3;
  return false;
}

/** @param {HTMLElement} tableContainer @param {object} controller EIT controller from createEITController */
export function mountEitMobileWizard(tableContainer, controller) {
  if (!tableContainer || !controller || !matchesEitMobile()) return;
  if (document.getElementById("eit-mobile-root")) return;

  const root = document.createElement("div");
  root.id = "eit-mobile-root";
  root.className = "eit-mobile-root";
  root.setAttribute("aria-hidden", "true");

  const zoomBar = document.createElement("div");
  zoomBar.className = "eit-mobile-zoombar";
  zoomBar.setAttribute("aria-hidden", "false");

  const zoomOut = document.createElement("button");
  zoomOut.type = "button";
  zoomOut.className = "eit-mobile-zoom-btn eit-mobile-zoom-out";
  zoomOut.textContent = "−";
  zoomOut.setAttribute("aria-label", "Zoom out");

  const zoomIn = document.createElement("button");
  zoomIn.type = "button";
  zoomIn.className = "eit-mobile-zoom-btn eit-mobile-zoom-in";
  zoomIn.textContent = "+";
  zoomIn.setAttribute("aria-label", "Zoom in");

  zoomBar.append(zoomOut, zoomIn);

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "eit-mobile-launcher";
  launcher.setAttribute("aria-haspopup", "dialog");
  launcher.setAttribute("aria-expanded", "false");

  const backdrop = document.createElement("div");
  backdrop.className = "eit-mobile-backdrop";
  backdrop.hidden = true;

  const sheet = document.createElement("div");
  sheet.className = "eit-mobile-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", t("eit.ariaController"));
  sheet.hidden = true;

  const header = document.createElement("div");
  header.className = "eit-mobile-sheet-header";

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "eit-mobile-back";
  backBtn.textContent = "←";
  backBtn.setAttribute("aria-label", "Back");

  const titleEl = document.createElement("div");
  titleEl.className = "eit-mobile-sheet-title";

  const collapseBtn = document.createElement("button");
  collapseBtn.type = "button";
  collapseBtn.className = "eit-mobile-collapse";
  collapseBtn.textContent = "▾";
  collapseBtn.setAttribute("aria-label", "Hide list");
  collapseBtn.hidden = true;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "eit-mobile-close";
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Close");

  const headerRight = document.createElement("div");
  headerRight.className = "eit-mobile-sheet-actions";
  headerRight.append(collapseBtn, closeBtn);

  header.append(backBtn, titleEl, headerRight);

  const body = document.createElement("div");
  body.className = "eit-mobile-sheet-body";

  const step1 = document.createElement("div");
  step1.className = "eit-mobile-step eit-mobile-step1";

  const step2 = document.createElement("div");
  step2.className = "eit-mobile-step eit-mobile-step2";
  step2.hidden = true;

  const numericSlot = document.createElement("div");
  numericSlot.className = "eit-mobile-numeric-slot";

  const listEl = document.createElement("div");
  listEl.className = "eit-mobile-list";
  listEl.setAttribute("role", "list");

  step2.appendChild(numericSlot);
  step2.appendChild(listEl);

  body.append(step1, step2);
  sheet.append(header, body);

  root.append(zoomBar, launcher, backdrop, sheet);
  document.body.appendChild(root);

  /** @type {'idle' | 'step1' | 'step2'} */
  let phase = "idle";
  /** @type {'property' | 'classification' | null} */
  let branch = null;
  let listHidden = false;
  let miniCollapsed = false;
  /** @type {'property' | 'classification'} */
  let miniBranch = "property";

  // iPad Safari: clicks can be flaky inside fixed overlays; bind a touch-friendly handler.
  const bindTap = (el, handler) => {
    if (!el) return;
    let lastTouchUpAt = 0;
    el.addEventListener("click", (e) => {
      if (lastTouchUpAt && (performance.now() - lastTouchUpAt) < 650) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      handler(e);
    });
    el.addEventListener("pointerup", (e) => {
      if (!e || (e.pointerType !== "touch" && e.pointerType !== "pen")) return;
      e.preventDefault();
      e.stopPropagation();
      lastTouchUpAt = performance.now();
      handler(e);
    }, { passive: false });
  };

  const syncZoomDisabled = () => {
    const getter = typeof window !== "undefined" && typeof window._uniplusGetUserScale === "function"
      ? window._uniplusGetUserScale
      : null;
    const s = getter ? getter() : 1;
    zoomOut.disabled = s <= 0.701;
    zoomIn.disabled = s >= 1.349;
  };

  const adjustZoom = (dir) => {
    if (typeof window !== "undefined" && typeof window._uniplusAdjustUserScale === "function") {
      window._uniplusAdjustUserScale(dir);
      syncZoomDisabled();
    }
  };

  function setLauncherMini(on) {
    miniCollapsed = Boolean(on);
    launcher.classList.toggle("eit-mobile-launcher-mini", miniCollapsed);
    if (miniCollapsed) {
      launcher.innerHTML = `<span class="eit-mobile-launcher-mini-icon" aria-hidden="true">▸</span>`;
    } else {
      syncLauncherLabel();
    }
  }

  function minimizeToMiniLauncher() {
    miniBranch = branch || "property";
    setLauncherMini(true);
    closeSheet({ toMini: true });
  }

  function setListHidden(hidden) {
    listHidden = Boolean(hidden);
    listEl.hidden = listHidden;
    collapseBtn.textContent = listHidden ? "▸" : "▾";
    collapseBtn.setAttribute("aria-label", listHidden ? "Show list" : "Hide list");
    sheet.classList.toggle("eit-mobile-list-hidden", listHidden);
    // If we’re not in Property (no mode/slider to show), collapse to header-only.
    const compact = listHidden && branch !== "property";
    sheet.classList.toggle("eit-mobile-compact", compact);
  }

  /** @type {string | null} */
  let lastLauncherPropLabel = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let launcherPingClearTimer = null;

  function flashLauncherAfterChange() {
    if (miniCollapsed) return;
    launcher.classList.remove("eit-mobile-launcher--ping");
    // Restart CSS animation when the same property is chosen again (e.g. unit cycle).
    void launcher.offsetWidth;
    launcher.classList.add("eit-mobile-launcher--ping");
    if (launcherPingClearTimer) window.clearTimeout(launcherPingClearTimer);
    launcherPingClearTimer = window.setTimeout(() => {
      launcher.classList.remove("eit-mobile-launcher--ping");
      launcherPingClearTimer = null;
    }, 720);
  }

  function syncLauncherLabel() {
    const snap = controller.getEitSnapshot();
    const cfg = controller.EIT_PROPERTY_CONFIG.find((c) => c.key === snap.property);
    const propPart = labelForProperty(cfg);
    const prev = lastLauncherPropLabel;
    lastLauncherPropLabel = propPart;
    const safe = escapeHtmlAttrish(propPart);
    launcher.innerHTML =
      `<span class="eit-mobile-launcher-prefix">View by</span>` +
      `<span class="eit-mobile-launcher-value"><span class="eit-mobile-launcher-value-text">${safe}</span></span>`;
    if (prev !== null && prev !== propPart) {
      flashLauncherAfterChange();
    }
  }

  function refreshStep2Rows() {
    listEl.innerHTML = "";
    const snap = controller.getEitSnapshot();

    if (branch === "property") {
      const props = controller.EIT_PROPERTY_CONFIG.filter((c) => c.group === "property");
      props.forEach((cfg) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "eit-mobile-list-row";
        row.setAttribute("role", "listitem");
        const inner = chipMarkupForPropertyKey(cfg.key) || labelForProperty(cfg);
        row.innerHTML = `<span class="eit-mobile-row-label">${inner}</span><span class="eit-mobile-row-check" aria-hidden="true">${snap.property === cfg.key ? "✓" : ""}</span>`;
        row.addEventListener("click", () => {
          const live = controller.getEitSnapshot();
          if (live.property === cfg.key && cfg.units && cfg.units.length > 1) {
            controller.cycleEitPropertyUnit(cfg.key);
          } else {
            controller.setEitProperty(cfg.key);
          }
          refreshStep2Rows();
          syncLauncherLabel();
        });
        listEl.appendChild(row);
      });
      return;
    }

    if (branch === "classification") {
      const props = controller.EIT_PROPERTY_CONFIG.filter((c) => c.group === "classification");
      props.forEach((cfg) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "eit-mobile-list-row";
        row.setAttribute("role", "listitem");
        row.innerHTML = `<span class="eit-mobile-row-label">${labelForProperty(cfg)}</span><span class="eit-mobile-row-check" aria-hidden="true">${snap.property === cfg.key ? "✓" : ""}</span>`;
        row.addEventListener("click", () => {
          controller.setEitProperty(cfg.key);
          closeSheet();
        });
        listEl.appendChild(row);
      });
      return;
    }

    // Tools (first20 / electron layout / S3 / reset) are shown on the top button bar under the hotbar.
  }

  // We previously re-parented the numeric range controls into the sheet.
  // Requirement change: keep numeric range slider on the main page (hotbar bar) at all times.
  function attachNumericChrome() {
    restoreEitMobileReparentedChrome();
    if (listEl.parentElement !== step2) step2.appendChild(listEl);
  }

  function detachNumericChrome() {
    restoreEitMobileReparentedChrome();
    if (listEl.parentElement !== step2) step2.appendChild(listEl);
  }

  function showStep1() {
    phase = "step1";
    branch = null;
    step1.hidden = false;
    step2.hidden = true;
    titleEl.textContent = t("eit.ariaController");
    backBtn.hidden = true;
    collapseBtn.hidden = true;
    detachNumericChrome();
    setListHidden(false);

    step1.innerHTML = "";
    const tiles = [
      { id: "property", label: t("eit.group.property"), icon: "◎" },
      { id: "classification", label: t("eit.group.classification"), icon: "▦" },
    ];
    tiles.forEach((tile) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "eit-mobile-tile";
      btn.innerHTML = `<span class="eit-mobile-tile-icon" aria-hidden="true">${tile.icon}</span><span class="eit-mobile-tile-label">${tile.label}</span>`;
      btn.addEventListener("click", () => {
        branch = /** @type {'property' | 'classification'} */ (tile.id);
        showStep2();
      });
      step1.appendChild(btn);
    });
  }

  function showStep2() {
    phase = "step2";
    step1.hidden = true;
    step2.hidden = false;
    backBtn.hidden = false;
    collapseBtn.hidden = false;
    setListHidden(false);

    if (branch === "property") {
      titleEl.textContent = t("eit.group.property");
      attachNumericChrome();
    } else {
      detachNumericChrome();
      if (branch === "classification") titleEl.textContent = t("eit.group.classification");
    }

    refreshStep2Rows();
  }

  function openSheet(startBranch = null) {
    root.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    sheet.hidden = false;
    // Some mobile browsers keep fixed layers "painted" even when hidden toggles rapidly.
    // Force display state to ensure the sheet can always be dismissed.
    backdrop.style.display = "block";
    sheet.style.display = "flex";
    backdrop.classList.remove("eit-mobile-backdrop--open");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        backdrop.classList.add("eit-mobile-backdrop--open");
      });
    });
    sheet.classList.remove("eit-mobile-sheet--enter");
    void sheet.offsetWidth;
    sheet.classList.add("eit-mobile-sheet--enter");
    launcher.setAttribute("aria-expanded", "true");
    setListHidden(false);
    if (startBranch) {
      branch = startBranch;
      showStep2();
    } else {
      showStep1();
    }
  }

  function closeSheet(opts = {}) {
    const { toMini = false } = opts || {};
    restoreEitMobileReparentedChrome();
    if (listEl.parentElement !== step2) {
      step2.appendChild(listEl);
    }
    setListHidden(false);
    phase = "idle";
    branch = null;
    step1.innerHTML = "";
    step2.hidden = true;
    backdrop.classList.remove("eit-mobile-backdrop--open");
    backdrop.hidden = true;
    sheet.hidden = true;
    backdrop.style.display = "none";
    sheet.style.display = "none";
    sheet.classList.remove("eit-mobile-sheet--enter");
    root.setAttribute("aria-hidden", "true");
    launcher.setAttribute("aria-expanded", "false");
    if (!toMini) setLauncherMini(false);
  }

  // Ensure initial hidden state is truly non-interactive.
  backdrop.style.display = "none";
  sheet.style.display = "none";

  bindTap(launcher, () => {
    if (!sheet.hidden) {
      closeSheet();
      return;
    }
    if (miniCollapsed) {
      const start = miniBranch;
      setLauncherMini(false);
      openSheet(start);
      return;
    }
    openSheet();
  });
  bindTap(backdrop, () => closeSheet());
  bindTap(closeBtn, () => closeSheet());
  bindTap(zoomOut, (e) => {
    e?.stopPropagation?.();
    adjustZoom(-1);
  });
  bindTap(zoomIn, (e) => {
    e?.stopPropagation?.();
    adjustZoom(1);
  });
  const onCollapse = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (phase !== "step2") return;
    // Always minimize the whole sheet into a tiny launcher (no blocking layer).
    minimizeToMiniLauncher();
  };
  bindTap(collapseBtn, onCollapse);
  bindTap(backBtn, () => {
    if (phase === "step2") showStep1();
    else closeSheet();
  });

  langUnsub = onLangChange(() => {
    sheet.setAttribute("aria-label", t("eit.ariaController"));
    syncLauncherLabel();
    if (!sheet.hidden) {
      if (phase === "step1") showStep1();
      else showStep2();
    }
  });

  syncLauncherLabel();
  syncZoomDisabled();
}

export function destroyEitMobileWizard() {
  if (langUnsub) {
    langUnsub();
    langUnsub = null;
  }
  restoreEitMobileReparentedChrome();
  const root = document.getElementById("eit-mobile-root");
  if (root) root.remove();
}

export function syncEitMobileMount(tableContainer, controller) {
  if (!tableContainer || !controller) return;

  const eitRoot = document.getElementById("eit-controller");
  const onTableMobile =
    matchesEitMobile() && isPeriodicTablePageActive(tableContainer);

  if (onTableMobile) {
    document.body.classList.add("eit-mobile");
    mountEitMobileWizard(tableContainer, controller);
  } else {
    document.body.classList.remove("eit-mobile");
    destroyEitMobileWizard();
  }

  // Desktop / fine-pointer wide layout: bar belongs inside `#periodic-table`. After narrowing
  // then widening, it can remain on `document.body` until the next init — reparent on sync.
  // Stray body mounts while `body.eit-mobile` is off are hidden via `grid.css` (no JS sleep).
  if (
    eitRoot &&
    eitRoot.parentElement === document.body &&
    typeof controller.ensureEITController === "function" &&
    !matchesEitMobile()
  ) {
    controller.ensureEITController(tableContainer);
  }
}
