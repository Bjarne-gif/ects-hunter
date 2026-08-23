import useAppStore from '../store/appStore'

const SIZE = 200
const CX = SIZE / 2
const CY = SIZE / 2
const R_OUTER = 82
const R_INNER = 62
const STROKE = 14

function arc(cx, cy, r, startDeg, endDeg) {
  const toRad = d => (d - 90) * (Math.PI / 180)
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

export default function ECTSRing() {
  const { stats } = useAppStore()

  const ects = stats?.ects ?? { total: 180, done: 0, in_progress: 0, remaining: 180 }
  const pct = ects.total > 0 ? (ects.done / ects.total) * 360 : 0
  const pctProg = ects.total > 0 ? (ects.in_progress / ects.total) * 360 : 0

  const doneEnd   = pct
  const progEnd   = pct + pctProg
  const hasArc    = doneEnd > 0.5 || progEnd > 0.5

  return (
    <div className="rounded-2xl border p-5 flex flex-col items-center"
         style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 self-start"
          style={{ color: 'var(--textsec)' }}>ECTS-Fortschritt</h3>

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Track */}
          <circle cx={CX} cy={CY} r={R_OUTER} fill="none"
                  stroke="#2A2D3E" strokeWidth={STROKE} strokeLinecap="round"/>
          {/* Done arc */}
          {doneEnd > 0.5 && (
            <path d={arc(CX, CY, R_OUTER, 0, Math.min(doneEnd, 359.9))}
                  fill="none" stroke="#10B981" strokeWidth={STROKE} strokeLinecap="round"/>
          )}
          {/* In-progress arc */}
          {pctProg > 0.5 && (
            <path d={arc(CX, CY, R_OUTER, doneEnd, Math.min(progEnd, 359.9))}
                  fill="none" stroke="#6366F1" strokeWidth={STROKE} strokeLinecap="round"
                  strokeDasharray="4 2"/>
          )}
          {/* Inner decorative */}
          <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#2A2D3E" strokeWidth={1}/>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono" style={{ color: 'var(--textpri)' }}>
            {ects.done}
          </span>
          <span className="text-xs" style={{ color: 'var(--textsec)' }}>/ {ects.total} ECTS</span>
          <span className="text-lg font-semibold mt-1"
                style={{ color: ects.done > 0 ? '#10B981' : 'var(--muted)' }}>
            {ects.percent_done ?? 0}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs">
        <LegendItem color="#10B981" label="Bestanden" value={`${ects.done} ECTS`} />
        <LegendItem color="#6366F1" label="Belegt" value={`${ects.in_progress} ECTS`} />
        <LegendItem color="#2A2D3E" label="Offen" value={`${ects.remaining} ECTS`} />
      </div>
    </div>
  )
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
      <div>
        <div style={{ color: 'var(--textsec)' }}>{label}</div>
        <div className="font-mono font-medium" style={{ color: 'var(--textpri)' }}>{value}</div>
      </div>
    </div>
  )
}
