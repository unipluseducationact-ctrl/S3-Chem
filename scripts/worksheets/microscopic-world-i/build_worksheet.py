# -*- coding: utf-8 -*-
from __future__ import annotations
import json, os, re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
TPL = Path(os.environ.get(
    "QUIZ_TEMPLATE_DIR",
    r"C:\Users\UniplusUser02\.agents\skills\create-quiz\templates",
))
MC_JSON = SCRIPTS / "questions_mc.json"
LQ_JSON = SCRIPTS / "questions_lq.json"
ASSETS = ROOT / "assets"

SECTIONS = [
    {"id": "atomic-structure", "label": "Atomic Structure", "labelZh": "原子結構"},
    {"id": "periodic-table", "label": "Periodic Table", "labelZh": "週期表"},
    {"id": "ionic-bond", "label": "Ionic Bond", "labelZh": "離子鍵"},
    {"id": "covalent-bond", "label": "Covalent Bond", "labelZh": "共價鍵"},
    {"id": "structure-properties", "label": "Structure and Properties", "labelZh": "物質結構與性質"},
]

EXPLICIT_EXCLUDE_IDS = {
    "ib-25-a",
    "sp-12-a-i",
    "sp-32-a-i",
    # Diagram-dependent / broken atomic-structure items
    "as-01-a",
    "as-02-a-i",
    "as-04-a",
    "as-08-a-i",
    "as-08-a-ii",
    "as-11-a-i",
    "mc-05032",
    "mc-05033",
}
EXPLICIT_SOURCE_EXCLUDE = re.compile(
    r"Part 3 Q25\(a\)$|Part 5 Q12\(a\)\(i\)$|Part 5 Q32\(a\)\(i\)$",
)
DRAW_EX = re.compile(
    r"\bdraw\b|"
    r"\blabel\b.*\bdiagram\b|"
    r"complete the diagram|"
    r"\belectron diagram\b|"
    r"with the (aid|help) of|"
    r"\bmark\b.*\bdiagram\b|"
    r"in this diagram|"
    r"draw the structure|"
    r"indicate the interactions|"
    r"in each of the following boxes|"
    r"draw.*structural formula|"
    r"fill in the missing ions|"
    r"labelled diagram",
    re.I,
)
LONG_EX = re.compile(r"\bexplain\b|\bdiscuss\b|suggest why", re.I)
DIAGRAM_READ = re.compile(
    r"give the letter from the diagram|"
    r"give the symbol.*from the diagram|"
    r"from the diagram that",
    re.I,
)
DIAGRAM = re.compile(r"\bdiagram\b|\bfigure\b|table below|shown below", re.I)
NUMERIC_STEM = re.compile(r"\bcalculate\b|\bdetermine\b|mass number|atomic number|how many", re.I)

DEF_STEM = re.compile(
    r"meaning of the term|what is meant by|state the meaning|define the term|definition of",
    re.I,
)
LABEL_FRAG = re.compile(
    r"^(cross|black dot|white dot|element|isotope|metals\?|non-metals\?)$",
    re.I,
)
BROKEN_MC_STEM = re.compile(
    r" of \?|,\s*,|\band  are\b|^and  |arrangement of the atom\s+is",
    re.I,
)
BROKEN_TABLE_STEM = re.compile(
    r"Complete the following table.*\bNo:\s*\d+\s*\|",
    re.I | re.S,
)
CALC_STEM = re.compile(r"\bcalculate\b", re.I)
DEICTIC_STEM = re.compile(
    r"\bthis (element|atom)\b|"
    r"number of Z\b|"
    r"\bparticle [A-Z]\b|"
    r"numbers of particle|"
    r"of this (element|atom)\b|"
    r"Atomic number of this atom|"
    r"Mass number of this atom|"
    r"Period number of this element|"
    r"\bof isotope [A-Z]\b|"
    r"\bisotope [A-Z]\b|"
    r"\bblack dot\b|"
    r"\batom [A-Z] belongs\b|"
    r"\bthe atom\b|"
    r"subatomic particle does n\s+\d",
    re.I,
)
BAD_LQ_ANSWER = re.compile(
    r"^\([a-z]\)$|不可翻印|警告:|^\(f\)\s",
    re.I,
)
ISO_TOPE_ROW = re.compile(
    r"Isotope\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)",
    re.I,
)
SUPERSCRIPT = str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")


def format_isotope_notation(text: str) -> str:
    def repl(m: re.Match) -> str:
        return m.group(1).translate(SUPERSCRIPT) + m.group(2)
    return re.sub(
        r"(?<![.\d/])(\d{1,3})([A-Z][a-z]{0,2})\b",
        repl,
        text,
    )


