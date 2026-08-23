from fastapi import APIRouter, HTTPException
from typing import List, Dict

from ..schemas import StudentInfoUpdate, StudentInfoOut
from ..session import require_connection, persist
from ..module_catalog import (
    get_all_modules, CATEGORY_LABELS, CATEGORY_ORDER,
    MANDATORY_CATEGORIES, ELECTIVE_CATEGORIES,
)

router = APIRouter(prefix="/student", tags=["student"])


def _get_info(conn):
    row = conn.execute("SELECT * FROM student_info WHERE id = 1").fetchone()
    if row is None:
        raise HTTPException(500, "Datenbank-Schema fehlerhaft")
    return dict(row)


@router.get("/info", response_model=StudentInfoOut)
def get_student_info():
    conn = require_connection()
    return _get_info(conn)


@router.put("/info")
def update_student_info(body: StudentInfoUpdate):
    conn = require_connection()
    info = _get_info(conn)
    updates = body.model_dump(exclude_none=True)
    if not updates:
        return info
    fields = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values())
    conn.execute(f"UPDATE student_info SET {fields} WHERE id = 1", values)
    conn.commit()
    persist()
    return _get_info(conn)


@router.get("/catalog")
def get_catalog():
    """Return module catalog grouped by category for the current student's info_set."""
    conn = require_connection()
    info = _get_info(conn)
    info_set = info.get("info_set", "new")
    modules = get_all_modules(info_set)

    grouped: Dict[str, list] = {}
    for m in modules:
        grouped.setdefault(m.category, []).append({
            "number": m.number,
            "name": m.name,
            "category": m.category,
            "ects": m.ects,
            "is_legacy": m.is_legacy,
            "legacy_replaces": m.legacy_replaces,
            "deprecated_note": m.deprecated_note,
            "faculty": m.faculty,
        })

    return {
        "info_set": info_set,
        "category_labels": CATEGORY_LABELS,
        "category_order": CATEGORY_ORDER,
        "groups": grouped,
    }
