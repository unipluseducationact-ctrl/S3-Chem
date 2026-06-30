# Microscopic World I Worksheet

HKDSE exercise bank (418 items: 256 MCQ + 162 short answer).

## Rebuild (offline)

```powershell
python build_worksheet.py
```

Source PDFs/docx are on the local Exercise machine (not in repo). Rebuild uses committed questions_mc.json and questions_lq.json.

## Deploy

```powershell
python scripts/deploy_s3chem.py
```
