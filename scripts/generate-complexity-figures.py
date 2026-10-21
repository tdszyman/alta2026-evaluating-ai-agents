#!/usr/bin/env python3
"""Generate the "complicated vs complex system" figures for the Part 1 deck.

Writes self-contained, SMIL-animated SVGs (no JS) to
presentations/01-agents-and-eval-challenges/images/:

  complicated-system.svg  traceable wiring; every run lands on the same output
  complex-system.svg      entangled network; runs land on a distribution of outputs
  parts-vs-whole.svg      the same parts, isolated vs interacting

Layouts are seeded, so re-running produces identical files.
Usage: python3 scripts/generate-complexity-figures.py
"""

from __future__ import annotations

import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "presentations/01-agents-and-eval-challenges/images"

W, H = 720, 420
INPUT = (28.0, 210.0)
AXIS_X = 640.0
AXIS_TOP, AXIS_BOTTOM = 40.0, 380.0

BLUE = "#1F5FA8"
BLUE_MID = "#5B93D3"
BLUE_PALE = "#EEF4FC"
TEAL = "#0F8F88"
TEAL_MID = "#3FBFB3"
TEAL_PALE = "#E3F6F4"
INK = "#1D2433"
GREY = "#8A94A6"
PULSE = "#F29D38"

FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"


def f(v: float) -> str:
    return f"{v:.1f}".rstrip("0").rstrip(".")


def svg_open(w: float, h: float, title: str, desc: str) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}" '
        f'font-family="{FONT}" role="img">',
        f"<title>{title}</title>",
        f"<desc>{desc}</desc>",
    ]


def input_terminal(colour: str) -> list[str]:
    x, y = INPUT
    return [
        f'<circle cx="{f(x)}" cy="{f(y)}" r="9" fill="white" stroke="{colour}" stroke-width="2.5"/>',
        f'<circle cx="{f(x)}" cy="{f(y)}" r="3.5" fill="{colour}"/>',
        f'<text x="{f(x)}" y="{f(y + 31)}" font-size="17" fill="{GREY}" text-anchor="middle">input</text>',
    ]


def output_axis(colour: str) -> list[str]:
    parts = [
        f'<line x1="{f(AXIS_X)}" y1="{f(AXIS_TOP)}" x2="{f(AXIS_X)}" y2="{f(AXIS_BOTTOM)}" '
        f'stroke="{GREY}" stroke-width="1.5"/>'
    ]
    for i in range(9):
        y = AXIS_TOP + i * (AXIS_BOTTOM - AXIS_TOP) / 8
        parts.append(
            f'<line x1="{f(AXIS_X - 4)}" y1="{f(y)}" x2="{f(AXIS_X)}" y2="{f(y)}" stroke="{GREY}" stroke-width="1"/>'
        )
    parts.append(
        f'<text x="{f(AXIS_X + 30)}" y="{f(AXIS_BOTTOM + 30)}" font-size="17" fill="{GREY}" '
        f'text-anchor="middle">outputs</text>'
    )
    return parts


def arrival_ring(x: float, y: float, colour: str, kt: float, dur: float, begin: float) -> str:
    """Ring that flashes at (x, y) when a pulse arrives at fraction kt of its cycle."""
    kt2 = min(kt + 0.7 / dur, 0.999)
    k0 = max(kt - 0.001, 0.0)
    timing = f'dur="{dur:.2f}s" begin="{begin:.2f}s" repeatCount="indefinite"'
    return (
        f'<circle cx="{f(x)}" cy="{f(y)}" r="4" fill="none" stroke="{colour}" stroke-width="2.5" opacity="0">'
        f'<animate attributeName="r" values="4;4;18;18" keyTimes="0;{kt:.3f};{kt2:.3f};1" {timing}/>'
        f'<animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;{k0:.3f};{kt:.3f};{kt2:.3f};1" {timing}/>'
        "</circle>"
    )


def pulse(path_d: str, kt: float, dur: float, begin: float, r: float = 5.0) -> str:
    """Dot that travels path_d during [0, kt] of each cycle, then hides until the next cycle."""
    timing = f'dur="{dur:.2f}s" begin="{begin:.2f}s" repeatCount="indefinite"'
    kh = min(kt + 0.001, 1.0)
    return (
        f'<circle r="{f(r)}" fill="{PULSE}" stroke="white" stroke-width="1.5" opacity="0">'
        f'<animateMotion path="{path_d}" keyPoints="0;1;1" keyTimes="0;{kt:.3f};1" calcMode="linear" {timing}/>'
        f'<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;{kt:.3f};{kh:.3f};1" {timing}/>'
        "</circle>"
    )


