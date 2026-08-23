"""
Module catalog for BSc Wirtschaftsinformatik, FernUniversität in Hagen.
Based on PO 18. Änderung (Amtliche Mitteilungen Nr. 25/2025, wirksam ab 01.10.2025).

Legacy modules (31041, 31051, 63016, 63511) remain valid for students
who enrolled under earlier versions of the PO.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ModuleDef:
    number: str
    name: str
    category: str        # see CATEGORY_* constants below
    ects: int = 10
    is_legacy: bool = False
    legacy_replaces: Optional[str] = None   # number of the current module this replaces
    deprecated_note: str = ""
    faculty: str = "WiWi"                  # "WiWi" | "MI"


# ── Category constants ──────────────────────────────────────────────────────
CAT_WIWI      = "wiwi_mandatory"
CAT_WINF      = "winf_mandatory"
CAT_MATH      = "math_mandatory"
CAT_INFO      = "informatik_mandatory"
CAT_EL_WW1   = "elective_wiwi_bwl"
CAT_EL_WW2   = "elective_wiwi_vwl"
CAT_EL_WINF  = "elective_winf"
CAT_EL_INFO  = "elective_informatik"
CAT_SEMINAR  = "seminar"
CAT_THESIS   = "thesis"

CATEGORY_LABELS = {
    CAT_WIWI:     "Pflichtmodule · Wirtschaftswissenschaft",
    CAT_WINF:     "Pflichtmodule · Wirtschaftsinformatik",
    CAT_MATH:     "Pflichtmodule · Mathematik",
    CAT_INFO:     "Pflichtmodule · Informatik",
    CAT_EL_WW1:  "Wahlpflichtmodule WiWi – Gruppe I (BWL)",
    CAT_EL_WW2:  "Wahlpflichtmodule WiWi – Gruppe II (VWL / Quantitative Methoden)",
    CAT_EL_WINF: "Wahlpflichtmodule · Wirtschaftsinformatik",
    CAT_EL_INFO: "Wahlpflichtmodule · Informatik",
    CAT_SEMINAR: "Seminar",
    CAT_THESIS:  "Bachelorarbeit",
}

MANDATORY_CATEGORIES = {CAT_WIWI, CAT_WINF, CAT_MATH, CAT_INFO}
ELECTIVE_CATEGORIES  = {CAT_EL_WW1, CAT_EL_WW2, CAT_EL_WINF, CAT_EL_INFO}

CATEGORY_ORDER = [
    CAT_WIWI, CAT_WINF, CAT_MATH, CAT_INFO,
    CAT_EL_WW1, CAT_EL_WW2, CAT_EL_WINF, CAT_EL_INFO,
    CAT_SEMINAR, CAT_THESIS,
]


# ── Pflichtmodule ───────────────────────────────────────────────────────────

PFLICHT_WIWI: List[ModuleDef] = [
    ModuleDef("31001", "Einführung in die Wirtschaftswissenschaft", CAT_WIWI),
    ModuleDef("31011", "Externes Rechnungswesen – Buchhaltung, Jahresabschluss, Steuern", CAT_WIWI),
    ModuleDef("31021", "Investition und Finanzierung", CAT_WIWI),
    ModuleDef("31031", "Internes Rechnungswesen und funktionale Steuerung", CAT_WIWI),
    ModuleDef("31121", "Mikro- und Makroökonomik in der Wirtschaftsinformatik", CAT_WIWI),
    # Legacy: students who enrolled before the change may have done one of these instead
    ModuleDef("31041", "Mikroökonomik", CAT_WIWI,
              is_legacy=True, legacy_replaces="31121",
              deprecated_note="Gültig für Einschreibungen vor Einführung von 31121"),
    ModuleDef("31051", "Makroökonomik", CAT_WIWI,
              is_legacy=True, legacy_replaces="31121",
              deprecated_note="Gültig für Einschreibungen vor Einführung von 31121"),
]

PFLICHT_WINF: List[ModuleDef] = [
    ModuleDef("31071", "Einführung in die Wirtschaftsinformatik", CAT_WINF),
    ModuleDef("31751", "Modellierung betrieblicher Informationssysteme", CAT_WINF),
    ModuleDef("31771", "Informationsmanagement", CAT_WINF),
    ModuleDef("64111", "Betriebliche Informationssysteme", CAT_WINF, faculty="MI"),
]

PFLICHT_MATH: List[ModuleDef] = [
    ModuleDef("31101", "Grundlagen der Wirtschaftsmathematik und Statistik", CAT_MATH),
    ModuleDef("61411", "Algorithmische Mathematik", CAT_MATH, faculty="MI"),
]

# Informatik – two alternative sets (student chooses at enrollment)
PFLICHT_INFO_NEW: List[ModuleDef] = [
    ModuleDef("65001", "Grundlagen der Informatik 1", CAT_INFO, faculty="MI"),
    ModuleDef("65002", "Grundlagen der Informatik 2", CAT_INFO, faculty="MI"),
    ModuleDef("63017", "Datenbanken und Sicherheit im Internet", CAT_INFO, faculty="MI"),
]

PFLICHT_INFO_OLD: List[ModuleDef] = [
    ModuleDef("63016", "Einführung in die objektorientierte Programmierung", CAT_INFO,
              faculty="MI", is_legacy=True,
              deprecated_note="Letztmalig belegbar SoSe 2025 · letzte Prüfung SoSe 2026"),
    ModuleDef("63511", "Einführung in die technischen und theoretischen Grundlagen der Informatik",
              CAT_INFO, faculty="MI", is_legacy=True,
              deprecated_note="Letztmalig belegbar SoSe 2026 · letzte Prüfung SoSe 2027"),
    ModuleDef("63017", "Datenbanken und Sicherheit im Internet", CAT_INFO, faculty="MI"),
]


# ── Wahlpflichtmodule ───────────────────────────────────────────────────────

ELECTIVE_WIWI_BWL: List[ModuleDef] = [
    ModuleDef("31491", "Logistik und Supply Chain Management", CAT_EL_WW1),
    ModuleDef("31501", "Finanzwirtschaft", CAT_EL_WW1),
    ModuleDef("31541", "Produktionsplanung", CAT_EL_WW1),
    ModuleDef("31581", "Unternehmensgründung", CAT_EL_WW1),
    ModuleDef("31591", "Unternehmensnachfolge", CAT_EL_WW1),
    ModuleDef("31601", "Instrumente des Controllings", CAT_EL_WW1),
    ModuleDef("31611", "Innovationscontrolling", CAT_EL_WW1),
    ModuleDef("31621", "Grundlagen des Marketing", CAT_EL_WW1),
    ModuleDef("31661", "Organisation: Theorie, Gestaltung, Wandel", CAT_EL_WW1),
    ModuleDef("31671", "Strategisches Management", CAT_EL_WW1),
    ModuleDef("31681", "Grundlagen der Unternehmensbesteuerung", CAT_EL_WW1),
    ModuleDef("31691", "Steuerliche Gewinnermittlung", CAT_EL_WW1,
              deprecated_note="Letztmalig belegbar und Prüfung SoSe 2026"),
    ModuleDef("31701", "Personalführung", CAT_EL_WW1),
    ModuleDef("31711", "Verhalten in Organisationen", CAT_EL_WW1),
    ModuleDef("31911", "Jahresabschluss nach IFRS", CAT_EL_WW1),
    ModuleDef("31921", "Konzernrechnungslegung", CAT_EL_WW1),
    ModuleDef("31991", "Handelsmarketing, Electronic Commerce und Digital Marketing", CAT_EL_WW1),
]

ELECTIVE_WIWI_VWL: List[ModuleDef] = [
    ModuleDef("31721", "Markt und Staat", CAT_EL_WW2),
    ModuleDef("31781", "Probleme der Wirtschaftspolitik", CAT_EL_WW2),
    ModuleDef("31791", "Industrieökonomik: Strategisches Unternehmensverhalten im Wettbewerb",
              CAT_EL_WW2, deprecated_note="Letztmalig belegbar und Prüfung WiSe 2025/2026"),
    ModuleDef("31801", "Problemlösen in graphischen Strukturen", CAT_EL_WW2),
    ModuleDef("31811", "Planen mit mathematischen Modellen", CAT_EL_WW2),
    ModuleDef("31931", "Grundlagen der Internationalen Wirtschaftsbeziehungen", CAT_EL_WW2),
    ModuleDef("31961", "Spieltheorie", CAT_EL_WW2),
    ModuleDef("31971", "Geldtheorie und Geldpolitik", CAT_EL_WW2),
    ModuleDef("31981", "Devisenmärkte, Internationales Währungssystem und Wirtschaftskrisen",
              CAT_EL_WW2),
]

ELECTIVE_WINF: List[ModuleDef] = [
    ModuleDef("31311", "IT-Governance", CAT_EL_WINF),
    ModuleDef("31481", "Digitale Ethik", CAT_EL_WINF),
    ModuleDef("31831", "Knowledge Management (englischsprachig)", CAT_EL_WINF),
    ModuleDef("31951", "Digitale Transformation", CAT_EL_WINF),
    ModuleDef("64112", "Entscheidungsmethoden in unternehmensweiten Softwaresystemen",
              CAT_EL_WINF, faculty="MI"),
]

ELECTIVE_INFO: List[ModuleDef] = [
    ModuleDef("63112", "Übersetzerbau", CAT_EL_INFO, faculty="MI"),
    ModuleDef("63113", "Datenstrukturen und Algorithmen", CAT_EL_INFO, faculty="MI"),
    ModuleDef("63117", "Data Mining", CAT_EL_INFO, faculty="MI"),
    ModuleDef("63122", "Architektur und Implementierung von Datenbanksystemen", CAT_EL_INFO,
              faculty="MI"),
    ModuleDef("63211", "Verteilte Systeme", CAT_EL_INFO, faculty="MI"),
    ModuleDef("63311", "Einführung in Mensch-Computer-Interaktion", CAT_EL_INFO, faculty="MI",
              deprecated_note="Nicht mehr belegbar · letzte Prüfung SoSe 2026"),
    ModuleDef("63312", "Interaktive Systeme", CAT_EL_INFO, faculty="MI",
              deprecated_note="Nicht mehr belegbar · letzte Prüfung SoSe 2026"),
    ModuleDef("63517", "Informations- und Kodierungstheorie", CAT_EL_INFO, faculty="MI"),
    ModuleDef("63712", "Parallel Programming", CAT_EL_INFO, faculty="MI"),
    ModuleDef("63812", "Software Engineering", CAT_EL_INFO, faculty="MI"),
    ModuleDef("64211", "Wissensbasierte Systeme", CAT_EL_INFO, faculty="MI",
              deprecated_note="Nicht mehr belegbar · letzte Prüfung WiSe 2025/26"),
    ModuleDef("64403", "Logik", CAT_EL_INFO, faculty="MI"),
]


# ── Lookup helpers ──────────────────────────────────────────────────────────

def get_all_modules(info_set: str = "new") -> List[ModuleDef]:
    info = PFLICHT_INFO_NEW if info_set == "new" else PFLICHT_INFO_OLD
    return (
        PFLICHT_WIWI + PFLICHT_WINF + PFLICHT_MATH + info
        + ELECTIVE_WIWI_BWL + ELECTIVE_WIWI_VWL + ELECTIVE_WINF + ELECTIVE_INFO
    )


def get_module(number: str, info_set: str = "new") -> Optional[ModuleDef]:
    for m in get_all_modules(info_set):
        if m.number == number:
            return m
    return None


def get_mandatory_modules(info_set: str = "new") -> List[ModuleDef]:
    info = PFLICHT_INFO_NEW if info_set == "new" else PFLICHT_INFO_OLD
    return PFLICHT_WIWI + PFLICHT_WINF + PFLICHT_MATH + info


def is_mandatory(category: str) -> bool:
    return category in MANDATORY_CATEGORIES


def is_elective(category: str) -> bool:
    return category in ELECTIVE_CATEGORIES


def winf_elective_required(category: str) -> bool:
    """At least one Wahlpflicht must come from WiInf (Fachrichtung 2)."""
    return category == CAT_EL_WINF


# Informatik prerequisite: Wahlpflicht Informatik requires all 3 Pflicht-Informatik
INFORMATIK_WAHLPFLICHT_PREREQ_COUNT = 3
