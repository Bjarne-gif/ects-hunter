"""
SQLite schema initialization and connection helpers.
"""
import sqlite3


DDL = """
PRAGMA journal_mode=DELETE;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS student_info (
    id          INTEGER PRIMARY KEY CHECK (id = 1),
    full_name   TEXT    NOT NULL DEFAULT '',
    matrikelnr  TEXT    NOT NULL DEFAULT '',
    enroll_sem  TEXT    NOT NULL DEFAULT '',
    info_set    TEXT    NOT NULL DEFAULT 'new',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO student_info (id) VALUES (1);

CREATE TABLE IF NOT EXISTS student_modules (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    module_number        TEXT    NOT NULL UNIQUE,
    status               TEXT    NOT NULL DEFAULT 'not_started',
    score_pct            REAL,
    grade                REAL,
    attempts             INTEGER NOT NULL DEFAULT 0,
    semester_info        TEXT    NOT NULL DEFAULT '',
    notes                TEXT    NOT NULL DEFAULT '',
    is_wahlpflicht_slot  INTEGER NOT NULL DEFAULT 0,
    updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_meta (
    key   TEXT PRIMARY KEY,
    value TEXT
);

INSERT OR IGNORE INTO app_meta (key, value) VALUES ('schema_version', '1');
"""


def init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(DDL)
    conn.commit()


def open_connection(path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn
