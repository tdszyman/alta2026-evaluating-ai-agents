#!/usr/bin/env python3
"""Mirror organisation/ into the Quarto site for organisers.

The mirror is not linked from the public navbar. Rendered pages carry a
noindex banner. On and after 30 November 2026 (tutorial day) this script
deletes the mirror so the build no longer publishes it.

Source of truth remains organisation/. This output is generated.
"""

from __future__ import annotations

import shutil
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "organisation"
DEST = ROOT / "presentations" / "organisation"
# Tutorial day. The public build drops this section from this date onward.
REMOVE_ON = date(2026, 11, 30)

BANNER = (
    "> **Organisers only.** This section is not linked from the public site. "
    "The build stops publishing it on 30 November 2026. "
    "Some links that point outside `organisation/` in the repository do not resolve here.\n"
)


def title_of(text: str, fallback: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip().replace('"', "'")
    return fallback.replace('"', "'")


def main() -> None:
    if DEST.exists():
        shutil.rmtree(DEST)
    if date.today() >= REMOVE_ON:
        print(f"Organisation mirror omitted (today >= {REMOVE_ON.isoformat()}).")
        return
    count = 0
    for path in SRC.rglob("*.md"):
        rel = path.relative_to(SRC)
        if path.name == "README.md" and path.parent == SRC:
            rel = Path("index.md")
        dest = DEST / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        body = path.read_text(encoding="utf-8")
        title = title_of(body, dest.stem.replace("-", " ").title())
        depth = len(rel.parts)
        include = "../" * depth + "_shared/noindex.html"
        dest.write_text(
            "---\n"
            f'title: "{title}"\n'
            "format:\n"
            "  html:\n"
            "    toc: true\n"
            f"    include-in-header: {include}\n"
            "---\n\n"
            f"{BANNER}\n{body}",
            encoding="utf-8",
        )
        count += 1
    print(f"Staged {count} organiser pages → {DEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
