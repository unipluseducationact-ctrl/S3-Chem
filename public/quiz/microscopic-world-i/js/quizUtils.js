export const QUIZ_UI_LANGS = ["en", "zh", "zh-Hant"];

export function isChineseUI(lang) {
  return lang === "zh" || lang === "zh-Hant";
}

export function noQuizAlertMessage(lang) {
  if (lang === "zh") return "请先生成题目。";
  if (lang === "zh-Hant") return "請先產生題目。";
  return "Generate questions first.";
}

export function resolveQuizLang() {
  try {
    const parentLang = window.parent.document.documentElement.lang;
    if (parentLang && QUIZ_UI_LANGS.includes(parentLang)) return parentLang;
    if (parentLang?.startsWith("zh")) return parentLang === "zh-Hant" ? "zh-Hant" : "zh";
  } catch (_) {
    /* cross-origin */
  }
  const local = document.documentElement.lang;
  if (local && QUIZ_UI_LANGS.includes(local)) return local;
  if (local?.startsWith("zh")) return local === "zh-Hant" ? "zh-Hant" : "zh";
  return "en";
}

export const DIFFICULTY_LEVELS = [
  { id: "all", labelEn: "All levels", labelZh: "全部難度" },
  { id: "easy", labelEn: "Easy", labelZh: "易" },
  { id: "medium", labelEn: "Medium", labelZh: "中" },
  { id: "hard", labelEn: "Hard", labelZh: "難" },
];

export const DIFFICULTY_MAP = {
  Foundation: "easy",
  Standard: "medium",
  Applied: "hard",
};

export function difficultyLevel(q) {
  return DIFFICULTY_MAP[q.difficulty] || "medium";
}

export function createRng(seedStr) {
  let s = 0;
  const str = String(seedStr || "").trim();
  if (str) {
    for (let i = 0; i < str.length; i++) s = (Math.imul(31, s) + str.charCodeAt(i)) | 0;
  } else {
    s = (Date.now() ^ (Math.random() * 0x7fffffff)) | 0;
  }
  if (s === 0) s = 1;
  return {
    random() {
      s = (Math.imul(1664525, s) + 1013904223) | 0;
      return (s >>> 0) / 0x100000000;
    },
  };
}

