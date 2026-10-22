# Hands-on prototype direction — 22 October 2026

Implementation direction requested by Yelaman in the workshop planning session. This records prototype choices, not final tutorial agenda or workshop answers.

- Preserve the original browser exercise at `/hands-on/app/`, with its four replies, prompt editor, and inline scores/chart. Put the advanced judge builder and reports on separate pages under `/hands-on/app/advanced/`.
- In the advanced workshop, keep career advice and add recorded one-call job search and two-call job/course scenarios.
- Use three neutral-labelled variants per new scenario, allowing tool-use and final-answer failures to differ. All data is synthetic; no preset scores.
- Let participants build judges through editable instructions and criteria, with blank and draft example starting points. Retain soundness/tone/compliance and add per-call tool metrics and grounding.
- Keep 1–5 scores with participant-editable passing thresholds, initially 4.
- Add a separate Microsoft-style report page in the same tab. Adapt the actual report arrangement lightly, keeping the repository theme and plain JavaScript implementation.
- Use one judge request per trace and repeat. No live agent/tool execution or .NET integration in this prototype.
- Share API key and endpoint across exercises, with separate prompts, model settings, and results. Keep existing advanced saved judges/reports and redirect their earlier report URLs. Link the starter first on the hands-on landing page.

Reference exploration ran Microsoft's report frontend with its generated development data in a temporary checkout of [dotnet/extensions, commit ed24aee](https://github.com/dotnet/extensions/tree/ed24aee220c7958953c173c7aabdda162937a941/src/Libraries/Microsoft.Extensions.AI.Evaluation.Reporting/TypeScript). Inspected the scenario sidebar, Overview/Cases navigation, a two-tool transcript, and expanded metric context/diagnostics. Fifty focused upstream report tests passed; this did not run live model evaluations.

- [ ] Organisers review the synthetic traces and editable draft rubrics.
- [ ] Confirm participant LLM access and token budget.
- [ ] Confirm how the prototype fits the Part 3 facilitation plan.

Implementation and usage: [workshop README](https://github.com/tdszyman/alta2026-evaluating-ai-agents/blob/main/workshop/README.md). Existing tutorial-level questions remain in [decisions](../decisions.md).
