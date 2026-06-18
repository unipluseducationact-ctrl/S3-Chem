# Preserve old GitHub Pages URL after rename

GitHub redirects git and repository web URLs when you rename a repo, but **not** project Pages URLs.

After renaming `S3-CH5-table` to `S3-Chem`, publish this folder to the organization Pages repo so the old link keeps working:

**Old (must keep working):** https://unipluseducationact-ctrl.github.io/S3-CH5-table/
**New:** https://unipluseducationact-ctrl.github.io/S3-Chem/

## One-time setup

1. On GitHub, create a **public** repository named `unipluseducationact-ctrl.github.io` under the `unipluseducationact-ctrl` org (if it does not exist yet).
2. Copy the contents of this directory into that repo default branch (keep the `S3-CH5-table/` folder at the repo root).
3. In **Settings -> Pages**, set source to deploy from the default branch, root `/`.
4. Rename the main app repo to `S3-Chem` (**Settings -> General -> Repository name**).
5. Update your local clone remote:
   git remote set-url origin https://github.com/unipluseducationact-ctrl/S3-Chem.git
6. Re-run the **Deploy to GitHub Pages** workflow on `S3-Chem`.

The redirect page preserves hash routes and query strings (e.g. #notes).