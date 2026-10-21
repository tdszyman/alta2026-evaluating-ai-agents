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

Do not use this skill to invent slide claims, rubrics, or timings. Read [`knowledge/tutorial-overview.md`](../../knowledge/tutorial-overview.md) and the part outline the source belongs to before tying a finding to Part 1–4.

## Where the text lives

`knowledge/bibliography.json` is the only prose source. `scripts/build-knowledge.py` generates `presentations/bibliography/<id>/index.qmd` and copies images next to it. Do not hand-edit the generated page.

| Field | Role |
|-------|------|
| `summary` | One or two sentences: why this source is on the list. Shown only when `summary_md` is absent. Keep it, and keep it true. |
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

1. Sources with `featured_rank` set, lowest rank first (the organiser primary list).
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

1. **Why it is here** — what the source is, and which tutorial part it serves. Use the record’s `groups`, `mentions`, and the part outlines. The survey papers have their own “Part 1” numbering. Say “the survey’s Part 1” so it is not read as this tutorial’s Part 1.
2. **What they did** — setup, data, and method, with the terms defined. Name the judge model, scale, dataset, and split when the paper reports them.
3. **What they found** — the results the tutorial needs, with the numbers the paper prints and what those numbers mean. Point at the figure or table the number comes from. Do not upgrade a qualitative claim into a count.
4. **What to carry into the tutorial** — three to six bullets. Each bullet is a specific idea a presenter could use. If the paper does not support a stronger claim, say so in the bullet.
5. **Limits** — what this source does not show, especially where Part 4 would over-read it.

No `:::` fences in the markdown. Those close the summary block.

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
