#!/usr/bin/env bash
# Render the Quarto site (home, decks, knowledge, about, hands-on).
# Local preview should match CI (GitHub Actions → GitHub Pages from main).
# Usage: ./scripts/render-slides.sh [00|01|02|03|04|all]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PART="${1:-all}"
PRES="$ROOT/presentations"
APP_STAGE="$PRES/hands-on/app"

# The site page is presentations/hands-on/index.qmd.
# The app is copied beside it so the page can link to app/index.html,
# then published under _site/hands-on/app/. The stage copy is gitignored.
stage_app() {
  python3 "$ROOT/scripts/stage-workshop.py" "$APP_STAGE"
}

publish_app() {
  python3 "$ROOT/scripts/stage-workshop.py" "$PRES/_site/hands-on/app"
}

cleanup_stage() {
  rm -rf "$APP_STAGE"
}
trap cleanup_stage EXIT
stage_app

if ! command -v quarto >/dev/null 2>&1; then
  echo "error: quarto not found on PATH. Install from https://quarto.org/docs/get-started/" >&2
  exit 1
fi

part_path() {
  case "$1" in
    00) echo "presentation/00-intro/index.qmd" ;;
    01) echo "presentation/01-agents-and-eval-challenges/index.qmd" ;;
    02) echo "presentation/02-llm-as-judge-methods/index.qmd" ;;
    03) echo "presentation/03-hands-on-exercise/index.qmd" ;;
    04) echo "presentation/04-reliability-and-future/index.qmd" ;;
    *) echo "" ;;
  esac
}

prepare_site() {
  echo "==> Building bibliography pages"
  python3 "$ROOT/scripts/build-knowledge.py"
}

render_all() {
  prepare_site
  echo "==> Rendering site → presentations/_site"
  (cd "$PRES" && quarto render)
}

render_one() {
  local key="$1"
  local rel
  rel="$(part_path "$key")"
  if [[ -z "$rel" ]]; then
    echo "error: unknown part '$key' (expected 00–04 or all)" >&2
    exit 1
  fi
  prepare_site
  echo "==> Rendering $rel (project: presentations/)"
  (cd "$PRES" && quarto render "$rel")
}

case "$PART" in
  all)
    render_all
    ;;
  00|01|02|03|04)
    render_one "$PART"
    ;;
  *)
    echo "usage: $0 [00|01|02|03|04|all]" >&2
    exit 1
    ;;
esac

publish_app

echo "Done. Build is in presentations/_site"
echo "Browse it with ./scripts/preview-site.sh  (do not open the HTML file directly)"