# ---------------------------------------------------------------------------
# Complicated system: modules of components, orthogonal wiring, left-to-right
# ---------------------------------------------------------------------------

CW, CH = 44, 30
BUS_X = 54.0

# id -> (cx, cy, half-width of the box, glyph). Glyph None = no box drawn.
NODES: dict[str, tuple[float, float, float, str | None]] = {
    "in": (INPUT[0], INPUT[1], 0, None),
    "a1": (100, 85, CW / 2, "fx"),
    "a2": (170, 85, CW / 2, "sum"),
    "a3": (100, 150, CW / 2, "chip"),
    "a4": (170, 150, CW / 2, "gate"),
    "b1": (100, 275, CW / 2, "chip"),
    "b2": (170, 275, CW / 2, "fx"),
    "b3": (100, 340, CW / 2, "gate"),
    "b4": (170, 340, CW / 2, "sum"),
    "c1": (290, 85, CW / 2, "sum"),
    "c2": (360, 85, CW / 2, "fx"),
    "d": (325, 210, 63, None),
    "e1": (290, 340, CW / 2, "fx"),
    "e2": (360, 340, CW / 2, "chip"),
    "f1": (480, 110, CW / 2, "chip"),
    "f2": (550, 110, CW / 2, "sum"),
    "f3": (480, 210, CW / 2, "fx"),
    "f4": (550, 210, CW / 2, "gate"),
    "f5": (480, 310, CW / 2, "sum"),
    "f6": (550, 310, CW / 2, "fx"),
    "out": (604, 210, 0, None),
    "axis": (AXIS_X, 210, 0, None),
}

# (src, dst, x of the vertical run; None = straight or midpoint)
WIRES: list[tuple[str, str, float | None]] = [
    ("in", "a1", BUS_X), ("in", "a3", BUS_X), ("in", "b1", BUS_X), ("in", "b3", BUS_X), ("in", "d", None),
    ("a1", "a2", None), ("a1", "a4", 135), ("a3", "a4", None),
    ("b1", "b2", None), ("b3", "b4", None), ("b1", "b4", 135),
    ("a2", "c1", None), ("a4", "d", 232), ("b2", "d", 232), ("b4", "e1", None),
    ("c1", "c2", None), ("c2", "f1", 420),
    ("d", "f3", None), ("d", "f5", 414),
    ("e1", "e2", None), ("e2", "f5", 428),
    ("f1", "f2", None), ("f3", "f4", None), ("f5", "f6", None), ("f1", "f4", 515), ("f5", "f4", 515),
    ("f2", "out", 604), ("f4", "out", None), ("f6", "out", 604), ("out", "axis", None),
]

MODULES = [
    # (x, y, w, h, label)
    (60, 40, 150, 150, "SUBSYSTEM A"),
    (60, 230, 150, 150, "SUBSYSTEM B"),
    (250, 30, 150, 110, "SUBSYSTEM C"),
    (250, 160, 150, 100, "SUBSYSTEM D"),
    (250, 280, 150, 100, "SUBSYSTEM E"),
    (440, 50, 150, 310, "SUBSYSTEM F"),
]

ROUTES = [
    ["in", "a1", "a2", "c1", "c2", "f1", "f2", "out", "axis"],
    ["in", "d", "f3", "f4", "out", "axis"],
    ["in", "b3", "b4", "e1", "e2", "f5", "f6", "out", "axis"],
    ["in", "a3", "a4", "d", "f5", "f4", "out", "axis"],
    ["in", "b1", "b2", "d", "f3", "f4", "out", "axis"],
]


def right_port(n: str) -> tuple[float, float]:
    cx, cy, hw, _ = NODES[n]
    return (cx + hw, cy)


def left_port(n: str) -> tuple[float, float]:
    cx, cy, hw, _ = NODES[n]
    return (cx - hw, cy)


