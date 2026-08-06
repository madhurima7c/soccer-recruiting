#!/usr/bin/env bash
# Serve soccer recruiting HTML prototypes locally and open in browser.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${1:-8090}"

cd "$ROOT"
python3 -m http.server "$PORT" &
PID=$!
sleep 1

echo ""
echo "Prototypes running at http://localhost:$PORT/"
echo ""
echo "  Shared Team Workspace:"
echo "    http://localhost:$PORT/shared-team-workspace/standalone.html"
echo ""
echo "  Personalized Reports & Visualizations:"
echo "    http://localhost:$PORT/personalized-reports-visualizations/standalone.html"
echo ""
echo "  Log Moment (mobile):"
echo "    http://localhost:$PORT/log-moment/standalone.html"
echo ""
echo "Press Ctrl+C to stop."

open "http://localhost:$PORT/shared-team-workspace/standalone.html" 2>/dev/null || true

wait $PID
