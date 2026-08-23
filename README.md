# FernUni Hagen — Modul- & Notentracker

**Inoffizieller akademischer Tracker für den BSc Wirtschaftsinformatik**  
FernUniversität in Hagen · PO 18. Änderung (wirksam ab 01.10.2025)

---

## Überblick

Dieses Tool ermöglicht Studierenden der FernUniversität in Hagen, ihren Studienfortschritt lokal, transparent und verschlüsselt zu verwalten. Es implementiert vollständig die Regeln der aktuellen Prüfungsordnung und unterstützt mehrere verschlüsselte Datenbankprofile — nützlich für Personen, die z. B. parallele Szenarien durchspielen möchten.

### Kernfunktionen

| Funktion | Detail |
|----------|--------|
| **AES-256-GCM-Verschlüsselung** | PBKDF2 (480.000 Iterationen), format: `MAGIC|VERSION|SALT|NONCE|CIPHERTEXT` |
| **Multi-Datenbank** | Automatische Erkennung aller `.fernuni.enc`-Dateien im `/data`-Verzeichnis |
| **DB-Selektor** | Dropdown oben rechts; nahtloses Wechseln zwischen Profilen |
| **Notenberechnung** | §22 Abs. 2 (PP→Note) + §24 Abs. 5 (Gesamtnote) vollständig implementiert |
| **Kompensationsregel** | §24 Abs. 2: Ausgleich pro Modulgruppe (WiWi, WiInf, Mathe+Info) |
| **Voraussetzungsprüfung** | Seminar (9 Pflichtmodule), Thesis, Informatik-Wahlpflicht |
| **Prognose** | 3 Szenarien (95/80/65 PP) für alle noch offenen Module |
| **Legacy-Module** | 31041/31051 (Alt) anerkannt, 63016/63511 (auslaufend) unterstützt |
| **Informatik-Set** | Wahl zwischen neuem (65001+65002) und altem (63016+63511) Set |

---

## Schnellstart

### Voraussetzungen

