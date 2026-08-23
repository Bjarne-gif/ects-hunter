"""
Grade calculation for BSc Wirtschaftsinformatik, FernUniversität in Hagen.

Key rules (PO 18. Änderung):
  §22 Abs. 2  — Prozentpunkte → Note conversion table
  §24 Abs. 4  — Mandatory avg = arithmetic mean of PP, then converted via §22
  §24 Abs. 5  — Gesamtnote = 3/5 * mandatory_note + 2/5 * ECTS-weighted(wahlpflicht+seminar+thesis)
  §24 Abs. 6  — Truncate to 1 decimal (no rounding)
  §24 Abs. 2  — Compensation rule (can pass even with one 5.0 per group)
"""
from __future__ import annotations
from math import floor
from typing import List, Optional, Dict


# ── §22 Abs. 2: Prozentpunkte → Note ────────────────────────────────────────

PP_TO_NOTE: List[tuple] = [
    (95, 1.0),
    (90, 1.3),
    (85, 1.7),
    (80, 2.0),
    (75, 2.3),
    (70, 2.7),
    (65, 3.0),
    (60, 3.3),
    (55, 3.7),
    (50, 4.0),
    (0,  5.0),   # < 50 → nicht bestanden
]


def pp_to_note(pp: float) -> float:
    for threshold, note in PP_TO_NOTE:
        if pp >= threshold:
            return note
    return 5.0


def note_to_label(note: float) -> str:
    if note <= 1.5: return "sehr gut"
    if note <= 2.5: return "gut"
    if note <= 3.5: return "befriedigend"
    if note <= 4.0: return "ausreichend"
    return "nicht ausreichend"


def is_passed(pp: Optional[float]) -> bool:
    return pp is not None and pp >= 50.0


def truncate1(x: float) -> float:
    """§24 Abs. 6: one decimal place, truncated (not rounded)."""
    return floor(x * 10) / 10


# ── §24 Abs. 4: Mandatory average ───────────────────────────────────────────

def mandatory_avg_note(pp_list: List[float]) -> Optional[float]:
    """
    Arithmetic mean of Prozentpunkte across mandatory modules,
    then converted to Note via §22 table.
    (All mandatory modules carry 10 ECTS, so ECTS-weighting = arithmetic mean.)
    """
    if not pp_list:
        return None
    return pp_to_note(sum(pp_list) / len(pp_list))


# ── §24 Abs. 5: Gesamtnote ──────────────────────────────────────────────────

def gesamtnote(
    mandatory_pp: List[float],      # PP of each completed mandatory module
    wahlpflicht_notes: List[float], # Note of each selected Wahlpflicht module
    seminar_note: Optional[float],
    thesis_note: Optional[float],
) -> Optional[Dict]:
    """
    Returns a dict with partial averages and the final Gesamtnote,
    or None if not enough data exists.
    """
    if not mandatory_pp:
        return None

    mand_note = mandatory_avg_note(mandatory_pp)

    secondary: List[float] = []
    if wahlpflicht_notes:
        secondary.extend(wahlpflicht_notes)
    if seminar_note is not None:
        secondary.append(seminar_note)
    if thesis_note is not None:
        secondary.append(thesis_note)

    secondary_avg = sum(secondary) / len(secondary) if secondary else None
    raw = (3 / 5) * mand_note + (2 / 5) * secondary_avg if secondary_avg is not None else None
    final = truncate1(raw) if raw is not None else None

    return {
        "mandatory_note": mand_note,
        "mandatory_note_label": note_to_label(mand_note),
        "secondary_avg": secondary_avg,
        "gesamtnote": final,
        "gesamtnote_label": note_to_label(final) if final is not None else None,
        "is_complete": final is not None,
    }


# ── §24 Abs. 2: Kompensationsregel ──────────────────────────────────────────

def _group_ok(scores: List[float], need_pass: int, min_fail_pp: float, min_sum: float) -> Dict:
    passed = [s for s in scores if s >= 50]
    failed = [s for s in scores if s < 50]
    total  = sum(scores)

    if len(passed) == len(scores):
        return {"ok": True, "detail": "Alle bestanden"}
    if len(passed) < need_pass:
        return {"ok": False, "detail": f"{len(passed)}/{need_pass} bestanden (min. {need_pass} erforderlich)"}

    # Exactly one failure allowed
    worst = min(failed) if failed else 0
    if worst >= min_fail_pp and total >= min_sum:
        return {"ok": True, "detail": f"Ausgleich: {worst:.0f} PP, Summe {total:.0f}/{min_sum:.0f} PP ✓"}
    reasons = []
    if worst < min_fail_pp:
        reasons.append(f"Nicht-bestandenes Modul hat nur {worst:.0f} PP (min. {min_fail_pp:.0f})")
    if total < min_sum:
        reasons.append(f"Gesamtsumme {total:.0f} PP (min. {min_sum:.0f})")
    return {"ok": False, "detail": "; ".join(reasons)}


def check_compensation(
    wiwi_pp: List[float],       # 5 WiWi mandatory modules
    winf_pp: List[float],       # 4 WiInf mandatory modules
    math_info_pp: List[float],  # 2 math + 3 informatik = 5 modules
) -> Dict:
    """
    §24 Abs. 2 compensation rule check.
    Bachelor can still be passed if at most one module per group is below 50 PP,
    subject to minimum score and sum constraints.
    """
    w  = _group_ok(wiwi_pp,      need_pass=4, min_fail_pp=25, min_sum=250)
    wi = _group_ok(winf_pp,      need_pass=3, min_fail_pp=25, min_sum=200)
    mi = _group_ok(math_info_pp, need_pass=4, min_fail_pp=25, min_sum=250)
    return {
        "wiwi":          w,
        "winf":          wi,
        "math_informatik": mi,
        "all_groups_ok": w["ok"] and wi["ok"] and mi["ok"],
    }


# ── Prerequisite checks ──────────────────────────────────────────────────────

def prerequisite_status(
    passed_mandatory_count: int,
    passed_informatik_count: int,
    seminar_passed: bool,
) -> Dict:
    """Return prerequisite fulfillment for seminar, thesis, and Informatik electives."""
    return {
        "seminar": {
            "met": passed_mandatory_count >= 9,
            "label": f"{passed_mandatory_count} / 9 Pflichtmodule bestanden",
        },
        "thesis": {
            "met": passed_mandatory_count >= 9 and seminar_passed,
            "label": (
                "Seminar noch nicht bestanden"
                if passed_mandatory_count >= 9 and not seminar_passed
                else f"{passed_mandatory_count} / 9 Pflichtmodule bestanden"
            ),
        },
        "elective_informatik": {
            "met": passed_informatik_count >= 3,
            "label": f"{passed_informatik_count} / 3 Informatik-Pflichtmodule bestanden",
        },
    }
