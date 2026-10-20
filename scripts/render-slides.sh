#!/usr/bin/env bash
# Render Quarto presentations site (landing + Reveal decks) under presentations/.
# Local preview should match CI (GitHub Actions → GitHub Pages from main).
# Usage: ./scripts/render-slides.sh [01|02|03|04|all]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PART="${1:-all}"
PRES="$ROOT/presentations"

if ! command -v quarto >/dev/null 2>&1; then
  echo "error: quarto not found on PATH. Install from https://quarto.org/docs/get-started/" >&2
  exit 1
fi

declare -A PART_PATHS=(
  [01]="01-agents-and-eval-challenges/index.qmd"
  [02]="02-llm-as-judge-methods/index.qmd"
  [03]="03-hands-on-exercise/index.qmd"
  [04]="04-reliability-and-future/index.qmd"
)

render_all() {
  echo "==> Rendering presentations site → presentations/_site"
  (cd "$PRES" && quarto render)
}

render_one() {
  local key="$1"
  local rel="${PART_PATHS[$key]:-}"
  if [[ -z "$rel" ]]; then
    echo "error: unknown part '$key' (expected 01–04 or all)" >&2
    exit 1
  fi
  echo "==> Rendering $rel (project: presentations/)"
  (cd "$PRES" && quarto render "$rel")
}

case "$PART" in
  all)
    render_all
    ;;
  01|02|03|04)
    render_one "$PART"
    ;;
  *)
    echo "usage: $0 [01|02|03|04|all]" >&2
    exit 1
    ;;
esac

echo "Done. Open presentations/_site/index.html (or the part’s HTML under _site/)."
