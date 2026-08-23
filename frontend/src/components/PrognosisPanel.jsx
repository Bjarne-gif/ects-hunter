import useAppStore from '../store/appStore'
import { noteColor, formatNote, noteToLabel } from '../utils/gradeUtils'

export default function PrognosisPanel() {
  const { stats } = useAppStore()

  if (!stats) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--textsec)' }}>
        Öffnen Sie zunächst eine Datenbank und tragen Sie Modulergebnisse ein.
      </div>
    )
  }

  const { grades, prognosis, ects, passed_mandatory_count, total_mandatory_count } = stats

  const scenarios = prognosis
    ? Object.entries(prognosis).map(([label, data]) => ({ label, ...data }))
    : []

  return (
    <div className="space-y-6 fade-in">
      {/* Current status */}
      <div className="rounded-2xl border p-6"
           style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--textpri)' }}>
          Aktueller Notenstand
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GradeCard
            label="Pflicht-Durchschnitt"
            note={grades.mandatory_note}
            sublabel="Arithm. Mittel der PP → §22"
            formula="Basis für 3/5 der Gesamtnote"
          />
          <GradeCard
            label="Prognose Gesamtnote"
            note={grades.gesamtnote}
            sublabel={grades.gesamtnote_label}
            formula="3/5 × Pflicht-Ø + 2/5 × WP/Seminar/Thesis-Ø"
          />
        </div>

        {!grades.gesamtnote && (
          <div className="mt-4 p-3 rounded-xl text-sm"
               style={{ background: '#6366F115', border: '1px solid #6366F130', color: 'var(--textsec)' }}>
            Die Gesamtnote kann erst berechnet werden, wenn mindestens ein Wahlpflichtmodul,
            das Seminar oder die Bachelorarbeit eingetragen wurde.
          </div>
        )}
      </div>

      {/* Scenarios */}
      {scenarios.length > 0 && (
        <div className="rounded-2xl border p-6"
             style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--textpri)' }}>
            Szenarien
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--textsec)' }}>
            Prognostizierte Gesamtnote, wenn alle noch ausstehenden {total_mandatory_count - passed_mandatory_count} Pflicht-
            und {4 - (stats.module_counts?.winf_passed || 0)} WP-Module mit dem jeweiligen Zielergebnis abgeschlossen werden.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {scenarios.map(s => (
              <ScenarioCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      )}

      {/* Formula explainer */}
      <FormulaExplainer stats={stats} />
    </div>
  )
}

function GradeCard({ label, note, sublabel, formula }) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--textsec)' }}>
        {label}
      </p>
      {note ? (
        <>
          <p className={`text-4xl font-bold font-mono mb-1 ${noteColor(note)}`}>{formatNote(note)}</p>
          <p className="text-sm" style={{ color: 'var(--textsec)' }}>{sublabel}</p>
        </>
      ) : (
        <p className="text-3xl font-bold font-mono mb-1" style={{ color: 'var(--muted)' }}>–</p>
      )}
      <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{formula}</p>
    </div>
  )
}

function ScenarioCard({ label, gesamtnote, label: noteLabel }) {
  const color = gesamtnote ? noteColor(gesamtnote) : 'text-textsec'
  return (
    <div className="p-4 rounded-xl border text-center"
         style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--textsec)' }}>{label}</p>
      {gesamtnote ? (
        <>
          <p className={`text-3xl font-bold font-mono ${color}`}>{formatNote(gesamtnote)}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--textsec)' }}>{noteToLabel(gesamtnote)}</p>
        </>
      ) : (
        <p className="text-2xl font-bold font-mono" style={{ color: 'var(--muted)' }}>–</p>
      )}
    </div>
  )
}

function FormulaExplainer({ stats }) {
  const g = stats?.grades
  return (
    <div className="rounded-2xl border p-6"
         style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--textpri)' }}>
        Berechnungsformel (§ 24 Abs. 5 PO)
      </h3>
      <div className="font-mono text-sm space-y-2">
        <FormulaLine label="Gesamtnote" value="3/5 × Pflicht-Ø + 2/5 × Sekundär-Ø" />
        <FormulaLine label="Pflicht-Ø" value="Note aus PP-Durchschnitt aller 14 Pflichtmodule (§22)" />
        <FormulaLine label="Sekundär-Ø" value="ECTS-gew. Ø (2 Wahlpflicht + Seminar + Thesis)" />
        <div className="pt-2 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
          <FormulaLine label="Kürzung" value="1 Dezimalstelle, abgeschnitten – nicht gerundet (§24 Abs. 6)" isNote />
        </div>
      </div>
      {g?.mandatory_note != null && (
        <div className="mt-4 p-3 rounded-xl text-sm"
             style={{ background: 'var(--panel)', borderColor: 'var(--border)', border: '1px solid' }}>
          Aktuell: <span className="font-mono font-semibold" style={{ color: 'var(--accent)' }}>
            3/5 × {formatNote(g.mandatory_note)} + 2/5 × {g.secondary_avg ? formatNote(g.secondary_avg) : '?'}
            {g.gesamtnote ? ` = ${formatNote(g.gesamtnote)}` : ''}
          </span>
        </div>
      )}
    </div>
  )
}

function FormulaLine({ label, value, isNote }) {
  return (
    <div className="flex gap-3 text-xs">
      <span className="w-28 flex-shrink-0" style={{ color: 'var(--textsec)' }}>{label}:</span>
      <span style={{ color: isNote ? 'var(--warning)' : 'var(--textpri)' }}>{value}</span>
    </div>
  )
}
