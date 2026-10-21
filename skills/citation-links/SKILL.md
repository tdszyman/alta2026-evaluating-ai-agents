---
name: citation-links
description: >-
  Review ALTA 2026 presentation decks against knowledge/bibliography.json and
  repair two-way citation links. Use when editing slides, adding a reference,
  or when the user asks to check citations, missing links, or bibliography-page
  backlinks.
---

# Citation links

Slides and the bibliography point at each other.

- A citation in a deck is a markdown link whose target contains `bibliography/<id>/`.
- `<id>` is a key in `knowledge/bibliography.json`.
- `scripts/build-knowledge.py` rebuilds `presentations/bibliography/` and lists, on each source page, every slide that links to that id.

## Check

From the repo root:

```bash
python3 scripts/build-knowledge.py
```

Read the report:

- **Broken citation links** — the deck names an id that is not in the bibliography. Fix the id or add the source. Exit code is 1.
- **Unlinked mentions** — a deck line contains a source’s `mentions` phrase and does not link that id. Link it, or remove the phrase from `mentions` if it is too broad (the tutorial title is not a citation).
- **Sources not yet cited** — informational. Do not add a citation that the slide does not support.

## Link a citation

From `presentations/presentation/<part>/index.qmd`:

```markdown
[Yao et al. 2023](../../bibliography/yao-2023-react/)
```

Use the concise ACL name (surname, or “Surname et al.”, plus year). Link an existing claim. Do not add a new teaching point just to have a citation.

Then run `python3 scripts/build-knowledge.py` again so the source page gains the backlink. The backlink uses the slide’s heading slug (`#/the-heading`), which matches Quarto’s `hash-type: title`.

## Add a source

Edit `knowledge/bibliography.json`. Required fields: `id`, `type` (`paper`, `blog`, or `website`), `title`, `year`, `groups`, `summary`.

- `authors` is a list of “Given Family” names. Use `author_label` (for example `Chen et al.`) only when the full byline is not known.
- `venue` is the rest of the ACL reference after the title (proceedings, “arXiv preprint arXiv:….”, site name).
- `abstract` is verbatim from the source, or `null`. Do not write an abstract from memory.
- `summary` is a one- or two-sentence note on why the source matters for the tutorial as a whole. The page uses it only when `summary_md` is absent. Do not present it as the authors’ abstract. Follow the naming rule in [`skills/source-summaries/SKILL.md`](../source-summaries/SKILL.md): the four official parts and the ALTA program abstract are stable; a list position, a bibliography group, an outline, and a slide number are not.
- A fuller reading summary, its figures, and any access failure belong in `summary_md`, `figures`, `access_note`, and `summary_status`. Provenance for that note belongs in `summary_generated_at`, `summary_skill_version`, and `summary_agent`. Follow [`skills/source-summaries/SKILL.md`](../source-summaries/SKILL.md). Do not delete those fields when you are only fixing a citation link.
- `links` is a list of `{label, href}` for the publication, PDF, code, dataset, site, or post.
- `mentions` lists short phrases the checker should find in decks. Keep them specific.

Groups used by the bibliography filters: `featured`, `surveys`, `agents`, `lifecycle`, `judges`, `trajectories`, `reliability`, `dialogue`, `industry`, `platforms`. Put organiser primary-list items in `featured` and set `featured_rank` in that list’s order.

Rebuild after the edit.
