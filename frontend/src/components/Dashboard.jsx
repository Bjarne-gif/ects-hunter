import { useEffect, useState } from 'react'
import useAppStore from '../store/appStore'
import ECTSRing from './ECTSRing'
import StatsPanel from './StatsPanel'
import ModuleSection from './ModuleSection'
import PrognosisPanel from './PrognosisPanel'
import StudentSettings from './StudentSettings'
import PrereqWarnings from './PrereqWarnings'

const TABS = [
  { id: 'overview',  label: 'Übersicht' },
  { id: 'modules',   label: 'Module' },
  { id: 'prognosis', label: 'Prognose' },
  { id: 'settings',  label: 'Einstellungen' },
]

export default function Dashboard() {
  const { loadAll, loading, catalog, stats } = useAppStore()
  const [tab, setTab] = useState('overview')

  useEffect(() => { loadAll() }, [])

  if (loading && !catalog) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full spin"
             style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 fade-in">
      {/* Tab nav */}
      <nav className="flex gap-1 p-1 rounded-xl w-fit"
           style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={tab === t.id
              ? { background: 'var(--accent)', color: '#fff' }
              : { color: 'var(--textsec)' }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'modules'   && <ModulesTab />}
      {tab === 'prognosis' && <PrognosisPanel />}
      {tab === 'settings'  && <StudentSettings />}
    </div>
  )
}

function OverviewTab() {
  const { stats } = useAppStore()

  return (
    <div className="space-y-6">
      {/* Top row: ECTS ring + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ECTSRing />
        </div>
        <div className="lg:col-span-2">
          <StatsPanel />
        </div>
      </div>

      {/* Prerequisites & warnings */}
      {stats && <PrereqWarnings />}
    </div>
  )
}

function ModulesTab() {
  const { catalog } = useAppStore()
  if (!catalog) return null

  const { category_order, category_labels, groups } = catalog

  return (
    <div className="space-y-4">
      {category_order
        .filter(cat => groups[cat])
        .map(cat => (
          <ModuleSection
            key={cat}
            category={cat}
            label={category_labels[cat]}
            modules={groups[cat]}
          />
        ))}

      {/* Special: Seminar + Thesis */}
      <SpecialModules />
    </div>
  )
}

function SpecialModules() {
  const { modules, saveModule } = useAppStore()
  const SPECIAL = [
    { key: 'seminar', label: 'Seminar', ects: 10 },
    { key: 'thesis',  label: 'Bachelorarbeit', ects: 10 },
  ]
  return (
    <div className="space-y-4">
      {SPECIAL.map(({ key, label, ects }) => (
        <ModuleSection
          key={key}
          category="special"
          label={label}
          modules={[{ number: key, name: label, ects, category: 'special', is_legacy: false }]}
          isSpecial
        />
      ))}
    </div>
  )
}
