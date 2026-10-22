#!/usr/bin/env python3
"""Generate the "output space" panels for the Part 1 slide on why generative AI
needs LLM-as-a-judge.

Writes static SVGs to presentations/presentation/01-agents-and-eval-challenges/images/:

  output-space-regression.svg  one number on a bounded axis, next to its label
  output-space-classes.svg     one of a handful of classes
  output-space-vocab.svg       one token out of a vocabulary grid
  output-space-sequences.svg   one path through a tree of token sequences
  output-space-agent.svg       several turns, each its own tree, chained by tool calls

Blue and teal match the complicated/complex figures: predictive is blue,
generative is teal. Layouts are seeded, so re-running produces identical files.
Usage: python3 scripts/generate-output-space-figures.py
"""

from __future__ import annotations

import random
from pathlib import Path

OUT = (
    Path(__file__).resolve().parent.parent
    / "presentations/presentation/01-agents-and-eval-challenges/images"
)

W, H = 240, 150

BLUE = "#1F5FA8"
BLUE_PALE = "#EEF4FC"
TEAL = "#0F8F88"
TEAL_MID = "#3FBFB3"
TEAL_PALE = "#E3F6F4"
INK = "#14283B"
GREY = "#526476"
LINE = "#B8C8D1"

FONT = "Inter, 'Source Sans 3', 'Segoe UI', system-ui, sans-serif"


def f(v: float) -> str:
    return f"{v:.1f}".rstrip("0").rstrip(".")


def svg(title: str, desc: str, body: list[str]) -> str:
    head = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'font-family="{FONT}" role="img">',
        f"<title>{title}</title>",
        f"<desc>{desc}</desc>",
    ]
    return "\n".join(head + body + ["</svg>"]) + "\n"


