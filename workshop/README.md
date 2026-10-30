# Hands-on workshop

Draft materials for **Part 3: Hands-on Agent Evaluation Exercise**. Participants build an LLM judge, run it over recorded agent traces, inspect its explanations, and challenge its conclusions. Scenarios and starter rubrics remain proposed workshop materials, not confirmed tutorial answers.

## Guided browser exercise

The hands-on landing page has one **Start exercise** button. The app at `/hands-on/app/` follows the same five separate pages in each round:

| Step | Page | Task |
|---|---|---|
| 1 | `index.html` | Inspect the current round's recorded cases |
| 2 | `rubric.html` | Design criteria, rubrics, evaluation targets, and passing thresholds |
| 3 | `judge.html` | Write overall judge instructions |
| 4 | `run.html` | Choose the judge model, run evaluations, and follow progress |
| 5 | `report.html?run=…` | Review scores, explanations, and evidence |

Back/Next links and numbered step navigation preserve the round. `round=advice`, `round=job-search`, or `round=jobs-training` identifies it. Visible round links on every page (including reports) open each round's cases, preserving judge edits without running evaluations. The round selector also allows revisiting examples. Without an explicit round, working pages use the last saved round, initially career advice.

| Round | Traces | Tool calls per trace |
|---|---:|---:|
| Career advice | 4 existing replies | 0 |
| Find suitable jobs | 3 variants of one request | 1 (`search_jobs`) |
| Connect jobs and training | 3 variants of one request | 2 (`search_jobs`, then `find_courses`) |

Begin with an editable career-advice rubric or choose a blank/draft rubric. Judge instructions and rubric edits carry forward between rounds. In round 3 only, **Add suggested tool criteria** offers the existing tool-choice, argument-accuracy, and grounding criteria. It adds missing criteria without duplicating or replacing participant edits. Loading a different rubric explicitly replaces criteria but keeps the judge instructions.

The run page evaluates only its current round. Model choice and request count are visible; run name, temperature, and repeats are under **More run settings**. Defaults are temperature 0 and one repeat; existing saved preferences take precedence. There is one request per applicable trace and repeat, with up to three concurrent requests and 1–5 repeats. Cancel stops active and queued requests. Internal navigation is disabled during a run. Leaving or refreshing stops requests and can leave an incomplete report; returning never resumes or repeats API calls automatically.

Only the judge calls the model API. Agent tools are **recorded fixtures**, not live integrations. The default endpoint is OpenRouter; Settings supports another browser-accessible OpenAI-compatible endpoint. Model availability depends on the endpoint and key. Inspecting cases, editing judges, and opening reports do not require a key or make model calls.

The synthetic variants let tool arguments, use of returned evidence, and answer quality differ. Participant labels do not reveal intended failure types. There are no preset scores or expected answers. Fictional job and course records are not real recommendations.

## Judge targets and reports

- **Final answer:** one score per criterion and trace.
- **Each tool call:** a separate score for each call, restricted to message evidence available up to that call. Because one request evaluates all targets, this instruction and evidence validation do not guarantee that the model ignores later context.
- **Use of tool results:** one score for how the answer uses returned evidence; not applicable without tools.
- **Whole trace:** one score assessing the complete interaction.

The app generates the JSON response contract from the criteria. Every result requires an integer score from 1–5, a concise explanation, and valid evidence message IDs. Missing, duplicate, invalid, or out-of-scope results produce an **evaluation error**, not a low agent score. Evidence links establish where the judge points; participants still need to check whether the evidence supports its claim.

A trace evaluation passes only if every applicable criterion meets its saved threshold (initially 4). Means, ranges, and pass rates use successful judge responses; errors, cancellations, pending entries, and not-applicable entries are shown separately. Tool criteria count one score per call. Each repeat is an independent trace evaluation.

The review page keeps the existing Overview/Cases report, transcript, tool inputs/outputs, expandable metrics, evidence links, and judge configuration snapshot. It offers revision, rerunning, and continuation to the next round. Saved reports are available from the cases and run pages and the report's run selector. Reports belong to the browser and site address used for the run; their URLs do not share results with other devices.

Judge drafts, model preferences, connection settings, workflow progress, and reports are saved locally. Edits save synchronously before navigating. Existing advanced drafts take precedence; otherwise a saved starter prompt can seed the advice judge using the existing migration. Legacy starter records stay intact. Existing credential storage and advanced draft/settings/report keys remain in use; a separate workflow record stores the current round/step, run names, and each round's latest report ID. Removed API keys are never restored from old settings.

Reports contain fixture and configuration snapshots, scores, explanations, raw judge replies, and available token usage/latency. Credentials are stored separately and excluded from reports. Progress snapshots are saved during evaluations. If saving a completed report fails, the app offers a JSON download. Old `/hands-on/app/advanced/` entry links redirect to the guided exercise; old advanced report URLs redirect to `/hands-on/app/report.html`, preserving query parameters and fragments. Older multi-scenario reports retain their filters and scores.

## Files and local checks

| Path | Purpose |
|---|---|
| `app/` | Guided pages, page controller, workflow/navigation helpers, shared connection helper |
| `app/advanced/` | Shared evaluation, storage, transcript/report rendering and styles; compatibility redirects |
| `data/scenarios.json` | Canonical recorded messages, tool definitions, calls, and results |
| `prompts/judges.json` | Editable draft judge examples |
| `tests/` | Node tests and mocked browser smoke test |
| `datasets.md` | External dataset links |
| `notebooks/` | Optional notebook placeholder |

The report layout follows [Microsoft.Extensions.AI.Evaluation.Reporting](https://github.com/dotnet/extensions/tree/main/src/Libraries/Microsoft.Extensions.AI.Evaluation.Reporting/TypeScript), adapted to the tutorial style brief. The deployed app has no React, .NET, npm, or backend dependency.

Run logic, workflow, and staging checks without installing packages:

```bash
node --test workshop/tests/*.test.mjs
```

Build and preview using the repository's Quarto workflow:

```bash
./scripts/render-slides.sh all
./scripts/preview-site.sh
```

For workshop-only development without Quarto, assemble assets and serve the directory:

```bash
python3 scripts/stage-workshop.py /tmp/alta-workshop-preview/hands-on/app
python3 -m http.server 8091 --bind 127.0.0.1 --directory /tmp/alta-workshop-preview
```

Open `http://127.0.0.1:8091/hands-on/app/`. Serve the assembled copy: it includes the canonical fixtures and prompts. Do not open HTML as a file.

Browser smoke tests use Playwright installed outside the repository; see `tests/browser-smoke.mjs` for environment variables. They make no paid model calls.

LLM access arrangements and final organiser approval of workshop materials remain open.
