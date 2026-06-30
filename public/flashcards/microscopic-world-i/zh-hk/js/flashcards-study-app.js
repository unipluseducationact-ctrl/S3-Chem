import { FLASHCARD_TAGS, FLASHCARD_DECK } from "./flashcardData.js";
import { FlashcardSession } from "./flashcardSession.js";

const CHAPTER_TITLE = "微觀世界 I";
const CHAPTER_SUBTITLE = "HKDSE 化學 · 定義與公式";

const session = new FlashcardSession(FLASHCARD_DECK);

const els = {
  tagRow: document.getElementById("tag-row"),
  filterRow: document.getElementById("filter-row"),
  modeToggle: document.getElementById("mode-toggle"),
  roundBadge: document.getElementById("round-badge"),
  progressText: document.getElementById("progress-text"),
  studyPanel: document.getElementById("study-panel"),
  summaryPanel: document.getElementById("summary-panel"),
  cardContainer: document.getElementById("card-container"),
  cardInner: document.getElementById("card-inner"),
  subtopicPill: document.getElementById("subtopic-pill"),
  cardCode: document.getElementById("card-code"),
  cardFront: document.getElementById("card-front-text"),
  cardBack: document.getElementById("card-back-text"),
  cardImage: document.getElementById("card-back-img"),
  ratingHint: document.getElementById("rating-hint"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  btnAgain: document.getElementById("btn-again"),
  btnFlip: document.getElementById("btn-flip"),
  btnGotIt: document.getElementById("btn-got-it"),
  summaryTitle: document.getElementById("summary-title"),
  summaryStats: document.getElementById("summary-stats"),
  summaryKeep: document.getElementById("summary-keep"),
  summaryConfident: document.getElementById("summary-confident"),
  btnNextRound: document.getElementById("btn-next-round"),
  btnRestart: document.getElementById("btn-restart"),
};

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTags() {
  els.tagRow.innerHTML = FLASHCARD_TAGS.map(
    (tag) =>
      `<span class="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-bold text-body-sm">#${escapeHtml(tag)}</span>`,
  ).join("");
}

function renderFilters() {
  const subtopics = session.getSubtopics();
  const chips = [
    `<button type="button" class="filter-chip active px-3 py-1.5 rounded-full border border-outline-variant/60 text-on-surface-variant font-label-bold" data-filter="">全部</button>`,
    ...subtopics.map(
      (st) =>
        `<button type="button" class="filter-chip px-3 py-1.5 rounded-full border border-outline-variant/60 text-on-surface-variant font-label-bold" data-filter="${escapeHtml(st)}">${escapeHtml(st)}</button>`,
    ),
  ];
  els.filterRow.innerHTML = chips.join("");
  els.filterRow.querySelectorAll(".filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      els.filterRow
        .querySelectorAll(".filter-chip")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      session.setFilter(btn.dataset.filter || null);
      render();
    });
  });
}

function renderModeToggle() {
  els.modeToggle.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === session.mode);
  });
}

