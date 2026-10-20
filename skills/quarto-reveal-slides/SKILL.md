---
name: quarto-reveal-slides
description: >-
  Author and render interactive Reveal.js slide decks with Quarto for the ALTA
  2026 tutorial presentations, and publish them to GitHub Pages from main.
  Use when editing presentations/, changing Reveal options, running
  scripts/render-slides.sh, or changing .github/workflows/pages.yml.
---

# Quarto + Reveal.js → GitHub Pages

## When to use

- Editing `presentations/**/*.qmd`
- Local preview via `scripts/render-slides.sh`
- Changing how decks publish to GitHub Pages

## Layout

```
presentations/
  _quarto.yml                 # website project (site-url, navbar, Reveal defaults)
  index.qmd                   # landing page (HTML)
  01-agents-and-eval-challenges/index.qmd   # Reveal deck
  02-… / 03-… / 04-…
  _site/                      # build output (gitignored) — CI deploys this
```

One Quarto **website** project; each tutorial part is its **own Reveal deck**. Multi-file HTML + assets is fine. Use `embed-resources: true` only if a single-file build stays reasonable — default is **off**.

## Publish target

| | |
|--|--|
| Product | **GitHub Pages** (`*.github.io`) |
| URL | `https://tdszyman.github.io/alta2026-evaluating-ai-agents/` |
| Trigger | Push to **`main`** only (workflow_dispatch allowed) |
| Workflow | [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml) |
| Build | `./scripts/render-slides.sh all` → `presentations/_site` → `actions/deploy-pages` |

No automatic per-branch sites. Do not expect the feature-branch PR to publish live Pages.

### One-time Pages setting (repo owner)

Settings → Pages → **Source: GitHub Actions**.  
Or: `gh api repos/tdszyman/alta2026-evaluating-ai-agents/pages -X POST -f build_type=workflow`  
If that fails (permissions), the owner must enable it in the UI.

## Authoring

1. One idea per slide; `---` between slides.
2. Incremental lists: `::: {.incremental}` … `:::`.
3. Speaker notes: `::: {.notes}` … `:::`.
4. Do **not** invent claims — leave `<!-- TODO: … -->` or mark **WIP**.
5. Part outlines live under `organisation/outlines/`; keep decks aligned.

## Render (local = CI)

```bash
./scripts/render-slides.sh all   # full site → presentations/_site
./scripts/render-slides.sh 01    # one part (still under the presentations project)
```

Requires Quarto on `PATH`. Do **not** commit `_site/` or `*_files/` (gitignored).

## References

- [Quarto Revealjs](https://quarto.org/docs/presentations/revealjs/)
- [Quarto + GitHub Pages](https://quarto.org/docs/publishing/github-pages.html)
- [`AGENTS.md`](../../AGENTS.md) · [`presentations/README.md`](../../presentations/README.md)
