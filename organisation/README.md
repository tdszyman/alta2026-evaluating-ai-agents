# Organisation

Living planning docs for the four tutorial organisers (Terrence/Terry Szymanski, Parvin Zarei Eskikand, Sara Mirabi, Yelaman Abdullin) and their agents.

**Intent:** Possibly shift collaboration from Notion to GitHub if everyone is on board. Keep these files human- and agent-editable; prefer PRs or direct edits on this branch for shared decisions.

## How to use this tree

| Path | Purpose |
|------|---------|
| [`meetings/`](meetings/) | Dated `YYYY-MM-DD-agenda.md` / `YYYY-MM-DD-minutes.md` (plus legacy notes) |
| [`action-items.md`](action-items.md) | Open actions and next-week commitments |
| [`decisions.md`](decisions.md) | Working decisions and open questions |
| [`literature/`](literature/) | References, reading checklist, platforms |
| [`notes/`](notes/) | Working concept notes (e.g. LLM-as-a-judge) |
| [`outlines/`](outlines/) | WIP section outlines (e.g. Part 1) |

## Relation to other top-level dirs

| Area | Role |
|------|------|
| **`organisation/`** | Living planning: meetings, actions, decisions, lit review WIP, outlines |
| [`knowledge/`](../knowledge/) | Stable tutorial facts (ALTA program title, speakers, official parts, source access notes) |
| [`presentations/`](../presentations/) | Slide decks delivered to attendees |
| [`workshop/`](../workshop/) | Hands-on assets for participants |

Do **not** duplicate the same document in both `organisation/` and `knowledge/`. Cross-link instead. When a planning doc hardens into tutorial knowledge (e.g. confirmed agenda), promote a short summary into `knowledge/` and leave detail here or in presentations/workshop.

## Collaboration workflow

**Organisers:** Terrence (Terry) Szymanski, Parvin Zarei Eskikand, Sara Mirabi, Yelaman Abdullin.  
**Cadence:** Weekly Friday planning meetings.

Markdown under `organisation/` is the **source of truth** for planning (agendas, minutes, outlines, lit notes). Notion may still be used during a transition; prefer committing here so humans and agents share one notebook.

### Artifacts

| Artifact | Use |
|----------|-----|
| **Markdown** (`organisation/`) | Notebook: agendas, minutes, outlines, literature, decisions, action items |
| **GitHub Issues** | Trackable work (assignable, closable). Link issue numbers from minutes and [`action-items.md`](action-items.md) when Issues exist |
| **GitHub Discussions** | Optional async debate that is not yet a decision |
| **Pull requests** | Substantive tutorial materials (`presentations/`, `workshop/`) or changes that need review — **not** routine meeting admin |

Meeting docs commit straight to the planning branch (this scaffold PR until it merges; then `main` or whatever the repo uses for planning). Open a PR for meeting docs only if the same change also touches tutorial content.

### Meeting file pattern

```
organisation/meetings/YYYY-MM-DD-agenda.md
organisation/meetings/YYYY-MM-DD-minutes.md
```

Keep [`action-items.md`](action-items.md) and [`decisions.md`](decisions.md) as the rolling indexes. Older notes without the `-minutes` suffix (e.g. [`meetings/2026-10-17-friday.md`](meetings/2026-10-17-friday.md)) remain valid history.

### Agent skill

For drafting agendas, filing minutes, and updating rolling indexes, follow:

**[`../skills/meeting-cycle/SKILL.md`](../skills/meeting-cycle/SKILL.md)**

## Agents

1. Read [`../AGENTS.md`](../AGENTS.md) and [`../knowledge/tutorial-overview.md`](../knowledge/tutorial-overview.md) first.
2. Prefer updating checkboxes and open questions in place over inventing resolved answers.
3. Do not invent tutorial substance (scenarios, rubrics, timings) beyond what is recorded here or in `knowledge/`.
4. For the Friday meeting cycle, use [`../skills/meeting-cycle/SKILL.md`](../skills/meeting-cycle/SKILL.md).
