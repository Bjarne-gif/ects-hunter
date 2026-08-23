import { useState, useEffect } from 'react'
import useAppStore from '../store/appStore'
import { ppToNote, formatNote, noteToLabel } from '../utils/gradeUtils'

const SEMSTERS = [
  'WiSe 22/23', 'SoSe 23', 'WiSe 23/24', 'SoSe 24',
  'WiSe 24/25', 'SoSe 25', 'WiSe 25/26', 'SoSe 26',
  'WiSe 26/27', 'SoSe 27',
]

export default function ModuleModal({ module: mod, isElective, onClose }) {
  const { modules, saveModule, deleteModuleRecord } = useAppStore()
  const existing = modules[mod.number] ?? {}

  const [status,    setStatus]    = useState(existing.status || 'not_started')
  const [scorePct,  setScorePct]  = useState(existing.score_pct ?? '')
  const [grade,     setGrade]     = useState(existing.grade ?? '')
  const [attempts,  setAttempts]  = useState(existing.attempts ?? 0)
  const [semester,  setSemester]  = useState(existing.semester_info || '')
  const [notes,     setNotes]     = useState(existing.notes || '')
  const [isWP,      setIsWP]      = useState(!!existing.is_wahlpflicht_slot)
  const [loading,   setLoading]   = useState(false)
  const [err,       setErr]       = useState('')

  const derivedNote = scorePct !== '' ? ppToNote(Number(scorePct)) : null
  const displayNote = scorePct !== '' ? derivedNote : (grade !== '' ? Number(grade) : null)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      await saveModule(mod.number, {
        module_number: mod.number,
        status,
        score_pct: scorePct !== '' ? Number(scorePct) : null,
        grade: scorePct !== '' ? null : (grade !== '' ? Number(grade) : null),
        attempts: Number(attempts),
        semester_info: semester,
        notes,
        is_wahlpflicht_slot: isWP,
      })
      onClose()
    } catch (ex) {
      setErr(ex?.response?.data?.detail || ex.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Eintrag für ${mod.name} löschen?`)) return
    setLoading(true)
    try {
      await deleteModuleRecord(mod.number)
      onClose()
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: '#00000080', backdropFilter: 'blur(4px)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg rounded-2xl border p-6 fade-in max-h-[90vh] overflow-y-auto"
           style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{ background: '#6366F115', color: 'var(--accent)' }}>
                {mod.number}
              </span>
              <h2 className="text-lg font-bold mt-2 leading-tight" style={{ color: 'var(--textpri)' }}>
                {mod.name}
              </h2>
            </div>
            <button onClick={onClose}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"
                    style={{ color: 'var(--textsec)' }}>✕</button>
          </div>
          <div className="flex gap-3 mt-2 text-xs" style={{ color: 'var(--muted)' }}>
            <span>{mod.ects} ECTS</span>
            <span>·</span>
            <span>{mod.faculty || 'WiWi'}</span>
            {mod.is_legacy && <><span>·</span><span style={{ color: 'var(--warning)' }}>Legacy</span></>}
          </div>
          {mod.deprecated_note && (
            <p className="mt-2 text-xs p-2 rounded-lg"
               style={{ background: '#F59E0B15', color: 'var(--warning)', border: '1px solid #F59E0B30' }}>
              ⚠ {mod.deprecated_note}
            </p>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Status */}
          <div>
            <label className="label-sm">Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
              {[
                { v: 'not_started', l: 'Offen',      icon: '○' },
                { v: 'enrolled',    l: 'Belegt',     icon: '◈' },
                { v: 'passed',      l: 'Bestanden',  icon: '✓' },
                { v: 'failed',      l: 'Nicht best.',icon: '✗' },
              ].map(s => (
                <button key={s.v} type="button"
                        onClick={() => setStatus(s.v)}
                        className="py-2 px-3 rounded-xl text-xs font-medium border transition-all"
                        style={status === s.v
                          ? { background: statusBg(s.v), color: statusFg(s.v), borderColor: statusFg(s.v) + '60' }
                          : { background: 'var(--surface)', color: 'var(--textsec)', borderColor: 'var(--border)' }}>
                  {s.icon} {s.l}
                </button>
              ))}
            </div>
          </div>

          {/* Score + Grade preview */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-sm">Prozentpunkte (0–100)</label>
              <input type="number" min="0" max="100" step="0.5"
                     placeholder="z.B. 75"
                     value={scorePct}
                     onChange={e => setScorePct(e.target.value)}
                     className="mt-1.5" />
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Note wird automatisch berechnet
              </p>
            </div>
            <div>
              <label className="label-sm">Note (manuell, falls kein PP)</label>
              <input type="number" min="1" max="5" step="0.1"
                     placeholder="z.B. 2.7"
                     value={grade}
                     onChange={e => setGrade(e.target.value)}
                     disabled={scorePct !== ''}
                     className="mt-1.5"
                     style={scorePct !== '' ? { opacity: 0.4 } : {}} />
            </div>
          </div>

          {/* Live grade preview */}
          {displayNote !== null && (
            <div className="px-4 py-3 rounded-xl flex items-center gap-3"
                 style={{ background: '#6366F115', border: '1px solid #6366F130' }}>
              <span className="text-2xl font-bold font-mono" style={{ color: '#6366F1' }}>
                {formatNote(displayNote)}
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--textpri)' }}>
                  {noteToLabel(displayNote)}
                </p>
                {scorePct !== '' && (
                  <p className="text-xs" style={{ color: 'var(--textsec)' }}>
                    Berechnet aus {scorePct} PP (§ 22 Abs. 2 PO)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Attempts + Semester */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-sm">Versuche</label>
              <input type="number" min="0" max="3"
                     value={attempts}
                     onChange={e => setAttempts(e.target.value)}
                     className="mt-1.5" />
            </div>
            <div>
              <label className="label-sm">Semester</label>
              <select value={semester} onChange={e => setSemester(e.target.value)} className="mt-1.5">
                <option value="">– wählen –</option>
                {SEMSTERS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Wahlpflicht slot */}
          {isElective && (
            <div className="flex items-center gap-3 p-3 rounded-xl border"
                 style={{ borderColor: 'var(--border)' }}>
              <input type="checkbox" id="wp-slot" checked={isWP}
                     onChange={e => setIsWP(e.target.checked)}
                     className="w-4 h-4" style={{ accentColor: 'var(--accent)' }} />
              <label htmlFor="wp-slot" className="text-sm cursor-pointer"
                     style={{ color: 'var(--textpri)' }}>
                Als eines der zwei Wahlpflicht-Module einbringen
                <span className="block text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Mind. eines davon muss aus Fachrichtung 2 (WiInf) stammen
                </span>
              </label>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="label-sm">Notizen</label>
            <textarea rows={2} placeholder="z.B. Lernhilfen, Wiederholungstermin…"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="mt-1.5 resize-none" />
          </div>

          {err && (
            <p className="text-xs p-2 rounded-lg"
               style={{ background: '#EF444415', color: 'var(--danger)', border: '1px solid #EF444430' }}>
              {err}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {existing.id && (
              <button type="button" onClick={handleDelete}
                      className="px-3 py-2 rounded-xl text-sm border transition-colors hover:border-danger"
                      style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}>
                Löschen
              </button>
            )}
            <button type="button" onClick={onClose}
                    className="flex-1 py-2 rounded-xl text-sm border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--textsec)' }}>
              Abbrechen
            </button>
            <button type="submit" disabled={loading}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--accent)' }}>
              {loading ? 'Speichert…' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function statusBg(s) {
  return { passed: '#10B98120', enrolled: '#6366F120', failed: '#EF444420', not_started: '#47556920' }[s]
}
function statusFg(s) {
  return { passed: '#10B981', enrolled: '#6366F1', failed: '#EF4444', not_started: '#94A3B8' }[s]
}