def regression() -> str:
    y = 92
    x0, x1 = 20, 220
    label_v, pred_v = 62, 72
    sx = lambda v: x0 + (x1 - x0) * v / 100
    b = [f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{INK}" stroke-width="2"/>']
    for v in (0, 25, 50, 75, 100):
        b.append(f'<line x1="{f(sx(v))}" y1="{y - 5}" x2="{f(sx(v))}" y2="{y + 5}" stroke="{INK}" stroke-width="1.5"/>')
    for v in (0, 50, 100):
        b.append(f'<text x="{f(sx(v))}" y="{y + 24}" font-size="14" fill="{GREY}" text-anchor="middle">{v}</text>')
    b += [
        f'<line x1="{f(sx(label_v))}" y1="{y - 40}" x2="{f(sx(pred_v))}" y2="{y - 40}" stroke="{BLUE}" stroke-width="2"/>',
        f'<line x1="{f(sx(label_v))}" y1="{y - 45}" x2="{f(sx(label_v))}" y2="{y - 35}" stroke="{BLUE}" stroke-width="2"/>',
        f'<line x1="{f(sx(pred_v))}" y1="{y - 45}" x2="{f(sx(pred_v))}" y2="{y - 35}" stroke="{BLUE}" stroke-width="2"/>',
        f'<text x="{f((sx(label_v) + sx(pred_v)) / 2)}" y="{y - 52}" font-size="14" fill="{BLUE}" text-anchor="middle">error</text>',
        f'<circle cx="{f(sx(label_v))}" cy="{y}" r="8" fill="white" stroke="{INK}" stroke-width="2"/>',
        f'<circle cx="{f(sx(pred_v))}" cy="{y}" r="8" fill="{BLUE}"/>',
        f'<text x="{f(sx(label_v) - 12)}" y="{y - 14}" font-size="13" fill="{GREY}" text-anchor="end">label</text>',
        f'<text x="{f(sx(pred_v) + 12)}" y="{y - 14}" font-size="13" fill="{BLUE}">prediction</text>',
    ]
    return svg(
        "Regression output",
        "A number line from 0 to 100. The prediction sits close to the label; the gap between them is the error.",
        b,
    )


def classes() -> str:
    names = ["Sales", "Technology", "Healthcare", "Trades", "Admin"]
    pred, label = 1, 1
    b = []
    for i, n in enumerate(names):
        y = 8 + i * 27
        on = i == pred
        b.append(
            f'<rect x="40" y="{y}" width="160" height="22" rx="2" '
            f'fill="{BLUE if on else BLUE_PALE}" stroke="{BLUE}" stroke-width="1.2"/>'
        )
        b.append(
            f'<text x="52" y="{y + 16}" font-size="14" fill="{"white" if on else INK}">{n}</text>'
        )
        if i == label:
            b.append(f'<text x="210" y="{y + 17}" font-size="16" fill="{BLUE}">✓</text>')
    return svg(
        "Classification output",
        "Five job categories. The model picks Technology, which matches the label.",
        b,
    )


def vocab() -> str:
    cols, rows, cell, gap = 34, 17, 5.2, 1.6
    pick = (21, 6)
    b = []
    for r in range(rows):
        for c in range(cols):
            x = 12 + c * (cell + gap)
            y = 8 + r * (cell + gap)
            on = (c, r) == pick
            b.append(
                f'<rect x="{f(x)}" y="{f(y)}" width="{cell}" height="{cell}" '
                f'fill="{TEAL if on else TEAL_PALE}"/>'
            )
    px = 12 + pick[0] * (cell + gap) + cell / 2
    py = 8 + pick[1] * (cell + gap) + cell / 2
    b.append(f'<circle cx="{f(px)}" cy="{f(py)}" r="7" fill="none" stroke="{TEAL}" stroke-width="1.6"/>')
    return svg(
        "One token",
        "A dense grid of hundreds of cells stands for the vocabulary. One cell, the chosen token, is filled.",
        b,
    )


def tree(x0: float, y0: float, x1: float, y_top: float, y_bot: float,
         depth: int, branch: int, rng: random.Random, path_choice: list[int]) -> tuple[list[str], tuple[float, float]]:
    """Fan-out tree from (x0, y0). Returns drawing and the end of the highlighted path."""
    b: list[str] = []
    levels = [[(x0, y0)]]
    step = (x1 - x0) / depth
    for d in range(1, depth + 1):
        n = branch ** d
        x = x0 + step * d
        ys = [y_top + (y_bot - y_top) * (i + 0.5) / n for i in range(n)]
        levels.append([(x, y + rng.uniform(-0.6, 0.6)) for y in ys])
    for d in range(1, depth + 1):
        op = max(0.18, 0.75 - 0.17 * d)
        for i, (x, y) in enumerate(levels[d]):
            px, py = levels[d - 1][i // branch]
            b.append(
                f'<line x1="{f(px)}" y1="{f(py)}" x2="{f(x)}" y2="{f(y)}" '
                f'stroke="{TEAL_MID}" stroke-width="{f(max(0.5, 1.6 - 0.3 * d))}" opacity="{op:.2f}"/>'
            )
    idx = 0
    pts = [levels[0][0]]
    for d in range(1, depth + 1):
        idx = idx * branch + path_choice[(d - 1) % len(path_choice)]
        pts.append(levels[d][idx])
    b.append(
        '<polyline points="' + " ".join(f"{f(x)},{f(y)}" for x, y in pts)
        + f'" fill="none" stroke="{TEAL}" stroke-width="2.4"/>'
    )
    b.append(f'<circle cx="{f(x0)}" cy="{f(y0)}" r="4" fill="{TEAL}"/>')
    return b, pts[-1]


def sequences() -> str:
    rng = random.Random(7)
    b, end = tree(14, 75, 214, 4, 146, depth=4, branch=4, rng=rng, path_choice=[2, 1, 3, 0])
    b.append(f'<circle cx="{f(end[0])}" cy="{f(end[1])}" r="4" fill="{TEAL}"/>')
    b.append(f'<text x="232" y="80" font-size="16" fill="{GREY}" text-anchor="end">…</text>')
    return svg(
        "A response",
        "A tree that fans out four ways at every token. One highlighted path through it is the response the model produced.",
        b,
    )


def agent() -> str:
    rng = random.Random(11)
    b: list[str] = []
    x = 8.0
    y = 75.0
    widths = [58, 58, 58]
    for t, wdt in enumerate(widths):
        part, end = tree(x, y, x + wdt, y - 46, y + 46, depth=3, branch=3, rng=rng, path_choice=[t % 3, 2 - t % 3, 1])
        b += part
        x, y = end
        if t < len(widths) - 1:
            b.append(f'<line x1="{f(x)}" y1="{f(y)}" x2="{f(x + 12)}" y2="75" stroke="{INK}" stroke-width="1.4"/>')
            b.append(f'<rect x="{f(x + 12)}" y="69" width="12" height="12" fill="white" stroke="{INK}" stroke-width="1.6"/>')
            x, y = x + 24, 75.0
    b.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="4" fill="{TEAL}"/>')
    return svg(
        "An agent trace",
        "Three response trees in a row. Each turn's chosen path ends in a tool call, drawn as a square, which starts the next turn's tree.",
        b,
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    figs = {
        "output-space-regression.svg": regression(),
        "output-space-classes.svg": classes(),
        "output-space-vocab.svg": vocab(),
        "output-space-sequences.svg": sequences(),
        "output-space-agent.svg": agent(),
    }
    for name, text in figs.items():
        (OUT / name).write_text(text)
        print(f"wrote {OUT / name}")


if __name__ == "__main__":
    main()