def _split_trailing_question(text: str) -> tuple[str, str]:
    text = text.strip()
    if not text:
        return "", ""
    q_start = re.compile(
        r"^(Which of the following|What is the|What is |What are |How many|Give the|"
        r"State the|Complete the|Calculate the|Determine the|Who|Where|When|Why|How|"
        r"Name the|Write down|Suggest|Predict|Explain|Describe|Arrange|Compare|"
        r"Identify|Select|Choose)\b",
        re.I,
    )
    if q_start.match(text):
        return "", text
    m = re.search(
        r"\s+(Which of the following|What is the|What is |What are |How many|Give the|"
        r"State the|Complete the|Calculate the|Determine the|Who|Where|When|Why|How|"
        r"Name the|Write down|Suggest|Predict|Explain|Describe|Arrange|Compare|"
        r"Identify|Select|Choose)\b",
        text,
        re.I,
    )
    if m:
        return text[: m.start()].strip(), text[m.start() :].strip()
    return text, ""


def _format_isotope_abundance_table(stem: str) -> str | None:
    m = re.search(
        r"(Number of protons\s+Number of neutrons\s+Relative abundance\s*/?\s*%?\s*)"
        r"((?:Isotope\s+\d+\s+\d+\s+\d+\s+[\d.]+\s*)+)",
        stem,
        re.I,
    )
    if not m:
        return None
    rows = ISO_TOPE_ROW.findall(m.group(2))
    if not rows:
        return None
    prefix = stem[: m.start()].rstrip()
    table = "Protons | Neutrons | Abundance %\n" + "\n".join(
        f"Isotope {iso}: {p} | {n} | {ab}" for iso, p, n, ab in rows
    )
    _, suffix = _split_trailing_question(stem[m.end() :])
    return f"{prefix}\n\n{table}\n\n{suffix}".strip() if suffix else f"{prefix}\n\n{table}".strip()


def _format_particle_xyz_table(stem: str) -> str | None:
    m = re.search(
        r"((?:[A-Z]\s+){1,}[A-Z])\s+"
        r"Number of protons\s+((?:\d+\s+)+)"
        r"Number of neutrons\s+((?:\d+\s+)+)"
        r"(?:Number of electrons\s+((?:\d+\s+)+))?",
        stem,
        re.I,
    )
    if not m:
        return None
    labels = m.group(1).split()
    protons = m.group(2).split()
    neutrons = m.group(3).split()
    electrons = (m.group(4) or "").split()
    n = len(labels)
    if n < 2 or len(protons) < n or len(neutrons) < n:
        return None
    prefix = stem[: m.start()].rstrip()
    lines = [" | ".join([""] + labels)]
    lines.append("Protons | " + " | ".join(protons[:n]))
    lines.append("Neutrons | " + " | ".join(neutrons[:n]))
    if len(electrons) >= n:
        lines.append("Electrons | " + " | ".join(electrons[:n]))
    _, suffix = _split_trailing_question(stem[m.end() :])
    table = "\n".join(lines)
    return f"{prefix}\n\n{table}\n\n{suffix}".strip() if suffix else f"{prefix}\n\n{table}".strip()


def _format_atom_wxyz_table(stem: str) -> str | None:
    m = re.search(
        r"Atom\s+Number of neutrons\s+Number of electrons\s+Mass number\s+"
        r"((?:[A-Z]\s+\d+\s+\d+\s+\d+\s*)+)",
        stem,
        re.I,
    )
    if not m:
        return None
    rows = re.findall(r"([A-Z])\s+(\d+)\s+(\d+)\s+(\d+)", m.group(1))
    if not rows:
        return None
    prefix = stem[: m.start()].rstrip()
    lines = ["Atom | Neutrons | Electrons | Mass number"]
    lines.extend(f"{a} | {n} | {e} | {mass}" for a, n, e, mass in rows)
    _, suffix = _split_trailing_question(stem[m.end() :])
    table = "\n".join(lines)
    return f"{prefix}\n\n{table}\n\n{suffix}".strip() if suffix else f"{prefix}\n\n{table}".strip()


def _format_species_table(stem: str) -> str | None:
    m = re.search(
        r"Species\s+Electronic arrangement\s+((?:[A-Z0-9+\-]+\s+[\d,]+\s*)+)",
        stem,
        re.I,
    )
    if not m:
        return None
    rows = re.findall(r"([A-Z0-9+\-]+)\s+([\d,]+)", m.group(1))
    if not rows:
        return None
    prefix = stem[: m.start()].rstrip()
    lines = ["Species | Electronic arrangement"] + [
        f"{sp} | {arr}" for sp, arr in rows
    ]
    _, suffix = _split_trailing_question(stem[m.end() :])
    table = "\n".join(lines)
    return f"{prefix}\n\n{table}\n\n{suffix}".strip() if suffix else f"{prefix}\n\n{table}".strip()


