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

function topicFromPage(page) {
  if (page <= 17) return "atomic-structure";
  if (page <= 57) return "periodic-table";
  if (page <= 93) return "ionic-bond";
  if (page <= 125) return "covalent-bond";
  return "structure-properties";
}

function findPageBefore(text, index) {
  const slice = text.slice(0, index);
  const matches = [...slice.matchAll(/(?:^|\n)(\d{1,3}) \d+\./gm)];
  if (!matches.length) return 2;
  const page = Number(matches[matches.length - 1][1]);
  return Number.isFinite(page) && page >= 2 && page <= 200 ? page : 2;
}

function inferTopic(stem, page) {
  const s = stem.toLowerCase();
  const byPage = topicFromPage(page);

  if (/ionic bond|electron transfer|metal.*non-?metal|ionic compound|lattice|giant ionic|electrostatic attraction between (ions|oppositely charged)/.test(s)) {
    return "ionic-bond";
  }
  if (/covalent bond|shared pair|intermolecular force|macromolecular|giant covalent|simple molecular|diamond|graphite|silicon dioxide|showing electrons in the outermost/.test(s)) {
    return /ionic bond|electron transfer|metal.*non-?metal/.test(s) ? byPage : "covalent-bond";
  }
  if (/periodic table|group i\b|group ii\b|group iii|group iv|group vii|group 0|noble gas|halogen|alkali metal|period \d|metalloid|semi-?metal/.test(s)) {
    return page <= 17 && /subatomic|proton|neutron|isotope/.test(s) ? "atomic-structure" : "periodic-table";
  }
  if (/melting point|boiling point|electrical conductivity|solubility|hardness|malleability|ductility|states of matter|physical propert|giant (ionic|covalent|metallic)|simple molecular/.test(s)) {
    return "structure-properties";
  }
  if (/proton|neutron|electron|isotope|atomic number|mass number|subatomic|nucleus|relative atomic mass/.test(s)) {
    return page >= 58 ? byPage : "atomic-structure";
  }
  return byPage;
}

function finalizeEntry(entry) {
  const hasOpts = Array.isArray(entry.options_en)
    && entry.options_en.length >= 2
    && entry.correct_index != null
    && entry.correct_index >= 0
    && entry.correct_index < entry.options_en.length;
  if (entry.qtype === "mcq" && !hasOpts) {
    entry.qtype = "short";
  }
  return entry;
}

function inferDifficulty(marks) {
  if (marks <= 1) return "easy";
  if (marks <= 2) return "medium";
  return "hard";
}

function inferHint(stem, qtype) {
  const hints = {
    "atomic-structure": "Recall subatomic particles, atomic number, mass number, and isotopes.",
    "periodic-table": "Use group and period trends from the Periodic Table.",
    "ionic-bond": "Focus on electron transfer between metals and non-metals.",
    "covalent-bond": "Focus on shared electron pairs and molecular structures.",
    "structure-properties": "Link bonding and structure to melting point, conductivity, and hardness.",
  };
  return hints[qtype] || hints["atomic-structure"];
}

function inferHintZh(qtype) {
  const hints = {
    "atomic-structure": "回想次原子粒子、原子序、質量數及同位素。",
    "periodic-table": "運用週期表中族與週期的規律。",
    "ionic-bond": "留意金屬與非金屬之間的電子轉移。",
    "covalent-bond": "留意共用電子對及分子結構。",
    "structure-properties": "聯繫鍵結與結構和熔點、導電性、硬度等性質。",
  };
  return hints[qtype] || hints["atomic-structure"];
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

    const page = findPageBefore(text, m.index);
    const qtype = inferTopic(stem, page);
    const difficulty = inferDifficulty(marks);
    const known = knownAnswer(stem);

    const entry = {
      id: `pdf_${String(++idx).padStart(3, "0")}`,
      qtype,
      topic_page: page,
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
    items.push(finalizeEntry(entry));
  }
  return items;
}

async function main() {
  const textOnly = process.argv.includes("--text-only");
  let cleaned;
  if (textOnly) {
    cleaned = cleanText(readFileSync(TEXT_DUMP, "utf8"));
  } else {
    const buf = readFileSync(PDF_PATH);
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    cleaned = cleanText(result.text);
    writeFileSync(TEXT_DUMP, cleaned, "utf8");
  }

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
