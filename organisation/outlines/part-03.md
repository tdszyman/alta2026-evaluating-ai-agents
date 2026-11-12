# Part 3 outline (WIP)

**Part:** Hands-on Agent Evaluation Exercise  
**Deck (WIP):** [`../../presentations/presentation/03-hands-on-exercise/index.qmd`](../../presentations/presentation/03-hands-on-exercise/index.qmd)  
**Workshop app:** [`../../workshop/README.md`](../../workshop/README.md) · `/hands-on/app/`  
**Status:** Introductory deck (5 content slides) for the ~10-minute briefing before participants open the hands-on exercise.

## Slides

1. **Title slide.** Shared Part 3 section divider (`Part 3`, `Yelaman Abdullin`).
2. **Goal: build and test a judge for a career assistant.** Visual pipeline (`Recorded trace + Rubric & prompt → LLM judge → Evaluation report`) and the three design principles behind the exercise:
   - **Isolate the judge:** The 10 career-assistant traces are recorded synthetic fixtures; only your judge calls the LLM API, so changes in scores reflect your rubric, prompt, or model choice.
   - **No spoilers in the case names:** Neutral labels (*Trace A, B, C*) mean you inspect the trace first and test whether your judge agrees.
   - **You are the domain expert:** No preset answer key; starter criteria are editable drafts ([Shankar et al. 2024](../../knowledge/bibliography.json)).
3. **Why look inside the trace? A polite reply can hide a failure.** Side-by-side trace mock-up and evaluator comparison showing how a polite answer can pass surface fluency and JSON schema checks while calling `search_jobs` with the wrong city/hours and inventing salary and interview promises.
4. **One career assistant across three rounds.** How the scenario and trace shape grow across rounds while your rubric and instructions carry forward:
   - **Round 1 · Career advice** (`0 tools · 4 cases`): `User → Assistant`. Calibrate the base answer rubric (*Soundness*, *Tone*, *Compliance*).
   - **Round 2 · Find suitable jobs** (`1 tool · 3 traces`): `User → search_jobs → Assistant`. Distinguish grounded search from wrong tool filters or invented job details.
   - **Round 3 · Connect jobs and training** (`2 tools · 3 traces`): `User → search_jobs → find_courses → Assistant`. Add tool-use criteria and check whether call 2 follows the skill gap from call 1 within budget and study-time constraints.
5. **Four places in the trace to attach a criterion.** Annotated trace with pins `A`–`D` mapping onto the four evaluation targets in the Rubric Builder (*Final answer*, *Each tool call*, *Use of tool results*, *Whole trace*), plus the `1–5` scale (default pass `≥ 4`) and message-ID evidence contract ([Winston 2026](../../knowledge/bibliography.json); [Jia et al. 2025](../../knowledge/bibliography.json); [Hong et al. 2026](../../knowledge/bibliography.json)).
6. **Five steps in every round.** The five-page workflow inside `/hands-on/app/` (`1. Inspect cases → 2. Design rubric → 3. Write judge → 4. Run evaluation → 5. Review report`), a first-pass checklist, experiments to try (thresholds, repeat runs/temperature, model comparison), and the link to open `/hands-on/`.
7. **Next.** Hand-off to Part 4 (`../04-reliability-and-future/`).

## Related

- Hands-on prototype notes: [`../notes/hands-on-prototype.md`](../notes/hands-on-prototype.md)
- Open Part 3 questions: [`../decisions.md`](../decisions.md#part-3--hands-on-working-direction)