function renderCard() {
  const card = session.getCurrentCard();
  if (!card) {
    els.cardFront.textContent = session.sessionComplete
      ? "本輪所有卡片已掌握！"
      : "沒有可顯示的卡片";
    els.cardBack.innerHTML = "";
    els.cardImage.classList.add("hidden");
    return;
  }

  els.subtopicPill.textContent = card.subtopic;
  els.cardCode.textContent = `Card ${card.id}`;
  document.querySelector(".subtopic-pill-back").textContent = card.subtopic;
  document.querySelector(".card-code-back").textContent = `Card ${card.id}`;
  els.cardFront.innerHTML = card.front;
  els.cardBack.innerHTML = card.back;
  applyCardTextSize(els.cardFront, card.front, true);
  if (card.backCompact) {
    els.cardBack.classList.add("card-text-compact");
  } else {
    applyCardTextSize(els.cardBack, card.back, true);
  }

  if (card.image) {
    els.cardImage.src = card.image.replace(/^\.\//, "");
    els.cardImage.alt = card.imageAlt || "";
    els.cardImage.classList.remove("hidden");
  } else {
    els.cardImage.classList.add("hidden");
    els.cardImage.removeAttribute("src");
  }

  els.cardInner.classList.toggle("card-flipped", session.flipped);
  els.ratingHint.textContent = session.flipped
    ? "← Again · Got it → 或按 1 / 2"
    : "點擊卡片、空白鍵或 FLIP 顯示答案";
  els.ratingHint.classList.toggle("text-tertiary", !session.flipped);

  const atStart = session.queueIndex <= 0;
  const atEnd = session.queueIndex >= session.roundQueue.length - 1;
  els.btnPrev.disabled = atStart;
  els.btnNext.disabled = session.phase !== "study" || (atEnd && !session.flipped);
  els.btnAgain.disabled = !session.flipped;
  els.btnGotIt.disabled = !session.flipped;
}

function renderStudyChrome() {
  const total = session.roundQueue.length || 0;
  const pos = total ? session.queueIndex + 1 : 0;
  els.progressText.textContent = `${pos} / ${total}`;
  els.roundBadge.textContent = `Round ${session.roundNumber} · ${session.getRoundCardCount()} cards`;
  renderModeToggle();
  renderCard();
}

function renderSummary() {
  const { keep, confident } = session.getSummaryLists();
  if (session.sessionComplete) {
    els.summaryTitle.textContent = "Deck complete";
    els.summaryStats.textContent =
      "所有卡片已達掌握權重 — 可重新開始或切換篩選。";
  } else {
    els.summaryTitle.textContent = `Round ${session.roundNumber} complete`;
    els.summaryStats.textContent = `${session.getRoundCardCount()} cards this round`;
  }

  const li = (c) =>
    `<li class="text-body-sm"><span class="font-label-code text-on-surface-variant">#${c.id}</span> ${escapeHtml(c.subtopic)} — ${stripHtml(c.front).slice(0, 48)}…</li>`;

  els.summaryKeep.innerHTML = keep.length
    ? keep.map(li).join("")
    : "<li class=\"text-on-surface-variant text-body-sm\">—</li>";
  els.summaryConfident.innerHTML = confident.length
    ? confident.map(li).join("")
    : "<li class=\"text-on-surface-variant text-body-sm\">—</li>";

  els.btnNextRound.textContent = session.sessionComplete
    ? "Restart deck"
    : "Next round →";
}

function stripHtml(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || "";
}

function applyCardTextSize(el, text, isHtml = false) {
  el.classList.remove("card-text-long", "card-text-compact");
  const plain = (isHtml ? stripHtml(text) : text).trim();
  const lines = plain.split("\n").filter(Boolean).length;
  const len = plain.length;
  if (lines >= 5 || len > 220) {
    el.classList.add("card-text-compact");
  } else if (lines >= 4 || len > 130) {
    el.classList.add("card-text-long");
  }
}

function render() {
  const studying = session.phase === "study" && !session.sessionComplete;
  els.studyPanel.classList.toggle("hidden", !studying);
  els.summaryPanel.classList.toggle("hidden", studying);

  if (studying) {
    renderStudyChrome();
  } else {
    renderSummary();
  }
}

function initModeToggle() {
  els.modeToggle.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      session.setMode(btn.dataset.mode);
      render();
    });
  });
}

function initControls() {
  els.btnFlip.addEventListener("click", () => {
    session.flip();
    renderCard();
  });
  els.cardContainer.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    session.flip();
    renderCard();
  });
  els.btnPrev.addEventListener("click", () => {
    session.prev();
    renderCard();
  });
  els.btnNext.addEventListener("click", () => {
    session.rateNext();
    render();
  });
  els.btnAgain.addEventListener("click", () => {
    if (session.rateAgain()) render();
  });
  els.btnGotIt.addEventListener("click", () => {
    if (session.rateGotIt()) render();
  });
  els.btnNextRound.addEventListener("click", () => {
    if (session.sessionComplete) session.resetSession();
    else session.nextRound();
    render();
  });
  els.btnRestart.addEventListener("click", () => {
    session.resetSession();
    render();
  });
}

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select")) return;
    if (session.phase !== "study") return;

    if (e.code === "Space") {
      e.preventDefault();
      session.flip();
      renderCard();
      return;
    }

    if (!session.flipped) {
      if (e.key === "ArrowLeft") {
        session.prev();
        renderCard();
      } else if (e.key === "ArrowRight") {
        session.nextNavigate();
        renderCard();
      }
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "1") {
      if (session.rateAgain()) render();
    } else if (e.key === "ArrowRight" || e.key === "2") {
      if (session.rateGotIt()) render();
    }
  });
}

function initTabReset() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      window.parent.postMessage({ type: "s3bio-flashcards-reset" }, "*");
      session.resetSession();
      render();
    }
  });
  window.addEventListener("message", (e) => {
    if (e.data?.type === "s3bio-flashcards-reset") {
      session.resetSession();
      render();
    }
  });
}

function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  const dots = Array.from({ length: 40 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.0004,
    vy: (Math.random() - 0.5) * 0.0004,
  }));

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(0, 78, 159, 0.12)";
    for (const d of dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > 1) d.vx *= -1;
      if (d.y < 0 || d.y > 1) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  frame();
}

document.getElementById("chapter-title").textContent = CHAPTER_TITLE;
document.getElementById("chapter-subtitle").textContent = CHAPTER_SUBTITLE;

renderTags();
renderFilters();
initModeToggle();
initControls();
initKeyboard();
initTabReset();
initParticles();
render();
