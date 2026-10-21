# Agent guide — ALTA 2026 Tutorial 2

This repository holds materials for **Evaluating AI Agents with LLM-as-a-Judge** (ALTA 2026 afternoon tutorial).

## Before you edit

1. Read [`knowledge/tutorial-overview.md`](knowledge/tutorial-overview.md) for title, speakers, and the four official parts.
2. Read [`knowledge/sources.md`](knowledge/sources.md) for what is known vs unknown (e.g. detailed agenda).
3. For planning, decisions, lit review, and WIP outlines, use [`organisation/`](organisation/README.md) — living docs for organisers and agents.
4. Do **not** invent agenda timings, slide narratives, rubrics, or workshop answers. Prefer checkboxes and open questions in `organisation/` over inventing resolutions.

## Layout

| Area | Use |
|------|-----|
| `organisation/` | Living planning: meetings, actions, decisions, literature, notes, outlines. Mirrored to `/organisation/` until tutorial day, then the build drops it |
| `presentations/` | Quarto website: home, about, presentation decks, generated bibliography pages |
| `workshop/` | Hands-on prompts, sample data, dataset link list. The app is published at `/hands-on/app/` |
| `knowledge/` | Stable tutorial facts, plus `bibliography.json` for the public bibliography |
| `skills/` | Follow the matching `SKILL.md` before building slides, citations, or meeting notes |
| `scripts/` | Prefer these helpers over ad-hoc render commands |

`organisation/` = living planning; `knowledge/` = stable facts and the bibliography. Cross-link; do not duplicate the same document in both.

## Public site

Published from `main` to GitHub Pages. Routes:

| URL | Page | Source |
|-----|------|--------|
| `/` | Home. Landing page and the jump-off to the other public sections | `presentations/index.qmd` |
| `/presentation/` | Presentation landing | `presentations/presentation/index.qmd` |
| `/presentation/01-agents-and-eval-challenges/` | Part 1 deck | that folder’s `index.qmd` |
| `/presentation/02-llm-as-judge-methods/` | Part 2 deck | that folder’s `index.qmd` |
| `/presentation/03-hands-on-exercise/` | Part 3 deck | that folder’s `index.qmd` |
| `/presentation/04-reliability-and-future/` | Part 4 deck | that folder’s `index.qmd` |
| `/hands-on/` | Hands-on page, same theme as the rest of the site. A button opens the app in a new tab | `presentations/hands-on/index.qmd` |
| `/hands-on/app/` | Hands-on app. Leave it independent; do not fold it into a deck | `workshop/app/` |
| `/bibliography/` | Bibliography, then one page per source | `knowledge/bibliography.json` via `scripts/build-knowledge.py` |
| `/about/` | Tutorial, contributors, how the site is built and run | `presentations/about/index.qmd` |
| `/organisation/` | Organiser mirror only. Not in the navbar, `noindex`, omitted from the sitemap | generated from `organisation/` |

Home, presentation landing, bibliography, about, and the hands-on page share the site theme (`presentations/site.scss` and `presentations/site-dark.scss`). The hands-on app at `/hands-on/app/` keeps its own page and uses the same light tokens. Visual changes go through [`presentations/_shared/style-brief.md`](presentations/_shared/style-brief.md) first. Do not restyle around that file. The human brief is the source of truth; the “Implementation decisions” section at the end is AI-generated and must stay labelled that way.

Those website pages must set `format: html`. The project also defines Reveal.js, and a page with no `format` is rendered as both. Both write `index.html`, and the build fails. Decks set `format: revealjs` instead.

Links stay in the current tab. Leave `link-external-newwindow` false.

### Local preview

Do not open `presentations/_site/index.html` as a file. Directory links such as `presentation/` only resolve when the build is served.

When the user asks to open the site, view a page, or how to look at a route, start the preview server and open that page in the browser. Do not only print the URL.

