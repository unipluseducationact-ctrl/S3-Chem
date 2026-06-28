(function () {
  "use strict";

  const F = window.BondingQuestionFilters;

  const QUESTION_TYPES = [
    { id: "ionic-bond", label_en: "Ionic bond", label_zh: "離子鍵", subtitle_en: "Electron transfer, ionic compounds", subtitle_zh: "電子轉移、離子化合物" },
    { id: "covalent-bond", label_en: "Covalent bond", label_zh: "共價鍵", subtitle_en: "Shared electrons, molecules", subtitle_zh: "共用電子、分子" },
  ];

  const DIFFICULTIES = [
    { id: "easy", label_en: "Easy", label_zh: "易" },
    { id: "medium", label_en: "Medium", label_zh: "中" },
    { id: "hard", label_en: "Hard", label_zh: "難" },
  ];

  const TYPE_LABELS = {};

  const UI = {
    en: {
      appTitle: "Ionic and covalent bond",
      appSubtitle: "Create ionic and covalent bonding worksheets for your class",
      lblTypes: "Question Types",
      lblCount: "Number of Questions",
      lblDiff: "Difficulty",
      lblLang: "Language",
      lblSeed: "Random seed (optional)",
      btnGenerate: "Generate Worksheet",
      trustText: "Questions are drawn from Topic 02 Overall 1 (Unit Education), pages 58–125 — ionic and covalent bonding only.",
      tabPrint: "Print",
      tabPractice: "Practice",
      tabAnswerKey: "Answer Key",
      btnExportPrint: "Print",
      btnToday: "Today",
      btnDocQ: "Word — Questions",
      btnDocA: "Word — Answers",
      txtPracticeHint: "First wrong: hint only. Second wrong: model answer.",
      placeholder: "Click 'Generate Worksheet' to create practice problems",
      quizCheck: "Check answer",
      empty: "Generate questions first.",
      btnSummary: "Session summary",
      summaryTitle: "Summary",
      summaryScoreLabel: "Score (correct / total)",
      summaryFirstTry: "Correct on first attempt",
      summaryWrongTitle: "Wrong twice — review these (Q no. & type)",
      summaryNoneWrong: "None — no questions failed after two attempts.",
      summaryIncomplete: "Still in progress (not yet correct)",
      alertNoQuiz: "Generate questions first.",
      summaryByTypeTitle: "Correct rate by question type",
      summaryByTypeColType: "Type",
      summaryByTypeColFraction: "Correct / in type",
      summaryByTypeColRate: "Rate",
      summaryByTypeColFirst: "First-try / in type",
      revTitle: "Comments & revision suggestions",
      revBandExcellent: "Overall accuracy is very high. Keep mixing question types for exam readiness.",
      revBandGood: "Good result. Use the table to target weaker types with another short round.",
      revBandFair: "Mixed performance: re-read Topic 2 notes on weaker areas, then regenerate.",
      revBandLow: "Several bonding concepts need consolidation — ionic transfer, covalent sharing, and compound formulae.",
      revWeakOne: "Prioritise revision on {type} — scored {c}/{t} ({pct}%).",
      revStrongOne: "Strength: every {type} item correct ({n} questions).",
      revTwoStrike: "Questions missed twice: study model answers, then regenerate those types.",
      revIncomplete: "Finish in-progress questions for a fair summary next time.",
      revFirstTryLow: "Many items needed two attempts. Read each stem carefully before answering.",
      revBalanced: "Errors spread across types — continue balanced practice.",
    },
    zh: {
      appTitle: "離子鍵與共價鍵",
      appSubtitle: "為你的班別建立離子鍵與共價鍵工作紙",
      lblTypes: "題型",
      lblCount: "題目數量",
      lblDiff: "難度",
      lblLang: "語言",
      lblSeed: "隨機種子（可留空）",
      btnGenerate: "產生工作紙",
      trustText: "題目來自 Topic 02 Overall 1（薈進教育）第 58–125 頁 — 僅限離子鍵與共價鍵。",
      tabPrint: "列印",
      tabPractice: "練習",
      tabAnswerKey: "答案",
      btnExportPrint: "列印",
      btnToday: "今天",
      btnDocQ: "Word — 試題",
      btnDocA: "Word — 答案",
      txtPracticeHint: "第一次答錯只顯示提示；第二次答錯顯示參考答案。",
      placeholder: "按「產生工作紙」以建立練習題目",
      quizCheck: "檢查答案",
      empty: "請先按「產生工作紙」。",
      btnSummary: "學習摘要",
      summaryTitle: "摘要",
      summaryScoreLabel: "得分（答對／總題數）",
      summaryFirstTry: "首次即答對",
      summaryWrongTitle: "兩次皆錯 — 需重溫（題號與題型）",
      summaryNoneWrong: "沒有此類題目。",
      summaryIncomplete: "尚未答對（進行中）",
      alertNoQuiz: "請先產生題目。",
      summaryByTypeTitle: "各題型答對率",
      summaryByTypeColType: "題型",
      summaryByTypeColFraction: "答對／該題型題數",
      summaryByTypeColRate: "答對率",
      summaryByTypeColFirst: "首次即對／該題型題數",
      revTitle: "評語與溫習建議",
      revBandExcellent: "整體答對率很高。建議持續混合各題型練習。",
      revBandGood: "整體表現不錯。可針對較弱題型加做一輪。",
      revBandFair: "表現參差：請重溫 Topic 2 相關筆記後再練習。",
      revBandLow: "多個鍵結概念仍需鞏固：離子鍵、共價鍵及化合物化學式。",
      revWeakOne: "建議優先溫習「{type}」：本次 {c}/{t}（{pct}%）。",
      revStrongOne: "強項：「{type}」本次全對（共 {n} 題）。",
      revTwoStrike: "曾兩次皆錯的題目：請細讀參考答案後再練習。",
      revIncomplete: "尚有未答對題目，建議先完成。",
      revFirstTryLow: "不少題目需第二次才答對，作答前宜細讀題幹。",
      revBalanced: "錯誤分散在不同題型，宜維持均衡練習。",
    },
  };

  function createRng(seed) {
    let s = (seed >>> 0) || 1;
    return {
      random() { s = (1664525 * s + 1013904223) >>> 0; return s / 0x100000000; },
      randint(a, b) { return a + Math.floor(this.random() * (b - a + 1)); },
      choice(arr) { return arr[Math.floor(this.random() * arr.length)]; },
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(this.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
    };
  }

  function fnvSeed(raw) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < raw.length; i++) {
      h ^= raw.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  async function stableSeed(userSeed, count, types, difficulty) {
    const raw = `${userSeed || ""}|${count}|${[...types].sort().join(",")}|${difficulty}`;
    const subtle = typeof crypto !== "undefined" && crypto.subtle;
    if (subtle && typeof subtle.digest === "function") {
      try {
        const enc = new TextEncoder().encode(raw);
        const buf = await subtle.digest("SHA-256", enc);
        const hex = Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
        return parseInt(hex.slice(0, 8), 16) >>> 0;
      } catch {
        /* SubtleCrypto may be blocked in some browsers/contexts — use FNV fallback */
      }
    }
    return fnvSeed(raw);
  }

  function allowedByDifficulty(q, difficulty) {
    const qDiff = q.difficulty || difficulty;
    if (difficulty === "easy") return qDiff === "easy";
    if (difficulty === "medium") return qDiff === "easy" || qDiff === "medium";
    return true;
  }

  let PDF_BANK = [];
  let pdfBankLoadPromise = null;

  function loadPdfBank() {
    if (!pdfBankLoadPromise) {
      pdfBankLoadPromise = fetch("./pdf-question-bank.json?v=20260630")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          PDF_BANK = (Array.isArray(data) ? data : [])
            .map((e) => window.Ch5EmbedUI.normalizeQuestion(e))
            .filter((e) => F.isBondingBankEntry(e));
          return PDF_BANK;
        })
        .catch(() => {
          PDF_BANK = [];
          return PDF_BANK;
        });
    }
    return pdfBankLoadPromise;
  }

  function bankEntryToQuestion(entry, suffix) {
    return window.Ch5EmbedUI.normalizeQuestion({
      id: entry.id + "_" + suffix,
      qtype: entry.qtype,
      difficulty: entry.difficulty,
      stem_en: entry.stem_en,
      stem_zh: entry.stem_zh,
      options_en: entry.options_en,
      options_zh: entry.options_zh,
      correct_index: entry.correct_index,
      accepted_answers_en: entry.accepted_answers_en || [],
      accepted_answers_zh: entry.accepted_answers_zh || [],
      hint_en: entry.hint_en,
      hint_zh: entry.hint_zh,
      answer_en: entry.answer_en,
      answer_zh: entry.answer_zh,
      marks: entry.marks || 1,
    });
  }

  async function generateQuestions(count, types, difficulty, userSeed) {
    await loadPdfBank();
    const seed = await stableSeed(String(userSeed || ""), count, types, difficulty);
    const rng = createRng(seed);

    let pool = PDF_BANK.filter(
      (q) => types.includes(q.qtype) && allowedByDifficulty(q, difficulty) && F.isBondingBankEntry(q)
    );
    pool = rng.shuffle(pool);

    const pdfTarget = Math.min(count, pool.length);
    const out = [];
    for (let i = 0; i < pdfTarget; i++) {
      out.push(bankEntryToQuestion(pool[i], i));
    }

    return rng.shuffle(out).map((q, i) => {
      const base = q.id.replace(/_\d+$/, "").replace(/_fb_\d+$/, "");
      return window.Ch5EmbedUI.normalizeQuestion({ ...q, id: base + "_" + i });
    });
  }

  let lang = window.Ch5EmbedUI.readLangFromQuery("en");
  let lastQuestions = [];
  const attemptMap = new Map();
  let currentViewMode = "print";
  let sheetDate = "";

  function t(key) { return (UI[lang] && UI[lang][key]) || UI.en[key] || key; }

  function setExportButtonsEnabled(enabled) {
    window.Ch5EmbedUI.setExportButtonsEnabled(["btnExportPrint", "btnToday", "btnDocQ", "btnDocA"], enabled);
  }

  function applyLang() {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.getElementById("appTitle").textContent = t("appTitle");
    document.getElementById("appSubtitle").textContent = t("appSubtitle");
    document.getElementById("lblTypes").textContent = t("lblTypes");
    document.getElementById("lblCount").textContent = t("lblCount");
    document.getElementById("lblDiff").textContent = t("lblDiff");
    document.getElementById("lblLang").textContent = t("lblLang");
    document.getElementById("lblSeed").textContent = t("lblSeed");
    document.getElementById("btnGenerateLabel").textContent = t("btnGenerate");
    document.getElementById("trustText").textContent = t("trustText");
    document.getElementById("tabPrint").textContent = t("tabPrint");
    document.getElementById("tabPractice").textContent = t("tabPractice");
    document.getElementById("tabAnswer").textContent = t("tabAnswerKey");
    document.getElementById("btnExportPrintLabel").textContent = t("btnExportPrint");
    document.getElementById("btnTodayLabel").textContent = t("btnToday");
    document.getElementById("btnDocQLabel").textContent = t("btnDocQ");
    document.getElementById("btnDocALabel").textContent = t("btnDocA");
    document.getElementById("txtPracticeHint").textContent = t("txtPracticeHint");
    document.getElementById("placeholderText").textContent = t("placeholder");
    document.getElementById("btnSummary").textContent = t("btnSummary");
    document.getElementById("btnLangEn").classList.toggle("active", lang === "en");
    document.getElementById("btnLangZh").classList.toggle("active", lang === "zh");
    initMeta();
    if (lastQuestions.length) { renderSheetPreviews(); renderQuiz(); } else renderQuiz();
    renderViewMode();
    const sp = document.getElementById("summaryPanel");
    if (!sp.hidden && lastQuestions.length) renderSummary();
  }

  function setDifficulty(value) {
    document.getElementById("selDiff").value = value;
    document.querySelectorAll("#difficulty-group .option-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === value);
    });
  }

  function syncCountPills() {
    const val = String(document.getElementById("numCount").value);
    document.querySelectorAll("#question-count-group .option-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === val);
    });
  }

  function initMeta() {
    const currentDiff = document.getElementById("selDiff").value || "medium";
    const diffGroup = document.getElementById("difficulty-group");
    if (!diffGroup.dataset.wired) {
      diffGroup.innerHTML = "";
      DIFFICULTIES.forEach((d) => {
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "option-btn"; btn.dataset.value = d.id;
        btn.textContent = lang === "zh" ? d.label_zh : d.label_en;
        btn.addEventListener("click", () => setDifficulty(d.id));
        diffGroup.appendChild(btn);
      });
      diffGroup.dataset.wired = "1";
    } else {
      diffGroup.querySelectorAll(".option-btn").forEach((btn, i) => {
        btn.textContent = lang === "zh" ? DIFFICULTIES[i].label_zh : DIFFICULTIES[i].label_en;
      });
    }
    setDifficulty(currentDiff);
    const countGroup = document.getElementById("question-count-group");
    if (!countGroup.dataset.wired) {
      [5, 10, 20, 30, 50].forEach((n) => {
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "option-btn"; btn.dataset.value = String(n);
        btn.textContent = String(n);
        btn.addEventListener("click", () => { document.getElementById("numCount").value = n; syncCountPills(); });
        countGroup.appendChild(btn);
      });
      countGroup.dataset.wired = "1";
    }
    syncCountPills();
    const checked = new Set(selectedTypes());
    const tc = document.getElementById("typeChecks");
    tc.innerHTML = "";
    QUESTION_TYPES.forEach((qt) => {
      const lab = document.createElement("label");
      lab.className = "checkbox-option";
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.value = qt.id;
      cb.checked = checked.size ? checked.has(qt.id) : ["ionic-bond", "covalent-bond"].includes(qt.id);
      const wrap = document.createElement("div");
      wrap.className = "checkbox-text-wrapper";
      const span = document.createElement("span");
      span.textContent = lang === "zh" ? qt.label_zh : qt.label_en;
      const sub = document.createElement("span");
      sub.className = "checkbox-subtitle";
      sub.textContent = lang === "zh" ? qt.subtitle_zh : qt.subtitle_en;
      wrap.appendChild(span); wrap.appendChild(sub);
      lab.appendChild(cb); lab.appendChild(wrap);
      tc.appendChild(lab);
    });
  }

  function selectedTypes() {
    return Array.from(document.querySelectorAll("#typeChecks input:checked")).map((x) => x.value);
  }

  async function generate() {
    const types = selectedTypes();
    if (!types.length) { alert(lang === "zh" ? "請至少選擇一種題型。" : "Select at least one question type."); return; }
    const btn = document.getElementById("btnGenerate");
    const btnLabel = document.getElementById("btnGenerateLabel");
    const prevLabel = btnLabel.textContent;
    btn.disabled = true;
    btnLabel.textContent = lang === "zh" ? "產生中…" : "Generating…";
    try {
      const count = Math.min(50, Math.max(1, Number(document.getElementById("numCount").value) || 10));
      const difficulty = document.getElementById("selDiff").value;
      const seed = document.getElementById("txtSeed").value;
      lastQuestions = await generateQuestions(count, types, difficulty, seed);
      if (!lastQuestions.length) {
        throw new Error("No questions generated");
      }
      attemptMap.clear();
      lastQuestions.forEach((q) => attemptMap.set(q.id, { wrong: 0, solved: false }));
      document.getElementById("summaryPanel").hidden = true;
      document.getElementById("summaryPanel").innerHTML = "";
      sheetDate = "";
      renderSheetPreviews();
      renderQuiz();
      setExportButtonsEnabled(true);
      currentViewMode = "print";
      document.querySelectorAll(".preview-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === "print"));
      renderViewMode();
    } catch (err) {
      console.error("Worksheet generate failed:", err);
      alert(lang === "zh"
        ? "無法產生工作紙，請重新整理頁面後再試。"
        : "Could not generate the worksheet. Please refresh and try again.");
    } finally {
      btn.disabled = false;
      btnLabel.textContent = prevLabel;
    }
  }

  function renderViewMode() {
    const hasQuestions = lastQuestions.length > 0;
    const placeholder = document.getElementById("previewPlaceholder");
    const printView = document.getElementById("printView");
    const practiceView = document.getElementById("practiceView");
    const answerView = document.getElementById("answerView");
    if (!hasQuestions) {
      placeholder.hidden = false; printView.hidden = true; practiceView.hidden = true; answerView.hidden = true;
      return;
    }
    placeholder.hidden = true;
    printView.hidden = currentViewMode !== "print";
    practiceView.hidden = currentViewMode !== "practice";
    answerView.hidden = currentViewMode !== "answer";
  }

  function renderSheetPreviews() {
    if (!lastQuestions.length) return;
    document.getElementById("printView").innerHTML = buildPdfInnerHtml(false);
    document.getElementById("answerView").innerHTML = buildPdfInnerHtml(true);
    fillPdfSheet(currentViewMode === "answer");
  }

  function qtypeLabel(typeId) {
    const row = QUESTION_TYPES.find((x) => x.id === typeId);
    return row ? (lang === "zh" ? row.label_zh : row.label_en) : typeId;
  }

  function revFill(template, map) {
    let out = template;
    Object.keys(map).forEach((k) => { out = out.split("{" + k + "}").join(map[k]); });
    return out;
  }

  function buildRevisionSuggestions(total, correct, firstTry, failed, incomplete, byType) {
    const lines = []; const seen = new Set();
    function addLine(s) { if (!s || seen.has(s)) return; seen.add(s); lines.push(s); }
    const pctAll = total ? Math.round((100 * correct) / total) : 0;
    const ftPctAll = total ? Math.round((100 * firstTry) / total) : 0;
    if (pctAll >= 85) addLine(t("revBandExcellent"));
    else if (pctAll >= 65) addLine(t("revBandGood"));
    else if (pctAll >= 40) addLine(t("revBandFair"));
    else addLine(t("revBandLow"));
    const typeRows = [];
    byType.forEach((agg, tid) => {
      if (!agg || !agg.total) return;
      typeRows.push({ name: qtypeLabel(tid), total: agg.total, correct: agg.correct, pct: Math.round((100 * agg.correct) / agg.total) });
    });
    typeRows.sort((a, b) => a.pct - b.pct || b.total - a.total);
    typeRows.filter((r) => r.total >= 2 && r.pct < 66).slice(0, 2).forEach((r) => {
      addLine(revFill(t("revWeakOne"), { type: r.name, c: String(r.correct), t: String(r.total), pct: String(r.pct) }));
    });
    if (total >= 4 && pctAll >= 45 && ftPctAll < 40) addLine(t("revFirstTryLow"));
    if (failed.length) addLine(t("revTwoStrike"));
    if (incomplete.length) addLine(t("revIncomplete"));
    if (!typeRows.filter((r) => r.pct < 66).length && typeRows.length >= 2) addLine(t("revBalanced"));
    return lines;
  }

  function renderSummary() {
    if (!lastQuestions.length) { alert(t("alertNoQuiz")); return; }
    currentViewMode = "practice";
    document.querySelectorAll(".preview-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === "practice"));
    renderViewMode();
    let correct = 0, firstTry = 0;
    const failed = [], incomplete = [];
    const byType = new Map();
    lastQuestions.forEach((q, idx) => {
      const st = attemptMap.get(q.id) || { wrong: 0, solved: false };
      const tid = q.qtype || "unknown";
      if (!byType.has(tid)) byType.set(tid, { total: 0, correct: 0, firstTry: 0 });
      const agg = byType.get(tid);
      agg.total += 1;
      if (st.solved && st.wrong < 2) {
        correct++; agg.correct++;
        if (st.wrong === 0) { firstTry++; agg.firstTry++; }
      } else if (st.solved && st.wrong >= 2) failed.push({ n: idx + 1, q });
      else incomplete.push(idx + 1);
    });
    const total = lastQuestions.length;
    const panel = document.getElementById("summaryPanel");
    panel.hidden = false;
    let html = "<h3>" + escHtml(t("summaryTitle")) + "</h3>";
    html += "<div class=\"summary-score\">" + escHtml(t("summaryScoreLabel")) + "：" + correct + " / " + total + "</div>";
    html += "<p class=\"summary-sub\">" + escHtml(t("summaryFirstTry")) + "：" + firstTry + " / " + total + "</p>";
    html += "<div class=\"summary-by-type-title\">" + escHtml(t("summaryByTypeTitle")) + "</div>";
    html += "<table class=\"summary-type-table\"><thead><tr><th>" + escHtml(t("summaryByTypeColType")) + "</th><th class=\"num\">" + escHtml(t("summaryByTypeColFraction")) + "</th><th class=\"num\">" + escHtml(t("summaryByTypeColRate")) + "</th></tr></thead><tbody>";
    QUESTION_TYPES.forEach((qt) => {
      const agg = byType.get(qt.id);
      if (!agg || !agg.total) return;
      const pct = Math.round((100 * agg.correct) / agg.total);
      html += "<tr><td>" + escHtml(lang === "zh" ? qt.label_zh : qt.label_en) + "</td><td class=\"num\">" + agg.correct + " / " + agg.total + "</td><td class=\"num\">" + pct + "%</td></tr>";
    });
    html += "</tbody></table>";
    const revLines = buildRevisionSuggestions(total, correct, firstTry, failed, incomplete, byType);
    html += '<div class="summary-revision"><h4>' + escHtml(t("revTitle")) + "</h4><ul>";
    revLines.forEach((line) => { html += "<li>" + escHtml(line) + "</li>"; });
    html += "</ul></div>";
    html += "<div class=\"summary-wrong-title\">" + escHtml(t("summaryWrongTitle")) + "</div>";
    if (!failed.length) html += "<p class=\"summary-none\">" + escHtml(t("summaryNoneWrong")) + "</p>";
    else {
      html += "<ul class=\"summary-wrong-list\">";
      failed.forEach(({ n, q }) => { html += "<li>Q" + n + " · " + escHtml(qtypeLabel(q.qtype)) + "</li>"; });
      html += "</ul>";
    }
    panel.innerHTML = html;
  }

  function normAns(s) {
    return String(s).trim().toLowerCase().replace(/\s+/g, " ").replace(/，/g, ",").replace(/、/g, ",");
  }

  function checkText(q, raw) {
    const u = normAns(raw);
    if (!u) return false;
    const lists = [...(q.accepted_answers_en || []), ...(q.accepted_answers_zh || [])];
    if (lists.some((a) => u === normAns(a))) return true;
    for (const a of lists) {
      const ta = normAns(a);
      if (ta && u.includes(ta) && u.length <= ta.length + 12) return true;
    }
    return false;
  }

  function renderQuiz() {
    const el = document.getElementById("quizArea");
    el.classList.remove("quiz-empty");
    if (!lastQuestions.length) { el.classList.add("quiz-empty"); el.textContent = t("empty"); return; }
    el.innerHTML = "";
    lastQuestions.forEach((q, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "q-block";
      const head = document.createElement("div");
      head.className = "q-head";
      head.textContent = "Q" + (idx + 1) + " · " + q.qtype + " · " + q.difficulty;
      wrap.appendChild(head);
      const se = document.createElement("p"); se.className = "stem"; se.textContent = q.stem_en; wrap.appendChild(se);
      const sz = document.createElement("p"); sz.className = "stem stem-zh"; sz.textContent = q.stem_zh; wrap.appendChild(sz);
      let inputEl = null;
      if (window.Ch5EmbedUI.hasChoiceOptions(q)) {
        const og = document.createElement("div"); og.className = "options";
        q.options_en.forEach((opt, j) => {
          const lab = document.createElement("label");
          const rd = document.createElement("input");
          rd.type = "radio"; rd.name = "mcq_" + q.id; rd.value = String(j);
          const oz = q.options_zh ? q.options_zh[j] : "";
          lab.appendChild(rd);
          lab.appendChild(document.createTextNode(" " + opt + (oz ? " / " + oz : "")));
          og.appendChild(lab);
        });
        wrap.appendChild(og);
      } else {
        inputEl = document.createElement("input");
        inputEl.type = "text"; inputEl.className = "text-ans";
        inputEl.placeholder = lang === "zh" ? "在此輸入答案" : "Type your answer";
        wrap.appendChild(inputEl);
      }
      const btn = document.createElement("button");
      btn.type = "button"; btn.textContent = t("quizCheck"); btn.className = "quiz-check-btn";
      const fb = document.createElement("div"); fb.className = "feedback"; fb.style.display = "none";
      btn.addEventListener("click", () => {
        const st = attemptMap.get(q.id) || { wrong: 0, solved: false };
        if (st.solved) return;
        let ok = false;
        if (window.Ch5EmbedUI.hasChoiceOptions(q)) {
          const picked = wrap.querySelector('input[name="mcq_' + q.id + '"]:checked');
          ok = picked ? Number(picked.value) === q.correct_index : false;
        } else ok = checkText(q, inputEl ? inputEl.value : "");
        fb.style.display = "block";
        if (ok) {
          st.solved = true; attemptMap.set(q.id, st);
          fb.className = "feedback ok"; fb.textContent = lang === "zh" ? "正確。" : "Correct.";
          return;
        }
        st.wrong += 1; attemptMap.set(q.id, st);
        if (st.wrong === 1) {
          fb.className = "feedback hint";
          fb.innerHTML = (lang === "zh" ? "<b>提示：</b>" : "<b>Hint:</b>") + " " + (lang === "zh" ? q.hint_zh : q.hint_en);
        } else {
          st.solved = true; attemptMap.set(q.id, st);
          fb.className = "feedback bad";
          fb.innerHTML = (lang === "zh" ? "<b>參考答案：</b>" : "<b>Model answer:</b>") + " " + (lang === "zh" ? q.answer_zh : q.answer_en);
        }
      });
      wrap.appendChild(btn); wrap.appendChild(fb);
      el.appendChild(wrap);
    });
  }

  function escHtml(s) {
    if (s == null) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function buildPdfInnerHtml(answersMode) {
    const titleEn = answersMode ? "HKDSE Chemistry — Ionic and covalent bond (Answers)" : "HKDSE Chemistry — Ionic and covalent bond (Questions)";
    const titleZh = answersMode ? "化學 — 離子鍵與共價鍵（答案）" : "化學 — 離子鍵與共價鍵（試題）";
    let html = "<h1>" + escHtml(titleEn) + "</h1><div class=\"meta\">" + escHtml(titleZh);
    if (sheetDate) html += " · " + escHtml(sheetDate);
    html += "</div>";
    lastQuestions.forEach((q, i) => {
      html += "<div class=\"pdf-q\"><strong>Q" + (i + 1) + "</strong> [" + escHtml(q.qtype) + "]<br/>";
      html += "<strong>EN:</strong> " + escHtml(q.stem_en) + "<br/><strong>中文：</strong> " + escHtml(q.stem_zh) + "<br/>";
      if (window.Ch5EmbedUI.hasChoiceOptions(q) && !answersMode) {
        q.options_en.forEach((op, j) => {
          html += "(" + (j + 1) + ") " + escHtml(op) + " / " + escHtml((q.options_zh || [])[j] || "") + "<br/>";
        });
      }
      if (answersMode) {
        if (window.Ch5EmbedUI.hasChoiceOptions(q)) {
          html += "<strong>Answer / 答案：</strong> (" + (q.correct_index + 1) + ") " + escHtml(q.options_en[q.correct_index]) + "<br/>";
        } else {
          html += "<strong>Answer (EN)：</strong> " + escHtml(q.answer_en) + "<br/><strong>答案（中文）：</strong> " + escHtml(q.answer_zh) + "<br/>";
        }
        html += "<em>Hint / 提示：</em> " + escHtml(q.hint_en) + " | " + escHtml(q.hint_zh);
      }
      html += "</div>";
    });
    return html;
  }

  function fillPdfSheet(answersMode) { document.getElementById("pdfSheet").innerHTML = buildPdfInnerHtml(answersMode); }

  function downloadWord(answersMode) {
    if (!lastQuestions.length) { alert(lang === "zh" ? "請先產生題目。" : "Generate questions first."); return; }
    const titleEn = answersMode ? "Ionic and covalent bond — Answers" : "Ionic and covalent bond — Questions";
    let body = "";
    lastQuestions.forEach((q, i) => {
      body += "<h2>Q" + (i + 1) + " [" + escHtml(q.qtype) + "]</h2><p><b>EN:</b> " + escHtml(q.stem_en) + "</p><p><b>中文：</b> " + escHtml(q.stem_zh) + "</p>";
      if (answersMode) body += "<p><b>Answer:</b> " + escHtml(q.answer_en) + " / " + escHtml(q.answer_zh) + "</p>";
    });
    const html = "<html><head><meta charset=\"utf-8\"><title>" + escHtml(titleEn) + "</title></head><body><h1>" + escHtml(titleEn) + "</h1>" + body + "</body></html>";
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (answersMode ? "ionic_covalent_answers_" : "ionic_covalent_questions_") + Date.now() + ".doc";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function printSheet(answersMode) {
    if (!lastQuestions.length) { alert(lang === "zh" ? "請先產生題目。" : "Generate questions first."); return; }
    fillPdfSheet(answersMode);
    window.print();
  }

  function fillTodayDate() {
    if (!lastQuestions.length) return;
    if (sheetDate) sheetDate = "";
    else {
      const today = new Date();
      sheetDate = lang === "zh" ? today.getFullYear() + "年" + (today.getMonth() + 1) + "月" + today.getDate() + "日"
        : today.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
    }
    renderSheetPreviews();
  }

  document.getElementById("numCount").addEventListener("input", syncCountPills);
  document.getElementById("btnLangEn").addEventListener("click", () => { lang = "en"; window.Ch5EmbedUI.setLangInQuery("en"); applyLang(); });
  document.getElementById("btnLangZh").addEventListener("click", () => { lang = "zh"; window.Ch5EmbedUI.setLangInQuery("zh"); applyLang(); });
  document.getElementById("btnGenerate").addEventListener("click", generate);
  document.querySelectorAll(".preview-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".preview-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentViewMode = tab.dataset.mode || "print";
      renderViewMode();
      if (lastQuestions.length) fillPdfSheet(currentViewMode === "answer");
    });
  });
  document.getElementById("btnSummary").addEventListener("click", renderSummary);
  document.getElementById("btnDocQ").addEventListener("click", () => downloadWord(false));
  document.getElementById("btnDocA").addEventListener("click", () => downloadWord(true));
  document.getElementById("btnExportPrint").addEventListener("click", () => printSheet(currentViewMode === "answer"));
  document.getElementById("btnToday").addEventListener("click", fillTodayDate);

  setExportButtonsEnabled(false);
  void loadPdfBank();
  applyLang();
})();
