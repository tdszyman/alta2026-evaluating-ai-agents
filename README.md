# Evaluating AI Agents with LLM-as-a-Judge

Materials for **ALTA 2026 Tutorial 2** (afternoon tutorial), Tutorial Day — Monday 30 November 2026.

| | |
|---|---|
| **Conference** | [ALTA 2026](https://alta2026.alta.asn.au/) |
| **Program** | [Afternoon tutorial](https://alta2026.alta.asn.au/program#afternoon-tutorial) |
| **Presenters** | Parvin Zarei Eskikand (SEEK), Terrence Szymanski (SEEK), Sara Mirabi (Deakin University), Yelaman Abdullin (Macquarie University) |

## Abstract (from ALTA program)

AI agents extend LLMs by planning, using tools, and interacting with users and systems — which makes behaviour harder to evaluate than conventional NLP systems. This tutorial introduces agent evaluation challenges, deterministic vs model-based approaches, and **LLM-as-a-judge** methods (criteria, rubrics, prompts, scales). It covers industry practice for organising and versioning evaluation assets, then a hands-on exercise: design a rubric, build a judge prompt, and apply it to a practical agent scenario. The tutorial closes with reliability, limitations, industry lessons, and open research directions.

## Tutorial overview (four sections)

From the [ALTA 2026 program](https://alta2026.alta.asn.au/program#afternoon-tutorial):

1. **Session 1 — Foundations of AI Agent Evaluation** (1.5h)
   - **Part 1:** AI Agents and Evaluation Challenges  
   - **Part 2:** LLM-as-a-Judge Methods
2. **Session 2 — Practical Evaluation of AI Agents** (1.5h)
   - **Part 3:** Hands-on Agent Evaluation Exercise  
   - **Part 4:** Reliability, Limitations, and Future Directions

Pre-requisite (program): basic familiarity with ML, NLP, and LLMs; laptop for hands-on; LLM access to be arranged before the tutorial.

## Repository layout

```
organisation/      Living planning (meetings, decisions, lit, outlines)
presentations/     Quarto site: home, about, four decks, generated bibliography pages
workshop/          Hands-on app, prompts, data, and dataset links
knowledge/         Stable tutorial facts and bibliography.json
skills/            Agent skills (slides, citations, meeting cycle)
scripts/           Render the site, rebuild bibliography pages, stage the organiser mirror
AGENTS.md          Entry point for coding agents working in this repo
```

| Path | Purpose |
|------|---------|
| [`organisation/`](organisation/) | Organiser planning. Published at `/organisation/` until tutorial day, not linked from the public nav |
| [`presentations/`](presentations/) | Public site source. Parts 1–4 live in `presentations/presentation/` |
| [`workshop/`](workshop/) | Hands-on materials. The page is `/hands-on/`; the app is `/hands-on/app/` |
| [`knowledge/`](knowledge/) | Tutorial facts and `bibliography.json`, which generates `/bibliography/` |
| [`skills/`](skills/) | Reusable agent skills |
| [`scripts/`](scripts/) | Render and citation helpers |

Prefer **`organisation/`** for living planning docs; keep **`knowledge/`** for stable tutorial knowledge. Cross-link — do not duplicate the same file in both places.

## Quick start

### Presentations

`presentations/` is the Quarto site: home, about, the presentation landing, four Reveal decks, and a bibliography. With [Quarto](https://quarto.org/) installed:

```bash
./scripts/render-slides.sh all   # or 01, 02, 03, 04
./scripts/preview-site.sh        # http://127.0.0.1:8090/ — browse the build
```

Quarto is only needed to rebuild. The preview command serves the files already in `presentations/_site/` (gitignored). Opening `index.html` as a file breaks links such as `presentation/`.

Published from **`main`** via GitHub Actions → GitHub Pages:  
<https://tdszyman.github.io/alta2026-evaluating-ai-agents/>  
(see [`skills/quarto-reveal-slides/SKILL.md`](skills/quarto-reveal-slides/SKILL.md)).

Public routes: `/` home, `/presentation/` and one URL per part, `/hands-on/`, `/bibliography/`, `/about/`. `/organisation/` is an unlisted organiser mirror and is left out of the build on tutorial day.

See [`presentations/README.md`](presentations/README.md).

### Workshop

Hands-on assets live under [`workshop/`](workshop/). The original starter in [`workshop/app/`](workshop/app/) stays at `/hands-on/app/`, with four replies and inline scores/chart. The separate advanced workshop in [`workshop/app/advanced/`](workshop/app/advanced/) adds a custom judge builder, ten draft traces with zero, one, or two tool calls, and detailed reports at `/hands-on/app/advanced/`. The `/hands-on/` page links to both. Dataset URLs and access notes go in [`workshop/datasets.md`](workshop/datasets.md).

## Status / next steps

- [x] Repo scaffolding (structure, READMEs, Quarto stubs, agent skill)
- [x] Organiser planning tree (`organisation/` — meetings, actions, lit, Part 1 outline)
- [ ] Confirm whether collaboration moves fully from Notion → GitHub (see [`organisation/README.md`](organisation/README.md))
- [ ] Confirm section owners for Parts 1–4 ([`organisation/decisions.md`](organisation/decisions.md))
- [ ] Resolve hands-on open questions; fill workshop prompts/data
- [ ] Confirm LLM / token budget for participants ([`organisation/action-items.md`](organisation/action-items.md))

## Contributing

Prefer small PRs per section or workshop asset. Keep invented content out of stubs — placeholders should stay clearly marked until real material lands.
