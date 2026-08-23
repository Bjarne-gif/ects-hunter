import useAppStore from '../store/appStore'
import { noteColor, formatNote, noteToLabel } from '../utils/gradeUtils'

export default function StatsPanel() {
  const { stats } = useAppStore()
  if (!stats) return <SkeletonCards />

  const { grades, ects, module_counts, passed_mandatory_count, total_mandatory_count } = stats

  const cards = [
    {
      label: 'Pflicht-Ø',
      value: grades.mandatory_note ? formatNote(grades.mandatory_note) : '–',
      sub: grades.mandatory_note ? noteToLabel(grades.mandatory_note) : 'Keine Daten',
      color: grades.mandatory_note ? noteColor(grades.mandatory_note) : 'text-textsec',
      detail: `${passed_mandatory_count} / ${total_mandatory_count} Module bestanden`,
    },
    {
      label: 'Gesamtnote',
      value: grades.gesamtnote ? formatNote(grades.gesamtnote) : '–',
      sub: grades.gesamtnote ? grades.gesamtnote_label : 'Noch nicht vollständig',
      color: grades.gesamtnote ? noteColor(grades.gesamtnote) : 'text-textsec',
      detail: grades.is_complete ? '§ 24 Abs. 5 PO' : 'Hochrechnung ausstehend',
    },
    {
      label: 'ECTS gesamt',
      value: `${ects.done}`,
      sub: `von ${ects.total} ECTS`,
      color: 'text-emerald-400',
      detail: `${ects.in_progress} ECTS laufend`,
    },
    {
      label: 'WiWi bestanden',
      value: `${module_counts.wiwi_passed}/5`,
      sub: 'Pflichtmodule',
      color: module_counts.wiwi_passed >= 5 ? 'text-emerald-400' : 'text-textsec',
      detail: '',
    },
    {
      label: 'WiInfo bestanden',
      value: `${module_counts.winf_passed}/4`,
      sub: 'Pflichtmodule',
      color: module_counts.winf_passed >= 4 ? 'text-emerald-400' : 'text-textsec',
      detail: '',
    },
    {
      label: 'Informatik best.',
      value: `${module_counts.info_passed}/3`,
      sub: 'Pflichtmodule',
      color: module_counts.info_passed >= 3 ? 'text-emerald-400' : 'text-textsec',
      detail: module_counts.info_passed < 3 ? 'Voraussetzung WP Info' : '',
    },
  ]

  return (
    <div className="rounded-2xl border p-5 h-full"
         style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--textsec)' }}>Statistiken</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map(c => (
          <div key={c.label} className="p-3 rounded-xl border"
               style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--textsec)' }}>{c.label}</p>
            <p className={`text-2xl font-bold font-mono ${c.color}`}>{c.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--textsec)' }}>{c.sub}</p>
            {c.detail && (
              <p className="text-xs mt-1" style={{ color: 'var(--muted)', fontSize: '10px' }}>{c.detail}</p>
            )}
          </div>
        ))}
      </div>

      {/* Compensation rule */}
      <CompensationBanner stats={stats} />
    </div>
  )
}

function CompensationBanner({ stats }) {
  const comp = stats?.compensation
  if (!comp) return null
  const { wiwi, winf, math_informatik, all_groups_ok } = comp

  const groups = [
    { label: 'WiWi (5 Module)', data: wiwi },
    { label: 'WiInf (4 Module)', data: winf },
    { label: 'Mathe + Informatik (5 Module)', data: math_informatik },
  ]

  return (
    <div className="mt-4 rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${all_groups_ok ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
        <span className="text-xs font-semibold" style={{ color: 'var(--textsec)' }}>
          § 24 Abs. 2 – Kompensationsregel
        </span>
      </div>
      <div className="space-y-1">
        {groups.map(g => (
          <div key={g.label} className="flex items-start gap-2 text-xs">
            <span style={{ color: g.data.ok ? '#10B981' : '#EF4444' }}>{g.data.ok ? '✓' : '✗'}</span>
            <div>
              <span style={{ color: 'var(--textsec)' }}>{g.label}: </span>
              <span style={{ color: g.data.ok ? '#10B981' : 'var(--textsec)' }}>{g.data.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--panel)' }} />
        ))}
      </div>
    </div>
  )
}