1. If `presentations/_site/index.html` is missing, run `./scripts/render-slides.sh all` first. That needs Quarto. Preview does not.
2. If nothing is listening on port 8090, run `./scripts/preview-site.sh` in the background. If that port is already in use, the server is already up — leave it.
3. Open the page: `open http://127.0.0.1:8090/<path>`. Home is `/`. Use the route table above for any other page (`/bibliography/`, `/presentation/01-agents-and-eval-challenges/`, and so on).

Follow [`skills/quarto-reveal-slides/SKILL.md`](skills/quarto-reveal-slides/SKILL.md) for render and preview details.

Each presentation part is its own deck and URL so contributors can work in one folder without editing the others. Decks inherit the shared Reveal chrome in `presentations/_quarto.yml` and `presentations/_shared/`. A part may override `format.revealjs` in its own file; that override is allowed, not a mistake. Part 1 already adds `complexity.css` and must keep the shared `chrome.css` on that list.

Default slide chrome:

- Top bar: slide-list button (opens a left drawer of every slide), breadcrumbs `Home / Part n / slide number / slide title` (and `k/n` when a fragment is showing), previous/next with `13 / 45`, and search over that deck.
- Keyboard: Left and Right move slides. Escape closes the drawer or search first, then goes to the site home.
- Page number at the bottom, same `n / total` count.
- Edge previous/next controls that fade after the pointer is still.

Bibliography:

- `knowledge/bibliography.json` is the source. One record per source (paper, blog, repo, post, or product page), cited in ACL form on both the list and the detail page.
- The list is a concise bibliography. Each title links to `/bibliography/<id>/`.
- Detail pages include links, the verbatim abstract when one was recorded, and a summary. Do not invent an abstract. If you cannot copy one, leave `abstract` null.
- Summaries are drafts for organisers. The page labels them **AI-generated summary**. Keep that label.
- A processed source also has `summary_md` (the reading note), `figures`, and sometimes `access_note`. Follow [`skills/source-summaries/SKILL.md`](skills/source-summaries/SKILL.md). The short `summary` stays as the fallback when `summary_md` is absent.
- A slide cites a source by linking to `bibliography/<id>/`. Run `python3 scripts/build-knowledge.py` so the source page lists every slide that links to it. Follow [`skills/citation-links/SKILL.md`](skills/citation-links/SKILL.md) when editing decks or the bibliography.

Organisation:

- Hidden from the public navbar and from the sitemap. Pages send `noindex`.
- `scripts/stage-organisation.py` stops publishing the mirror on **30 November 2026** (tutorial day). Remove it earlier if organising is finished.
- Do not link `/organisation/` from home, about, or the decks.

## Skills

- [`skills/meeting-cycle/`](skills/meeting-cycle/SKILL.md) — draft Friday agendas; process minutes into action-items/decisions
- [`skills/quarto-reveal-slides/`](skills/quarto-reveal-slides/SKILL.md) — author Reveal decks; local render; when asked to open or view the site, run `./scripts/preview-site.sh` and open the page; publish to GitHub Pages from `main`
- [`skills/citation-links/`](skills/citation-links/SKILL.md) — keep slide citations and bibliography-page backlinks in sync
- [`skills/source-summaries/`](skills/source-summaries/SKILL.md) — write the reading summary and figure captures on a bibliography source page

Collaboration workflow (Markdown source of truth, Issues, PRs): [`organisation/README.md`](organisation/README.md).  
Slides publish target: `https://tdszyman.github.io/alta2026-evaluating-ai-agents/` (Actions on `main` only — see the Quarto skill).

## Conventions

- Four parts map 1:1 to `presentations/presentation/01` … `04` and to Session 1 / Session 2 on the ALTA program page. Public URLs are `/presentation/01-…` and so on.
- Workshop code and prompts stay under `workshop/`; do not bury them inside slide folders.
- Prefer editing existing stubs over creating parallel structures.
- Mark unfinished material with `TODO:` or HTML/Markdown comments so humans can find gaps.
- Meeting agendas/minutes commit on the planning branch; PRs only when tutorial content also changes.
