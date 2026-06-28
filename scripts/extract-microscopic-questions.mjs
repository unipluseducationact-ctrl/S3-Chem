/**
 * Extract question stems from Topic 02 Overall 1 PDF into pdf-question-bank.json
 * Usage: node scripts/extract-microscopic-questions.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PDF_PATH = join(ROOT, "public/worksheets/ch2-microscopic-world-1/source/topic-02-overall-1.pdf");
const OUT_PATH = join(ROOT, "public/worksheets/ch2-microscopic-world-1/pdf-question-bank.json");
const TEXT_DUMP = join(ROOT, "public/worksheets/ch2-microscopic-world-1/source/extracted-text.txt");

function cleanText(raw) {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/-- \d+ of \d+ --/g, "\n")
    .replace(/警告:[^\n]*\n/g, "")
    .replace(/薈進教育中心 Unit Education Tel: \d+\n/g, "")
    .replace(/Topic 02 Microscopic world I\n/g, "")
    .replace(/Part \d+\n/g, "")
    .replace(/\f/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inferQtype(stem) {
  const s = stem.toLowerCase();
  if (/filtration|evaporation|distillation|chromatograph|crystalli|magnetic separation|separate.*mixture|separation technique/.test(s)) {
    return "separation";
  }
  if (/physical change|chemical change|new substance|reversible|irreversible/.test(s)) {
    return "change";
  }
  if (/element.*compound|compound.*mixture|classify|mixture|pure substance/.test(s)) {
    return "classification";
  }
  if (/particle|solid|liquid|gas|vibrate|kinetic theory|states of matter|arrangement of particles/.test(s)) {
    return "particle";
  }
  if (/which of the following|true or false|\(a\).*\(b\).*\(c\).*\(d\)/i.test(stem)) {
    return "mcq";
  }
  return "short";
}

function inferDifficulty(marks) {
  if (marks <= 1) return "easy";
  if (marks <= 2) return "medium";
  return "hard";
}

function inferHint(stem, qtype) {
  const hints = {
    separation: "Recall which separation method suits the states of the components (solid/liquid/gas, soluble or not).",
    change: "Ask whether a new substance forms and whether the change is easily reversed.",
    classification: "Decide if substances are chemically combined (compound) or physically mixed (mixture).",
    particle: "Link particle arrangement and motion to the state of matter.",
    short: "Refer to Topic 02 Microscopic world I notes — atomic structure, periodic table, and bonding.",
    mcq: "Eliminate options that contradict basic chemical definitions.",
  };
  return hints[qtype] || hints.short;
}

function inferHintZh(qtype) {
  const hints = {
    separation: "回想各成分的状态（固／液／氣、是否溶解）以選擇合適的分離方法。",
    change: "判斷有否形成新物質，以及變化是否容易回復。",
    classification: "判斷物質是化學結合（化合物）還是物理混合（混合物）。",
    particle: "聯繫粒子排列與運動和物質的狀態。",
    short: "參考 Topic 2 微觀世界 I 筆記：原子結構、週期表及鍵結。",
    mcq: "排除與基本化學定義矛盾的選項。",
  };
  return hints[qtype] || hints.short;
}

function knownAnswer(stem) {
  const s = stem.toLowerCase();
  if (/four elements.*earth.?s? crust|most abundant.*crust/.test(s)) {
    return {
      en: "Oxygen, silicon, aluminium, iron (decreasing abundance)",
      zh: "氧、矽、鋁、鐵（按豐度由高至低）",
      accepted_en: ["oxygen silicon aluminium iron", "oxygen, silicon, aluminium, iron", "o si al fe"],
      accepted_zh: ["氧 矽 鋁 鐵", "氧、矽、鋁、鐵"],
    };
  }
  if (/electrically neutral/.test(s) && /atom/.test(s)) {
    return {
      en: "Equal numbers of protons and electrons; opposite charges cancel.",
      zh: "質子數與電子數相等；正負電荷互相抵消。",
      accepted_en: ["equal protons and electrons", "same number of protons and electrons"],
      accepted_zh: ["質子數等於電子數", "質子與電子數目相同"],
    };
  }
  if (/what is meant by.*isotope|meaning of.*isotope|term.? isotope/.test(s)) {
    return {
      en: "Atoms of the same element (same number of protons) with different numbers of neutrons.",
      zh: "同一元素（相同質子數）但中子數不同的原子。",
      accepted_en: ["same protons different neutrons", "same number of protons different neutrons"],
      accepted_zh: ["相同質子數不同中子數", "質子數相同中子數不同"],
    };
  }
  if (/separate.*isotope.*chemical/.test(s)) {
    return {
      en: "No — isotopes have the same chemical properties and cannot be separated by chemical methods.",
      zh: "不可以——同位素化學性質相同，不能藉化學方法分離。",
      accepted_en: ["no", "cannot", "not possible"],
      accepted_zh: ["不可以", "不能"],
    };
  }
  if (/mass number of deuterium/.test(s)) {
    return { en: "2", zh: "2", accepted_en: ["2"], accepted_zh: ["2"] };
  }
  if (/all atoms contain protons.*neutrons.*electrons/.test(s)) {
    return {
      en: "Incorrect — hydrogen-1 (¹H) has no neutrons.",
      zh: "錯誤——氫-1（¹H）沒有中子。",
      accepted_en: ["hydrogen", "hydrogen-1", "no neutrons in hydrogen"],
      accepted_zh: ["氫", "氫-1", "沒有中子"],
    };
  }
  return null;
}

function parseQuestions(text) {
  const items = [];
  const markRe = /([\s\S]*?)\((\d+)\s*marks?\)/gi;
  let m;
  let idx = 0;
  const skipPatterns = [
    /^content$/i,
    /^part topic page$/i,
    /^page$/i,
    /atomic structure \d+ – \d+/i,
    /periodic table \d+ – \d+/i,
    /ionic bond \d+ – \d+/i,
    /covalent bond \d+ – \d+/i,
    /structure and properties \d+ – \d+/i,
    /^part \d+$/i,
  ];

  while ((m = markRe.exec(text)) !== null) {
    let stem = m[1].trim();
    const marks = Number(m[2]);
    if (stem.length < 15 || stem.length > 1200) continue;
    if (/^Atomic$|^Melting point/.test(stem)) continue;

    stem = stem
      .replace(/^\d+\.\s*/, "")
      .replace(/^[a-z]\)\s*/i, "")
      .replace(/^\([a-z]\)\s*/i, "")
      .replace(/^\([ivx]+\)\s*/i, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (stem.length < 12) continue;
    if (skipPatterns.some((re) => re.test(stem))) continue;
    if (/Content Part Topic Page/.test(stem)) continue;

    const qtype = inferQtype(stem);
    const difficulty = inferDifficulty(marks);
    const known = knownAnswer(stem);

    const entry = {
      id: `pdf_${String(++idx).padStart(3, "0")}`,
      qtype,
      difficulty,
      stem_en: stem.endsWith("?") ? stem : stem + (stem.match(/\?$/) ? "" : ""),
      stem_zh: stem,
      options_en: null,
      options_zh: null,
      correct_index: null,
      accepted_answers_en: known?.accepted_en || [],
      accepted_answers_zh: known?.accepted_zh || [],
      hint_en: inferHint(stem, qtype),
      hint_zh: inferHintZh(qtype),
      answer_en: known?.en || "Refer to Topic 02 Overall 1 marking scheme / teacher notes.",
      answer_zh: known?.zh || "請參考 Topic 02 Overall 1 評分準則／教師筆記。",
      marks,
      source: "topic-02-overall-1.pdf",
    };
    items.push(entry);
  }
  return items;
}

async function main() {
  const buf = readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const cleaned = cleanText(result.text);
  writeFileSync(TEXT_DUMP, cleaned, "utf8");

  const questions = parseQuestions(cleaned);
  const byType = {};
  questions.forEach((q) => {
    byType[q.qtype] = (byType[q.qtype] || 0) + 1;
  });

  writeFileSync(OUT_PATH, JSON.stringify(questions, null, 2), "utf8");
  console.log(`Wrote ${questions.length} questions to ${OUT_PATH}`);
  console.log("By type:", byType);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
