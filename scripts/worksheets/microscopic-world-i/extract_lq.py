# -*- coding: utf-8 -*-
import json, re
from pathlib import Path
import fitz
ROOT = Path(__file__).resolve().parents[1]
EXERCISE = ROOT.parents[1]
Q_PDF = EXERCISE / 'Microscopic world 1 LQ Overall 1.pdf'
A_PDF = EXERCISE / 'Microscopic world 1 LQ Overall Answer 1.pdf'
OUT_JSON = ROOT / 'scripts' / 'questions_lq.json'
PARTS = [
    ('atomic-structure','as',1,2,17),
    ('periodic-table','pt',2,18,57),
    ('ionic-bond','ib',3,58,93),
    ('covalent-bond','cb',4,94,125),
    ('structure-properties','sp',5,126,157),
]
ANSWER_PAGES = {1:(2,8),2:(9,23),3:(24,44),4:(45,64),5:(65,77)}
MARK_RE = re.compile(r'\((\d+)\s*marks?\)', re.I)
MAIN_Q_RE = re.compile(r'^\s*(\d{1,2})\.\s*$')
ROMAN_RE = re.compile(r'^\s*\((i{1,3}|iv|v|vi{0,3}|ix|x|xi{0,3})\)\s*$', re.I)
LETTER_RE = re.compile(r'^\s*\(([a-z])\)\s*$', re.I)
SKIP_LINE = re.compile(r'Unit Education|Topic 02|Microscopic world|Part \d', re.I)

def pdf_text_pages(path, start, end):
    doc = fitz.open(path)
    try:
        return '\n'.join(doc[i].get_text() for i in range(start-1, min(end, len(doc))))
    finally:
        doc.close()

def clean(line):
    return re.sub(r'\s+', ' ', line).strip()

def parse_subparts(text, prefix, part_num, section):
    lines = [clean(x) for x in text.splitlines()]
    items, main_q, path_stack, stem_buf, pending_marks = [], None, [], [], None
    def make_id():
        return prefix + '-' + '-'.join([f'{int(main_q):02d}'] + list(path_stack))
    def flush():
        nonlocal stem_buf, pending_marks
        if main_q is None or not path_stack:
            stem_buf, pending_marks = [], None
            return
        stem = ' '.join(stem_buf).strip()
        if len(stem) < 5:
            stem_buf, pending_marks = [], None
            return
        items.append({
            'id': make_id(), 'section': section, 'part': part_num,
            'mainQ': int(main_q), 'path': list(path_stack),
            'marks': pending_marks or 1, 'stem': stem, 'answer': '',
            'sourceRef': f'Part {part_num} Q{main_q}' + ''.join(f'({p})' for p in path_stack),
        })
        stem_buf, pending_marks = [], None
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line or SKIP_LINE.search(line):
            i += 1
            continue
        if MAIN_Q_RE.match(line):
            flush(); main_q = MAIN_Q_RE.match(line).group(1); path_stack = []; stem_buf = []; i += 1
            continue
        letter = LETTER_RE.match(line) if not path_stack else None
        if letter and main_q:
            flush(); path_stack = [letter.group(1).lower()]; stem_buf = []; i += 1
            while i < len(lines):
                nxt = lines[i]
                if not nxt or SKIP_LINE.search(nxt):
                    i += 1; continue
                if MAIN_Q_RE.match(nxt) or LETTER_RE.match(nxt) or ROMAN_RE.match(nxt):
                    break
                mm = MARK_RE.search(nxt)
                if mm:
                    pending_marks = int(mm.group(1))
                    sp = MARK_RE.sub('', nxt).strip()
                    if sp: stem_buf.append(sp)
                    flush(); i += 1; break
                stem_buf.append(nxt); i += 1
            continue
        roman = ROMAN_RE.match(line)
        if roman and main_q and path_stack:
            flush(); path_stack = path_stack[:1] + [roman.group(1).lower()]; stem_buf = []; i += 1
            while i < len(lines):
                nxt = lines[i]
                if not nxt or SKIP_LINE.search(nxt):
                    i += 1; continue
                if MAIN_Q_RE.match(nxt) or LETTER_RE.match(nxt) or ROMAN_RE.match(nxt):
                    break
                mm = MARK_RE.search(nxt)
                if mm:
                    pending_marks = int(mm.group(1))
                    sp = MARK_RE.sub('', nxt).strip()
                    if sp: stem_buf.append(sp)
                    flush(); i += 1; break
                stem_buf.append(nxt); i += 1
            continue
        i += 1
    flush()
    return items

def parse_answers(text, prefix):
    lines = [clean(x) for x in text.splitlines()]
    answers, main_q, path_stack, buf = {}, None, [], []
    def key():
        return prefix + '-' + '-'.join([f'{int(main_q):02d}'] + list(path_stack))
    def flush():
        nonlocal buf
        if main_q and path_stack and buf:
            answers[key()] = ' '.join(buf).strip()
        buf = []
    for line in lines:
        if not line or SKIP_LINE.search(line):
            continue
        if line.isdigit() and len(line) <= 2 and buf:
            flush(); continue
        mq = MAIN_Q_RE.match(line)
        if mq:
            flush(); main_q = mq.group(1); path_stack = []; continue
        letter = LETTER_RE.match(line) if not path_stack else None
        if letter and main_q:
            flush(); path_stack = [letter.group(1).lower()]; continue
        roman = ROMAN_RE.match(line)
        if roman and main_q and path_stack:
            flush(); path_stack = path_stack[:1] + [roman.group(1).lower()]; continue
        if main_q and path_stack and not re.match(r'^\d+$', line):
            buf.append(line)
    flush()
    return answers

def main():
    all_items = []
    for sid, prefix, part_num, p_start, p_end in PARTS:
        items = parse_subparts(pdf_text_pages(Q_PDF, p_start, p_end), prefix, part_num, sid)
        a_start, a_end = ANSWER_PAGES[part_num]
        am = parse_answers(pdf_text_pages(A_PDF, a_start, a_end), prefix)
        for it in items:
            it['answer'] = am.get(it['id'], '')
            it['hasAnswer'] = bool(it['answer'])
        all_items.extend(items)
    OUT_JSON.write_text(json.dumps(all_items, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('LQ:', len(all_items), 'matched', sum(1 for x in all_items if x.get('hasAnswer')))

if __name__ == '__main__':
    main()
