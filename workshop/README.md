# Hands-on workshop

Draft materials for **Part 3: Hands-on Agent Evaluation Exercise**. Participants build an LLM judge, run it over recorded agent traces, inspect its explanations, and challenge its conclusions. Scenario details and starter rubrics remain proposed workshop materials, not confirmed tutorial answers.

## Starter exercise

The original app remains at `/hands-on/app/`: one judge prompt, four career-advice replies, and inline scores, chart, and per-call rationales. Its layout and scoring workflow stay the same. The hands-on landing page links to this starter first, followed by the separate advanced workshop.

## Advanced browser exercise

The advanced app at `/hands-on/app/advanced/` lets participants:

1. Start with an editable example judge or a blank judge.
2. Write judge instructions and add/remove criteria, each with its own rubric, evaluation target, and 1–5 passing threshold (initially 4).
3. Select scenarios, a judge model, temperature, and 1–5 repeats. The displayed request count excludes traces with no applicable criteria.
4. Run one judge request per applicable trace and repeat, with up to three concurrent requests. Cancel to stop active and queued requests.
5. Open a separate report with scenario filtering, overview statistics, searchable cases, per-call scores, explanations, evidence links, and the exact judge configuration used.

Only the judge calls the model API. Agent tools are **recorded fixtures**, not live integrations. The default endpoint is OpenRouter; Settings supports another browser-accessible OpenAI-compatible endpoint. Model availability depends on the endpoint and key.

## Scenarios

| Scenario | Traces | Tool calls per trace |
|---|---:|---:|
| Career advice | 4 existing replies | 0 |
| Find suitable jobs | 3 variants of one request | 1 (`search_jobs`) |
| Connect jobs and training | 3 variants of one request | 2 (`search_jobs`, then `find_courses`) |

The synthetic variants let tool arguments, use of returned evidence, and answer quality differ. Participant labels do not reveal intended failure types. There are no preset scores or expected answers. Fictional job and course records are not real recommendations.

## Judge targets and results

- **Final answer:** one score per criterion and trace.
- **Each tool call:** a separate score for each call, restricted to message evidence available up to that call. Because one request evaluates all targets, this instruction and evidence validation do not guarantee that the model ignores later context.
- **Use of tool results:** one score for how the answer uses returned evidence; not applicable without tools.
- **Whole trace:** one score assessing the complete interaction.

The app generates the JSON response contract from the selected criteria. Every result requires an integer score from 1–5, a concise explanation, and valid evidence message IDs. Missing, duplicate, invalid, or out-of-scope results produce an **evaluation error**, not a low agent score. Evidence links establish where the judge points; participants still need to check whether the evidence supports its claim.

A trace evaluation passes only if every applicable criterion meets its saved threshold. Overview means/ranges and pass rates use successful judge responses; errors, cancellations, pending entries, and not-applicable entries are shown separately. Tool criteria count one score per call. Each repeat is an independent trace evaluation; the expanded case also shows repeat summaries for each target.

Judge drafts, settings, and reports are saved locally in the browser. The starter and advanced exercises share only their API key and endpoint. Their prompts, models, temperature, repeats, and results are independent. An existing connection migrates once into shared connection storage while preserving the starter's saved prompt and model preferences. Removing the key in either exercise updates the other and does not restore it from old settings. Advanced model preferences seed from existing preferences on first visit and subsequently stay independent.

Reports contain fixture and configuration snapshots, scores, returned explanations, raw judge replies, and any available token usage/latency. Credentials are stored separately and are not copied into reports. Existing advanced judge drafts and reports retain their storage keys; old `/hands-on/app/report.html?run=...` URLs redirect to the advanced report while preserving the query and fragment. An existing starter prompt can seed an advanced advice judge without changing the starter prompt. Reports belong to the browser and site address used for the run; their URLs do not share results with other devices. An interrupted page can leave an incomplete report snapshot. If saving the completed report fails, the app offers a JSON download.

## Files and local checks

| Path | Purpose |
|---|---|
| `app/` | Original starter and shared API connection helper |
| `app/advanced/` | Advanced judge builder, evaluation logic, separate styles, and report viewer |
| `data/scenarios.json` | Canonical recorded messages, tool definitions, calls, and results |
| `prompts/judges.json` | Editable draft judge examples |
| `tests/` | Node tests and browser smoke test (mocked model responses) |
| `datasets.md` | External dataset links |
| `notebooks/` | Optional notebook placeholder |

The report layout follows [Microsoft.Extensions.AI.Evaluation.Reporting](https://github.com/dotnet/extensions/tree/main/src/Libraries/Microsoft.Extensions.AI.Evaluation.Reporting/TypeScript), adapted lightly to the tutorial style brief. The deployed app has no React, .NET, npm, or backend dependency.

Run logic and staging checks without installing packages:

```bash
node --test workshop/tests/*.test.mjs
```

Build and preview the complete site using the repository's Quarto workflow:

```bash
./scripts/render-slides.sh all
./scripts/preview-site.sh
```

For workshop-only development without Quarto, assemble assets and serve the directory (do not open HTML as a file):

```bash
python3 scripts/stage-workshop.py /tmp/alta-workshop-preview/hands-on/app
python3 -m http.server 8091 --bind 127.0.0.1 --directory /tmp/alta-workshop-preview
```

Then open `http://127.0.0.1:8091/hands-on/app/` for the starter or `http://127.0.0.1:8091/hands-on/app/advanced/` for the advanced workshop. Advanced reports use `report.html?run=<id>` relative to the advanced page. The advanced source app needs staged `data/` and `prompts/`, so serve the assembled copy.

Browser smoke tests use Playwright installed outside the repository; see `tests/browser-smoke.mjs` for environment variables. They make no paid model calls.

LLM access arrangements and final organiser approval of workshop materials remain open.
