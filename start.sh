#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# FernUni Tracker — Backend + Frontend gleichzeitig starten
# Beendet beide Prozesse wenn du Ctrl+C drückst.
# ─────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"
DATA_DIR="$SCRIPT_DIR/data"

# ── Voraussetzungen prüfen ──────────────────────────────────
if ! command -v python3 &>/dev/null; then
  echo "✗ Python 3 nicht gefunden. Bitte installieren: https://python.org"
  exit 1
fi
if ! command -v node &>/dev/null; then
  echo "✗ Node.js nicht gefunden. Bitte installieren: https://nodejs.org"
  exit 1
fi

# ── Datenverzeichnis ─────────────────────────────────────────
mkdir -p "$DATA_DIR"

# ── Backend venv ─────────────────────────────────────────────
if [ ! -d "$VENV_DIR" ]; then
  echo "→ Erstelle Python-venv…"
  python3 -m venv "$VENV_DIR"
fi
echo "→ Backend-Abhängigkeiten prüfen…"
"$VENV_DIR/bin/pip" install -q -r "$BACKEND_DIR/requirements.txt"

# ── Frontend npm ─────────────────────────────────────────────
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "→ Frontend-Pakete installieren…"
  cd "$FRONTEND_DIR" && npm install && cd "$SCRIPT_DIR"
fi

# ── Aufräumen bei Ctrl+C ─────────────────────────────────────
cleanup() {
  echo ""
  echo "→ Beende Backend und Frontend…"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo "✓ Beendet."
}
trap cleanup SIGINT SIGTERM

# ── Backend starten ──────────────────────────────────────────
echo ""
echo "→ Starte Backend  (http://localhost:8000) …"
DATA_DIR="$DATA_DIR" "$VENV_DIR/bin/uvicorn" app.main:app \
  --host 127.0.0.1 \
  --port 8000 \
  --reload \
  --app-dir "$BACKEND_DIR" &
BACKEND_PID=$!

# Kurz warten bis Backend hochgefahren ist
sleep 2

# ── Frontend starten ─────────────────────────────────────────
echo "→ Starte Frontend (http://localhost:5173) …"
cd "$FRONTEND_DIR"
npm run dev -- --host 127.0.0.1 &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ""
echo "┌─────────────────────────────────────────┐"
echo "│  FernUni Tracker läuft                  │"
echo "│                                         │"
echo "│  Frontend  →  http://localhost:5173     │"
echo "│  Backend   →  http://localhost:8000     │"
echo "│  API-Docs  →  http://localhost:8000/docs│"
echo "│                                         │"
echo "│  Ctrl+C zum Beenden                     │"
echo "└─────────────────────────────────────────┘"

# Auf beide Prozesse warten
wait "$BACKEND_PID" "$FRONTEND_PID"
