# Presentations

Quarto + Reveal.js decks for the four tutorial parts. Shared Reveal defaults live in [`_shared/_quarto.yml`](_shared/_quarto.yml).

| Dir | Part | Title (ALTA program) |
|-----|------|----------------------|
| [`01-agents-and-eval-challenges/`](01-agents-and-eval-challenges/) | 1 | AI Agents and Evaluation Challenges |
| [`02-llm-as-judge-methods/`](02-llm-as-judge-methods/) | 2 | LLM-as-a-Judge Methods |
| [`03-hands-on-exercise/`](03-hands-on-exercise/) | 3 | Hands-on Agent Evaluation Exercise |
| [`04-reliability-and-future/`](04-reliability-and-future/) | 4 | Reliability, Limitations, and Future Directions |

## Render

```bash
# from repo root
./scripts/render-slides.sh all
./scripts/render-slides.sh 01
```

Requires [Quarto](https://quarto.org/docs/get-started/).

## Authoring

- Edit `index.qmd` in each part folder.
- Prefer the agent skill [`skills/quarto-reveal-slides/SKILL.md`](../skills/quarto-reveal-slides/SKILL.md) when adding interactivity or changing Reveal options.
- Keep slide content minimal until the detailed agenda and section owners are confirmed.