def _format_complete_table(stem: str) -> str | None:
    if not re.search(r"Complete the following table", stem, re.I):
        return None
    m = re.match(r"(Complete the following table[:\s]+)(.+)", stem, re.I | re.S)
    if not m:
        return None
    header_part = m.group(1).strip()
    rest = m.group(2).strip()
    if "\n" in rest and rest.count("\n") >= 2:
        return None
    labels = re.findall(
        r"[A-Z][a-z]+(?:\s+of\s+[a-z]+)?(?:\s+[a-z]+)*|No\.\s+of\s+\w+|"
        r"Full atomic symbol|Electronic arrangement|Name of element|"
        r"Physical state|Color|Type\(s\) of chemical bonding|"
        r"Particle|Proton|Neutron|Electron|Mass number|Atomic number|"
        r"Period number|Group number|Element|Substance|State at room",
        rest,
        re.I,
    )
    if len(labels) < 3:
        return None
    # Find where numeric tail starts after last label
    tail_start = 0
    for label in labels:
        idx = rest.find(label, tail_start)
        if idx >= 0:
            tail_start = idx + len(label)
    tail = rest[tail_start:].strip()
    if not tail or not re.search(r"\d", tail):
        return None
    nums = re.findall(r"[\d.]+|[A-Z][a-z]+(?:\s+\d+[A-Za-z]+)?", tail)
    if len(nums) < 4:
        return None
    chunk = max(1, len(nums) // len(labels))
    lines = [header_part, ""]
    for i, label in enumerate(labels):
        start = i * chunk
        end = start + chunk if i < len(labels) - 1 else len(nums)
        row_vals = nums[start:end]
        if row_vals:
            lines.append(f"{label}: {' | '.join(row_vals)}")
    return "\n".join(lines).strip()


def format_table_in_stem(stem: str) -> str:
    for fn in (
        _format_isotope_abundance_table,
        _format_atom_wxyz_table,
        _format_particle_xyz_table,
        _format_species_table,
        _format_complete_table,
    ):
        out = fn(stem)
        if out:
            return out
    if re.search(r"following table|table below|table shows", stem, re.I):
        table_m = re.search(
            r"((?:Number of|Relative abundance|Isotope|Atom|Species|Substance|Element)\s+.+)",
            stem,
            re.I,
        )
        if table_m:
            prefix = stem[: table_m.start()].rstrip()
            table_part, suffix = _split_trailing_question(table_m.group(1))
            if suffix:
                return f"{prefix}\n\n{table_part}\n\n{suffix}".strip()
            return f"{prefix}\n\n{table_part}".strip()
    return stem


def cleanup_graph_stem_noise(stem: str) -> str:
    if not re.search(r"graph below", stem, re.I):
        return stem
    m = re.match(r"(.+?graph below shows[^.]*\.\s*)", stem, re.I | re.S)
    if not m:
        return stem
    prefix = m.group(1).strip()
    tail = stem[m.end() :]
    q = re.search(r"(What is the .+)$", tail, re.I)
    if q:
        return f"{prefix}\n\n{q.group(1).strip()}"
    cleaned = re.sub(
        r"(?:\d*[A-Z])+(?:Relative abundance\s*/?\s*%|Relative isotopic mass)+",
        "",
        tail,
        flags=re.I,
    )
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
    return f"{prefix}\n\n{cleaned}".strip() if cleaned else prefix


def format_stem_pipeline(stem: str) -> str:
    stem = cleanup_graph_stem_noise(stem)
    stem = format_table_in_stem(stem)
    stem = format_stem_for_display(stem)
    return format_isotope_notation(stem)


def is_bare_multi_diagram_mc(stem: str, options: list) -> bool:
    if not re.search(r"\(1\).*\(2\).*\(3\)", stem, re.S):
        return False
    if re.search(r"\(1\)[A-Za-z(]", stem):
        return False
    combo = all(re.search(r"\(\d\)", o.get("text", "")) for o in options)
    return bool(combo and re.search(r"\(3\)\s*$", stem.strip()))


def format_stem_for_display(stem: str) -> str:
    if re.search(r"\(1\)", stem):
        stem = re.sub(r"\?\s*\((\d+)\)", r"?\n\n(\1)", stem)
        stem = re.sub(r"\((\d+)\)(?=[A-Za-z(])", r"(\1) ", stem)
    if re.search(r"\(1\).*\(2\).*\(3\)", stem):
        stem = re.sub(r"\s*\((\d+)\)", r"\n(\1)", stem).strip()
    return stem


COMBINATION_STEM_RE = re.compile(
    r"\bcombinations?\b.*(?:correct|INCORRECT|likely to be correct)",
    re.I,
)
COMBINATION_III_OPTION_RE = re.compile(r"^\(\d\)")
NAME_FORMULA_OPTION_RE = re.compile(r"^(.+?)\s+([A-Z][A-Za-z0-9()+\-²³⁰-⁹]+)$")

KNOWN_COMBINATION_HEADERS = [
    "Number of neutrons",
    "Number of protons",
    "Number of electrons",
    "Particles in the lattice",
    "Attraction between particles",
    "Nature of the compound",
    "Formula of the compound",
    "Colour in aqueous solution",
    "Relative molecular mass",
    "Molecular formula",
    "Nature of bonding",
    "Chemical formula",
    "Type of bonding",
    "Constituent particles",
    "Melting point / C",
    "Boiling point / C",
    "Melting point",
    "Boiling point",
    "Pure substance",
    "Group name",
    "Element X",
    "Element Y",
    "Element P",
    "Element Q",
    "Atom X",
    "Atom Y",
    "Description",
    "Substance",
    "Structure",
    "Electrolyte",
    "Mixture",
    "Formula",
    "Name",
    "Ion",
    "Crystal",
    "Aluminium",
    "Copper",
    "Iron",
    "P2+(aq)",
    "Q2(aq)",
    "R2+(aq)",
    "S2(aq)",
    "Ba(NO3)2",
    "Cl2O",
    "x",
    "y",
    "A",
    "B",
    "C",
    "X",
    "Y",
    "Z",
]

KNOWN_COMBINATION_PHRASES = KNOWN_COMBINATION_HEADERS + [
    "Dilute sulphuric acid",
    "Potassium chloride",
    "Magnesium oxide",
    "Silicon dioxide",
    "Ammonium chloride",
    "Sodium carbonate",
    "Magnesium nitrate",
    "Aluminium oxide",
    "Barium(II) nitrate",
    "Barium nitrate",
    "Dichlorine monoxide",
    "Dichlorine oxide",
    "Polyethene",
    "Ethanol",
    "Glucose",
    "Graphite",
    "Van der Waals' forces",
    "Van der Waals’ forces",
    "Intermolecular forces",
    "Ionic bond",
    "Covalent bond",
    "Metallic bond",
    "Number of protons",
    "Number of neutrons",
    "Number of electrons",
]


def _phrase_list_sorted(phrases: list[str]) -> list[str]:
    return sorted(set(phrases), key=len, reverse=True)


def _greedy_phrase_split(text: str, phrases: list[str]) -> list[str]:
    text = " ".join(text.split())
    if not text:
        return []
    sorted_phrases = _phrase_list_sorted(phrases)
    parts: list[str] = []
    pos = 0
    while pos < len(text):
        while pos < len(text) and text[pos] == " ":
            pos += 1
        if pos >= len(text):
            break
        matched = False
        for phrase in sorted_phrases:
            end = pos + len(phrase)
            if text[pos:end].lower() == phrase.lower() and (
                end == len(text) or text[end] == " "
            ):
                parts.append(text[pos:end])
                pos = end
                matched = True
                break
        if not matched:
            return []
    return parts


def _capital_boundary_split(text: str) -> list[str]:
    return [p.strip() for p in re.split(r"(?<=[a-z)])\s+(?=[A-Z])", text) if p.strip()]


def _is_simple_token_column(text: str) -> bool:
    tokens = text.split()
    if len(tokens) < 2:
        return False
    if all(re.fullmatch(r"\d+", t) for t in tokens):
        return True
    if all(re.fullmatch(r"\d+", t) or re.fullmatch(r"[A-Z][a-z]*", t) for t in tokens):
        if any(re.fullmatch(r"\d+", t) for t in tokens):
            return True
        if all(re.fullmatch(r"[A-Z][a-z]*", t) for t in tokens):
            return True
    if all(re.search(r"[\d+]", t) or re.search(r"\(aq\)", t) for t in tokens):
        return True
    return False


def _split_combination_columns(text: str, ncol: int | None, phrases: list[str]) -> list[str]:
    text = " ".join(text.split())
    if not text:
        return []

    parts = _greedy_phrase_split(text, phrases)
    if parts and (ncol is None or len(parts) == ncol):
        return parts

    if ncol == 2:
        m = NAME_FORMULA_OPTION_RE.match(text)
        if m:
            return [m.group(1).strip(), m.group(2).strip()]

    if _is_simple_token_column(text):
        tokens = text.split()
        if ncol is None or len(tokens) == ncol:
            return tokens

    caps = _capital_boundary_split(text)
    if caps and (ncol is None or len(caps) == ncol):
        return caps

    tokens = text.split()
    if ncol is None or len(tokens) == ncol:
        return tokens

    if parts:
        return parts
    if caps:
        return caps
    return tokens


def _infer_combination_ncol(options: list, phrases: list[str]) -> int:
    counts: list[int] = []
    for opt in options:
        text = opt.get("text", "").strip()
        if not text:
            continue
        parts = _split_combination_columns(text, None, phrases)
        if parts:
            counts.append(len(parts))
    if not counts:
        return 0
    return max(set(counts), key=counts.count)


def extract_combination_header_suffix(stem: str) -> str:
    m = re.search(r"\bcombinations?\b", stem, re.I)
    if not m:
        return ""
    tail = stem[m.start() :]
    qm = re.search(r"\?", tail)
    if not qm:
        return ""
    rest = tail[qm.end() :].strip()
    rest = re.sub(r"^\([^)]+\)\s*", "", rest).strip()
    if re.search(r"\(1\).*\(2\)", rest):
        return ""
    return rest


def is_combination_table_mcq(stem: str, options: list) -> bool:
    if not COMBINATION_STEM_RE.search(stem):
        return False
    texts = [o.get("text", "").strip() for o in options]
    if not texts:
        return False
    if all(COMBINATION_III_OPTION_RE.match(t) for t in texts):
        return False
    return any(len(t.split()) >= 2 for t in texts)


def parse_combination_headers(stem: str, ncol: int) -> list[str]:
    suffix = extract_combination_header_suffix(stem)
    if not suffix:
        return []
    phrases = _phrase_list_sorted(KNOWN_COMBINATION_HEADERS)
    parts = _split_combination_columns(suffix, ncol, phrases)
    return parts if parts else [suffix]


def format_combination_option(text: str, ncol: int) -> str:
    text = " ".join(text.split())
    parts = _split_combination_columns(text, ncol, KNOWN_COMBINATION_PHRASES)
    if len(parts) > 1:
        return ", ".join(parts)
    return text


def format_combination_stem(stem: str, ncol: int) -> str:
    suffix = extract_combination_header_suffix(stem)
    if not suffix or ncol < 2:
        return stem
    headers = parse_combination_headers(stem, ncol)
    if len(headers) < 2:
        return stem
    header_line = ", ".join(headers)
    if stem.endswith(suffix):
        prefix = stem[: -len(suffix)].rstrip()
    else:
        prefix = stem.replace(suffix, "", 1).rstrip()
    return f"{prefix}\n{header_line}"


def calc_missing_data(stem: str) -> bool:
    if not CALC_STEM.search(stem):
        return False
    sl = stem.lower()
    if re.search(r"\bthis element\b", sl) and len(re.findall(r"\d+\.?\d*%?", stem)) < 2:
        return True
    if "table" in sl or "given" in sl or "following" in sl:
        return False
    nums = re.findall(r"\d+\.?\d*%?", stem)
    return len(nums) < 2


def validate_mc_item(q: dict) -> bool:
    if q.get("answerMissing") or not q.get("answer"):
        return False
    stem = q.get("stem", "")
    opts = q.get("options", [])
    texts = [o.get("text", "").strip() for o in opts]
    if any(len(t) < 1 for t in texts):
        return False
    if any(not t or t.lower() == "and" for t in texts):
        return False
    if any(len(t) < 3 and t.lower() in ("", "and") for t in texts):
        return False
    if any(re.fullmatch(r"[,.\s;:]+", t) for t in texts):
        return False
    if BROKEN_MC_STEM.search(stem):
        return False
    if len(stem.strip()) < 20:
        return False
    if is_bare_multi_diagram_mc(stem, opts):
        return False
    return True


def validate_lq_item(item: dict) -> bool:
    stem = item.get("stem", "").strip()
    ans = item.get("answer", "").strip()
    if len(stem) < 12 or LABEL_FRAG.match(stem):
        return False
    if DEF_STEM.search(stem):
        return False
    if DEICTIC_STEM.search(stem):
        return False
    if BROKEN_TABLE_STEM.search(stem):
        return False
    if BAD_LQ_ANSWER.search(ans):
        return False
    if calc_missing_data(stem):
        return False
    return True


def marks_difficulty(m):
    if m <= 1: return "Foundation"
    if m == 2: return "Standard"
    return "Applied"


def answer_variants(ans: str) -> list[str]:
    ans = re.sub(r"\s+", " ", ans.strip())
    if not ans: return []
    out = [ans]
    short = re.sub(r"[.,;:]$", "", ans)
    if short not in out: out.append(short)
    for part in re.split(r"\s*[,;]\s*|\s+and\s+", short):
        p = part.strip()
        if 0 < len(p) < 60 and p not in out: out.append(p)
    if re.fullmatch(r"-?\d+(\.\d+)?", short):
        if "." in short:
            out.append(str(float(short)))
            out.append(f"{float(short):.1f}")
        else:
            out.append(str(int(short)))
    return list(dict.fromkeys(x for x in out if x))


def parse_answer_parts(ans: str) -> list[str]:
    ans = re.sub(r"\s+", " ", ans.strip())
    if not ans: return []
    eq_parts = re.findall(r"(?:[A-Za-z][A-Za-z0-9\s]*?=\s*[^,;]+)", ans)
    if len(eq_parts) >= 2:
        return [re.sub(r"^[^=]+=\s*", "", p).strip() for p in eq_parts]
    if ";" in ans:
        parts = [p.strip() for p in ans.split(";") if p.strip()]
        if 1 < len(parts) <= 6: return parts
    return [ans]


def classify_lq(item: dict) -> tuple[str, str]:
    stem = item.get("stem", "")
    sl = stem.lower()
    marks = int(item.get("marks") or 1)
    ans = item.get("answer", "")
    qid = item.get("id", "")
    source = item.get("sourceRef", "")
    if qid in EXPLICIT_EXCLUDE_IDS or EXPLICIT_SOURCE_EXCLUDE.search(source):
        return "exclude", "drawing or on-figure answer"
    if not item.get("hasAnswer") or not ans:
        return "exclude", "no answer"
    if DRAW_EX.search(sl):
        return "exclude", "drawing"
    if marks >= 2 and LONG_EX.search(sl):
        return "exclude", "long explain"
    if len(ans) > 140 and marks >= 2:
        return "exclude", "long answer"
    if DIAGRAM.search(sl):
        if DIAGRAM_READ.search(sl):
            return "include-needs-image", "diagram"
        return "exclude", "diagram task"
    if marks <= 2 or NUMERIC_STEM.search(sl) or re.search(
        r"write down|state|name|which|what is|complete the following|fill in", sl, re.I
    ):
        return "include", "short"
    if len(ans) <= 80:
        return "include", "short answer"
    return "exclude", "open ended"


def lq_to_fill(item: dict) -> dict:
    ans = item["answer"]
    parts = parse_answer_parts(ans)
    marks = int(item.get("marks") or 1)
    lines = []
    if len(parts) == 1:
        lines.append({"segments": [
            {"type": "text", "value": "Answer: "},
            {"type": "blank", "accept": answer_variants(parts[0])},
        ]})
    else:
        for i, p in enumerate(parts, 1):
            lines.append({"segments": [
                {"type": "text", "value": f"({i}) "},
                {"type": "blank", "accept": answer_variants(p)},
            ]})
    return {
        "id": item["id"],
        "section": item["section"],
        "format": "fill",
        "difficulty": marks_difficulty(marks),
        "stem": format_stem_pipeline(item["stem"]),
        "lines": lines,
        "hint": f"See {item.get('sourceRef', 'notes')}. ({marks} mark{'s' if marks!=1 else ''})",
        "sourceRef": item.get("sourceRef", ""),
    }


def mc_to_item(q: dict) -> dict | None:
    if not validate_mc_item(q):
        return None
    raw_stem = q["stem"]
    raw_options = q["options"]
    if is_combination_table_mcq(raw_stem, raw_options):
        ncol = _infer_combination_ncol(raw_options, KNOWN_COMBINATION_PHRASES)
        combo_stem = format_combination_stem(raw_stem, ncol)
        stem = format_stem_pipeline(combo_stem)
        options = [
            {
                "key": o["key"],
                "text": format_isotope_notation(
                    format_combination_option(o.get("text", ""), ncol)
                ),
            }
            for o in raw_options
        ]
    else:
        stem = format_stem_pipeline(raw_stem)
        options = [
            {"key": o["key"], "text": format_isotope_notation(o.get("text", ""))}
            for o in raw_options
        ]
    item = {
        "id": q["id"],
        "section": q["section"],
        "format": "mcq",
        "difficulty": q.get("difficulty", "Standard"),
        "stem": stem,
        "options": options,
        "answer": q["answer"],
        "hint": q.get("hint") or "Review your notes.",
        "sourceRef": q.get("sourceRef", q["id"]),
    }
    files = q.get("imageFiles") or []
    if files:
        item["_imageFile"] = files[0]
    return item


def attach_image(item: dict, image_map: dict) -> dict:
    f = item.pop("_imageFile", None) or image_map.get(item["id"], {}).get("file")
    if f:
        info = image_map.get(item["id"], {})
        item["image"] = {
            "src": f"../assets/{f}",
            "alt": info.get("alt", item.get("stem", "")[:80]),
            "caption": info.get("caption", info.get("alt", "Diagram")),
        }
    return item


def build_image_map(mc_raw: list, lq_included: list) -> dict:
    m = {}
    for q in mc_raw:
        files = q.get("imageFiles") or []
        if files and not q.get("answerMissing"):
            m[q["id"]] = {
                "file": files[0],
                "alt": q["stem"][:100],
                "caption": f"Fig - {q['sourceRef']}",
            }
    for q in lq_included:
        if q.get("_needsImage"):
            m[q["id"]] = {
                "file": "",
                "alt": q["stem"][:100],
                "caption": f"Fig - {q.get('sourceRef','')} (crop pending)",
                "pending": True,
            }
    return m


def write_sections():
    p = ROOT / "extracted" / "sections.json"
    p.write_text(json.dumps(SECTIONS, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_extraction_review(mc, lq_all, lq_inc):
    by_sec_mc = {}
    by_sec_lq = {}
    for q in mc:
        if q.get("answerMissing"): continue
        by_sec_mc[q["section"]] = by_sec_mc.get(q["section"], 0) + 1
    for q in lq_inc:
        by_sec_lq[q["section"]] = by_sec_lq.get(q["section"], 0) + 1
    lines = [
        "# Extraction review - Microscopic World I",
        "",
        "## MC (docx)",
        f"- Total parsed: {len(mc)}",
        f"- With answer: {sum(1 for q in mc if q.get('answer'))}",
        f"- With images: {sum(1 for q in mc if q.get('imageFiles'))}",
        "",
        "## LQ (pdf)",
        f"- Total sub-parts: {len(lq_all)}",
        f"- Included after filter: {len(lq_inc)}",
        "",
        "## By section",
        "",
        "| Section | MCQ | Short answer |",
        "|---------|-----|--------------|",
    ]
    for s in SECTIONS:
        sid = s["id"]
        lines.append(f"| {s['label']} | {by_sec_mc.get(sid,0)} | {by_sec_lq.get(sid,0)} |")
    lines.append("")
    (ROOT / "extracted" / "extraction-review.md").write_text("\n".join(lines), encoding="utf-8")


def write_quiz_review(items):
    lines = [
        "# Quiz review - Microscopic World I",
        "",
        "| # | id | section | format | difficulty | answer | image? | stem (truncated) |",
        "|---|-----|---------|--------|------------|--------|--------|------------------|",
    ]
    for i, q in enumerate(items[:25], 1):
        stem = q.get("stem", "").replace("\n", " ")[:55]
        ans = q.get("answer") or (q.get("lines") and "fill") or "-"
        img = "yes" if q.get("image") or q.get("_imageFile") else "-"
        lines.append(f"| {i} | {q['id']} | {q['section']} | {q.get('format','mcq')} | {q.get('difficulty','')} | {str(ans)[:12]} | {img} | {stem} |")
    lines += ["", f"**Total in bank:** {len(items)}", ""]
    (ROOT / "draft" / "quiz-review.md").write_text("\n".join(lines), encoding="utf-8")


def write_quiz_data(locale: str, items: list, image_map: dict):
    out_items = []
    for raw in items:
        q = dict(raw)
        if q.get("_needsImage") and not image_map.get(q["id"], {}).get("file"):
            q.pop("_needsImage", None)
        else:
            attach_image(q, image_map)
        q.pop("_needsImage", None)
        out_items.append(q)
    js = (
        "/** Auto-generated by scripts/build_worksheet.py */\n\n"
        + "export const QUIZ_SECTIONS = "
        + json.dumps(SECTIONS, ensure_ascii=False, indent=2)
        + ";\n\nexport const QUIZ_ITEMS = "
        + json.dumps(out_items, ensure_ascii=False, indent=2)
        + ";\n"
    )
    dest = ROOT / locale / "js" / "quizData.js"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(js, encoding="utf-8")


def patch_quiz_utils(text: str) -> str:
    text = text.replace(
        '{ id: "fill", labelEn: "Fill in the blanks", labelZh: "填充題", labelZhHans: "填空题" }',
        '{ id: "fill", labelEn: "Short answer", labelZh: "短答題", labelZhHans: "短答题" }',
    )
    filters = """export const QUIZ_FORMAT_FILTERS = [
  { id: "mcq", labelEn: "Multiple choice", labelZh: "選擇題", labelZhHans: "选择题" },
  { id: "fill", labelEn: "Short answer", labelZh: "短答題", labelZhHans: "短答题" },
];"""
    text = re.sub(
        r"export const QUIZ_FORMAT_FILTERS = \[[\s\S]*?\];",
        filters,
        text,
        count=1,
    )
    text = text.replace(
        'return parentLang === "zh-Hant" ? "zh-Hant" : "zh";',
        'return parentLang === "zh-Hant" || parentLang === "zh-HK" ? "zh-Hant" : "zh";',
    )
    text = text.replace(
        'return local === "zh-Hant" ? "zh-Hant" : "zh";',
        'return local === "zh-Hant" || local === "zh-HK" ? "zh-Hant" : "zh";',
    )
    return text


def patch_quiz_app(text: str, locale: str) -> str:
    text = text.replace(
        """  function setHint(text) {
    const msg = text || t("empty");
    if (els.hintText) els.hintText.textContent = msg;
    if (els.hintTextMobile) els.hintTextMobile.textContent = msg;
  }""",
        """  function setHint(_text) {
    /* hint sidebar removed */
  }""",
    )
    text = text.replace("    if (firstOpen) setHint(firstOpen.hint);\n\n", "")
    text = text.replace(
        '      wrap.addEventListener("mouseenter", () => setHint(q.hint));\n'
        '      wrap.addEventListener("focusin", () => setHint(q.hint));\n\n',
        "",
    )
    if locale == "en":
        text = text.replace("Concept checks", "HKDSE worksheet practice")
        text = text.replace(
            "Several concepts need consolidation. Review Snell's law, refractive index, ray paths, and dispersion before the next round.",
            "Several topics need consolidation. Review atomic structure, bonding, and structure-property links before the next round.",
        )
        text = text.replace(
            "Mixed performance: re-read refraction notes for weaker topics, then regenerate.",
            "Mixed performance: revisit weaker topics (see table), then regenerate.",
        )
    else:
        text = text.replace("Concept checks", "HKDSE 工作紙練習")
        text = text.replace(
            "Several concepts need consolidation. Review Snell's law, refractive index, ray paths, and dispersion before the next round.",
            "部分課題需加強。請重溫原子結構、化學鍵與物質結構性質，再生成新一輪題目。",
        )
    return text


def patch_quiz_effects(text: str) -> str:
    return text.replace(
        """export function animateSplitText(element) {
  if (!element) return;
  const text = element.textContent?.trim() || "";
  if (!text) return;
  element.classList.remove("reveal");
  element.innerHTML = text
    .split(/\\s+/)
    .map((word, i) => `<span class="split-word" style="transition-delay:${i * 28}ms">${word}</span>`)
    .join(" ");
  requestAnimationFrame(() => {
    setTimeout(() => element.classList.add("reveal"), 40);
  });
}""",
        """export function animateSplitText(element) {
  if (!element) return;
  const text = element.textContent?.trim() || "";
  if (!text) return;
  element.classList.remove("reveal");
  let delay = 0;
  const lines = text.split(/\\n/);
  element.innerHTML = lines
    .map((line) => {
      const words = line.trim().split(/\\s+/).filter(Boolean);
      if (!words.length) return "<br>";
      const html = words
        .map((word) => {
          const span = `<span class="split-word" style="transition-delay:${delay}ms">${word}</span>`;
          delay += 28;
          return span;
        })
        .join(" ");
      return html;
    })
    .join("<br>");
  requestAnimationFrame(() => {
    setTimeout(() => element.classList.add("reveal"), 40);
  });
}""",
    )


def patch_quiz_html(html: str, locale: str) -> str:
    html = html.replace(
        'id="quiz-num-count" max="50" min="1" type="number" value="9"',
        'id="quiz-num-count" max="50" min="1" type="number" value="10"',
    )
    html = re.sub(
        r'<div class="grid grid-cols-1 xl:grid-cols-\[minmax\(220px,260px\)_1fr\] gap-6 items-start">\s*'
        r'<aside class="hidden xl:block[\s\S]*?</aside>\s*',
        "",
        html,
        count=1,
    )
    html = re.sub(
        r'<div class="xl:hidden mb-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 focus-dim">\s*'
        r'<p class="text-body-sm text-on-surface-variant" id="quiz-hint-text-mobile">[\s\S]*?</p>\s*</div>\s*',
        "",
        html,
        count=1,
    )
    html = html.replace("</div>\n</div>\n</main>", "</div>\n</main>", 1)
    if locale == "en":
        html = html.replace("<title>Quiz — replace chapter title</title>", "<title>Microscopic World I · Worksheet</title>")
        html = html.replace("CH · CHAPTER LABEL", "Topic 2 · Microscopic World I")
    else:
        html = html.replace('lang="en"', 'lang="zh-HK"')
        html = html.replace("<title>Quiz — replace chapter title</title>", "<title>微觀世界 I · 工作紙</title>")
        html = html.replace("CH · CHAPTER LABEL", "課題二 · 微觀世界 I")
        html = html.replace('data-i18n="hSettings">Worksheet settings', 'data-i18n="hSettings">工作紙設定')
        html = html.replace('data-i18n="btnGenerate">Generate questions', 'data-i18n="btnGenerate">生成題目')
    return html


def clone_ui():
    for locale in ("en", "zh-hk"):
        dest_js = ROOT / locale / "js"
        dest_js.mkdir(parents=True, exist_ok=True)
        for name in ("quizApp.js", "quizUtils.js", "quizSummary.js", "quizExport.js", "quizEffects.js"):
            src_text = (TPL / "js" / name).read_text(encoding="utf-8")
            if name == "quizUtils.js":
                src_text = patch_quiz_utils(src_text)
            if name == "quizApp.js":
                src_text = patch_quiz_app(src_text, locale)
            if name == "quizEffects.js":
                src_text = patch_quiz_effects(src_text)
            (dest_js / name).write_text(src_text, encoding="utf-8")
        html = patch_quiz_html((TPL / "quiz.html").read_text(encoding="utf-8"), locale)
        (ROOT / locale / "quiz.html").write_text(html, encoding="utf-8")


def dedupe_bank(items: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for q in items:
        base = q["id"]
        uid = base
        n = 2
        while uid in seen:
            uid = f"{base}-{n}"
            n += 1
        seen.add(uid)
        if uid != base:
            q = dict(q)
            q["id"] = uid
        out.append(q)
    return out


def main():
    for d in ("extracted", "draft", "assets", "en/js", "zh-hk/js"):
        (ROOT / d).mkdir(parents=True, exist_ok=True)
    mc_raw = json.loads(MC_JSON.read_text(encoding="utf-8"))
    lq_all = json.loads(LQ_JSON.read_text(encoding="utf-8"))
    mc_items = [x for q in mc_raw if (x := mc_to_item(q))]
    lq_inc = []
    for item in lq_all:
        status, reason = classify_lq(item)
        if status.startswith("include"):
            if not validate_lq_item(item):
                continue
            fill = lq_to_fill(item)
            if status == "include-needs-image":
                fill["_needsImage"] = True
            lq_inc.append(fill)
    bank = dedupe_bank(mc_items + lq_inc)
    image_map = build_image_map(mc_raw, lq_inc)
    write_sections()
    write_extraction_review(mc_raw, lq_all, lq_inc)
    write_quiz_review(bank)
    (ROOT / "draft" / "image-map.json").write_text(json.dumps(image_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_quiz_data("en", bank, image_map)
    write_quiz_data("zh-hk", bank, image_map)
    clone_ui()
    mc_count = sum(1 for q in bank if q.get("format", "mcq") == "mcq")
    fill_count = sum(1 for q in bank if q.get("format") == "fill")
    print(f"Bank: {len(bank)} items ({mc_count} MCQ + {fill_count} short answer)")
    print(f"Images mapped: {sum(1 for v in image_map.values() if v.get('file'))} (+ {sum(1 for v in image_map.values() if v.get('pending'))} pending LQ)")


if __name__ == "__main__":
    main()