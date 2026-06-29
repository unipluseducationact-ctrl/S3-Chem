import {
  escHtml,
  isChineseUI,
  noQuizAlertMessage,
  modelAnswerForLang,
  questionFormat,
  questionStem,
  formatStemHtml,
  getFillLines,
} from "./quizUtils.js";

function fillLineExportHtml(line, answersMode) {
  let html = "";
  line.segments.forEach((seg) => {
    if (seg.type === "text") {
      html += escHtml(seg.value || "");
      return;
    }
    if (answersMode) {
      html += `<b>${escHtml(seg.accept?.[0] || "")}</b>`;
    } else {
      html += "__________";
    }
  });
  return html;
}

function buildDocBody(questions, answersMode, lang) {
  let body = "";
  questions.forEach((q, i) => {
    const fmt = questionFormat(q);
    body += `<h2>Q${i + 1} · ${escHtml(q.section)} · ${escHtml(q.difficulty)} · ${escHtml(fmt.toUpperCase())}</h2>`;
    body += formatStemHtml(questionStem(q, lang));
    if (q.image?.src && !answersMode) {
      body += `<p><i>[Diagram: ${escHtml(q.image.caption || q.image.alt || "see notes")}]</i></p>`;
    }
    if (!answersMode) {
      if (fmt === "fill" && getFillLines(q).length) {
        if (q.wordBank?.length) {
          body += `<p><i>Word bank:</i> ${escHtml(q.wordBank.join(", "))}</p>`;
        }
        body += "<ol>";
        getFillLines(q).forEach((line) => {
          body += `<li>${fillLineExportHtml(line, answersMode)}</li>`;
        });
        body += "</ol>";
      } else if (q.options?.length) {
        body += "<ul>";
        q.options.forEach((opt) => {
          body += `<li><b>${escHtml(opt.key)}.</b> ${escHtml(opt.text)}</li>`;
        });
        body += "</ul>";
      }
    }
    if (answersMode) {
      const label = isChineseUI(lang) ? "答案" : "Answer";
      body += `<p><b>${label}:</b> ${escHtml(modelAnswerForLang(q, lang))}</p>`;
    }
  });
  return body;
}

export function downloadWord(questions, answersMode, lang) {
  if (!questions.length) {
    alert(noQuizAlertMessage(lang));
    return;
  }
  const titleEn = answersMode
    ? "Microscopic World I (Ch5–8) — Answers"
    : "Microscopic World I (Ch5–8) — Questions";
  const titleZh = answersMode ? "微觀世界 I（第五至八章）— 答案" : "微觀世界 I（第五至八章）— 試題";
  const docTitle = isChineseUI(lang) ? titleZh : titleEn;
  const body = buildDocBody(questions, answersMode, lang);
  const html =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    `<head><meta charset="utf-8"><title>${escHtml(docTitle)}</title></head><body>` +
    `<h1>${escHtml(docTitle)}</h1>${body}</body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const a = document.createElement("a");
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = URL.createObjectURL(blob);
  a.download = (answersMode ? "micworld1_answers_" : "micworld1_questions_") + ts + ".doc";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function printSheet(questions, answersMode, lang) {
  if (!questions.length) {
    alert(noQuizAlertMessage(lang));
    return;
  }
  const sheet = document.getElementById("quiz-pdf-sheet");
  if (!sheet) return;
  const titleEn = answersMode
    ? "Microscopic World I (Ch5–8) — Answers"
    : "Microscopic World I (Ch5–8) — Questions";
  const titleZh = answersMode ? "微觀世界 I（第五至八章）— 答案" : "微觀世界 I（第五至八章）— 試題";
  const docTitle = isChineseUI(lang) ? titleZh : titleEn;
  let html = `<h1>${escHtml(docTitle)}</h1>`;
  html += buildDocBody(questions, answersMode, lang);
  sheet.innerHTML = html;
  window.print();
}