def wire_points(src: str, dst: str, mx: float | None) -> list[tuple[float, float]]:
    (x1, y1), (x2, y2) = right_port(src), left_port(dst)
    if abs(y1 - y2) < 0.5:
        return [(x1, y1), (x2, y2)]
    if mx is None:
        mx = (x1 + x2) / 2
    pts = [(x1, y1), (mx, y1), (mx, y2), (x2, y2)]
    return [p for i, p in enumerate(pts) if i == 0 or p != pts[i - 1]]


def poly_d(pts: list[tuple[float, float]]) -> str:
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts)


def on_segment(p, a, b) -> bool:
    (px, py), (ax, ay), (bx, by) = p, a, b
    if abs(ax - bx) < 0.5 and abs(px - ax) < 0.5:
        return min(ay, by) - 0.5 <= py <= max(ay, by) + 0.5
    if abs(ay - by) < 0.5 and abs(py - ay) < 0.5:
        return min(ax, bx) - 0.5 <= px <= max(ax, bx) + 0.5
    return False


def junctions(wire_pts: list[list[tuple[float, float]]]) -> list[tuple[float, float]]:
    ports = {right_port(n) for n in NODES} | {left_port(n) for n in NODES}
    found: set[tuple[float, float]] = set()
    for i, pts in enumerate(wire_pts):
        for p in pts[1:-1] if len(pts) > 2 else []:
            if p in ports:
                continue
            for j, other in enumerate(wire_pts):
                if j == i:
                    continue
                if any(on_segment(p, other[k], other[k + 1]) for k in range(len(other) - 1)):
                    found.add(p)
                    break
    # The input bus branch point and the final merge point.
    found.add((BUS_X, INPUT[1]))
    found.add((NODES["out"][0], NODES["out"][1]))
    return sorted(found)


def glyph(kind: str, cx: float, cy: float) -> str:
    if kind == "fx":
        return (
            f'<text x="{f(cx)}" y="{f(cy + 4.5)}" font-size="13" font-style="italic" fill="{BLUE}" '
            f'text-anchor="middle" font-family="Georgia, serif">f(x)</text>'
        )
    if kind == "sum":
        return (
            f'<text x="{f(cx)}" y="{f(cy + 6)}" font-size="17" fill="{BLUE}" text-anchor="middle" '
            f'font-family="Georgia, serif">&#931;</text>'
        )
    if kind == "chip":
        out = [f'<rect x="{f(cx - 7)}" y="{f(cy - 7)}" width="14" height="14" rx="1.5" fill="{BLUE}"/>']
        for dx in (-4, 0, 4):
            out.append(
                f'<line x1="{f(cx + dx)}" y1="{f(cy - 11)}" x2="{f(cx + dx)}" y2="{f(cy + 11)}" '
                f'stroke="{BLUE}" stroke-width="1.3"/>'
            )
        return "".join(out)
    if kind == "gate":
        return (
            f'<path d="M{f(cx - 9)} {f(cy - 8)} h8 a8 8 0 0 1 0 16 h-8 z" fill="none" '
            f'stroke="{BLUE}" stroke-width="1.8"/>'
        )
    raise ValueError(kind)


def gear_path(cx: float, cy: float, r_out: float, r_in: float, teeth: int, phase: float = 0.0) -> str:
    p = 2 * math.pi / teeth
    pts = []
    for i in range(teeth):
        a = phase + i * p
        for frac, r in ((0.0, r_in), (0.2, r_out), (0.5, r_out), (0.7, r_in)):
            ang = a + frac * p
            pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + " Z"


