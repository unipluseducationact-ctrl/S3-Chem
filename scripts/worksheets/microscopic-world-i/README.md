# Microscopic World I Worksheet

HKDSE exercise bank (427 items: 258 MCQ + 169 short answer).

## Rebuild (offline)

From this directory, with `QUIZ_TEMPLATE_DIR` pointing at create-quiz templates:

```powershell
python build_worksheet.py
```

Source PDFs/docx live on the local Exercise machine under `Exercise/` (not in this repo). Rebuild uses committed `questions_mc.json` and `questions_lq.json`.

## Deploy to S3-Chem public quiz

From the local microscopic-world-i project:

```powershell
python scripts/deploy_s3chem.py
```

Set `S3_CHEM_ROOT` if the clone is not at the default path.