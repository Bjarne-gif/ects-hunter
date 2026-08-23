from fastapi import APIRouter
from typing import Dict, List, Optional

from ..session import require_connection
from ..module_catalog import (
    get_all_modules, get_mandatory_modules,
    CAT_INFO, CAT_WIWI, CAT_WINF, CAT_MATH,
    CAT_EL_WW1, CAT_EL_WW2, CAT_EL_WINF, CAT_EL_INFO,
    CAT_SEMINAR, CAT_THESIS,
    is_mandatory, is_elective,
)
from ..grade_calc import (
    pp_to_note, note_to_label, is_passed,
    mandatory_avg_note, gesamtnote,
    check_compensation, prerequisite_status,
)

router = APIRouter(prefix="/stats", tags=["statistics"])


def _get_info(conn) -> dict:
    return dict(conn.execute("SELECT * FROM student_info WHERE id = 1").fetchone())


def _get_records(conn) -> Dict[str, dict]:
    rows = conn.execute("SELECT * FROM student_modules").fetchall()
    return {r["module_number"]: dict(r) for r in rows}


@router.get("")
def full_statistics():
    conn = require_connection()
    info = _get_info(conn)
    info_set = info.get("info_set", "new")
    records = _get_records(conn)

    all_mods = get_all_modules(info_set)
    mandatory_mods = get_mandatory_modules(info_set)

    # ── ECTS counting ────────────────────────────────────────────────────────
    TOTAL_ECTS = 180
    done_ects, inprog_ects = 0, 0

    for m in all_mods:
        if m.is_legacy:
            continue
        rec = records.get(m.number, {})
        status = rec.get("status", "not_started")
        if status == "passed":
            done_ects += m.ects
        elif status == "enrolled":
            inprog_ects += m.ects

    # Seminar and thesis
    for key in ("seminar", "thesis"):
        rec = records.get(key, {})
        status = rec.get("status", "not_started")
        if status == "passed":
            done_ects += 10
        elif status == "enrolled":
            inprog_ects += 10

    remaining_ects = max(0, TOTAL_ECTS - done_ects - inprog_ects)
    percent_done = round(done_ects / TOTAL_ECTS * 100, 1)

    # ── Mandatory module analysis ────────────────────────────────────────────
    # Deduplicate legacy modules: if a student has passed a legacy module,
    # it counts for the slot of the module it replaces.
    mandatory_pp: List[float] = []
    wiwi_pp, winf_pp, math_pp, info_pp = [], [], [], []
    passed_mandatory = 0
    passed_informatik = 0
    total_mandatory = 0

    # Build effective mandatory set (de-dup legacy)
    legacy_to_current: Dict[str, str] = {}
    for m in mandatory_mods:
        if m.is_legacy and m.legacy_replaces:
            legacy_to_current[m.number] = m.legacy_replaces

    covered_current: set = set()

    for m in mandatory_mods:
        if m.is_legacy:
            continue  # will check below
        total_mandatory += 1

        # Check if current module is covered by a legacy module the student has done
        covering_legacy = [k for k, v in legacy_to_current.items() if v == m.number]
        rec = records.get(m.number, {})
        for leg_num in covering_legacy:
            leg_rec = records.get(leg_num, {})
            if leg_rec.get("status") == "passed":
                rec = leg_rec  # use legacy record
                covered_current.add(m.number)
                break

        status = rec.get("status", "not_started")
        pp = rec.get("score_pct")

        if status == "passed" and pp is not None:
            mandatory_pp.append(pp)
            passed_mandatory += 1
            if m.category == CAT_WIWI:   wiwi_pp.append(pp)
            if m.category == CAT_WINF:   winf_pp.append(pp)
            if m.category == CAT_MATH:   math_pp.append(pp)
            if m.category == CAT_INFO:
                info_pp.append(pp)
                passed_informatik += 1

    # ── Selected Wahlpflicht ─────────────────────────────────────────────────
    wahlpflicht_records = [
        rec for rec in records.values()
        if rec.get("is_wahlpflicht_slot") and rec.get("status") == "passed"
    ]
    wahlpflicht_notes = []
    for rec in wahlpflicht_records:
        if rec.get("grade") is not None:
            wahlpflicht_notes.append(rec["grade"])
        elif rec.get("score_pct") is not None:
            wahlpflicht_notes.append(pp_to_note(rec["score_pct"]))

    # ── Seminar + Thesis ─────────────────────────────────────────────────────
    def _extract_note(key: str) -> Optional[float]:
        rec = records.get(key, {})
        if rec.get("status") != "passed":
            return None
        if rec.get("grade") is not None:
            return rec["grade"]
        if rec.get("score_pct") is not None:
            return pp_to_note(rec["score_pct"])
        return None

    seminar_note = _extract_note("seminar")
    thesis_note  = _extract_note("thesis")

    # ── Grades ──────────────────────────────────────────────────────────────
    grade_data = gesamtnote(mandatory_pp, wahlpflicht_notes, seminar_note, thesis_note)
    if grade_data is None:
        grade_data = {
            "mandatory_note": None, "mandatory_note_label": None,
            "secondary_avg": None, "gesamtnote": None,
            "gesamtnote_label": None, "is_complete": False,
        }

    # ── Prerequisites ────────────────────────────────────────────────────────
    seminar_passed = records.get("seminar", {}).get("status") == "passed"
    prereqs = prerequisite_status(passed_mandatory, passed_informatik, seminar_passed)

    # ── Compensation rule ────────────────────────────────────────────────────
    math_info_pp = math_pp + info_pp
    compensation = check_compensation(wiwi_pp, winf_pp, math_info_pp)

    # ── Prognosis: best achievable grade ────────────────────────────────────
    # Assume all remaining modules score at specified targets
    prognosis = _prognosis(mandatory_pp, total_mandatory, wahlpflicht_notes, seminar_note, thesis_note)

    return {
        "ects": {
            "total": TOTAL_ECTS,
            "done": done_ects,
            "in_progress": inprog_ects,
            "remaining": remaining_ects,
            "percent_done": percent_done,
        },
        "grades": grade_data,
        "prereqs": prereqs,
        "compensation": compensation,
        "passed_mandatory_count": passed_mandatory,
        "total_mandatory_count": total_mandatory,
        "prognosis": prognosis,
        "module_counts": {
            "wiwi_passed": len(wiwi_pp),
            "winf_passed": len(winf_pp),
            "math_passed": len(math_pp),
            "info_passed": len(info_pp),
        },
    }


