# Hands-on workshop

Materials for **Part 3: Hands-on Agent Evaluation Exercise** (and supporting assets for the rest of the tutorial).

Per the [ALTA program](https://alta2026.alta.asn.au/program#afternoon-tutorial), participants will:

1. Design an evaluation rubric  
2. Create an LLM-as-a-judge prompt  
3. Apply the judge to outputs from a practical tool-using agent scenario  
4. Compare results and discuss reliability, robustness, and cost  

## Layout

| Path | Purpose |
|------|---------|
| [`app/`](app/) | Starter browser app (judge prompt, cases, OpenRouter calls) |
| [`prompts/`](prompts/) | Judge prompts, rubric templates, agent system prompts |
| [`data/`](data/) | Small fixtures / sample trajectories for local runs |
| [`datasets.md`](datasets.md) | Links and access notes for larger or external datasets |
| [`notebooks/`](notebooks/) | Optional interactive notebooks (placeholder) |

## Starter app

[`app/`](app/) is a static page. `scripts/render-slides.sh` copies it to `/hands-on/app/` on the published site. The site page at `/hands-on/` links to it and opens the app in a new tab. Participants edit a judge prompt and run it over four career-advice replies. The browser calls OpenRouter with a key they paste locally.

The four replies are starter fixtures, written so soundness, tone, and compliance can come apart. They are not a confirmed Part 3 scenario.

## Status

Scaffold plus that starter app. Concrete scenario, rubrics, and how LLM access will be provided are still open.

```text
TODO: confirm agent scenario (tool-using / conversational)
TODO: add starter judge prompt under prompts/
TODO: add fixture trajectories under data/
TODO: document LLM access for participants
```
