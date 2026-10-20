# jasonshelter0.github.io

Source for [jasonshelter0.github.io](https://jasonshelter0.github.io/). GitHub Pages publishes the `main` branch from the repository root. The site is plain HTML, CSS and JavaScript; no build command or package install is needed.

## Pages

- `/index.html` — portfolio homepage.
- `/subloom/index.html` — Subloom plugin manual.
- `/assets/site.css` and `/assets/site.js` — shared appearance and interactions.
- `/assets/mark.svg` — site mark and favicon.

## Update

```bash
git pull --ff-only
# Edit the pages and assets.
git add -A
git commit -m "Update site"
git push origin main
```

GitHub Pages then republishes the site. Check deployment status in the repository's **Actions** tab or **Settings → Pages**. Keep Subloom's behavior and release links in the manual aligned with the [plugin repository](https://github.com/jasonshelter0/obsidian-subloom).
