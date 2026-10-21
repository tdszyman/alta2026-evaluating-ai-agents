# Agent skills

Skills are instructions coding agents should follow for recurring tasks in this repo.

| Skill | When to use |
|-------|-------------|
| [`meeting-cycle/`](meeting-cycle/SKILL.md) | Draft Friday agendas; process minutes; update action-items/decisions |
| [`quarto-reveal-slides/`](quarto-reveal-slides/SKILL.md) | Author or render decks; when asked to open or view the site, run `./scripts/preview-site.sh` and open the page |
| [`citation-links/`](citation-links/SKILL.md) | Check slide citations against the bibliography and rebuild backlinks |

Add new skills as `skills/<name>/SKILL.md` with YAML front matter (`name`, `description`).
