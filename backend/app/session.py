"""
Session management for the currently active (decrypted) database.

Lifecycle:
  1. User selects / creates a database → decrypt to /tmp working file
  2. All reads/writes go to the working SQLite file
  3. After each mutating request, working file is re-encrypted to /data/
  4. Switching databases closes the current connection and cleans up /tmp file
"""
import sqlite3
import threading
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

from .config import settings
from .encryption import encrypt_bytes, decrypt_bytes
from .database import init_schema, open_connection


_lock = threading.Lock()

_session: Dict[str, Any] = {
    "name": None,
    "temp_path": None,
    "enc_path": None,
    "password": None,
    "conn": None,
}


# ── Public helpers ──────────────────────────────────────────────────────────

def active_name() -> Optional[str]:
    return _session["name"]


def require_connection() -> sqlite3.Connection:
    conn = _session["conn"]
    if conn is None:
        raise RuntimeError(
            "Keine Datenbank geöffnet. Bitte wählen oder erstellen Sie eine Datenbank."
        )
    return conn


def list_databases() -> list:
    data_dir = Path(settings.DATA_DIR)
    data_dir.mkdir(parents=True, exist_ok=True)
    results = []
    ext = settings.DB_EXTENSION
    for f in sorted(data_dir.glob(f"*{ext}"), key=lambda p: p.stat().st_mtime, reverse=True):
        name = f.name[: -len(ext)]
        results.append(
            {
                "name": name,
                "filename": f.name,
                "size_kb": round(f.stat().st_size / 1024, 1),
                "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                "is_active": name == _session["name"],
            }
        )
    return results


def create_database(name: str, password: str) -> None:
    with _lock:
        _assert_valid_name(name)
        enc_path = _enc_path(name)
        if enc_path.exists():
            raise ValueError(f"Datenbank '{name}' existiert bereits.")
        temp_path = _temp_path(name)
        _close_current()
        conn = open_connection(str(temp_path))
        init_schema(conn)
        conn.close()
        _encrypt_to_disk(temp_path, enc_path, password)
        conn = open_connection(str(temp_path))
        _set_session(name, temp_path, enc_path, password, conn)


def open_database(name: str, password: str) -> None:
    with _lock:
        enc_path = _enc_path(name)
        if not enc_path.exists():
            raise FileNotFoundError(f"Datenbank '{name}' nicht gefunden.")
        temp_path = _temp_path(name)
        _close_current()
        raw = enc_path.read_bytes()
        decrypted = decrypt_bytes(raw, password)  # raises on wrong password
        temp_path.write_bytes(decrypted)
        conn = open_connection(str(temp_path))
        init_schema(conn)
        _set_session(name, temp_path, enc_path, password, conn)


def persist() -> None:
    """Re-encrypt working SQLite file back to /data/. Call after every write."""
    with _lock:
        if _session["conn"] is None:
            return
        _session["conn"].commit()
        temp_path = Path(_session["temp_path"])
        enc_path = Path(_session["enc_path"])
        _encrypt_to_disk(temp_path, enc_path, _session["password"])


def close_database() -> None:
    with _lock:
        if _session["conn"]:
            try:
                _session["conn"].commit()
                temp = Path(_session["temp_path"])
                enc = Path(_session["enc_path"])
                _encrypt_to_disk(temp, enc, _session["password"])
            except Exception:
                pass
        _close_current()


# ── Private helpers ─────────────────────────────────────────────────────────

def _enc_path(name: str) -> Path:
    return Path(settings.DATA_DIR) / f"{name}{settings.DB_EXTENSION}"


def _temp_path(name: str) -> Path:
    return Path(settings.TEMP_DIR) / f"fw_{name}.db"


def _encrypt_to_disk(temp: Path, enc: Path, password: str) -> None:
    data = temp.read_bytes()
    tmp_out = enc.with_suffix(".tmp")
    tmp_out.write_bytes(encrypt_bytes(data, password))
    tmp_out.replace(enc)


def _set_session(name, temp_path, enc_path, password, conn) -> None:
    _session["name"] = name
    _session["temp_path"] = str(temp_path)
    _session["enc_path"] = str(enc_path)
    _session["password"] = password
    _session["conn"] = conn


def _close_current() -> None:
    if _session["conn"]:
        try:
            _session["conn"].close()
        except Exception:
            pass
    if _session["temp_path"]:
        try:
            Path(_session["temp_path"]).unlink(missing_ok=True)
        except Exception:
            pass
    _session.update(
        {"name": None, "temp_path": None, "enc_path": None, "password": None, "conn": None}
    )


def _assert_valid_name(name: str) -> None:
    if not name or not name.replace("-", "").replace("_", "").isalnum():
        raise ValueError(
            "Datenbankname darf nur Buchstaben, Zahlen, Bindestriche und Unterstriche enthalten."
        )
