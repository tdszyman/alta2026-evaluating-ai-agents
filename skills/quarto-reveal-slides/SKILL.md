---
name: quarto-reveal-slides
description: >-
  Author and render interactive Reveal.js slide decks with Quarto for the ALTA
  2026 tutorial presentations. Use when creating or editing presentations under
  presentations/, changing Reveal options, adding speaker notes, code highlighting,
  or incremental lists, or when running scripts/render-slides.sh.
---

# Quarto + Reveal.js slides

## When to use

- Editing any `presentations/*/index.qmd`
- Adding shared theme or Reveal defaults in `presentations/_shared/`
- Rendering decks locally via `scripts/render-slides.sh`

## Layout in this repo

```
presentations/
  _shared/_quarto.yml          # shared Reveal defaults
  01-agents-and-eval-challenges/
    _quarto.yml
    index.qmd
  02-… / 03-… / 04-…
```

Each part is its own Quarto project. Prefer extending stubs over inventing long narratives without an agenda.

## Authoring checklist

1. Put one idea per slide; use `---` horizontal rules between slides in `.qmd`.
2. Use incremental reveals for lists:

   ```markdown
   ::: {.incremental}
   - Point A
   - Point B
   :::
   ```

3. Speaker notes:

   ```markdown
   ::: {.notes}
   Talking points for the presenter…
   :::
   ```

4. Code blocks: prefer short snippets; enable line highlighting with `{.python}` / Pandoc attributes as needed (`code-line-numbers` is on in shared config).
5. Do **not** invent tutorial claims, timings, or results — leave `<!-- TODO: … -->` comments.

## Front matter pattern

Minimal Reveal deck:

```yaml
---
title: "Part N: Title"
subtitle: "ALTA 2026 Tutorial 2 — Afternoon"
format:
  revealjs:
    slide-number: true
    hash: true
---
```

Shared options live in `presentations/_shared/_quarto.yml` (theme, transition, navigation). Override per-deck only when necessary.

## Render

From the repo root:

```bash
./scripts/render-slides.sh 01      # one part
./scripts/render-slides.sh all     # all four parts
```

Requires Quarto on `PATH`. Output goes to each part’s `_output/` (gitignored via Quarto/`_files` patterns — keep HTML out of commits unless the team decides otherwise).

## Interactive / “live” patterns

Useful Reveal + Quarto features for this tutorial:

| Need | Approach |
|------|----------|
| Step-through bullets | `{.incremental}` |
| Live code highlight | Quarto code chunks + `code-line-numbers` |
| Fragments | `::: {.fragment}` |
| Two-column compare | Quarto columns (`::: {layout-ncol=2}`) |
| Link to workshop | Relative links to `../../workshop/` |

Avoid embedding secrets or API keys in slides. Point hands-on API work at `workshop/` materials.

## References

- [Quarto Revealjs](https://quarto.org/docs/presentations/revealjs/)
- [Reveal.js presentations guide](https://quarto.org/docs/presentations/revealjs/presenting.html)
- Repo overview: [`AGENTS.md`](../../AGENTS.md), [`presentations/README.md`](../../presentations/README.md)
