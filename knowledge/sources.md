# Sources and access notes

Record what was used when scaffolding this repo so later contributors know what is authoritative vs missing.

## Fetched successfully

| Source | URL | Notes |
|--------|-----|-------|
| ALTA 2026 program (afternoon tutorial) | https://alta2026.alta.asn.au/program#afternoon-tutorial | Title, abstract, presenters, session/part overview, prerequisites |
| ALTA 2026 site | https://alta2026.alta.asn.au/ | Conference home |

## Schedule

- **Conference site listing** (as relayed by Terrence, 24 November 2026): 13:00–14:00 Session 1, 14:00–14:30 afternoon tea, 14:30–16:00 Session 2.
- **Tutorial plan** (Terrence, 24 November 2026): the organisers are shifting afternoon tea slightly. 13:00–13:35 Part 1, 13:35–14:10 Part 2, 14:10–14:40 afternoon tea, 14:40–15:30 Part 3, 15:30–16:00 Part 4. Session 1 is Parts 1–2 and Session 2 is Parts 3–4. Q&A is inside each part’s slot and is not shown separately.
- Start and end (13:00, 16:00) agree. The tea break and Part 3’s start depend on the organisers confirming the shift.
- The Intro deck’s schedule slide and [`tutorial-overview.md`](tutorial-overview.md) use the tutorial plan.

Beyond that schedule, the detailed agenda is not in this repo. Do **not** invent agenda timings, section owners, or workshop specifics. Add the agenda here (e.g. `knowledge/detailed-agenda.md`) when it is available. Keep this `knowledge/` tree for stable tutorial facts only.

## Bibliography

The public reading list is [`bibliography.json`](bibliography.json). `scripts/build-knowledge.py` turns it into `/bibliography/` on the site. Abstracts in that file are copied from the sources; summaries are labelled AI-generated drafts.
