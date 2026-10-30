# Hands-on prototype direction

Implementation direction requested by Yelaman in the workshop planning session, updated on 30 October 2026 to simplify audience navigation. This records prototype choices, not final tutorial agenda or workshop answers.

- Use one guided app at `/hands-on/app/`, replacing the starter/advanced choice. Split each stage into a separate page: inspect cases, design rubric, write judge instructions, run evaluation, and review results.
- Progress through career advice (the existing four replies), one-call job search, then two-call job/course scenarios. Each run evaluates its current round; review links lead to the next round.
- Use three neutral-labelled variants per new scenario, allowing tool-use and final-answer failures to differ. All data is synthetic; no preset scores.
- Let participants build judges through editable instructions and criteria, with blank and draft example starting points. Retain soundness/tone/compliance and add per-call tool metrics and grounding.
- Keep 1–5 scores with participant-editable passing thresholds, initially 4.
- Carry rubric and instruction edits forward. Offer the existing tool-use criteria through an explicit add button, preserving edits and avoiding duplicates. Retain a dedicated rubric page with full criterion editing.
- Add a separate Microsoft-style report page in the same tab. Adapt the actual report arrangement lightly, keeping the repository theme and plain JavaScript implementation.
- Use one judge request per trace and repeat. No live agent/tool execution or .NET integration in this prototype.
- Keep a single saved judge and connection, with report snapshots for each run. Preserve existing saved judges, prompts, preferences, and reports. Redirect former advanced entry/report URLs to the guided pages. The landing page has one Start exercise button.
- Keep numbered navigation and Back/Next controls consistent. Tuck temperature, repeats, and run name into More run settings. Browsing and editing require no key; only an explicit run makes API calls.

Reference exploration ran Microsoft's report frontend with its generated development data in a temporary checkout of [dotnet/extensions, commit ed24aee](https://github.com/dotnet/extensions/tree/ed24aee220c7958953c173c7aabdda162937a941/src/Libraries/Microsoft.Extensions.AI.Evaluation.Reporting/TypeScript). Inspected the scenario sidebar, Overview/Cases navigation, a two-tool transcript, and expanded metric context/diagnostics. Fifty focused upstream report tests passed; this did not run live model evaluations.

- [ ] Organisers review the synthetic traces and editable draft rubrics.
- [ ] Confirm participant LLM access and token budget.
- [ ] Confirm how the prototype fits the Part 3 facilitation plan.

Implementation and usage: [workshop README](https://github.com/tdszyman/alta2026-evaluating-ai-agents/blob/main/workshop/README.md). Existing tutorial-level questions remain in [decisions](../decisions.md).
