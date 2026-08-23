#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# FernUni Tracker — Backend starten (ohne Docker)
# Voraussetzung: Python 3.10+
# ─────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv"
DATA_DIR="$SCRIPT_DIR/data"

# Datenverzeichnis anlegen
mkdir -p "$DATA_DIR"

# venv erstellen falls nicht vorhanden
if [ ! -d "$VENV_DIR" ]; then
  echo "→ Erstelle Python-venv…"
  python3 -m venv "$VENV_DIR"
fi

# Abhängigkeiten installieren / aktualisieren
echo "→ Installiere/prüfe Abhängigkeiten…"
"$VENV_DIR/bin/pip" install -q -r "$BACKEND_DIR/requirements.txt"

echo ""
echo "✓ Backend startet auf http://localhost:8000"
echo "  API-Docs: http://localhost:8000/docs"
echo "  Daten:    $DATA_DIR"
echo ""

# Backend starten
DATA_DIR="$DATA_DIR" "$VENV_DIR/bin/uvicorn" app.main:app \
  --host 127.0.0.1 \
  --port 8000 \
  --reload \
  --app-dir "$BACKEND_DIR"
