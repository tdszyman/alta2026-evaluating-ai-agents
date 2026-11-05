#!/usr/bin/env bash
# Render the Quarto site (home, decks, knowledge, about, hands-on).
# Local preview should match CI (GitHub Actions → GitHub Pages from main).
# Usage: ./scripts/render-slides.sh [01|01g|02|03|04|all]

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
    01) echo "presentation/01-agents-and-eval-challenges/index.qmd" ;;
    01g) echo "presentation/01g-graveyard/index.qmd" ;;
    02) echo "presentation/02-llm-as-judge-methods/index.qmd" ;;
    03) echo "presentation/03-hands-on-exercise/index.qmd" ;;
    04) echo "presentation/04-reliability-and-future/index.qmd" ;;
    *) echo "" ;;
  esac
}

prepare_site() {
  echo "==> Building bibliography pages and organiser mirror"
  python3 "$ROOT/scripts/build-knowledge.py"
  python3 "$ROOT/scripts/stage-organisation.py"
}

strip_organisation_from_sitemap() {
  local map="$PRES/_site/sitemap.xml"
  if [[ -f "$map" ]]; then
    python3 - "$map" <<'PY'
import pathlib, sys
path = pathlib.Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
kept = []
block = []
drop = False
for line in text.splitlines(keepends=True):
    if "<url>" in line:
        block = [line]
        drop = False
        continue
    if block:
        block.append(line)
        if "organisation/" in line:
            drop = True
        if "</url>" in line:
            if not drop:
                kept.extend(block)
            block = []
        continue
    kept.append(line)
path.write_text("".join(kept), encoding="utf-8")
PY
  fi
  if [[ ! -d "$PRES/organisation" ]]; then
    rm -rf "$PRES/_site/organisation"
  fi
}

# The deck theme picker (_shared/chrome.html) loads a template's tokens from
# _site/_shared/themes/<id>.css. Compile every template with the Dart Sass
# that ships with Quarto, so no other tool is needed.
find_sass() {
  local bin
  bin="$(quarto --paths 2>/dev/null | head -n 1)"
  for candidate in "$bin"/tools/*/dart-sass/sass "$bin"/tools/dart-sass/sass; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done
  command -v sass || true
}

compile_slide_themes() {
  local sass out
  sass="$(find_sass)"
  if [[ -z "$sass" ]]; then
    echo "error: no Dart Sass found (expected Quarto's bundled copy)." >&2
    exit 1
  fi
  out="$PRES/_site/_shared/themes"
  mkdir -p "$out"
  echo "==> Compiling slide templates for the theme picker → _site/_shared/themes/"
  for theme in "$PRES"/_shared/themes/*.scss; do
    "$sass" --quiet --no-source-map --style=compressed "$theme" "$out/$(basename "$theme" .scss).css"
  done
}

render_all() {
  prepare_site
  echo "==> Rendering site → presentations/_site"
  (cd "$PRES" && quarto render)
  strip_organisation_from_sitemap
}

render_one() {
  local key="$1"
  local rel
  rel="$(part_path "$key")"
  if [[ -z "$rel" ]]; then
    echo "error: unknown part '$key' (expected 01, 01g, 02–04 or all)" >&2
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
  01|01g|02|03|04)
    render_one "$PART"
    ;;
  *)
    echo "usage: $0 [01|01g|02|03|04|all]" >&2
    exit 1
    ;;
esac

compile_slide_themes
publish_app

echo "Done. Build is in presentations/_site"
echo "Browse it with ./scripts/preview-site.sh  (do not open the HTML file directly)"
