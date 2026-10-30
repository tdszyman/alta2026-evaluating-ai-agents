# Scripts

| Script | Purpose |
|--------|---------|
| [`render-slides.sh`](render-slides.sh) | Render the Quarto site (`01`–`04` or `all`), including bibliography pages, the organiser mirror, and the hands-on app |
| [`preview-site.sh`](preview-site.sh) | Serve `presentations/_site` at http://127.0.0.1:8090 so local links work. No Quarto required |
| [`stage-workshop.py`](stage-workshop.py) | Assemble the guided exercise pages, report, shared connection helper, canonical fixtures, judge templates, and compatibility redirects |
| [`build-knowledge.py`](build-knowledge.py) | Rebuild `/bibliography/` from `knowledge/bibliography.json` and report citation links |
| [`stage-organisation.py`](stage-organisation.py) | Mirror `organisation/` into the site; skips the mirror on and after 30 November 2026 |
| [`generate-complexity-figures.py`](generate-complexity-figures.py) | Regenerate the animated complicated-vs-complex SVGs used in Part 1 (`python3 scripts/generate-complexity-figures.py`) |
| [`generate-output-space-figures.py`](generate-output-space-figures.py) | Regenerate the output-space panels on the Part 1 slide “Why generative AI needs LLM-as-a-judge” (`python3 scripts/generate-output-space-figures.py`) |

Make executable if needed: `chmod +x scripts/render-slides.sh`.
