/**
 * Notes + Summary: optional on-screen drawing layer (pen / highlighter).
 * One isolated instance per `[data-chapter-draw-root]` mount.
 */

const HIGHLIGHTER_WIDTH_PX = 14;
/** Match `.blank-page { padding-top }` in base.css */
const DRAW_VIEW_TOP_PX = 60;
const DEFAULT_HIGHLIGHTER_ALPHA = 0.22;

/**
 * @param {HTMLElement} mount
 */
function createDrawOverlay(mount) {
  const page = mount.closest(".blank-page");
  if (!page || !mount) return;

  mount.innerHTML = `
    <canvas class="chapter-draw-canvas" aria-hidden="true"></canvas>
    <button type="button" class="chapter-draw-fab" aria-pressed="false" aria-label="Draw on screen" title="Draw">✎</button>
    <div class="chapter-draw-toolbar" role="toolbar" aria-label="Drawing tools" hidden>
      <div class="chapter-draw-toolbar-row">
        <button type="button" class="chapter-draw-tool is-active" data-draw-tool="pen" aria-pressed="true">Pen</button>
        <button type="button" class="chapter-draw-tool" data-draw-tool="highlighter" aria-pressed="false">Highlighter</button>
      </div>
      <label class="chapter-draw-width-label">Width
        <input type="range" class="chapter-draw-width" min="1" max="28" value="3" />
      </label>
      <div class="chapter-draw-colors" aria-label="Colors">
        <button type="button" class="chapter-draw-color-dot active" data-color="#0f172a" data-highlighter-alpha="0.14" style="--dot:#0f172a" aria-label="Black"></button>
        <button type="button" class="chapter-draw-color-dot" data-color="#dc2626" data-highlighter-alpha="0.22" style="--dot:#dc2626" aria-label="Red"></button>
        <button type="button" class="chapter-draw-color-dot" data-color="#eab308" data-highlighter-alpha="0.38" style="--dot:#eab308" aria-label="Yellow"></button>
        <button type="button" class="chapter-draw-color-dot" data-color="#22c55e" data-highlighter-alpha="0.32" style="--dot:#22c55e" aria-label="Green"></button>
        <button type="button" class="chapter-draw-color-dot" data-color="#f97316" data-highlighter-alpha="0.3" style="--dot:#f97316" aria-label="Orange"></button>
        <button type="button" class="chapter-draw-color-dot" data-color="#3b82f6" data-highlighter-alpha="0.28" style="--dot:#3b82f6" aria-label="Blue"></button>
        <button type="button" class="chapter-draw-color-dot" data-color="#ec4899" data-highlighter-alpha="0.28" style="--dot:#ec4899" aria-label="Pink"></button>
        <button type="button" class="chapter-draw-color-dot" data-color="#ffffff" data-highlighter-alpha="0.18" style="--dot:#ffffff" aria-label="White"></button>
      </div>
      <div class="chapter-draw-toolbar-row chapter-draw-toolbar-actions">
        <button type="button" class="chapter-draw-clear">Clear</button>
        <button type="button" class="chapter-draw-done">Done</button>
      </div>
    </div>
  `;

  const canvas = /** @type {HTMLCanvasElement} */ (mount.querySelector(".chapter-draw-canvas"));
  const fab = /** @type {HTMLButtonElement} */ (mount.querySelector(".chapter-draw-fab"));
  const toolbar = /** @type {HTMLElement} */ (mount.querySelector(".chapter-draw-toolbar"));
  const widthInput = /** @type {HTMLInputElement} */ (mount.querySelector(".chapter-draw-width"));
  const clearBtn = mount.querySelector(".chapter-draw-clear");
  const doneBtn = mount.querySelector(".chapter-draw-done");
  const drawCtx = canvas.getContext("2d");
  if (!drawCtx) return;

  let drawActive = false;
  let drawColor = "#0f172a";
  let drawLineWidth = 3;
  let drawTool = "pen";
  let drawHighlighterAlpha = 0.14;
  /** @type {{ x: number; y: number } | null} */
  let lastPt = null;
  let drawing = false;
  /** @type {number | null} */
  let activePointerId = null;

  function syncDrawModeClass() {
    page.classList.toggle("chapter-draw-active", drawActive);
    fab.setAttribute("aria-pressed", drawActive ? "true" : "false");
  }

  function readHighlighterAlphaFromDot(el) {
    const raw = /** @type {HTMLButtonElement} */ (el).dataset.highlighterAlpha;
    if (raw === undefined || raw === "") return DEFAULT_HIGHLIGHTER_ALPHA;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return DEFAULT_HIGHLIGHTER_ALPHA;
    return Math.min(1, Math.max(0.04, n));
  }

  function syncHighlighterAlphaFromActiveDot() {
    const active = mount.querySelector(".chapter-draw-color-dot.active");
    if (active instanceof HTMLElement) {
      drawHighlighterAlpha = readHighlighterAlphaFromDot(active);
    }
  }

  function setDrawTool(t) {
    drawTool = t === "highlighter" ? "highlighter" : "pen";
    mount.querySelectorAll(".chapter-draw-tool").forEach((btn) => {
      const b = /** @type {HTMLButtonElement} */ (btn);
      const on = b.dataset.drawTool === drawTool;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (drawTool === "highlighter") {
      widthInput.disabled = true;
      syncHighlighterAlphaFromActiveDot();
    } else {
      widthInput.disabled = false;
    }
  }

  function getCanvasPointFromClient(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }

  function applyDrawStyle() {
    drawCtx.strokeStyle = drawColor;
    drawCtx.globalAlpha = drawTool === "highlighter" ? drawHighlighterAlpha : 1;
    drawCtx.lineWidth = drawTool === "highlighter" ? HIGHLIGHTER_WIDTH_PX : drawLineWidth;
    drawCtx.lineCap = "round";
    drawCtx.lineJoin = "round";
    drawCtx.globalCompositeOperation = "source-over";
  }

  function drawTo(clientX, clientY, { start = false } = {}) {
    const pt = getCanvasPointFromClient(clientX, clientY);
    if (start || !lastPt) {
      drawCtx.beginPath();
      drawCtx.moveTo(pt.x, pt.y);
    } else {
      drawCtx.lineTo(pt.x, pt.y);
      drawCtx.stroke();
      drawCtx.beginPath();
      drawCtx.moveTo(pt.x, pt.y);
    }
    lastPt = pt;
  }

  function resizeDrawCanvas({ preserve = true } = {}) {
    const drawDpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = window.innerWidth;
    const cssH = Math.max(1, window.innerHeight - DRAW_VIEW_TOP_PX);
    const w = Math.floor(cssW * drawDpr);
    const h = Math.floor(cssH * drawDpr);
    let img = null;
    if (preserve && canvas.width > 0 && canvas.height > 0) {
      try {
        img = drawCtx.getImageData(0, 0, canvas.width, canvas.height);
      } catch {
        img = null;
      }
    }
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    if (img && img.width === w && img.height === h) {
      try {
        drawCtx.putImageData(img, 0, 0);
      } catch {
        /* ignore */
      }
    }
  }

  function setCanvasVisible(on) {
    canvas.classList.toggle("chapter-draw-canvas--on", on);
    canvas.setAttribute("aria-hidden", on ? "false" : "true");
  }

  function toggleDraw() {
    drawActive = !drawActive;
    toolbar.hidden = !drawActive;
    setCanvasVisible(drawActive);
    syncDrawModeClass();
    if (drawActive) {
      const preserve = canvas.width > 0 && canvas.height > 0;
      resizeDrawCanvas({ preserve });
    } else {
      lastPt = null;
      drawing = false;
      activePointerId = null;
    }
  }

  function setDrawColor(c, el) {
    drawColor = c;
    drawHighlighterAlpha = readHighlighterAlphaFromDot(el);
    mount.querySelectorAll(".chapter-draw-color-dot").forEach((d) => d.classList.remove("active"));
    el.classList.add("active");
  }

  function clearDraw() {
    drawCtx.save();
    drawCtx.setTransform(1, 0, 0, 1, 0, 0);
    drawCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawCtx.restore();
  }

  function exitDrawCompletely() {
    drawActive = false;
    toolbar.hidden = true;
    setCanvasVisible(false);
    syncDrawModeClass();
    lastPt = null;
    drawing = false;
    activePointerId = null;
  }

  function startStrokeAt(clientX, clientY) {
    applyDrawStyle();
    drawing = true;
    lastPt = null;
    drawTo(clientX, clientY, { start: true });
  }

  function continueStrokeAt(clientX, clientY) {
    if (!drawing) return;
    drawTo(clientX, clientY, { start: false });
  }

  function endStroke() {
    drawing = false;
    lastPt = null;
    activePointerId = null;
  }

  fab.addEventListener("click", (e) => {
    e.preventDefault();
    toggleDraw();
  });

  mount.querySelectorAll(".chapter-draw-tool").forEach((btn) => {
    btn.addEventListener("click", () => {
      setDrawTool(/** @type {HTMLButtonElement} */ (btn).dataset.drawTool || "pen");
    });
  });

  widthInput.addEventListener("input", () => {
    const n = Number(widthInput.value);
    drawLineWidth = Number.isFinite(n) ? n : 3;
  });

  mount.querySelectorAll(".chapter-draw-color-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      const c = /** @type {HTMLButtonElement} */ (dot).dataset.color || "#0f172a";
      setDrawColor(c, dot);
    });
  });

  clearBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    clearDraw();
  });

  doneBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    exitDrawCompletely();
  });

  function onSelectStart(e) {
    if (drawActive && page.classList.contains("active")) {
      e.preventDefault();
    }
  }

  document.addEventListener("selectstart", onSelectStart, true);

  if (window.PointerEvent) {
    canvas.addEventListener(
      "pointerdown",
      (e) => {
        if (!drawActive || e.button !== 0) return;
        e.preventDefault();
        activePointerId = e.pointerId;
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        startStrokeAt(e.clientX, e.clientY);
      },
      { passive: false },
    );

    canvas.addEventListener(
      "pointermove",
      (e) => {
        if (!drawActive || !drawing || e.pointerId !== activePointerId) return;
        e.preventDefault();
        continueStrokeAt(e.clientX, e.clientY);
      },
      { passive: false },
    );

    const onPointerEnd = (e) => {
      if (e.pointerId !== activePointerId) return;
      endStroke();
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    canvas.addEventListener("pointerup", onPointerEnd);
    canvas.addEventListener("pointercancel", onPointerEnd);
  } else {
    canvas.addEventListener(
      "mousedown",
      (e) => {
        if (!drawActive || e.button !== 0) return;
        e.preventDefault();
        startStrokeAt(e.clientX, e.clientY);
      },
      { passive: false },
    );
    canvas.addEventListener(
      "mousemove",
      (e) => {
        if (!drawActive || !drawing) return;
        e.preventDefault();
        continueStrokeAt(e.clientX, e.clientY);
      },
      { passive: false },
    );
    window.addEventListener("mouseup", () => {
      if (!drawActive) return;
      endStroke();
    });

    canvas.addEventListener(
      "touchstart",
      (e) => {
        if (!drawActive || !e.changedTouches[0]) return;
        e.preventDefault();
        const t = e.changedTouches[0];
        startStrokeAt(t.clientX, t.clientY);
      },
      { passive: false },
    );
    canvas.addEventListener(
      "touchmove",
      (e) => {
        if (!drawActive || !drawing || !e.changedTouches[0]) return;
        e.preventDefault();
        const t = e.changedTouches[0];
        continueStrokeAt(t.clientX, t.clientY);
      },
      { passive: false },
    );
    canvas.addEventListener("touchend", () => {
      if (!drawActive) return;
      endStroke();
    });
    canvas.addEventListener("touchcancel", () => {
      if (!drawActive) return;
      endStroke();
    });
    canvas.addEventListener("mouseleave", () => {
      if (!drawActive) return;
      endStroke();
    });
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (!drawActive) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resizeDrawCanvas({ preserve: true }), 100);
  });

  const mo = new MutationObserver(() => {
    if (!page.classList.contains("active")) {
      exitDrawCompletely();
    }
  });
  mo.observe(page, { attributes: true, attributeFilter: ["class"] });
}

export function initChapterDrawOverlays() {
  document.querySelectorAll("[data-chapter-draw-root]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.dataset.chapterDrawInited === "1") return;
    el.dataset.chapterDrawInited = "1";
    createDrawOverlay(el);
  });
}
