(function () {
  "use strict";

  const SUBSTANCES = [
    { name_en: "water", name_zh: "水", type: "compound", formula: "H2O" },
    { name_en: "carbon dioxide", name_zh: "二氧化碳", type: "compound", formula: "CO2" },
    { name_en: "sodium chloride", name_zh: "氯化鈉", type: "compound", formula: "NaCl" },
    { name_en: "glucose", name_zh: "葡萄糖", type: "compound", formula: "C6H12O6" },
    { name_en: "ammonia", name_zh: "氨", type: "compound", formula: "NH3" },
    { name_en: "iron", name_zh: "鐵", type: "element" },
    { name_en: "oxygen", name_zh: "氧", type: "element" },
    { name_en: "copper", name_zh: "銅", type: "element" },
    { name_en: "sulphur", name_zh: "硫", type: "element" },
    { name_en: "helium", name_zh: "氦", type: "element" },
    { name_en: "air", name_zh: "空氣", type: "mixture" },
    { name_en: "brass", name_zh: "黃銅", type: "mixture" },
    { name_en: "seawater", name_zh: "海水", type: "mixture" },
    { name_en: "milk", name_zh: "牛奶", type: "mixture" },
    { name_en: "sand and iron filings", name_zh: "沙和鐵粉", type: "mixture" },
    { name_en: "petrol", name_zh: "汽油", type: "mixture" },
    { name_en: "ink", name_zh: "墨水", type: "mixture" },
  ];

  const SEPARATIONS = [
    { mixture_en: "sand and water", mixture_zh: "沙和水", method_en: "filtration", method_zh: "過濾法", hint_en: "Insoluble solid from liquid.", hint_zh: "不溶固體與液體分離。" },
    { mixture_en: "salt solution (aqueous sodium chloride)", mixture_zh: "鹽溶液（氯化鈉水溶液）", method_en: "evaporation", method_zh: "蒸發法", hint_en: "Recover dissolved solid by removing solvent.", hint_zh: "除去溶劑以取得溶質固體。" },
    { mixture_en: "copper(II) sulphate solution", mixture_zh: "硫酸銅溶液", method_en: "crystallization", method_zh: "結晶法", hint_en: "Form pure crystals from a saturated solution.", hint_zh: "由飽和溶液析出純淨晶體。" },
    { mixture_en: "ethanol and water", mixture_zh: "乙醇和水", method_en: "fractional distillation", method_zh: "分餾法", hint_en: "Liquids with different boiling points.", hint_zh: "沸點不同的液體混合物。" },
    { mixture_en: "coloured ink", mixture_zh: "有色墨水", method_en: "chromatography", method_zh: "色層分析法", hint_en: "Separate dissolved dyes on paper.", hint_zh: "在濾紙上分離溶解的色素。" },
    { mixture_en: "iron filings and sulphur powder", mixture_zh: "鐵粉和硫粉", method_en: "magnetic separation", method_zh: "磁性分離", hint_en: "One component is magnetic.", hint_zh: "其中一種成分具磁性。" },
    { mixture_en: "crude oil", mixture_zh: "原油", method_en: "fractional distillation", method_zh: "分餾法", hint_en: "Separate many hydrocarbons by boiling point.", hint_zh: "按沸點分離多種碳氫化合物。" },
  ];

  const PHYSICAL_CHANGES = [
    { en: "melting ice", zh: "冰熔化" },
    { en: "boiling water", zh: "水沸騰" },
    { en: "dissolving sugar in water", zh: "糖溶於水" },
    { en: "crushing chalk", zh: "粉碎粉筆" },
    { en: "evaporating seawater to obtain salt", zh: "蒸發海水取得食鹽" },
  ];

  const CHEMICAL_CHANGES = [
    { en: "burning magnesium in air", zh: "鎂在空氣中燃燒" },
    { en: "rusting of iron", zh: "鐵生鏽" },
    { en: "electrolysis of water", zh: "水的電解" },
    { en: "adding zinc to dilute hydrochloric acid", zh: "鋅加入稀鹽酸" },
    { en: "baking a cake", zh: "烘烤蛋糕" },
  ];

  const QUESTION_TYPES = [
    { id: "atomic-structure", label_en: "Atomic structure", label_zh: "原子結構", subtitle_en: "Protons, neutrons, electrons, isotopes", subtitle_zh: "質子、中子、電子、同位素" },
    { id: "periodic-table", label_en: "Periodic table", label_zh: "週期表", subtitle_en: "Groups, periods, trends", subtitle_zh: "族、週期、趨勢" },
    { id: "ionic-bond", label_en: "Ionic bond", label_zh: "離子鍵", subtitle_en: "Electron transfer, ionic compounds", subtitle_zh: "電子轉移、離子化合物" },
    { id: "covalent-bond", label_en: "Covalent bond", label_zh: "共價鍵", subtitle_en: "Shared electrons, molecules", subtitle_zh: "共用電子、分子" },
    { id: "structure-properties", label_en: "Structure and properties of substances", label_zh: "物質的結構與性質", subtitle_en: "Bonding types and physical properties", subtitle_zh: "鍵結類型與物理性質" },
  ];

  const DIFFICULTIES = [
    { id: "easy", label_en: "Easy", label_zh: "易" },
    { id: "medium", label_en: "Medium", label_zh: "中" },
    { id: "hard", label_en: "Hard", label_zh: "難" },
  ];

  const TYPE_LABELS = {
    element: { en: "element", zh: "元素" },
    compound: { en: "compound", zh: "化合物" },
    mixture: { en: "mixture", zh: "混合物" },
  };

  const UI = {
    en: {
      appTitle: "Microscopic world 1",
      appSubtitle: "Create Topic 2 worksheets for your class",
      lblTypes: "Question Types",
      lblCount: "Number of Questions",
      lblDiff: "Difficulty",
      lblLang: "Language",
      lblSeed: "Random seed (optional)",
      btnGenerate: "Generate Worksheet",
      trustText: "Questions are drawn primarily from Topic 02 Overall 1 (Unit Education) — atomic structure, periodic table, bonding, and properties.",
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
      revBandLow: "Several Topic 2 concepts need consolidation — atomic structure, periodic table, bonding, and properties of substances.",
      revWeakOne: "Prioritise revision on {type} — scored {c}/{t} ({pct}%).",
      revStrongOne: "Strength: every {type} item correct ({n} questions).",
      revTwoStrike: "Questions missed twice: study model answers, then regenerate those types.",
      revIncomplete: "Finish in-progress questions for a fair summary next time.",
      revFirstTryLow: "Many items needed two attempts. Read each stem carefully before answering.",
      revBalanced: "Errors spread across types — continue balanced practice.",
    },
    zh: {
      appTitle: "微觀世界 1",
      appSubtitle: "為你的班別建立 Topic 2 工作紙",
      lblTypes: "題型",
      lblCount: "題目數量",
      lblDiff: "難度",
      lblLang: "語言",
      lblSeed: "隨機種子（可留空）",
      btnGenerate: "產生工作紙",
      trustText: "題目主要來自 Topic 02 Overall 1（薈進教育）— 原子結構、週期表、鍵結及物質性質。",
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
      revBandLow: "多個 Topic 2 概念仍需鞏固：原子結構、週期表、鍵結及物質性質。",
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

  function makeMcq(rng, diff, stem_en, stem_zh, correctIdx, opts_en, opts_zh, hint_en, hint_zh, id) {
    const order = rng.shuffle([0, 1, 2, 3]);
    const sh_en = order.map((i) => opts_en[i]);
    const sh_zh = order.map((i) => opts_zh[i]);
    const ci = order.indexOf(correctIdx);
    return {
      id, qtype: "mcq", difficulty: diff,
      stem_en, stem_zh,
      options_en: sh_en, options_zh: sh_zh,
      correct_index: ci,
      accepted_answers_en: [], accepted_answers_zh: [],
      hint_en, hint_zh,
      answer_en: sh_en[ci], answer_zh: sh_zh[ci],
      marks: 1,
    };
  }

  function mcqParticleSolid(rng, diff) {
    const correct = 0;
    return makeMcq(rng, diff,
      "According to the particle theory, which statement about particles in a solid is correct?",
      "根據粒子理論，下列哪一句關於固體中粒子的描述正確？",
      correct,
      ["Particles vibrate about fixed positions", "Particles move freely and fill the container", "Particles are far apart with weak forces", "Particles do not move at all"],
      ["粒子在固定位置附近振動", "粒子自由移動並充滿容器", "粒子相距甚遠且作用力弱", "粒子完全不動"],
      "Think about fixed shape and volume of solids.",
      "想想固體有固定形狀和體積。",
      "mcq_particle_solid"
    );
  }

  function mcqParticleGas(rng, diff) {
    const correct = 1;
    return makeMcq(rng, diff,
      "Which property of gases is best explained by the particle theory?",
      "下列哪項氣體的性質最能用粒子理論解釋？",
      correct,
      ["Gases have fixed volume", "Gases can be compressed easily", "Gases have high density", "Gas particles are larger than liquid particles"],
      ["氣體有固定體積", "氣體容易被壓縮", "氣體密度很高", "氣體粒子比液體粒子大"],
      "Gas particles are far apart with large empty spaces.",
      "氣體粒子相距甚遠，空隙大。",
      "mcq_particle_gas"
    );
  }

  function mcqCompoundDef(rng, diff) {
    const correct = 0;
    return makeMcq(rng, diff,
      "Which statement best describes a compound?",
      "下列哪一句最準確描述「化合物」？",
      correct,
      ["Two or more elements chemically combined in fixed ratio", "Two or more substances mixed physically", "A substance containing only one type of atom", "A solution of a solid in a liquid"],
      ["兩種或以上元素以固定比例化學結合", "兩種或以上物質物理混合", "只含一種原子的物質", "固體溶於液體的溶液"],
      "Compounds have a definite composition and can be decomposed.",
      "化合物有固定組成，可被分解。",
      "mcq_compound_def"
    );
  }

  function mcqMixtureDef(rng, diff) {
    const correct = 2;
    return makeMcq(rng, diff,
      "Which is a characteristic of a mixture?",
      "下列哪項是混合物的特徵？",
      correct,
      ["Fixed chemical formula", "Cannot be separated by physical methods", "Components retain their individual properties", "Always a single phase only"],
      ["有固定化學式", "不能以物理方法分離", "各成分保持原有性質", "必定只有一相"],
      "In a mixture, substances are not chemically bonded.",
      "混合物中各物質沒有化學鍵結合。",
      "mcq_mixture_def"
    );
  }

  function classifySubstance(rng, diff) {
    const sub = rng.choice(SUBSTANCES);
    const ans = TYPE_LABELS[sub.type];
    const wrong = ["element", "compound", "mixture"].filter((t) => t !== sub.type);
    const opts_en = [ans.en, ...wrong.map((t) => TYPE_LABELS[t].en)];
    const opts_zh = [ans.zh, ...wrong.map((t) => TYPE_LABELS[t].zh)];
    const order = rng.shuffle([0, 1, 2]);
    const sh_en = order.map((i) => opts_en[i]);
    const sh_zh = order.map((i) => opts_zh[i]);
    const ci = order.indexOf(0);
    return {
      id: "classify_" + sub.name_en.replace(/\s/g, "_"),
      qtype: "classification", difficulty: diff,
      stem_en: "Classify " + sub.name_en + " as an element, compound, or mixture.",
      stem_zh: "將「" + sub.name_zh + "」分類為元素、化合物或混合物。",
      options_en: sh_en, options_zh: sh_zh,
      correct_index: ci,
      accepted_answers_en: [ans.en], accepted_answers_zh: [ans.zh],
      hint_en: sub.type === "compound" ? "Can it be broken down into elements chemically?" : sub.type === "element" ? "Only one type of atom." : "More than one substance physically combined.",
      hint_zh: sub.type === "compound" ? "能否以化學方法分解為元素？" : sub.type === "element" ? "只有一種原子。" : "多於一種物質物理混合。",
      answer_en: ans.en, answer_zh: ans.zh,
      marks: 1,
    };
  }

  function classifyShort(rng, diff) {
    const sub = rng.choice(SUBSTANCES.filter((s) => s.type === "compound"));
    const ans = TYPE_LABELS.compound;
    return {
      id: "classify_short_" + sub.name_en.replace(/\s/g, "_"),
      qtype: "classification", difficulty: diff,
      stem_en: "State whether " + sub.name_en + " is an element, compound, or mixture.",
      stem_zh: "說明「" + sub.name_zh + "」是元素、化合物還是混合物。",
      options_en: null, options_zh: null, correct_index: null,
      accepted_answers_en: [ans.en, "compound"], accepted_answers_zh: [ans.zh, "化合物"],
      hint_en: "It has a fixed formula: " + (sub.formula || "") + ".",
      hint_zh: "它有固定化學式：" + (sub.formula || "") + "。",
      answer_en: "Compound", answer_zh: "化合物",
      marks: 1,
    };
  }

  function separationMcq(rng, diff) {
    const row = rng.choice(SEPARATIONS);
    const methods = [
      { en: "filtration", zh: "過濾法" },
      { en: "evaporation", zh: "蒸發法" },
      { en: "crystallization", zh: "結晶法" },
      { en: "fractional distillation", zh: "分餾法" },
      { en: "chromatography", zh: "色層分析法" },
      { en: "magnetic separation", zh: "磁性分離" },
    ];
    const wrong = methods.filter((m) => m.en !== row.method_en);
    const picks = rng.shuffle(wrong).slice(0, 2);
    const opts_en = [row.method_en, picks[0].en, picks[1].en, rng.choice(methods).en];
    const opts_zh = [row.method_zh, picks[0].zh, picks[1].zh, rng.choice(methods).zh];
    const unique_en = [...new Set(opts_en)];
    while (unique_en.length < 4) {
      const extra = rng.choice(methods);
      if (!unique_en.includes(extra.en)) unique_en.push(extra.en);
    }
    const final_en = rng.shuffle(unique_en.slice(0, 4));
    const final_zh = final_en.map((e) => methods.find((m) => m.en === e).zh);
    const ci = final_en.indexOf(row.method_en);
    return {
      id: "sep_" + row.method_en.replace(/\s/g, "_"),
      qtype: "separation", difficulty: diff,
      stem_en: "Which method is most suitable to separate " + row.mixture_en + "?",
      stem_zh: "分離「" + row.mixture_zh + "」最適合的方法是？",
      options_en: final_en, options_zh: final_zh,
      correct_index: ci,
      accepted_answers_en: [row.method_en], accepted_answers_zh: [row.method_zh],
      hint_en: row.hint_en, hint_zh: row.hint_zh,
      answer_en: row.method_en, answer_zh: row.method_zh,
      marks: diff === "hard" ? 2 : 1,
    };
  }

  function separationShort(rng, diff) {
    const row = rng.choice(SEPARATIONS.slice(0, 5));
    return {
      id: "sep_short_" + row.method_en.replace(/\s/g, "_"),
      qtype: "separation", difficulty: diff,
      stem_en: "Name a suitable separation technique for " + row.mixture_en + ".",
      stem_zh: "寫出一種適合分離「" + row.mixture_zh + "」的方法。",
      options_en: null, options_zh: null, correct_index: null,
      accepted_answers_en: [row.method_en, row.method_en.replace("fractional ", "")],
      accepted_answers_zh: [row.method_zh],
      hint_en: row.hint_en, hint_zh: row.hint_zh,
      answer_en: row.method_en, answer_zh: row.method_zh,
      marks: 2,
    };
  }

  function particleStateCompare(rng, diff) {
    const state = rng.choice(["solid", "liquid", "gas"]);
    const data = {
      solid: { en: "vibrate about fixed positions", zh: "在固定位置附近振動", wrong: ["move randomly at high speed", "slide over each other"] },
      liquid: { en: "slide over each other", zh: "互相滑動", wrong: ["vibrate about fixed positions", "are very far apart"] },
      gas: { en: "move randomly at high speed", zh: "高速隨機運動", wrong: ["vibrate about fixed positions", "are closely packed in layers"] },
    };
    const d = data[state];
    const correct = 0;
    const opts_en = [d.en, d.wrong[0], d.wrong[1], "do not possess kinetic energy"];
    const opts_zh = [d.zh, "在固定位置附近振動", "相距甚遠", "沒有動能"];
    return makeMcq(rng, diff,
      "How do particles in a " + state + " mainly behave?",
      state === "solid" ? "固體中的粒子主要如何運動？" : state === "liquid" ? "液體中的粒子主要如何運動？" : "氣體中的粒子主要如何運動？",
      correct, opts_en, opts_zh,
      "Relate particle motion to shape and volume of the state.",
      "聯繫粒子運動與該狀態的形狀和體積。",
      "particle_" + state
    );
  }

  function particleShort(rng, diff) {
    const state = rng.choice(["solid", "liquid", "gas"]);
    const answers = {
      solid: { en: "fixed shape and volume", zh: "固定形狀和體積" },
      liquid: { en: "fixed volume but no fixed shape", zh: "固定體積但無固定形狀" },
      gas: { en: "no fixed shape or volume", zh: "無固定形狀和體積" },
    };
    const a = answers[state];
    return {
      id: "particle_short_" + state,
      qtype: "particle", difficulty: diff,
      stem_en: "Describe the shape and volume of a " + state + " in terms of particle arrangement.",
      stem_zh: "從粒子排列說明" + (state === "solid" ? "固體" : state === "liquid" ? "液體" : "氣體") + "的形狀和體積。",
      options_en: null, options_zh: null, correct_index: null,
      accepted_answers_en: [a.en], accepted_answers_zh: [a.zh],
      hint_en: "Think about how closely packed particles are and how they move.",
      hint_zh: "想想粒子排列的緊密程度及運動方式。",
      answer_en: a.en, answer_zh: a.zh,
      marks: 2,
    };
  }

  function changeIdentify(rng, diff) {
    const isPhysical = rng.random() < 0.5;
    const item = rng.choice(isPhysical ? PHYSICAL_CHANGES : CHEMICAL_CHANGES);
    const correct = isPhysical ? 0 : 1;
    return makeMcq(rng, diff,
      "Is \"" + item.en + "\" a physical change or a chemical change?",
      "「" + item.zh + "」是物理變化還是化學變化？",
      correct,
      ["Physical change", "Chemical change", "Both physical and chemical", "Neither"],
      ["物理變化", "化學變化", "同時是物理和化學變化", "兩者都不是"],
      isPhysical ? "Is a new substance formed?" : "Look for new substances, colour change, gas, etc.",
      isPhysical ? "有否形成新物質？" : "留意新物質、顏色變化、氣體等。",
      "change_" + item.en.replace(/\s/g, "_").slice(0, 20)
    );
  }

  function changeShort(rng, diff) {
    const item = rng.choice(CHEMICAL_CHANGES);
    return {
      id: "change_short",
      qtype: "change", difficulty: diff,
      stem_en: "Give ONE observation that shows \"" + item.en + "\" is a chemical change.",
      stem_zh: "舉出一個現象說明「" + item.zh + "」是化學變化。",
      options_en: null, options_zh: null, correct_index: null,
      accepted_answers_en: ["new substance formed", "colour change", "gas evolved", "energy change", "cannot be easily reversed"],
      accepted_answers_zh: ["形成新物質", "顏色改變", "放出氣體", "能量變化", "不易回復"],
      hint_en: "Chemical changes form new substances and are usually difficult to reverse.",
      hint_zh: "化學變化會形成新物質，且通常不易回復。",
      answer_en: "A new substance is formed (e.g. colour change, gas given off, or energy released).",
      answer_zh: "形成新物質（例如顏色改變、放出氣體或能量變化）。",
      marks: 2,
    };
  }

  function shortDefineElement(rng, diff) {
    return {
      id: "short_element",
      qtype: "short", difficulty: diff,
      stem_en: "Define the term element.",
      stem_zh: "定義「元素」。",
      options_en: null, options_zh: null, correct_index: null,
      accepted_answers_en: ["substance made of one type of atom", "one type of atom", "cannot be broken down into simpler substances by chemical means"],
      accepted_answers_zh: ["只由一種原子組成的物質", "一種原子", "不能以化學方法分解為更簡單物質"],
      hint_en: "Think about atoms and the periodic table.",
      hint_zh: "想想原子與週期表。",
      answer_en: "A substance made of only one type of atom, which cannot be broken down into simpler substances by chemical means.",
      answer_zh: "只由一種原子組成、不能以化學方法分解為更簡單物質的物質。",
      marks: 2,
    };
  }

  function shortFiltration(rng, diff) {
    return {
      id: "short_filtration",
      qtype: "short", difficulty: diff,
      stem_en: "Explain briefly how filtration separates an insoluble solid from a liquid.",
      stem_zh: "簡述過濾法如何分離不溶固體與液體。",
      options_en: null, options_zh: null, correct_index: null,
      accepted_answers_en: ["solid particles too large to pass through filter paper", "insoluble solid retained on filter paper filtrate passes through"],
      accepted_answers_zh: ["固體粒子太大無法通過濾紙", "不溶固體留在濾紙上濾液通過"],
      hint_en: "What happens to particle size relative to the filter pores?",
      hint_zh: "粒子大小與濾紙孔隙有何關係？",
      answer_en: "The insoluble solid particles are too large to pass through the filter paper; the liquid (filtrate) passes through.",
      answer_zh: "不溶固體粒子太大無法通過濾紙，液體（濾液）則可通過。",
      marks: 2,
    };
  }

  const BUILDERS = {
    "atomic-structure": [shortDefineElement, mcqParticleSolid, mcqParticleGas],
    "periodic-table": [mcqCompoundDef, mcqMixtureDef, classifySubstance],
    "ionic-bond": [shortDefineElement, classifyShort],
    "covalent-bond": [mcqCompoundDef, particleShort],
    "structure-properties": [particleStateCompare, particleShort, changeIdentify],
  };

  let PDF_BANK = [];
  let pdfBankLoadPromise = null;

  function loadPdfBank() {
    if (!pdfBankLoadPromise) {
      pdfBankLoadPromise = fetch("./pdf-question-bank.json?v=20260629")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          PDF_BANK = (Array.isArray(data) ? data : []).map((e) => window.Ch5EmbedUI.normalizeQuestion(e));
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

  function generateFromBuilders(rng, types, difficulty, count) {
    let buildersFlat = [];
    types.forEach((t) => { (BUILDERS[t] || []).forEach((b) => buildersFlat.push({ type: t, fn: b })); });
    if (!buildersFlat.length) buildersFlat = [{ type: "atomic-structure", fn: shortDefineElement }];
    const out = [];
    for (let i = 0; i < count; i++) {
      let picked = rng.choice(buildersFlat);
      let q = picked.fn(rng, difficulty);
      q.qtype = picked.type;
      let guard = 0;
      while (!allowedByDifficulty(q, difficulty) && guard < 20) {
        picked = rng.choice(buildersFlat);
        q = picked.fn(rng, difficulty);
        q.qtype = picked.type;
        guard++;
      }
      q.id = q.id + "_fb_" + i;
      out.push(window.Ch5EmbedUI.normalizeQuestion(q));
    }
    return out;
  }

  async function generateQuestions(count, types, difficulty, userSeed) {
    await loadPdfBank();
    const seed = await stableSeed(String(userSeed || ""), count, types, difficulty);
    const rng = createRng(seed);

    let pool = PDF_BANK.filter(
      (q) => types.includes(q.qtype) && allowedByDifficulty(q, difficulty)
    );
    pool = rng.shuffle(pool);

    const pdfTarget = pool.length
      ? Math.min(count, pool.length, Math.max(1, Math.ceil(count * 0.85)))
      : 0;

    const out = [];
    for (let i = 0; i < pdfTarget; i++) {
      out.push(bankEntryToQuestion(pool[i], i));
    }

    if (out.length < count) {
      const fallback = generateFromBuilders(rng, types, difficulty, count - out.length);
      out.push(...fallback);
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
      cb.checked = checked.size ? checked.has(qt.id) : ["atomic-structure", "periodic-table", "ionic-bond"].includes(qt.id);
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
    const titleEn = answersMode ? "HKDSE Chemistry — Microscopic world 1 (Answers)" : "HKDSE Chemistry — Microscopic world 1 (Questions)";
    const titleZh = answersMode ? "化學 — 微觀世界 1（答案）" : "化學 — 微觀世界 1（試題）";
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
    const titleEn = answersMode ? "Microscopic world 1 — Answers" : "Microscopic world 1 — Questions";
    let body = "";
    lastQuestions.forEach((q, i) => {
      body += "<h2>Q" + (i + 1) + " [" + escHtml(q.qtype) + "]</h2><p><b>EN:</b> " + escHtml(q.stem_en) + "</p><p><b>中文：</b> " + escHtml(q.stem_zh) + "</p>";
      if (answersMode) body += "<p><b>Answer:</b> " + escHtml(q.answer_en) + " / " + escHtml(q.answer_zh) + "</p>";
    });
    const html = "<html><head><meta charset=\"utf-8\"><title>" + escHtml(titleEn) + "</title></head><body><h1>" + escHtml(titleEn) + "</h1>" + body + "</body></html>";
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (answersMode ? "microscopic_answers_" : "microscopic_questions_") + Date.now() + ".doc";
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
