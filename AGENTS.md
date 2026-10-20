# Agent guide — ALTA 2026 Tutorial 2

This repository holds materials for **Evaluating AI Agents with LLM-as-a-Judge** (ALTA 2026 afternoon tutorial).

## Before you edit

1. Read [`knowledge/tutorial-overview.md`](knowledge/tutorial-overview.md) for title, speakers, and the four official parts.
2. Read [`knowledge/sources.md`](knowledge/sources.md) for what is known vs unknown (e.g. detailed agenda).
3. Do **not** invent agenda timings, slide narratives, rubrics, or workshop answers. Use placeholders when content is missing.

## Layout

| Area | Use |
|------|-----|
| `presentations/NN-*/` | Quarto Reveal.js decks — one directory per tutorial part |
| `workshop/` | Hands-on prompts, sample data, dataset link list |
| `knowledge/` | Facts and source notes (keep accurate; cite ALTA program) |
| `skills/` | Follow the matching `SKILL.md` before building slides or tooling |
| `scripts/` | Prefer these helpers over ad-hoc render commands |

## Skills

- [`skills/quarto-reveal-slides/`](skills/quarto-reveal-slides/SKILL.md) — author and render interactive Reveal decks with Quarto

## Conventions

- Four parts map 1:1 to `presentations/01` … `04` and to Session 1 / Session 2 on the ALTA program page.
- Workshop code and prompts stay under `workshop/`; do not bury them inside slide folders.
- Prefer editing existing stubs over creating parallel structures.
- Mark unfinished material with `TODO:` or HTML/Markdown comments so humans can find gaps.
