#!/usr/bin/env python3
"""Build the public bibliography pages and report slide citation links.

Source: knowledge/bibliography.json
Output: presentations/bibliography/
Scans:  presentations/presentation/**/*.qmd

A citation is any markdown link whose target contains bibliography/<id>/.
Run this before quarto render (scripts/render-slides.sh does).
"""

from __future__ import annotations

import html
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BIB = ROOT / "knowledge" / "bibliography.json"
FIGURES = ROOT / "knowledge" / "source-figures"
DECKS = ROOT / "presentations" / "presentation"
OUT = ROOT / "presentations" / "bibliography"

PARTS = {
    "01-agents-and-eval-challenges": "Part 1",
    "02-llm-as-judge-methods": "Part 2",
    "03-hands-on-exercise": "Part 3",
    "04-reliability-and-future": "Part 4",
}

GROUP_LABELS = [
    ("surveys", "Surveys"),
    ("agents", "Agents"),
    ("lifecycle", "Lifecycle"),
    ("judges", "Judges"),
    ("trajectories", "Trajectories"),
    ("reliability", "Reliability"),
    ("dialogue", "Dialogue"),
    ("industry", "Industry"),
    ("platforms", "Platforms"),
]


def yaml_quote(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def acl_authors(authors: list[str]) -> str:
    if not authors:
        return ""
    if len(authors) == 1:
        return authors[0]
    if len(authors) == 2:
        return f"{authors[0]} and {authors[1]}"
    return ", ".join(authors[:-1]) + ", and " + authors[-1]


def surname(name: str) -> str:
    parts = name.replace(",", " ").split()
    return parts[-1] if parts else name


def concise_who(src: dict) -> str:
    if src.get("author_label"):
        return str(src["author_label"]).rstrip(".")
    authors = src.get("authors") or []
    if not authors:
        return ""
    if src.get("type") == "website" and len(authors) == 1:
        return authors[0]
    if len(authors) == 1:
        return surname(authors[0])
    if len(authors) == 2:
        return f"{surname(authors[0])} and {surname(authors[1])}"
    return f"{surname(authors[0])} et al"


def full_reference(src: dict) -> str:
    authors = (src.get("author_label") or "").rstrip(".") or acl_authors(src.get("authors") or [])
    year = str(src.get("year") or "n.d.").rstrip(".")
    title = src["title"].rstrip(".")
    venue = (src.get("venue") or "").strip()
    if venue and not venue.endswith("."):
        venue += "."
    bits = []
    if authors:
        bits.append(f"{authors}.")
    bits.append(f"{year}.")
    bits.append(f"{title}.")
    if venue:
        bits.append(venue)
    return " ".join(bits)


def concise_reference(src: dict) -> str:
    who = concise_who(src)
    year = str(src.get("year") or "n.d.").rstrip(".")
    title = src["title"].rstrip(".")
    if who:
        return f"{who}. {year}. {title}."
    return f"{title}. {year}."


def sort_key(src: dict) -> tuple:
    label = (src.get("author_label") or "").rstrip(".")
    authors = src.get("authors") or []
    if label:
        who = label.split()[0].lower()
    elif authors:
        who = surname(authors[0]).lower()
    else:
        who = src["title"].lower()
    year = str(src.get("year") or "9999")
    return (who, year, src["title"].lower())


def html_paragraph(text: str) -> str:
    return "<p>" + html.escape(text).replace("\n\n", "</p><p>").replace("\n", " ") + "</p>"


def slugify(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[*_`]", "", text)
    text = text.strip().lower()
    text = text.replace("'", "").replace("’", "")
    text = re.sub(r"[^\w.\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-.")
    return text or "section"


def slide_index(markdown: str) -> list[dict]:
    """First heading of each slide, with Pandoc-style ids."""
    body = markdown
    if body.startswith("---"):
        end = body.find("\n---", 3)
        if end != -1:
            body = body[end + 4 :]
    seen: dict[str, int] = {}
    slides = []
    current: dict | None = None
    for line in body.splitlines():
        if line.strip() == "---":
            current = None
            continue
        match = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
        if not match:
            continue
        base = slugify(match.group(2))
        n = seen.get(base, 0)
        seen[base] = n + 1
        ident = base if n == 0 else f"{base}-{n}"
        if current is None:
            current = {"id": ident, "title": re.sub(r"[*_`]", "", match.group(2)).strip()}
            slides.append(current)
    return slides


def find_slide(slides: list[dict], lineno: int, lines: list[str]) -> dict | None:
    """Map a citation line to the slide that contains it."""
    # Re-walk to the line and remember the latest slide heading.
    body_start = 0
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                body_start = i + 1
                break
    slide_i = -1
    started = False
    for i, line in enumerate(lines):
        if i < body_start:
            continue
        if line.strip() == "---":
            started = False
            continue
        if re.match(r"^#{1,6}\s+", line) and not started:
            slide_i += 1
            started = True
        if i + 1 >= lineno and slide_i >= 0:
            return slides[slide_i] if slide_i < len(slides) else None
    return slides[slide_i] if 0 <= slide_i < len(slides) else None


def scan_decks(ids: set[str]) -> tuple[dict[str, list[dict]], list[str]]:
    cited: dict[str, list[dict]] = {i: [] for i in ids}
    broken: list[str] = []
    link_re = re.compile(r"bibliography/([a-z0-9-]+)/?")
    for path in sorted(DECKS.glob("*/*.qmd")):
        part_key = path.parent.name
        part = PARTS.get(part_key, part_key)
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()
        slides = slide_index(text)
        for lineno, line in enumerate(lines, start=1):
            if "bibliography/" not in line:
                continue
            for match in link_re.finditer(line):
                sid = match.group(1)
                if sid not in ids:
                    broken.append(f"{path.relative_to(ROOT)}:{lineno}: unknown id {sid}")
                    continue
                slide = find_slide(slides, lineno, lines)
                title = slide["title"] if slide else "Slide"
                ident = slide["id"] if slide else ""
                href = f"../../presentation/{part_key}/#{('/' + ident) if ident else ''}"
                # hash-type: title → #/id
                href = f"../../presentation/{part_key}/" + (f"#/{ident}" if ident else "")
                entry = {"part": part, "title": title, "href": href, "file": str(path.relative_to(ROOT))}
                if entry not in cited[sid]:
                    cited[sid].append(entry)
    return cited, broken


def mention_report(sources: list[dict]) -> list[str]:
    notes = []
    for path in sorted(DECKS.glob("*/*.qmd")):
        lines = path.read_text(encoding="utf-8").splitlines()
        rel = path.relative_to(ROOT)
        for src in sources:
            sid = src["id"]
            for phrase in src.get("mentions") or []:
                rx = re.compile(re.escape(phrase))
                for lineno, line in enumerate(lines, start=1):
                    if not rx.search(line):
                        continue
                    if f"bibliography/{sid}" in line:
                        continue
                    notes.append(f"{rel}:{lineno}: “{phrase}” is not linked to {sid}")
                    break
    return notes


def write_index(sources: list[dict]) -> None:
    ordered = sorted(sources, key=sort_key)
    buttons = ['<button type="button" aria-pressed="true" data-group="all">All</button>']
    for key, label in GROUP_LABELS:
        buttons.append(
            f'<button type="button" aria-pressed="false" data-group="{html.escape(key)}">{html.escape(label)}</button>'
        )
    items = []
    for src in ordered:
        groups = " ".join(g for g in (src.get("groups") or []) if g != "featured")
        who = concise_who(src)
        year = str(src.get("year") or "n.d.").rstrip(".")
        title = src["title"].rstrip(".")
        prefix = f"{who}. {year}. " if who else ""
        items.append(
            f'<li data-groups="{html.escape(groups)}">'
            f'{html.escape(prefix)}<a href="{html.escape(src["id"] + "/")}">{html.escape(title)}</a>.'
            f"</li>"
        )
    page = f"""---
title: "Bibliography [including AI-generated literature summaries]{{.title-sub}}"
pagetitle: "Bibliography"
format: html
---

Click on a source below to view more details, including its AI-generated summary where one has been written.

<div class="filters" role="toolbar" aria-label="Filter the bibliography">
{chr(10).join(buttons)}
</div>

<ul class="bib-list" id="bib-list">
{chr(10).join(items)}
</ul>

```{{=html}}
<script>
(function () {{
  var buttons = document.querySelectorAll(".filters button");
  var items = document.querySelectorAll("#bib-list li");
  buttons.forEach(function (btn) {{
    btn.addEventListener("click", function () {{
      buttons.forEach(function (b) {{ b.setAttribute("aria-pressed", "false"); }});
      btn.setAttribute("aria-pressed", "true");
      var group = btn.getAttribute("data-group");
      items.forEach(function (li) {{
        var groups = (li.getAttribute("data-groups") || "").split(/\\s+/);
        li.hidden = group !== "all" && groups.indexOf(group) === -1;
      }});
    }});
  }});
}})();
</script>
```
"""
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "index.qmd").write_text(page, encoding="utf-8")


def figure_html(fig: dict) -> str:
    alt = html.escape(fig.get("alt") or "", quote=True)
    caption = html.escape(fig.get("caption") or "")
    credit = html.escape(fig.get("credit") or "")
    credit_html = f'<span class="figure-credit">{credit}</span>' if credit else ""
    file_name = html.escape(fig["file"], quote=True)
    return (
        '<figure class="paper-figure">'
        f'<img src="{file_name}" alt="{alt}">'
        f"<figcaption>{caption}{credit_html}</figcaption>"
        "</figure>"
    )


def render_summary(src: dict, dest: Path, missing: list[str]) -> str:
    """Markdown for the AI-generated summary, with figure placeholders expanded."""
    md = (src.get("summary_md") or "").strip()
    if not md:
        return "```{=html}\n" + html_paragraph(src.get("summary") or "Summary not yet written.") + "\n```"
    figures = {f["file"]: f for f in (src.get("figures") or []) if f.get("file")}
    used: set[str] = set()

    def repl(match: re.Match) -> str:
        name = match.group(1).strip()
        used.add(name)
        fig = figures.get(name)
        src_path = FIGURES / src["id"] / name
        if fig is None or not src_path.is_file():
            missing.append(f'{src["id"]}: {name}')
            return (
                "\n\n```{=html}\n"
                f'<p class="figure-missing">Figure file missing: {html.escape(name)}</p>\n'
                "```\n\n"
            )
        shutil.copy(src_path, dest / name)
        return "\n\n```{=html}\n" + figure_html(fig) + "\n```\n\n"

    body = re.sub(r"\{\{figure:\s*([^}]+?)\s*\}\}", repl, md)
    leftovers = []
    for name, fig in figures.items():
        if name in used:
            continue
        src_path = FIGURES / src["id"] / name
        if not src_path.is_file():
            missing.append(f'{src["id"]}: {name}')
            continue
        shutil.copy(src_path, dest / name)
        leftovers.append("```{=html}\n" + figure_html(fig) + "\n```")
    if leftovers:
        body = body.rstrip() + "\n\n" + "\n\n".join(leftovers) + "\n"
    return body


def provenance_html(src: dict) -> str:
    """Quiet line: when the note was written, which skill version, and which agent."""
    when = str(src.get("summary_generated_at") or "").strip()
    version = src.get("summary_skill_version")
    agent = str(src.get("summary_agent") or "").strip()
    parts = []
    if when:
        parts.append(html.escape(when))
    if version is not None and str(version).strip():
        parts.append("Skill version " + html.escape(str(version).strip()))
    if agent:
        parts.append(html.escape(agent))
    if not parts:
        return ""
    return '<p class="ai-provenance">' + " · ".join(parts) + "</p>\n"


def write_source(src: dict, cites: list[dict], missing: list[str]) -> None:
    links = []
    seen = set()
    for link in src.get("links") or []:
        href = link.get("href")
        if not href or href in seen:
            continue
        seen.add(href)
        links.append(f'- [{link.get("label") or "Link"}]({href})')
    if src.get("url") and src["url"] not in seen:
        links.insert(0, f'- [Source]({src["url"]})')
    link_md = "\n".join(links) if links else "Canonical link not yet recorded."
    if src.get("abstract"):
        abstract_md = "```{=html}\n" + html_paragraph(src["abstract"]) + "\n```"
    else:
        abstract_md = "No formal abstract is recorded for this source."
    if cites:
        cite_md = "\n".join(
            f'- [{html.escape(c["part"])} · {html.escape(c["title"])}]({c["href"]})'
            for c in cites
        )
        # titles are already plain; html.escape in a markdown link label will show entities.
        cite_md = "\n".join(
            f'- [{c["part"]} · {c["title"].replace("[", "").replace("]", "")}]({c["href"]})'
            for c in cites
        )
    else:
        cite_md = "No slide currently links to this source."
    note = src.get("note")
    note_md = f"\n{note}\n" if note else ""
    access = (src.get("access_note") or "").strip()
    access_md = ""
    if access:
        access_md = (
            "\n::: {.access-note}\n**Access note.** "
            + access
            + "\n:::\n"
        )
    year = str(src.get("year") or "n.d.").rstrip(".")
    kind = {"paper": "Paper", "blog": "Blog post", "website": "Website"}.get(src.get("type"), "Source")
    dest = OUT / src["id"]
    dest.mkdir(parents=True, exist_ok=True)
    summary_body = render_summary(src, dest, missing)
    page = f"""---
title: {yaml_quote(src["title"])}
subtitle: {yaml_quote(f"{kind} · {year}")}
format: html
toc: false
---

<p class="acl-ref">{html.escape(full_reference(src))}</p>
{note_md}
## Links

{link_md}

## Abstract

{abstract_md}
{access_md}
::: {{.ai-summary}}
<p class="ai-label">AI-generated summary</p>
{provenance_html(src)}
Draft for organiser review. A coding agent wrote this note. It is not a substitute for the abstract or the source.

{summary_body}
:::

## Cited in the presentation

{cite_md}
"""
    (dest / "index.qmd").write_text(page, encoding="utf-8")


def main() -> int:
    data = json.loads(BIB.read_text(encoding="utf-8"))
    sources = data["sources"]
    ids = {s["id"] for s in sources}
    dupes = [s["id"] for s in sources if sum(1 for t in sources if t["id"] == s["id"]) > 1]
    if dupes:
        print("duplicate ids:", sorted(set(dupes)), file=sys.stderr)
        return 1
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    cited, broken = scan_decks(ids)
    write_index(sources)
    missing: list[str] = []
    for src in sources:
        write_source(src, cited.get(src["id"], []), missing)
    drafted = [s["id"] for s in sources if s.get("summary_status") == "draft"]
    print(f"Wrote {len(sources)} bibliography pages → {OUT.relative_to(ROOT)}")
    print(f"Draft reading summaries: {len(drafted)}")
    unstamped = [
        s["id"]
        for s in sources
        if (s.get("summary_md") or "").strip()
        and not (
            str(s.get("summary_generated_at") or "").strip()
            and str(s.get("summary_skill_version") or "").strip()
            and str(s.get("summary_agent") or "").strip()
        )
    ]
    if unstamped:
        print("Reading notes missing provenance:", ", ".join(unstamped))
    mentions = mention_report(sources)
    if broken:
        print("Broken citation links:")
        for line in broken:
            print(" ", line)
    else:
        print("Broken citation links: none")
    if mentions:
        print("Unlinked mentions:")
        for line in mentions:
            print(" ", line)
    else:
        print("Unlinked mentions: none")
    uncited = [s["id"] for s in sources if not cited.get(s["id"])]
    print(f"Sources not yet cited from a deck: {len(uncited)}")
    if missing:
        print("Missing figures:")
        for line in missing:
            print(" ", line)
    return 1 if broken or missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
