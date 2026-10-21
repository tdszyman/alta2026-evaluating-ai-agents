---
name: quarto-reveal-slides
description: >-
  Author and render interactive Reveal.js slide decks with Quarto for the ALTA
  2026 tutorial presentations, and publish them to GitHub Pages from main.
  Use when editing presentations/, changing Reveal options, running
  scripts/render-slides.sh, changing .github/workflows/pages.yml, or when
  the user asks to open, preview, or view the site or any page on it.
---

# Quarto + Reveal.js → GitHub Pages

## When to use

- Editing `presentations/**/*.qmd`
- Rendering or previewing the site
- The user asks to open the site or view a specific page
- Changing how decks publish to GitHub Pages

## Layout

```
presentations/
  _quarto.yml                 # website project (routes, theme, Reveal defaults)
  site.scss                   # Scientific Modernist (light) website theme
  site-dark.scss              # Night Laboratory (dark) website theme
  index.qmd                   # site home (/)
  about/index.qmd             # /about/
  presentation/index.qmd      # /presentation/
  presentation/01-…/index.qmd # one Reveal deck per part
  _shared/style-brief.md      # visual source of truth; edit this before restyling
  _shared/                    # slide chrome and shared website component rules
  _site/                      # build output (gitignored) — CI deploys this
  _site/hands-on/             # rendered hands-on page
  _site/hands-on/app/         # copy of workshop/app, added by scripts/render-slides.sh
```

One Quarto **website**. Home, about, the presentation landing, the hands-on page, and the bibliography share the light and dark themes. Each tutorial part is its **own Reveal deck** under `presentation/`, so a contributor can edit one part without touching the others. Decks inherit the chrome in `_quarto.yml` and `_shared/`. A part may override `format.revealjs` in its own file. If that override sets `css`, keep `_shared/chrome.css` in the list (Part 1 does this for `complexity.css`). Multi-file HTML + assets is fine. Use `embed-resources: true` only if a single-file build stays reasonable — default is **off**.

## Style

[`_shared/style-brief.md`](../../presentations/_shared/style-brief.md) is the source of truth for visual style. Change that document first, then the theme files. Do not introduce a palette, typeface, or effect that the brief does not allow.

The website uses Quarto’s light/dark toggle (`site.scss` / `site-dark.scss`). Slide decks stay the light Scientific Modernist theme. That choice is recorded under **Implementation decisions** in the brief, which is an AI-generated section and must stay labelled as such.

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
./scripts/preview-site.sh        # http://127.0.0.1:8090/
```

Rendering requires Quarto on `PATH`. Preview only needs Python and an existing `_site/`. Do **not** commit `_site/` or `*_files/` (gitignored).

## Open a page

When the user asks to open the site, view a page, or how to look at a route, start the server and open the page. Do not only print the URL, and do not open `presentations/_site/index.html` as a file.

1. If `presentations/_site/index.html` is missing, run `./scripts/render-slides.sh all` first.
2. If nothing is listening on port 8090, run `./scripts/preview-site.sh` in the background. If that port is already in use, the preview server is already running — leave it.
3. Open the requested page with `open http://127.0.0.1:8090/<path>`.

| Ask | URL |
|-----|-----|
| Home | `http://127.0.0.1:8090/` |
| Presentation | `http://127.0.0.1:8090/presentation/` |
| Part 1–4 | `http://127.0.0.1:8090/presentation/01-agents-and-eval-challenges/` (and `02-…`, `03-…`, `04-…`) |
| Hands-on | `http://127.0.0.1:8090/hands-on/` |
| Hands-on app | `http://127.0.0.1:8090/hands-on/app/` |
| Bibliography | `http://127.0.0.1:8090/bibliography/` |
| One source | `http://127.0.0.1:8090/bibliography/<id>/` |
| About | `http://127.0.0.1:8090/about/` |
| Organisation | `http://127.0.0.1:8090/organisation/` |

The script stages `workshop/app/` at `presentations/hands-on/app/` so the hands-on page can link to it, copies those files into `presentations/_site/hands-on/app/`, and deletes the stage. Run the script rather than a bare `quarto render` if the app should be in the output.

## References

- [Quarto Revealjs](https://quarto.org/docs/presentations/revealjs/)
- [Quarto + GitHub Pages](https://quarto.org/docs/publishing/github-pages.html)
- [`AGENTS.md`](../../AGENTS.md) · [`presentations/README.md`](../../presentations/README.md)
