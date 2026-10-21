---
name: source-summaries
description: >-
  Write a tutorial-focused reading summary and capture key figures for one
  ALTA 2026 bibliography source page. Use when asked to summarise references,
  add paper figures to /bibliography/<id>/, or continue the reading pass.
---

# Source summaries

Each public source page (`/bibliography/<id>/`) should carry a reading note a first-year graduate student can use while preparing this tutorial, plus the figures that note depends on. The page already has an ACL reference, links, and a verbatim abstract. This skill fills the reading note. It does not write slides.

Audience: the tutorial prerequisites. Basic ML, NLP, and LLMs. No prior experience with agents or LLM-as-a-judge. Use the technical terms, and define each one the first time it appears in that note.

## When to use

- The user asks to summarise references, process source pages, or continue this reading pass.
- A source page still has only the one-sentence `summary`.

Do not use this skill to invent slide claims, rubrics, or timings. Before tying a finding to Part 1–4, read only the stable scope in [`knowledge/tutorial-overview.md`](../../knowledge/tutorial-overview.md): the four official parts and the ALTA program abstract. Do not open the part outlines, the slide decks, or the bibliography groups in order to name a section, a slide, or a list position.

## Where the text lives

`knowledge/bibliography.json` is the only prose source. `scripts/build-knowledge.py` generates `presentations/bibliography/<id>/index.qmd` and copies images next to it. Do not hand-edit the generated page.

| Field | Role |
|-------|------|
| `summary` | One or two sentences: why this source matters for the tutorial as a whole. Shown only when `summary_md` is absent. Keep it, and keep it true. The same naming rule as `summary_md` applies. |
| `summary_md` | The reading note, markdown. The page shows this inside the existing **AI-generated summary** label. |
| `summary_status` | `draft` after a successful pass. Organisers change it later. Do not set `reviewed`. |
| `figures` | List of `{file, alt, caption, credit}`. |
| `access_note` | Plain sentence about what could not be opened or captured. `null` when nothing failed. The page prints it above the summary. |
| `abstract` | Verbatim from the source, or `null`. Never paraphrase into this field. |

Images live at `knowledge/source-figures/<id>/<file>` (png or jpg). In `summary_md`, put the figure on its own line where the reader needs it:

```
{{figure:fig2-model-vs-agent.png}}
```

The file name must match `figures[].file`. A listed figure with no placeholder is appended at the end. A placeholder with no file is printed on the page as missing and fails the build.

## Order

1. Sources with `featured_rank` set, lowest rank first. That field is only a processing order. Do not mention it, or any list position, in the note.
2. Then the rest of `sources`, in file order.
3. Skip a source whose `summary_status` is already `draft` unless the user asked to revise it.
4. Papers, posts, and product pages all count. A batch is a number of **successful** sources, default 5. A blocked source does not count. Stop at the end of the batch.

## Read the source

Open the URL in `links` (PDF or publisher HTML). Read the full text you are summarising, not only the abstract. Record the URL you actually used.

If the full text will not open (paywall, HTTP error, empty download, login wall):

- Set `access_note` to what failed, including the URL and status or symptom.
- Do not fill `summary_md` from memory or from the abstract.
- Leave `summary_status` unset.
- Continue to the next source.

If the text opens but a figure will not:

- Write the note anyway.
- Name the missing figure and the reason in `access_note`.
- The source still counts as successful when the note is from the full text and at least one figure is captured, or the source genuinely has no figure, chart, or table worth showing (say that in `access_note`).

## Write `summary_md`

Your own words. Do not paste the abstract, a long quotation, or a prompt from the paper. A screenshot of a figure that happens to contain a prompt is fine; retyping that prompt into the note is not.

About 500–850 words. A short post can be shorter. Go longer only when cutting would drop a number the tutorial needs. Use these headings:

1. **Why it is here** — what the source is, and why it matters for the tutorial as a whole. Name an official part only when the connection is that part’s stable scope, below. A paper’s own part numbering is not the tutorial’s. Say “the survey’s Part 1” when you mean the paper.
2. **What they did** — setup, data, and method, with the terms defined. Name the judge model, scale, dataset, and split when the paper reports them.
3. **What they found** — the results that bear on the tutorial, with the numbers the paper prints and what those numbers mean. Point at the figure or table the number comes from. Do not upgrade a qualitative claim into a count.
4. **What to carry into the tutorial** — three to six bullets. Each bullet is a specific idea that follows from the paper and from the stable scope below. If the paper does not support a stronger claim, say so in the bullet.
5. **Limits** — what this source does not show, especially where a claim about reliability, cost, or failure modes would over-read it.