export function seededShuffle(arr, seedStr) {
  const rng = createRng(seedStr);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function questionFormat(q) {
  return q.format || "mcq";
}

/** Worksheet filters for question format (MCQ only for this quiz). */
export const QUIZ_FORMAT_FILTERS = [
  { id: "mcq", labelEn: "Multiple choice", labelZh: "選擇題", labelZhHans: "选择题" },
];

export function questionStem(q, lang) {
  return isChineseUI(lang) ? q.stemZh || q.stem : q.stem;
}

function isTableSeparatorLine(line) {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function isTableRow(line) {
  const t = line.trim();
  if (!t) return false;
  if (isTableSeparatorLine(t)) return true;
  if (t.startsWith("|") && t.endsWith("|")) return true;
  return (t.match(/\|/g) || []).length >= 2;
}

function parseTableCells(line) {
  const t = line.trim();
  if (t.startsWith("|") && t.endsWith("|")) {
    return t
      .slice(1, -1)
      .split("|")
      .map((s) => s.trim());
  }
  return t.split("|").map((s) => s.trim()).filter(Boolean);
}

function isNumberedLine(line) {
  return /^\(\d+\)\s/.test(line.trim());
}

function isOptionTableRow(cells) {
  return cells.length > 0 && /^[A-D]\.\s/.test(cells[0]);
}

/** Parse stem text into structured HTML (paragraphs, numbered lists, tables). */
export function formatStemHtml(text) {
  const lines = String(text || "").split("\n");
  const parts = [];
  let paragraphCount = 0;
  let i = 0;

  function flushTable(rows) {
    const dataRows = rows.filter((r) => !isTableSeparatorLine(r));
    if (!dataRows.length) return;
    let html = '<table class="quiz-stem-table"><tbody>';
    dataRows.forEach((row, ri) => {
      const cells = parseTableCells(row);
      const isHeader = ri === 0 && !isOptionTableRow(cells);
      html += "<tr>";
      cells.forEach((cell) => {
        html += isHeader
          ? `<th>${escHtml(cell)}</th>`
          : `<td>${escHtml(cell)}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    parts.push(html);
  }

  function flushList(items) {
    if (!items.length) return;
    parts.push(
      `<ul class="quiz-stem-list">${items.map((li) => `<li>${escHtml(li)}</li>`).join("")}</ul>`
    );
  }

  function flushParagraph(line) {
    const t = line.trim();
    if (!t) return;
    paragraphCount += 1;
    const cls = paragraphCount === 1 ? "quiz-stem-p quiz-stem-lead" : "quiz-stem-p";
    parts.push(`<p class="${cls}">${escHtml(t)}</p>`);
  }

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    if (isTableRow(trimmed)) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim() && isTableRow(lines[i].trim())) {
        tableRows.push(lines[i].trim());
        i += 1;
      }
      flushTable(tableRows);
      continue;
    }

    if (isNumberedLine(trimmed)) {
      const listItems = [];
      while (i < lines.length && isNumberedLine(lines[i].trim())) {
        listItems.push(lines[i].trim());
        i += 1;
      }
      flushList(listItems);
      continue;
    }

    flushParagraph(trimmed);
    i += 1;
  }

  return parts.join("");
}

export function formatFilterLabel(filter, lang) {
  if (lang === "zh") return filter.labelZhHans || filter.labelZh;
  if (lang === "zh-Hant") return filter.labelZh;
  return filter.labelEn;
}

/** Count questions per section, per format, and section×format matrix. */
export function buildQuizBankStats(questions, sectionIds, formatIds) {
  const bySection = {};
  const byFormat = Object.fromEntries(formatIds.map((id) => [id, 0]));
  const matrix = {};
  for (const sid of sectionIds) {
    matrix[sid] = Object.fromEntries(formatIds.map((fid) => [fid, 0]));
  }
  for (const q of questions) {
    const fmt = questionFormat(q);
    if (!sectionIds.includes(q.section) || !formatIds.includes(fmt)) continue;
    bySection[q.section] = (bySection[q.section] || 0) + 1;
    byFormat[fmt] = (byFormat[fmt] || 0) + 1;
    if (matrix[q.section]) matrix[q.section][fmt] = (matrix[q.section][fmt] || 0) + 1;
  }
  return { total: questions.length, bySection, byFormat, matrix };
}

export function filterQuizPool(allQuestions, { sections, formats, difficulty }) {
  let pool = allQuestions.filter(
    (q) => sections.includes(q.section) && formats.includes(questionFormat(q))
  );
  if (difficulty && difficulty !== "all") {
    pool = pool.filter((q) => difficultyLevel(q) === difficulty);
  }
  return pool;
}

export function formatTypeLabel(q) {
  const f = questionFormat(q);
  if (f === "tf") return "T/F";
  if (f === "fill") return "FILL";
  return "MCQ";
}

export function normalizeFillAnswer(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;]/g, "");
}

export function fillAnswerMatches(input, acceptList) {
  const n = normalizeFillAnswer(input);
  if (!n) return false;
  return (acceptList || []).some((a) => normalizeFillAnswer(a) === n);
}

/** @returns {{ segments: Array<{type:'text'|'blank', value?: string, accept?: string[]}> }[]} */
export function getFillLines(q) {
  if (q.lines?.length) return q.lines;
  return (q.fields || []).map((field) => ({
    segments: [
      { type: "text", value: String(field.label || "").replace(/_+/g, "") },
      { type: "blank", accept: field.accept || [] },
    ],
  }));
}

export function countFillBlanks(q) {
  return getFillLines(q).reduce(
    (n, line) => n + line.segments.filter((s) => s.type === "blank").length,
    0
  );
}

export function fillLineAnswerText(line) {
  return line.segments
    .map((seg) => {
      if (seg.type === "text") return seg.value || "";
      return seg.accept?.[0] || "___";
    })
    .join("");
}

export function allFillFieldsCorrect(q, values) {
  const lines = getFillLines(q);
  if (!lines.length) return false;
  let i = 0;
  for (const line of lines) {
    for (const seg of line.segments) {
      if (seg.type !== "blank") continue;
      if (!fillAnswerMatches(values[i], seg.accept)) return false;
      i += 1;
    }
  }
  return i === values.length && i > 0;
}

export function modelAnswerText(q) {
  const f = questionFormat(q);
  if (f === "tf") {
    const opt = q.options?.find((o) => o.key === q.answer);
    const word = opt?.text || (q.answer === "T" ? "True" : "False");
    const wordZh = opt?.textZh || (q.answer === "T" ? "正確" : "錯誤");
    return { en: `${word}.`, zh: `${wordZh}。` };
  }
  if (f === "fill") {
    const lines = getFillLines(q);
    if (lines.length) {
      return { en: lines.map((line) => fillLineAnswerText(line)).join(" | "), zh: "" };
    }
  }
  const opt = q.options?.find((o) => o.key === q.answer);
  const en = opt ? `${q.answer}. ${opt.text}` : q.answer;
  const zh = opt?.textZh ? `${q.answer}. ${opt.textZh}` : "";
  return { en, zh };
}

export function modelAnswerForLang(q, lang) {
  const ma = modelAnswerText(q);
  return isChineseUI(lang) ? ma.zh || ma.en : ma.en;
}
