#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# FernUni Tracker — Frontend starten (ohne Docker)
# Voraussetzung: Node.js 18+
# ─────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

cd "$FRONTEND_DIR"

# node_modules installieren falls nicht vorhanden
if [ ! -d "node_modules" ]; then
  echo "→ Installiere npm-Pakete…"
  npm install
fi

echo ""
echo "✓ Frontend startet auf http://localhost:5173"
echo "  (API-Anfragen werden automatisch an http://localhost:8000 weitergeleitet)"
echo ""

npm run dev -- --host 127.0.0.1
