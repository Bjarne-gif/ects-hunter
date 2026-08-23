from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field


# ── Database management ──────────────────────────────────────────────────────

class DbCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)
    password: str = Field(..., min_length=4)


class DbOpen(BaseModel):
    password: str


class DbInfo(BaseModel):
    name: str
    filename: str
    size_kb: float
    modified: str
    is_active: bool


# ── Student info ─────────────────────────────────────────────────────────────

class StudentInfoUpdate(BaseModel):
    full_name: Optional[str] = None
    matrikelnr: Optional[str] = None
    enroll_sem: Optional[str] = None
    info_set: Optional[str] = None  # "new" | "old"


class StudentInfoOut(BaseModel):
    full_name: str
    matrikelnr: str
    enroll_sem: str
    info_set: str
    created_at: str


# ── Module records ───────────────────────────────────────────────────────────

class ModuleUpsert(BaseModel):
    module_number: str
    status: str = "not_started"      # not_started | enrolled | passed | failed
    score_pct: Optional[float] = None
    grade: Optional[float] = None    # auto-derived if score_pct given; manual override otherwise
    attempts: int = 0
    semester_info: str = ""
    notes: str = ""
    is_wahlpflicht_slot: bool = False  # True = counted as one of the 2 selected Wahlpflicht


class ModuleRecordOut(BaseModel):
    id: int
    module_number: str
    status: str
    score_pct: Optional[float]
    grade: Optional[float]
    attempts: int
    semester_info: str
    notes: str
    is_wahlpflicht_slot: bool
    updated_at: str


# ── Statistics ───────────────────────────────────────────────────────────────

class ECTSStats(BaseModel):
    total: int
    done: int
    in_progress: int
    remaining: int
    percent_done: float


class GradeStats(BaseModel):
    mandatory_note: Optional[float]
    mandatory_note_label: Optional[str]
    secondary_avg: Optional[float]
    gesamtnote: Optional[float]
    gesamtnote_label: Optional[str]
    is_complete: bool


class PrereqStatus(BaseModel):
    seminar: dict
    thesis: dict
    elective_informatik: dict


class CompensationCheck(BaseModel):
    wiwi: dict
    winf: dict
    math_informatik: dict
    all_groups_ok: bool


class FullStats(BaseModel):
    ects: ECTSStats
    grades: GradeStats
    prereqs: PrereqStatus
    compensation: CompensationCheck
    passed_mandatory_count: int
    total_mandatory_count: int
