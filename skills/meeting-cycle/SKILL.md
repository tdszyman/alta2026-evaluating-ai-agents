---
name: meeting-cycle
description: >-
  Draft Friday planning agendas and process meeting minutes for the ALTA 2026
  tutorial organisers. Use when asked to draft an agenda, write minutes, update
  action-items or decisions from a meeting, or continue the weekly planning cycle.
---

# Meeting cycle

Full workflow context: [`organisation/README.md`](../../organisation/README.md) (Collaboration workflow). Do not invent outcomes, decisions, or commitments.

## When to use

- Draft next Friday’s (or a named date’s) agenda
- Turn pasted or committed minutes into repo updates
- Refresh [`action-items.md`](../../organisation/action-items.md) / [`decisions.md`](../../organisation/decisions.md) after a meeting

## Inputs

| Need | Where |
|------|--------|
| Latest notes/minutes | `organisation/meetings/*` (prefer newest `*-minutes.md`; else latest dated notes) |
| Open work | `organisation/action-items.md` |
| Decisions / open questions | `organisation/decisions.md` |
| Relevant WIP | e.g. `organisation/outlines/part-01.md` |
| User paste | Chat text treated as minutes — do not add claims absent from it |

## File pattern

```
organisation/meetings/YYYY-MM-DD-agenda.md
organisation/meetings/YYYY-MM-DD-minutes.md
```

Default agenda date: **next Friday** unless the user names another date.

## Draft an agenda

1. Read latest minutes/notes, `action-items.md`, `decisions.md`, and relevant outlines.
2. Write `organisation/meetings/YYYY-MM-DD-agenda.md` with:
   - **Purpose**
   - **Prep** owners should bring (from open action items)
   - **Discussion** (open questions — keep them phrased as questions)
   - **Decisions needed** (only items already flagged as open/tentative)
   - **Carry-over actions** with owners
3. Link related files. Timebox lightly only if tutorial session structure implies it; do not pad.
4. Optional discussion only if clearly in-repo as WIP (e.g. Part 1 outline).

## Process minutes

When minutes are pasted in chat or committed:

1. Write `organisation/meetings/YYYY-MM-DD-minutes.md` (meeting date; if only “Friday” and an agenda exists, use that agenda’s date).
2. Update `action-items.md`: check off done items; add new ones with **owner** and link to the source minutes.
3. Update `decisions.md`: record decisions; leave unresolved questions explicit.
4. Note which new actions should become **GitHub Issues**; create them with `gh` when authenticated and the user has not said to skip Issues. Link issue numbers from minutes and action-items.
5. Draft the **following Friday’s** agenda from what remains open.
6. **Do not** invent outcomes absent from the minutes. Preserve names and uncertainty.

## Outputs / commit

- Meeting-doc updates → commit on the **current planning branch** (scaffold PR branch until merged; then `main` or the repo’s planning default).
- Open a **PR** only if the change also touches tutorial content (`presentations/`, `workshop/`, etc.).
- Routine meeting admin does **not** need a PR.

## Do nots

- Do not invent decisions, owners, scenarios, or deadlines.
- Do not replace the collaboration section in `organisation/README.md` — follow it.
- Do not use PRs for agenda/minutes-only edits.
- Do not create Issues in a turn where the user asked to skip them or documenting the rule is enough.
