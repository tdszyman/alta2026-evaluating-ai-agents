# Presentations

Quarto website for the tutorial. Built locally and in CI the same way; published to **GitHub Pages** from `main` only.

**Live URL (after Pages enabled + merge to main):**  
<https://tdszyman.github.io/alta2026-evaluating-ai-agents/>

| Path | Role |
|------|------|
| [`index.qmd`](index.qmd) | Site home (`/`) |
| [`about/`](about/) | About the tutorial and how the site runs |
| [`presentation/`](presentation/) | Presentation landing and Parts 1–4, one deck per folder |
| `bibliography/` | Generated bibliography (from `knowledge/bibliography.json`; gitignored) |
| [`_quarto.yml`](_quarto.yml) | Navbar, theme, shared Reveal chrome |
| [`_shared/`](_shared/) | Slide chrome, fonts, noindex include |
| `_site/` | Build output (gitignored; CI artifact) |
| `_site/hands-on/` | Hands-on page |
| `_site/hands-on/app/` | Hands-on app, copied from `workshop/app/` |
| `_site/organisation/` | Organiser mirror until 30 November 2026; not in the navbar |

## Render

```bash
# from repo root — same command CI uses
./scripts/render-slides.sh all
./scripts/render-slides.sh 01
./scripts/preview-site.sh          # http://127.0.0.1:8090/
```

Rendering requires [Quarto](https://quarto.org/docs/get-started/). Preview does not: it serves the gitignored build in `_site/`. Open that URL in a browser. Opening `_site/index.html` as a file leaves directory links unresolved. The render script rebuilds bibliography pages and the organiser mirror before Quarto runs. Agent skill: [`../skills/quarto-reveal-slides/SKILL.md`](../skills/quarto-reveal-slides/SKILL.md).

## Publish

Workflow: [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) — push to `main` → render → deploy Pages. No per-branch sites.
