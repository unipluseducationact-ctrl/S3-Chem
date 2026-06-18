// =============================================================================
// Page Controller - Main page switching and global nav state
// =============================================================================

import { onLangChange } from "./langController.js";

export function initPageController(options = {}) {
  const {
    onTablePageShown,
    onToolsPageShown,
    onLabPageShown,
    onWorksheetPageShown,
    onSettingsPageShown,
    onFlashcardsPageShown,
  } = options;

  const mainContainer = document.getElementById("main-container");
  const blankPage1 = document.getElementById("blank-page-1");
  const interactiveLabPage = document.getElementById("interactive-lab-page");
  const blankPage2 = document.getElementById("blank-page-2");
  const notesPage = document.getElementById("notes-page");
  const flashcardsPage = document.getElementById("flashcards-page");
  const settingsPage = document.getElementById("settings-page");
  const ionsPage = document.getElementById("ions-page");

  let currentPage = "table";

  const pages = {
    table: () => {
      if (mainContainer) mainContainer.style.display = "";
    },
    notes: () => {
      if (notesPage) notesPage.classList.add("active");
    },
    blank1: () => {
      if (blankPage1) blankPage1.classList.add("active");
    },
    lab: () => {
      if (interactiveLabPage) interactiveLabPage.classList.add("active");
    },
    blank2: () => {
      if (blankPage2) blankPage2.classList.add("active");
    },
    flashcards: () => {
      if (flashcardsPage) flashcardsPage.classList.add("active");
    },
    settings: () => {
      if (settingsPage) settingsPage.classList.add("active");
    },
  };

  function hideAllPages() {
    if (mainContainer) mainContainer.style.display = "none";
    if (blankPage1) blankPage1.classList.remove("active");
    if (interactiveLabPage) interactiveLabPage.classList.remove("active");
    if (blankPage2) blankPage2.classList.remove("active");
    if (notesPage) notesPage.classList.remove("active");
    if (flashcardsPage) flashcardsPage.classList.remove("active");
    if (settingsPage) settingsPage.classList.remove("active");
    if (ionsPage) ionsPage.classList.remove("active");
  }

  function showPage(page) {
    if (!pages[page] || currentPage === page) return;

    hideAllPages();
    pages[page]();
    currentPage = page;

    if (page === "settings") {
      requestAnimationFrame(() => {
        const sp = document.getElementById("settings-page");
        const shell = document.getElementById("page-settings");
        if (sp) sp.scrollTop = 0;
        if (shell) shell.scrollTop = 0;
      });
    }

    if (page === "table" && typeof onTablePageShown === "function") {
      requestAnimationFrame(onTablePageShown);
    }

    if (page === "blank1" && typeof onToolsPageShown === "function") {
      onToolsPageShown();
    }

    if (page === "lab" && typeof onLabPageShown === "function") {
      onLabPageShown();
    }

    if (page === "blank2" && typeof onWorksheetPageShown === "function") {
      onWorksheetPageShown();
    }

    if (page === "settings" && typeof onSettingsPageShown === "function") {
      onSettingsPageShown();
    }

    if (page === "flashcards" && typeof onFlashcardsPageShown === "function") {
      onFlashcardsPageShown();
    }
  }

  const globalNavBtns = document.querySelectorAll(".nav-pill-btn, .nav-logo-link, .nav-brand");
  const navPageMap = {
    table: "table",
    notes: "notes",
    tools: "blank1",
    lab: "lab",
    worksheet: "blank2",
    flashcards: "flashcards",
    summary: "settings",
  };

  function updateGlobalNavActive(activePage) {
    globalNavBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === activePage);
    });
    moveSliderTo(activePage);
  }

  // ── Sliding pill indicator ──
  const pillContainer = document.querySelector(".global-nav-pill");
  const pillBtns = pillContainer ? pillContainer.querySelectorAll(".nav-pill-btn") : [];
  let slider = null;
  let sliderRefreshFrame = null;

  function positionSlider(activeBtn, { immediate = false } = {}) {
    if (!slider || !pillContainer || !activeBtn) return;

    const containerRect = pillContainer.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    if (immediate) slider.style.transition = "none";
    slider.style.width = `${btnRect.width}px`;
    slider.style.transform = `translateX(${btnRect.left - containerRect.left}px)`;

    if (immediate) {
      requestAnimationFrame(() => {
        if (slider) slider.style.transition = "";
      });
    }
  }

  function refreshSliderPosition(immediate = false) {
    if (!pillContainer) return;
    const activeBtn = pillContainer.querySelector(".nav-pill-btn.active");
    if (activeBtn) positionSlider(activeBtn, { immediate });
  }

  function scheduleSliderRefresh() {
    if (sliderRefreshFrame !== null) return;

    sliderRefreshFrame = requestAnimationFrame(() => {
      sliderRefreshFrame = null;
      refreshSliderPosition(true);
    });
  }

  function createSlider() {
    if (!pillContainer || pillBtns.length === 0) return;
    slider = document.createElement("div");
    slider.className = "nav-pill-slider";
    pillContainer.appendChild(slider);
    refreshSliderPosition(true);
  }

  function moveSliderTo(page) {
    const targetBtn = pillContainer.querySelector(`.nav-pill-btn[data-page="${page}"]`);
    positionSlider(targetBtn);
  }

  createSlider();

  // Recalculate slider position on resize
  window.addEventListener("resize", scheduleSliderRefresh);

  // Recalculate after language change (button text width changes)
  onLangChange(() => requestAnimationFrame(() => refreshSliderPosition(true)));

  globalNavBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      const target = navPageMap[page];
      if (!target) return;
      showPage(target);
      updateGlobalNavActive(page);
    });
  });

  updateGlobalNavActive("table");

  return {
    showPage,
    updateGlobalNavActive,
    getCurrentPage: () => currentPage,
  };
}
