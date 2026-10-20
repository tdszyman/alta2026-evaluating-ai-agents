# Tutorial overview

Source: [ALTA 2026 Conference Program — Afternoon tutorial](https://alta2026.alta.asn.au/program#afternoon-tutorial) (fetched during repo scaffolding).

## Identity

| Field | Value |
|-------|-------|
| Title | Evaluating AI Agents with LLM-as-a-Judge |
| Event | ALTA 2026 Tutorial Day |
| Date | Monday 30 November 2026 |
| Slot | Afternoon tutorial (Tutorial 2) |
| Length | Two sessions × 1.5h (per program overview) |

## Presenters

- Parvin Zarei Eskikand — Senior Data Scientist, SEEK
- Terrence Szymanski — Head of Generative AI, SEEK
- Sara Mirabi — Deakin University
- Yelaman Abdullin — Macquarie University

## Sessions and parts

### Session 1: Foundations of AI Agent Evaluation (1.5h)

1. **Part 1 — AI Agents and Evaluation Challenges**  
   Agents, tool use, why final-answer scoring is insufficient; industry evaluation lifecycle (prompts, test cases, datasets, rubrics, code; versioning; offline vs production monitoring).

2. **Part 2 — LLM-as-a-Judge Methods**  
   Deterministic vs non-deterministic evaluation; LLM-as-a-judge; criteria, rubrics, scales, prompting; when teams choose rules vs judges vs humans; quality / latency / reliability / cost trade-offs.

### Session 2: Practical Evaluation of AI Agents (1.5h)

3. **Part 3 — Hands-on Agent Evaluation Exercise**  
   Build a rubric and LLM judge for a tool-using agent scenario; run over test cases; analyse tool choice, parameters, and response quality.

4. **Part 4 — Reliability, Limitations, and Future Directions**  
   Judge consistency, robustness, cost, failure modes; good practice; industry lessons; open research.

## Prerequisites (program text)

Basic familiarity with machine learning, NLP, and large language models. No prior experience with AI agents or LLM-as-a-judge required. Participants should bring a laptop. Access to the required LLM will be arranged and confirmed before the tutorial.

## Mapping to this repo

| Part | Presentations | Workshop |
|------|---------------|----------|
| 1 | `presentations/01-agents-and-eval-challenges/` | — |
| 2 | `presentations/02-llm-as-judge-methods/` | — |
| 3 | `presentations/03-hands-on-exercise/` | `workshop/` (primary) |
| 4 | `presentations/04-reliability-and-future/` | optional follow-ups |