def _prognosis(
    mandatory_pp: List[float],
    total_mandatory: int,
    wahlpflicht_notes: List[float],
    seminar_note: Optional[float],
    thesis_note: Optional[float],
) -> Dict:
    """
    Estimate Gesamtnote for three target scenarios:
    excellent (95 PP), good (80 PP), acceptable (65 PP).
    """
    scenarios = {"sehr gut (95 PP)": 95, "gut (80 PP)": 80, "solide (65 PP)": 65}
    results = {}
    remaining_mandatory = total_mandatory - len(mandatory_pp)
    remaining_secondary = (2 - len(wahlpflicht_notes)) + (0 if seminar_note else 1) + (0 if thesis_note else 1)

    for label, target_pp in scenarios.items():
        target_note = pp_to_note(target_pp)
        sim_mand_pp = mandatory_pp + [target_pp] * remaining_mandatory
        sim_wp_notes = wahlpflicht_notes + [target_note] * (2 - len(wahlpflicht_notes))
        sim_sem = seminar_note if seminar_note is not None else target_note
        sim_thesis = thesis_note if thesis_note is not None else target_note

        g = gesamtnote(sim_mand_pp, sim_wp_notes, sim_sem, sim_thesis)
        results[label] = {
            "gesamtnote": g["gesamtnote"] if g else None,
            "label": g["gesamtnote_label"] if g else None,
        }
    return results
