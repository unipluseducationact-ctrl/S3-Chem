/**
 * Shared UI helpers for Ch.5 embedded worksheets (vanilla, no build step).
 */
(function (global) {
  "use strict";

  const ZH_LANGS = new Set(["zh", "zh-hant", "zh-tw", "zh-hk"]);

  function readLangFromQuery(defaultLang) {
    const q = (new URLSearchParams(window.location.search).get("lang") || "").toLowerCase();
    if (q === "en") return "en";
    if (ZH_LANGS.has(q)) return "zh";
    return defaultLang === "zh" ? "zh" : "en";
  }

  function setLangInQuery(lang) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang === "en" ? "en" : "zh");
      window.history.replaceState(null, "", url);
    } catch {
      /* ignore */
    }
  }

  function bindOptionGroup(container, options) {
    if (!container) return;
    const hiddenInput = options && options.hiddenInput;
    const onChange = options && options.onChange;

    container.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.value;
        container.querySelectorAll(".option-btn").forEach((b) => {
          b.classList.toggle("active", b === btn);
        });
        if (hiddenInput) hiddenInput.value = value;
        if (onChange) onChange(value, btn);
      });
    });

    if (hiddenInput) {
      hiddenInput.addEventListener("input", () => {
        const val = String(hiddenInput.value);
        container.querySelectorAll(".option-btn").forEach((b) => {
          b.classList.toggle("active", b.dataset.value === val);
        });
      });
    }
  }

  function bindPreviewTabs(tabSelector, options) {
    const tabs = Array.from(document.querySelectorAll(tabSelector));
    const panels = (options && options.panels) || {};
    const placeholder = options && options.placeholder;
    const hasContent = (options && options.hasContent) || (() => true);
    const onChange = options && options.onChange;
    let currentMode = (options && options.defaultMode) || "print";

    function render() {
      const has = hasContent();
      if (placeholder) placeholder.hidden = has;
      Object.keys(panels).forEach((mode) => {
        const el = panels[mode];
        if (el) el.hidden = !has || currentMode !== mode;
      });
      tabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.mode === currentMode);
      });
      if (onChange) onChange(currentMode);
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        currentMode = tab.dataset.mode || "print";
        render();
      });
    });

    return {
      setMode(mode) {
        currentMode = mode;
        render();
      },
      getMode() {
        return currentMode;
      },
      refresh: render,
    };
  }

  function setExportButtonsEnabled(ids, enabled) {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = !enabled;
    });
  }

  /** True when a question has at least two choices and a valid correct_index. */
  function hasChoiceOptions(q) {
    if (!q || !Array.isArray(q.options_en) || q.options_en.length < 2) return false;
    const ci = q.correct_index;
    return ci != null && ci >= 0 && ci < q.options_en.length;
  }

  /**
   * Ensure qtype matches data: MCQ without real options becomes short answer.
   * Call after loading from PDF bank or procedural builders.
   */
  function normalizeQuestion(q) {
    if (!q) return q;
    const out = { ...q };
    if (out.qtype === "mcq" && !hasChoiceOptions(out)) {
      out.qtype = "short";
      out.options_en = null;
      out.options_zh = null;
      out.correct_index = null;
    }
    return out;
  }

  global.Ch5EmbedUI = {
    readLangFromQuery,
    setLangInQuery,
    bindOptionGroup,
    bindPreviewTabs,
    setExportButtonsEnabled,
    hasChoiceOptions,
    normalizeQuestion,
  };
})(typeof window !== "undefined" ? window : globalThis);