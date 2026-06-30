# -*- coding: utf-8 -*-
from __future__ import annotations
import json, re, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
EXERCISE = ROOT.parents[1]
Q_DOCX = EXERCISE / 'Microscopic world 1 MC Compiled.docx'
A_DOCX = EXERCISE / 'Microscopic world 1 MC Compiled Answer.docx'
OUT_JSON = ROOT / 'scripts' / 'questions_mc.json'
ASSETS = ROOT / 'assets'
W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'
CHAPTER_SECTION = {5:'atomic-structure',6:'periodic-table',7:'ionic-bond',8:'covalent-bond',9:'structure-properties'}
OPTION_RE = re.compile(r'^([A-D])[\.\)]\s*(.*)$', re.I)
CHEM_ID_RE = re.compile(r'^ChemMCQ(\d+)$')
CHAPTER_RE = re.compile(r'^Chapter\s+(\d+)\s+(.+)$', re.I)
ANSWER_RE = re.compile(r'^Answer:\s*([A-D])\s*$', re.I)

def w_tag(n): return '{%s}%s' % (W_NS, n)
def r_tag(n): return '{%s}%s' % (R_NS, n)
def a_tag(n): return '{%s}%s' % (A_NS, n)

def docx_blocks(path):
    blocks = []
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read('word/document.xml'))
        for p in root.iter(w_tag('p')):
            texts, rids = [], []
            for node in p.iter():
                if node.tag == w_tag('t'):
                    if node.text: texts.append(node.text)
                    if node.tail: texts.append(node.tail)
                for blip in node.iter(a_tag('blip')):
                    rid = blip.attrib.get(r_tag('embed'))
                    if rid: rids.append(rid)
            line = ''.join(texts).strip()
            if line: blocks.append({'type':'text','text':line})
            for rid in rids: blocks.append({'type':'image','rId':rid})
    return blocks

def load_rels(path):
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read('word/_rels/document.xml.rels'))
    return {rel.attrib['Id']: rel.attrib['Target'] for rel in root if rel.attrib.get('Id')}

def extract_media(path, dest):
    dest.mkdir(parents=True, exist_ok=True)
    rels = load_rels(path)
    mapping = {}
    with zipfile.ZipFile(path) as z:
        for rid, target in rels.items():
            if not target.startswith('media/'): continue
            src = 'word/' + target
            if src not in z.namelist(): continue
            ext = Path(target).suffix or '.png'
            fname = 'mc-media-%s%s' % (rid, ext)
            (dest / fname).write_bytes(z.read(src))
            mapping[rid] = fname
    return mapping

def parse_questions(blocks):
    questions, chapter, current, phase = [], 5, None, 'stem'
    def flush():
        nonlocal current
        if current and len(current.get('options',[])) >= 2:
            questions.append(current)
        current = None
    for block in blocks:
        if block['type']=='image':
            if current is not None: current.setdefault('imageRids',[]).append(block['rId'])
            continue
        line = block['text']
        if not line or line.startswith('Sections ') or line.startswith('Section '): continue
        ch = CHAPTER_RE.match(line)
        if ch: flush(); chapter = int(ch.group(1)); continue
        idm = CHEM_ID_RE.match(line)
        if idm:
            flush(); num = idm.group(1)
            current = {'chemId':line,'id':'mc-%s'%num,'chapter':chapter,'section':CHAPTER_SECTION.get(chapter,'atomic-structure'),'stem':'','options':[],'imageRids':[]}
            phase = 'stem'; continue
        if current is None: continue
        opt = OPTION_RE.match(line)
        if opt:
            phase = 'options'
            current['options'].append({'key':opt.group(1).upper(),'text':opt.group(2).strip()}); continue
        if phase=='stem':
            current['stem'] = (current['stem']+' '+line).strip() if current['stem'] else line
        elif current['options']:
            current['options'][-1]['text'] += ' ' + line
    flush(); return questions

def parse_answers(blocks):
    answers, cur, hint, after = {}, None, [], False
    def save():
        nonlocal cur, hint, after
        if cur: answers[cur] = {'answer':answers.get(cur,{}).get('answer'), 'hint':' '.join(hint).strip()}
        cur, hint, after = None, [], False
    for block in blocks:
        if block['type']!='text': continue
        line = block['text']
        if CHAPTER_RE.match(line): save(); continue
        idm = CHEM_ID_RE.match(line)
        if idm: save(); cur = line; answers[cur]={'answer':None,'hint':''}; continue
        if cur is None: continue
        am = ANSWER_RE.match(line)
        if am: answers[cur]['answer']=am.group(1).upper(); after=True; continue
        if after and line and not line.startswith('Answer'): hint.append(line)
    save(); return answers

def merge(questions, answers, media_map):
    out = []
    for q in questions:
        ans = answers.get(q['chemId'],{})
        item = {'id':q['id'],'chemId':q['chemId'],'section':q['section'],'chapter':q['chapter'],'format':'mcq','difficulty':'Standard','stem':q['stem'].strip(),'options':q['options'],'answer':ans.get('answer'),'hint':ans.get('hint') or 'Review your notes.','sourceRef':q['chemId']}
        if not item['answer']: item['answerMissing']=True
        files = [media_map[r] for r in q.get('imageRids',[]) if r in media_map]
        if files: item['imageFiles']=files
        out.append(item)
    return out

def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    merged = merge(parse_questions(docx_blocks(Q_DOCX)), parse_answers(docx_blocks(A_DOCX)), extract_media(Q_DOCX, ASSETS))
    OUT_JSON.write_text(json.dumps(merged, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print('MC:', len(merged), 'with ans', sum(1 for q in merged if q.get('answer')), 'with img', sum(1 for q in merged if q.get('imageFiles')))

if __name__=='__main__': main()
