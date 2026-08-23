import { useState } from 'react'
import useAppStore from '../store/appStore'
import ModuleModal from './ModuleModal'
import { statusBadge, formatNote, formatPP } from '../utils/gradeUtils'

export default function ModuleSection({ category, label, modules, isSpecial = false }) {
  const { modules: records } = useAppStore()
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(null)

  const passedCount = modules.filter(m => records[m.number]?.status === 'passed').length
  const total = modules.filter(m => !m.is_legacy || records[m.number]).length

  const isElective = category?.startsWith('elective_')

  // For electives: show all, highlight selected ones
  const displayModules = isElective
    ? modules
    : modules.filter(m => !m.is_legacy || records[m.number])

  return (
    <div className="rounded-2xl border overflow-hidden"
         style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/3 transition-colors"
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-3">
          <CategoryDot category={category} />
          <span className="text-sm font-semibold" style={{ color: 'var(--textpri)' }}>{label}</span>
          {!isElective && (
            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{
                    background: passedCount === total ? '#10B98120' : '#6366F115',
                    color: passedCount === total ? '#10B981' : 'var(--textsec)',
                  }}>
              {passedCount}/{total}
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
             className={`transition-transform ${collapsed ? '-rotate-90' : ''}`}
             style={{ color: 'var(--muted)' }}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Table */}
      {!collapsed && (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr style={{ background: 'var(--panel)' }}>
                <th>Nr.</th>
                <th>Modul</th>
                <th className="hidden md:table-cell">ECTS</th>
                <th>Status</th>
                <th className="hidden sm:table-cell">Ergebnis</th>
                <th className="hidden sm:table-cell">Note</th>
                <th className="hidden lg:table-cell">Semester</th>
                <th>Versuche</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayModules.map(m => {
                const rec = records[m.number] ?? {}
                const badge = statusBadge(rec.status || 'not_started')
                const isLegacyActive = m.is_legacy && records[m.number]

                return (
                  <tr key={m.number} className={m.is_legacy && !records[m.number] ? 'opacity-40' : ''}>
                    <td>
                      <span className="font-mono text-xs" style={{ color: 'var(--textsec)' }}>
                        {m.number}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm" style={{ color: 'var(--textpri)' }}>
                          {m.name}
                        </span>
                        {m.is_legacy && (
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>
                            ⟳ Legacy-Modul – {m.deprecated_note}
                          </span>
                        )}
                        {m.deprecated_note && !m.is_legacy && (
                          <span className="text-xs" style={{ color: 'var(--warning)', opacity: 0.8 }}>
                            ⚠ {m.deprecated_note}
                          </span>
                        )}
                        {isElective && rec.is_wahlpflicht_slot && (
                          <span className="text-xs" style={{ color: 'var(--accent)' }}>★ Ausgewählt</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="font-mono text-xs" style={{ color: 'var(--textsec)' }}>
                        {m.ects} ECTS
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="font-mono text-sm" style={{ color: 'var(--textpri)' }}>
                        {formatPP(rec.score_pct)}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="font-mono text-sm font-semibold"
                            style={{ color: rec.grade ? gradeColor(rec.grade) : 'var(--muted)' }}>
                        {formatNote(rec.grade)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className="text-xs" style={{ color: 'var(--textsec)' }}>
                        {rec.semester_info || '–'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ color: 'var(--textsec)' }}>
                        {rec.attempts || 0}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setEditing(m)}
                        className="text-xs px-2 py-1 rounded-lg transition-colors hover:text-accent"
                        style={{ color: 'var(--muted)' }}
                      >
                        Bearbeiten
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ModuleModal
          module={editing}
          isElective={isElective}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function CategoryDot({ category }) {
  const colors = {
    wiwi_mandatory: '#F59E0B',
    winf_mandatory: '#6366F1',
    math_mandatory: '#10B981',
    informatik_mandatory: '#06B6D4',
    elective_wiwi_bwl: '#F97316',
    elective_wiwi_vwl: '#EF4444',
    elective_winf: '#8B5CF6',
    elective_informatik: '#0EA5E9',
    special: '#94A3B8',
  }
  return (
    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: colors[category] || '#475569' }} />
  )
}

function gradeColor(note) {
  if (note <= 1.5) return '#10B981'
  if (note <= 2.5) return '#6EE7B7'
  if (note <= 3.5) return '#F59E0B'
  if (note <= 4.0) return '#F97316'
  return '#EF4444'
}
