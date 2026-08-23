from fastapi import APIRouter, HTTPException
from typing import List

from ..schemas import ModuleUpsert, ModuleRecordOut
from ..session import require_connection, persist
from ..grade_calc import pp_to_note

router = APIRouter(prefix="/modules", tags=["modules"])


def _row_to_dict(row) -> dict:
    d = dict(row)
    d["is_wahlpflicht_slot"] = bool(d["is_wahlpflicht_slot"])
    return d


@router.get("", response_model=List[ModuleRecordOut])
def list_modules():
    conn = require_connection()
    rows = conn.execute("SELECT * FROM student_modules ORDER BY module_number").fetchall()
    return [_row_to_dict(r) for r in rows]


@router.get("/{module_number}", response_model=ModuleRecordOut)
def get_module(module_number: str):
    conn = require_connection()
    row = conn.execute(
        "SELECT * FROM student_modules WHERE module_number = ?", (module_number,)
    ).fetchone()
    if row is None:
        raise HTTPException(404, f"Modul {module_number} nicht in der Datenbank")
    return _row_to_dict(row)


@router.put("/{module_number}", response_model=ModuleRecordOut)
def upsert_module(module_number: str, body: ModuleUpsert):
    conn = require_connection()

    # Auto-derive grade from score_pct if score is provided
    grade = body.grade
    if body.score_pct is not None:
        grade = pp_to_note(body.score_pct)

    conn.execute(
        """
        INSERT INTO student_modules
            (module_number, status, score_pct, grade, attempts, semester_info, notes,
             is_wahlpflicht_slot, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(module_number) DO UPDATE SET
            status              = excluded.status,
            score_pct           = excluded.score_pct,
            grade               = excluded.grade,
            attempts            = excluded.attempts,
            semester_info       = excluded.semester_info,
            notes               = excluded.notes,
            is_wahlpflicht_slot = excluded.is_wahlpflicht_slot,
            updated_at          = excluded.updated_at
        """,
        (
            module_number,
            body.status,
            body.score_pct,
            grade,
            body.attempts,
            body.semester_info,
            body.notes,
            1 if body.is_wahlpflicht_slot else 0,
        ),
    )
    conn.commit()
    persist()

    row = conn.execute(
        "SELECT * FROM student_modules WHERE module_number = ?", (module_number,)
    ).fetchone()
    return _row_to_dict(row)


@router.delete("/{module_number}", status_code=204)
def delete_module(module_number: str):
    conn = require_connection()
    conn.execute(
        "DELETE FROM student_modules WHERE module_number = ?", (module_number,)
    )
    conn.commit()
    persist()