- [Docker](https://docs.docker.com/get-docker/) und [Docker Compose](https://docs.docker.com/compose/)

### Starten

```bash
git clone <repo-url>
cd fernuni-tracker
docker compose up --build -d
```

Öffne im Browser: **http://localhost:3000**

### Daten

Alle verschlüsselten Datenbankdateien (`*.fernuni.enc`) liegen im Verzeichnis `./data/`.  
Dieses Verzeichnis ist als Docker-Volume gemappt — die Daten verlassen nie das lokale System.

### Entwicklungsmodus (ohne Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
DATA_DIR=./data uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Technische Architektur

```
fernuni-tracker/
├── docker-compose.yml
├── data/                       # Docker-Volume: verschlüsselte Datenbankdateien
│   └── *.fernuni.enc
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI-Einstiegspunkt
│       ├── config.py           # Konfiguration
│       ├── encryption.py       # AES-256-GCM (PBKDF2)
│       ├── database.py         # SQLite DDL
│       ├── session.py          # In-Memory Sitzungsverwaltung
│       ├── module_catalog.py   # Vollständiger Modulkatalog BSc WiInf
│       ├── grade_calc.py       # Notenberechnungslogik (§22, §24 PO)
│       ├── schemas.py          # Pydantic-Schemas
│       └── routers/
│           ├── db_router.py    # GET/POST /api/databases
│           ├── student_router.py
│           ├── modules_router.py
│           └── stats_router.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── App.jsx
        ├── api/index.js        # Axios-Client
        ├── store/appStore.js   # Zustand State-Management
        ├── components/
        │   ├── Header.jsx           # Sticky Header mit DB-Selektor
        │   ├── Dashboard.jsx        # Tab-Navigation
        │   ├── ECTSRing.jsx         # SVG-Fortschrittsring
        │   ├── StatsPanel.jsx       # Statistik-Kacheln
        │   ├── ModuleSection.jsx    # Kollabierbare Modultabellen
        │   ├── ModuleModal.jsx      # Modul-Bearbeitungsdialog
        │   ├── PrognosisPanel.jsx   # Notenprognose (3 Szenarien)
        │   ├── StudentSettings.jsx  # Profil + XRP-Spenden-QR
        │   └── PrereqWarnings.jsx   # Voraussetzungs-Warnungen
        └── utils/gradeUtils.js      # Notenberechnungs-Hilfsfunktionen
```

---

## Notenberechnung (PO-Referenz)

### §22 Abs. 2 — Prozentpunkte → Note

| PP-Bereich | Note |
|-----------|------|
| ≥ 95      | 1,0  |
| ≥ 90      | 1,3  |
| ≥ 85      | 1,7  |
| ≥ 80      | 2,0  |
| ≥ 75      | 2,3  |
| ≥ 70      | 2,7  |
| ≥ 65      | 3,0  |
| ≥ 60      | 3,3  |
| ≥ 55      | 3,7  |
| ≥ 50      | 4,0  |
| < 50      | 5,0  |

### §24 Abs. 5 — Gesamtnote

```
Gesamtnote = 3/5 × Pflicht-Ø + 2/5 × ECTS-gew. Ø(Wahlpflicht + Seminar + Thesis)

Pflicht-Ø  = §22-Note des arithmetischen PP-Mittels aller 14 Pflichtmodule
Kürzung    = 1 Dezimalstelle, abgeschnitten — nicht gerundet (§24 Abs. 6)
```

### §24 Abs. 2 — Kompensationsregel

| Gruppe | Module | Min. bestanden | Min. PP (nicht best.) | Min. Summe |
|--------|--------|----------------|----------------------|------------|
| WiWi | 5 | 4 | ≥ 25 PP | ≥ 250 PP |
| WiInf | 4 | 3 | ≥ 25 PP | ≥ 200 PP |
| Mathe + Info | 5 | 4 | ≥ 25 PP | ≥ 250 PP |

---

## Modulkatalog

### Pflichtmodule (14 × 10 ECTS = 140 ECTS)

**Wirtschaftswissenschaft (5)**
- 31001 Einführung in die Wirtschaftswissenschaft
- 31011 Externes Rechnungswesen
- 31021 Investition und Finanzierung
- 31031 Internes Rechnungswesen und funktionale Steuerung
- 31121 Mikro- und Makroökonomik in der WI *(neu; Legacy: 31041 oder 31051)*

**Wirtschaftsinformatik (4)**
- 31071 Einführung in die Wirtschaftsinformatik
- 31751 Modellierung betrieblicher Informationssysteme
- 31771 Informationsmanagement
- 64111 Betriebliche Informationssysteme

**Mathematik (2)**
- 31101 Grundlagen der Wirtschaftsmathematik und Statistik
- 61411 Algorithmische Mathematik

**Informatik (3) — Neues Set (ab WiSe 25/26)**
- 65001 Grundlagen der Informatik 1
- 65002 Grundlagen der Informatik 2
- 63017 Datenbanken und Sicherheit im Internet

**Informatik (3) — Altes Set (Legacy)**
- 63016 Einführung in die objektorientierte Programmierung
- 63511 Einführung in die technischen und theoretischen Grundlagen der Informatik
- 63017 Datenbanken und Sicherheit im Internet

### Wahlpflichtmodule (2 × 10 ECTS = 20 ECTS)

Mindestens 1 aus Fachrichtung 2 (Wirtschaftsinformatik) erforderlich.

- **Gruppe I (BWL)**: 31491, 31501, 31541, 31581, 31591, 31601, 31611, 31621, 31661, 31671, 31681, 31701, 31711, 31911, 31921, 31991
- **Gruppe II (VWL/Quant.)**: 31721, 31781, 31801, 31811, 31931, 31961, 31971, 31981
- **WiInf**: 31311, 31481, 31831, 31951, 64112
- **Informatik**: 63112, 63113, 63117, 63122, 63211, 63517, 63712, 63812, 64403

**Voraussetzung Informatik-Wahlpflicht**: Alle 3 Informatik-Pflichtmodule bestanden (§11 Abs. 2)

### Seminar + Bachelorarbeit (2 × 10 ECTS)

**Voraussetzung Seminar**: ≥ 9 Pflichtmodule bestanden  
**Voraussetzung Thesis**: ≥ 9 Pflichtmodule + Seminar bestanden

---

## Verschlüsselungsformat

```
Offset  Länge  Inhalt
0       7      MAGIC: "FERNUNI"
7       1      VERSION: 0x01
8       16     SALT (zufällig, PBKDF2)
24      12     NONCE (zufällig, AES-GCM)
36      n      CIPHERTEXT + GCM-Tag
```

- **Schlüsselableitung**: PBKDF2-HMAC-SHA256, 480.000 Iterationen
- **Chiffre**: AES-256-GCM (authentifizierte Verschlüsselung)
- **Bibliothek**: Python `cryptography` (OpenSSL-Backend)

---

## Datenschutz

- Alle Daten bleiben **ausschließlich lokal** im `./data/`-Verzeichnis
- Kein Telemetrie, keine Cloud-Anbindung, keine externen API-Aufrufe
- Passwörter werden ausschließlich im Arbeitsspeicher gehalten, nie persistiert
- Temporäre entschlüsselte Dateien liegen im Docker-Container unter `/tmp/` und werden bei Datenbankwechsel sofort gelöscht

---

## Haftungsausschluss

Dieses Tool ist **inoffiziell** und wird von Studierenden für Studierende entwickelt.  
Für verbindliche Informationen zu Prüfungsordnung, Noten und Modulen sind stets die  
**offiziellen Dokumente der FernUniversität in Hagen** maßgeblich:  
https://www.fernuni-hagen.de/wirtschaftswissenschaft/studium/bsc-winf.shtml

---

## Roadmap

- [ ] Import aus FernUni-Notenübersicht (CSV)
- [ ] Export der Daten als PDF-Bericht
- [ ] Andere Studiengänge (BSc WiWi, Master)
- [ ] Farbthemen (Light Mode)
- [ ] Offline-Modus / PWA

---

*Erstellt mit ❤️ und viel Kaffee — freiwillige Spenden via XRP willkommen (Einstellungen)*
