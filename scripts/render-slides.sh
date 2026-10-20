#!/usr/bin/env bash
# Render Quarto Reveal.js decks under presentations/.
# Usage: ./scripts/render-slides.sh [01|02|03|04|all]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PART="${1:-all}"

if ! command -v quarto >/dev/null 2>&1; then
  echo "error: quarto not found on PATH. Install from https://quarto.org/docs/get-started/" >&2
  exit 1
fi

declare -A PART_DIRS=(
  [01]="presentations/01-agents-and-eval-challenges"
  [02]="presentations/02-llm-as-judge-methods"
  [03]="presentations/03-hands-on-exercise"
  [04]="presentations/04-reliability-and-future"
)

render_one() {
  local key="$1"
  local dir="${PART_DIRS[$key]:-}"
  if [[ -z "$dir" ]]; then
    echo "error: unknown part '$key' (expected 01–04 or all)" >&2
    exit 1
  fi
  echo "==> Rendering $dir"
  (cd "$ROOT/$dir" && quarto render index.qmd)
}

case "$PART" in
  all)
    for k in 01 02 03 04; do
      render_one "$k"
    done
    ;;
  01|02|03|04)
    render_one "$PART"
    ;;
  *)
    echo "usage: $0 [01|02|03|04|all]" >&2
    exit 1
    ;;
esac

echo "Done."
