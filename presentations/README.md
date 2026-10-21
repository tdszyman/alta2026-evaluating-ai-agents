# Presentations

Quarto website: HTML landing page + four Reveal.js decks. Built locally and in CI the same way; published to **GitHub Pages** from `main` only.

**Live URL (after Pages enabled + merge to main):**  
<https://tdszyman.github.io/alta2026-evaluating-ai-agents/>

| Path | Role |
|------|------|
| [`index.qmd`](index.qmd) | Site home |
| [`01-agents-and-eval-challenges/`](01-agents-and-eval-challenges/) | Part 1 (WIP deck from outline) |
| [`02-llm-as-judge-methods/`](02-llm-as-judge-methods/) | Part 2 stub |
| [`03-hands-on-exercise/`](03-hands-on-exercise/) | Part 3 stub |
| [`04-reliability-and-future/`](04-reliability-and-future/) | Part 4 stub |
| [`_quarto.yml`](_quarto.yml) | Project / site / Reveal defaults |
| `_site/` | Build output (gitignored; CI artifact) |
| `_site/hands-on/` | Starter judge app, copied from `workshop/app/` by the render script |

## Render

```bash
# from repo root — same command CI uses
./scripts/render-slides.sh all
./scripts/render-slides.sh 01
```

Requires [Quarto](https://quarto.org/docs/get-started/). Agent skill: [`../skills/quarto-reveal-slides/SKILL.md`](../skills/quarto-reveal-slides/SKILL.md).

## Publish

Workflow: [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) — push to `main` → render → deploy Pages. No per-branch sites.