def complicated_svg() -> str:
    s = svg_open(
        W,
        H,
        "A complicated system",
        "Subsystems of components wired together. Every path from input to output can be traced, "
        "and every run produces the same output.",
    )

    for x, y, w, h, label in MODULES:
        s.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{BLUE_PALE}" '
            f'stroke="{BLUE_MID}" stroke-width="1.2" stroke-dasharray="5 4"/>'
        )
        s.append(
            f'<text x="{x + 9}" y="{y + 16}" font-size="11" letter-spacing="1" fill="{BLUE_MID}">{label}</text>'
        )

    all_wires = [wire_points(a, b, mx) for a, b, mx in WIRES]
    for pts in all_wires:
        s.append(
            f'<path d="{poly_d(pts)}" fill="none" stroke="{BLUE_MID}" stroke-width="1.8" stroke-linejoin="round"/>'
        )
    for x, y in junctions(all_wires):
        s.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="3.2" fill="{BLUE}"/>')

    # Subsystem D: a meshed gear pair (drawn over its internal wire stubs).
    dcx, dcy, dhw, _ = NODES["d"]
    g1, g2 = (dcx - 16, dcy), (dcx + 16, dcy)
    s.append(
        f'<path d="M{f(dcx - dhw)} {f(dcy)} H{f(g1[0] - 12)} M{f(g2[0] + 12)} {f(dcy)} H{f(dcx + dhw)}" '
        f'stroke="{BLUE_MID}" stroke-width="1.8"/>'
    )
    teeth = 10
    for (gx, gy), phase, direction in ((g1, 0.0, 1), (g2, math.pi / teeth, -1)):
        s.append(f'<g><path d="{gear_path(gx, gy, 17, 13, teeth, phase)}" fill="white" stroke="{BLUE}" stroke-width="1.6"/>')
        s.append(f'<circle cx="{f(gx)}" cy="{f(gy)}" r="4" fill="{BLUE}"/>')
        s.append(
            f'<animateTransform attributeName="transform" type="rotate" from="0 {f(gx)} {f(gy)}" '
            f'to="{360 * direction} {f(gx)} {f(gy)}" dur="8s" repeatCount="indefinite"/></g>'
        )

    for n, (cx, cy, hw, kind) in NODES.items():
        if kind is None:
            continue
        s.append(
            f'<rect x="{f(cx - hw)}" y="{f(cy - CH / 2)}" width="{CW}" height="{CH}" rx="5" '
            f'fill="white" stroke="{BLUE}" stroke-width="1.6"/>'
        )
        s.append(glyph(kind, cx, cy))

    s += input_terminal(BLUE)
    s += output_axis(BLUE)
    # Every run lands in the same place: a point mass.
    s.append(f'<rect x="{f(AXIS_X + 3)}" y="{f(210 - 5)}" width="60" height="10" rx="2" fill="{BLUE}"/>')
    s.append(f'<circle cx="{f(AXIS_X)}" cy="210" r="4.5" fill="{BLUE}"/>')

    dur, kt = 4.0, 0.8
    for route in ROUTES:
        pts: list[tuple[float, float]] = [INPUT]
        mx_of = {(a, b): mx for a, b, mx in WIRES}
        for u, v in zip(route, route[1:]):
            pts += wire_points(u, v, mx_of[(u, v)])
            if NODES[v][3] is not None or v == "d":
                pts.append(right_port(v))
        dedup = [p for i, p in enumerate(pts) if i == 0 or p != pts[i - 1]]
        s.append(pulse(poly_d(dedup), kt, dur, 0.0, r=4.5))
    s.append(arrival_ring(AXIS_X, 210, BLUE, kt, dur, 0.0))

    s.append("</svg>")
    return "\n".join(s) + "\n"


# ---------------------------------------------------------------------------
# Complex system: entangled network, biased random walks, output distribution
# ---------------------------------------------------------------------------

def quad_len(a, c, b, steps: int = 16) -> float:
    total, prev = 0.0, a
    for i in range(1, steps + 1):
        t = i / steps
        x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t**2 * b[0]
        y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t**2 * b[1]
        total += math.dist(prev, (x, y))
        prev = (x, y)
    return total


def bend_control(a, b, amount: float) -> tuple[float, float]:
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    dx, dy = b[0] - a[0], b[1] - a[1]
    return (mx - dy * amount, my + dx * amount)