No `:::` fences in the markdown. Those close the summary block.

### What the note may name

The note should still say why the source matters for this tutorial. It should survive edits to the slides and to the bibliography.

Name these, and only these, as tutorial structure. They are the four parts and the ALTA program abstract in `knowledge/tutorial-overview.md`:

- **Part 1 — AI Agents and Evaluation Challenges.** Agents, tool use, and why final-answer scoring is insufficient. The industry lifecycle: prompts, test cases, datasets, rubrics, and code; versioning; offline evaluation versus production monitoring.
- **Part 2 — LLM-as-a-Judge Methods.** Deterministic versus non-deterministic evaluation. Criteria, rubrics, scales, and prompting. When a team chooses rules, a judge, or a human. Quality, latency, reliability, and cost.
- **Part 3 — Hands-on Agent Evaluation Exercise.** Participants build a rubric and an LLM judge for a tool-using agent, run it on test cases, and analyse tool choice, parameters, and response quality.
- **Part 4 — Reliability, Limitations, and Future Directions.** Consistency, robustness, cost, and failure modes. Good practice, industry lessons, and open research.

Do not mention any of the following. They change as the tutorial is revised:

- Where the source sits in the bibliography, including “primary”, “secondary”, “featured”, a group name, or a rank.
- An organiser list, a reading list, or “the outline”.
- A slide number, a slide title, or what a particular slide currently says.
- The current hands-on app: its scenario, its scale, or its output format. Part 3’s official wording (a rubric, an LLM judge, tool choice, parameters, response quality) is enough.
- Another source as if it were fixed tutorial material. Name another paper only as another paper.

“Part 1” is allowed. “The Part 1 outline” and “the first item on the list” are not. A sentence such as “It is the first item on the organiser primary list, and it is the wide frame for Part 1” keeps the second clause and drops the first.

## Capture figures

Pick 2–4 figures, charts, or tables that the note depends on. Prefer the framework diagram, the main result plot, and one table of the numbers you cite. Skip decorative art, the abstract, and a full page.

1. Prefer the publisher’s figure image (arXiv HTML `img` src is the usual case). Download that file.
2. If the figure is drawn in the PDF and has no image file, render the page and crop to the figure, including its caption and excluding the next paragraph and the other column.
3. Open the crop before saving it. A sliver of the next paragraph, a running header, or the other column’s text means the crop is wrong. Recrop.
4. Save PNG, RGB on white, longest side at most 1600 pixels.
5. `alt` describes what the image shows (axes, compared conditions, the result a reader can see). Do not write “figure from the paper”.
6. `caption` starts with the paper’s own number (“Figure 2 from Surname et al. (year).”) and one sentence on why it is on this page.
7. `credit` is `Reproduced from Surname et al. (year).`

## Finish one source

1. Set `summary_status` to `draft`. Keep `summary` as the short fallback, rewritten if it is no longer accurate.
2. If authors or a verbatim abstract were missing and you now have them from the file you opened, fill `authors` and `abstract`. Remove `author_label` once the byline is complete. Do not guess a name.
3. Validate JSON:

```bash
python3 -c "import json; json.load(open('knowledge/bibliography.json'))"
python3 scripts/build-knowledge.py
```

`build-knowledge.py` exits 1 when a listed figure file is missing. Fix that before rendering.

4. Render and open the page (see [`skills/quarto-reveal-slides/SKILL.md`](../quarto-reveal-slides/SKILL.md)):

```bash
./scripts/render-slides.sh all
./scripts/preview-site.sh
```

Open `http://127.0.0.1:8090/bibliography/<id>/`. Check the summary, each figure, the caption, and both colour appearances if you changed the theme. Fix overflow, a cut-off caption, or a missing image before counting the source as done.

5. Do not tick `organisation/literature/reading-checklist.md`. That list is for the organisers.

## Batch

Process one source fully, then the next. After the requested number of successes, stop. Leave later sources untouched. In the handoff, list each success with its id and page, and each blocked source with the `access_note` you wrote.
