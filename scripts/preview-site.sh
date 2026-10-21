#!/usr/bin/env bash
# Serve the already-built site so links work in a browser.
# Opening presentations/_site/index.html as a file does not: directory
# links such as presentation/ never become index.html.
# Quarto is not required for this. Rebuild with ./scripts/render-slides.sh all.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE="$ROOT/presentations/_site"
PORT="${1:-8090}"

if [[ ! -f "$SITE/index.html" ]]; then
  echo "error: no build at presentations/_site/. Run ./scripts/render-slides.sh all first." >&2
  exit 1
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "error: port $PORT is already in use. Try: $0 8091" >&2
  exit 1
fi

echo "Serving presentations/_site"
echo "http://127.0.0.1:${PORT}/"
cd "$SITE"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
