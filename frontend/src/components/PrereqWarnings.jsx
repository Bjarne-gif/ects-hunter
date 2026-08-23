import useAppStore from '../store/appStore'

export default function PrereqWarnings() {
  const { stats } = useAppStore()
  if (!stats?.prereqs) return null

  const { prereqs } = stats
  const items = [
    {
      label: 'Zulassung zum Seminar',
      req: '9 Pflichtmodule bestanden',
      ...prereqs.seminar,
    },
    {
      label: 'Zulassung zur Bachelorarbeit',
      req: '9 Pflichtmodule + Seminar bestanden',
      ...prereqs.thesis,
    },
    {
      label: 'Wahlpflicht Informatik',
      req: 'Alle 3 Informatik-Pflichtmodule bestanden',
      ...prereqs.elective_informatik,
    },
  ]

  const unmet = items.filter(i => !i.met)

  if (unmet.length === 0) return null

  return (
    <div className="rounded-2xl border p-4 space-y-2"
         style={{ background: '#F59E0B08', borderColor: '#F59E0B30' }}>
      <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#F59E0B' }}>
        ⚠ Voraussetzungen noch nicht erfüllt
      </h3>
      {unmet.map(item => (
        <div key={item.label} className="flex items-start gap-2 text-xs">
          <span style={{ color: '#F59E0B' }}>›</span>
          <div>
            <span className="font-semibold" style={{ color: 'var(--textpri)' }}>{item.label}</span>
            <span className="ml-2" style={{ color: 'var(--textsec)' }}>({item.req})</span>
            <p style={{ color: 'var(--muted)' }}>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
