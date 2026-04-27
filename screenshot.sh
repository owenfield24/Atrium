#!/usr/bin/env bash
# Temporary screenshot workflow — capture a page from the local dev server.
# Usage:  ./screenshot.sh [path]      e.g.  ./screenshot.sh /pricing
# Output: /tmp/atrium-shot.png  (overwritten each run, auto-deleted after 90s)

set -e
PATH_ARG="${1:-/}"
URL="http://localhost:9001${PATH_ARG}"
OUT="/tmp/atrium-shot.png"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Clean up any prior screenshot so we never serve a stale image.
rm -f "$OUT"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --window-size=1440,900 \
  --screenshot="$OUT" \
  "$URL" >/dev/null 2>&1

# Schedule auto-deletion. Detached so the script returns immediately.
( sleep 90 && rm -f "$OUT" ) >/dev/null 2>&1 </dev/null &
disown 2>/dev/null || true

echo "$OUT"