def complex_svg() -> str:
    rng = random.Random(11)
    clusters = [(150, 110), (135, 300), (290, 200), (410, 85), (430, 320), (540, 190)]

    nodes: list[tuple[float, float]] = []
    tries = 0
    while len(nodes) < 82 and tries < 50000:
        tries += 1
        if rng.random() < 0.72:
            cx, cy = rng.choice(clusters)
            x, y = rng.gauss(cx, 48), rng.gauss(cy, 42)
        else:
            x, y = rng.uniform(70, 585), rng.uniform(30, 390)
        if not (70 <= x <= 585 and 28 <= y <= 392):
            continue
        if any(math.dist((x, y), p) < 25 for p in nodes):
            continue
        nodes.append((x, y))

    n = len(nodes)
    edges: dict[tuple[int, int], tuple[float, float]] = {}

    def add_edge(i: int, j: int, bend: float) -> None:
        key = (min(i, j), max(i, j))
        if i != j and key not in edges:
            edges[key] = bend_control(nodes[key[0]], nodes[key[1]], bend)

    for i in range(n):
        near = sorted(range(n), key=lambda j: math.dist(nodes[i], nodes[j]))[1:6]
        for j in near[: rng.choice([2, 3, 3, 4])]:
            if math.dist(nodes[i], nodes[j]) < 115:
                add_edge(i, j, rng.uniform(-0.28, 0.28))
    long_links = 0
    while long_links < 16:
        i, j = rng.randrange(n), rng.randrange(n)
        if 150 < math.dist(nodes[i], nodes[j]) < 330:
            add_edge(i, j, rng.choice([-1, 1]) * rng.uniform(0.25, 0.45))
            long_links += 1

    adj: dict[int, list[int]] = {i: [] for i in range(n)}
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    entry = sorted(range(n), key=lambda i: math.dist(INPUT, nodes[i]))[:3]
    entry_ctrl = {i: bend_control(INPUT, nodes[i], rng.uniform(-0.2, 0.2)) for i in entry}

    # Connect any stragglers to the component reachable from the input.
    while True:
        seen, stack = set(entry), list(entry)
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if v not in seen:
                    seen.add(v)
                    stack.append(v)
        rest = [i for i in range(n) if i not in seen]
        if not rest:
            break
        i = rest[0]
        j = min(seen, key=lambda k: math.dist(nodes[i], nodes[k]))
        add_edge(i, j, rng.uniform(-0.2, 0.2))
        adj[i].append(j)
        adj[j].append(i)

    exit_x = 545
    exits = [i for i in range(n) if nodes[i][0] > exit_x]

    def walk(r: random.Random) -> list[int] | None:
        cur = r.choice(entry)
        path = [cur]
        for _ in range(70):
            if nodes[cur][0] > exit_x:
                return path
            nbrs = adj[cur]
            weights = [math.exp(0.9 * (nodes[v][0] - nodes[cur][0]) / 60) for v in nbrs]
            cur = r.choices(nbrs, weights)[0]
            path.append(cur)
        return None

    def exit_y(node: int, r: random.Random) -> float:
        return min(max(nodes[node][1] + r.gauss(0, 13), AXIS_TOP + 6), AXIS_BOTTOM - 6)

    sim = random.Random(3)
    outcomes = []
    while len(outcomes) < 4000:
        p = walk(sim)
        if p:
            outcomes.append(exit_y(p[-1], sim))

    s = svg_open(
        W,
        H,
        "A complex system",
        "Many interconnected parts with feedback loops. Signals take different routes on every run, "
        "and runs land on a distribution of outputs.",
    )
    s.append("<defs>")
    s.append(
        f'<radialGradient id="blob"><stop offset="0" stop-color="{TEAL_MID}" stop-opacity="0.22"/>'
        f'<stop offset="1" stop-color="{TEAL_MID}" stop-opacity="0"/></radialGradient>'
    )
    s.append("</defs>")
    for cx, cy in clusters:
        s.append(f'<circle cx="{cx}" cy="{cy}" r="95" fill="url(#blob)"/>')

    for i in entry:
        c = entry_ctrl[i]
        s.append(
            f'<path d="M{f(INPUT[0])} {f(INPUT[1])} Q{f(c[0])} {f(c[1])} {f(nodes[i][0])} {f(nodes[i][1])}" '
            f'fill="none" stroke="{TEAL}" stroke-width="1.6" opacity="0.6"/>'
        )
    for (a, b), c in edges.items():
        length = math.dist(nodes[a], nodes[b])
        op = 0.22 if length > 140 else 0.45
        s.append(
            f'<path d="M{f(nodes[a][0])} {f(nodes[a][1])} Q{f(c[0])} {f(c[1])} {f(nodes[b][0])} {f(nodes[b][1])}" '
            f'fill="none" stroke="{TEAL}" stroke-width="1.3" opacity="{op}"/>'
        )
    exit_rng = random.Random(5)
    for i in exits:
        y_end = exit_y(i, exit_rng)
        c = bend_control(nodes[i], (AXIS_X, y_end), 0.1)
        s.append(
            f'<path d="M{f(nodes[i][0])} {f(nodes[i][1])} Q{f(c[0])} {f(c[1])} {f(AXIS_X)} {f(y_end)}" '
            f'fill="none" stroke="{TEAL}" stroke-width="1.1" opacity="0.25" stroke-dasharray="3 4"/>'
        )

    max_deg = max(len(v) for v in adj.values())
    for i, (x, y) in enumerate(nodes):
        deg = len(adj[i])
        r = 3.4 + 6.0 * (deg - 1) / max(max_deg - 1, 1)
        fill = TEAL if deg >= max_deg - 2 else TEAL_MID
        d = rng.uniform(2.6, 5.2)
        s.append(
            f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{fill}" stroke="white" stroke-width="1.2">'
            f'<animate attributeName="r" values="{f(r)};{f(r * 1.3)};{f(r)}" dur="{d:.2f}s" '
            f'begin="-{rng.uniform(0, d):.2f}s" repeatCount="indefinite"/></circle>'
        )

    s += input_terminal(TEAL)
    s += output_axis(TEAL)

    # Histogram of where 4,000 simulated runs exit: a distribution, not a point.
    bin_h = 10
    bins = [0] * int((AXIS_BOTTOM - AXIS_TOP) // bin_h)
    for y in outcomes:
        bins[min(int((y - AXIS_TOP) // bin_h), len(bins) - 1)] += 1
    peak = max(bins)
    for k, count in enumerate(bins):
        if count == 0:
            continue
        w = 60 * count / peak
        y = AXIS_TOP + k * bin_h
        s.append(
            f'<rect x="{f(AXIS_X + 3)}" y="{f(y + 1)}" width="{f(w)}" height="{bin_h - 2}" rx="1.5" '
            f'fill="{TEAL}" opacity="0.6"/>'
        )

    speed = 120.0
    anim = random.Random(21)
    shown = 0
    while shown < 9:
        p = walk(anim)
        if not p or not (6 <= len(p) <= 24):
            continue
        y_end = exit_y(p[-1], anim)
        c0 = entry_ctrl[p[0]]
        d = f"M{f(INPUT[0])} {f(INPUT[1])} Q{f(c0[0])} {f(c0[1])} {f(nodes[p[0]][0])} {f(nodes[p[0]][1])}"
        length = quad_len(INPUT, c0, nodes[p[0]])
        for u, v in zip(p, p[1:]):
            c = edges[(min(u, v), max(u, v))]
            d += f" Q{f(c[0])} {f(c[1])} {f(nodes[v][0])} {f(nodes[v][1])}"
            length += quad_len(nodes[u], c, nodes[v])
        d += f" L{f(AXIS_X)} {f(y_end)}"
        length += math.dist(nodes[p[-1]], (AXIS_X, y_end))
        travel = length / speed
        dur = travel + anim.uniform(0.8, 2.0)
        kt = travel / dur
        begin = -anim.uniform(0, dur)
        s.append(pulse(d, kt, dur, begin))
        s.append(arrival_ring(AXIS_X, y_end, TEAL, kt, dur, begin))
        shown += 1

    s.append("</svg>")
    return "\n".join(s) + "\n"


# ---------------------------------------------------------------------------
# Parts vs whole
# ---------------------------------------------------------------------------

PW_NODES = [
    (40, 60), (125, 28), (215, 58), (295, 38),
    (70, 150), (165, 128), (258, 145),
    (40, 245), (128, 222), (222, 240), (300, 212), (178, 185),
]
PW_EDGES = [
    (0, 1), (1, 2), (2, 3), (0, 4), (1, 5), (2, 6), (3, 6), (4, 5), (5, 6), (4, 7),
    (5, 11), (11, 8), (7, 8), (8, 9), (9, 10), (6, 10), (11, 9), (2, 5), (6, 11), (3, 10),
]
PW_LOOPS = [
    ([4, 5, 11, 8, 7, 4], 5.5),
    ([6, 10, 9, 11, 6], 3.8),
]


def parts_vs_whole_svg() -> str:
    pw, ph = 900, 330
    lx, rx, oy = 50, 530, 22
    rng = random.Random(4)
    s = svg_open(
        pw,
        ph,
        "The whole is more than the sum of its parts",
        "Left: the same parts in isolation, each individually fine. Right: the parts interacting, "
        "forming feedback loops that no single part contains.",
    )

    s.append(
        f'<rect x="{lx - 30}" y="{oy - 14}" width="380" height="290" rx="14" fill="{BLUE_PALE}"/>'
        f'<rect x="{rx - 30}" y="{oy - 14}" width="380" height="290" rx="14" fill="{TEAL_PALE}"/>'
    )

    for x, y in PW_NODES:
        cx, cy = lx + x, oy + y
        s.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="11" fill="{TEAL_MID}" stroke="white" stroke-width="1.5"/>')
        s.append(
            f'<circle cx="{f(cx + 10)}" cy="{f(cy - 10)}" r="7" fill="white" stroke="{BLUE}" stroke-width="1.3"/>'
            f'<path d="M{f(cx + 6.5)} {f(cy - 10)} l2.5 2.6 l4.4 -5" fill="none" stroke="{BLUE}" '
            f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
        )

    ax = (lx + 330 + rx - 30) / 2
    s.append(
        f'<path d="M{f(ax - 34)} 150 H{f(ax + 26)}" stroke="{GREY}" stroke-width="2.5"/>'
        f'<path d="M{f(ax + 20)} 142 L{f(ax + 34)} 150 L{f(ax + 20)} 158 Z" fill="{GREY}"/>'
        f'<text x="{f(ax)}" y="130" font-size="17" fill="{GREY}" text-anchor="middle">+ interactions</text>'
    )

    loop_edges = {frozenset(e) for loop, _ in PW_LOOPS for e in zip(loop, loop[1:])}
    ctrl: dict[tuple[int, int], tuple[float, float]] = {}
    for a, b in PW_EDGES:
        pa = (rx + PW_NODES[a][0], oy + PW_NODES[a][1])
        pb = (rx + PW_NODES[b][0], oy + PW_NODES[b][1])
        c = bend_control(pa, pb, rng.uniform(-0.18, 0.18))
        ctrl[(a, b)] = ctrl[(b, a)] = c
        if frozenset((a, b)) in loop_edges:
            continue
        s.append(
            f'<path d="M{f(pa[0])} {f(pa[1])} Q{f(c[0])} {f(c[1])} {f(pb[0])} {f(pb[1])}" fill="none" '
            f'stroke="{TEAL}" stroke-width="1.6" opacity="0.5"/>'
        )

    for loop, dur in PW_LOOPS:
        pts = [(rx + PW_NODES[i][0], oy + PW_NODES[i][1]) for i in loop]
        d = f"M{f(pts[0][0])} {f(pts[0][1])}"
        for (u, v), p in zip(zip(loop, loop[1:]), pts[1:]):
            c = ctrl[(u, v)]
            d += f" Q{f(c[0])} {f(c[1])} {f(p[0])} {f(p[1])}"
        s.append(
            f'<path d="{d}" fill="none" stroke="{PULSE}" stroke-width="2.6" opacity="0.6" stroke-linejoin="round"/>'
        )
        s.append(
            f'<circle r="5.5" fill="{PULSE}" stroke="white" stroke-width="1.5">'
            f'<animateMotion path="{d}" dur="{dur}s" begin="-{rng.uniform(0, dur):.2f}s" repeatCount="indefinite"/>'
            "</circle>"
        )

    for i, (x, y) in enumerate(PW_NODES):
        r = 11
        d = rng.uniform(2.6, 4.8)
        s.append(
            f'<circle cx="{f(rx + x)}" cy="{f(oy + y)}" r="{r}" fill="{TEAL_MID}" stroke="white" stroke-width="1.5">'
            f'<animate attributeName="r" values="{r};{r * 1.18:.1f};{r}" dur="{d:.2f}s" '
            f'begin="-{rng.uniform(0, d):.2f}s" repeatCount="indefinite"/></circle>'
        )

    s.append(
        f'<text x="{lx + 160}" y="{ph - 6}" font-size="20" fill="{BLUE}" text-anchor="middle">the parts, in isolation</text>'
        f'<text x="{rx + 160}" y="{ph - 6}" font-size="20" fill="{TEAL}" text-anchor="middle">the parts, interacting</text>'
    )
    s.append("</svg>")
    return "\n".join(s) + "\n"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, build in (
        ("complicated-system.svg", complicated_svg),
        ("complex-system.svg", complex_svg),
        ("parts-vs-whole.svg", parts_vs_whole_svg),
    ):
        (OUT / name).write_text(build(), encoding="utf-8")
        print(f"wrote {OUT / name}")


if __name__ == "__main__":
    main()
