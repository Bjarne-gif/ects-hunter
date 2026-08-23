/**
 * Frontend grade helpers — mirror of backend grade_calc.py
 * Used for live preview before saving.
 */

export const PP_THRESHOLDS = [
  [95, 1.0], [90, 1.3], [85, 1.7], [80, 2.0],
  [75, 2.3], [70, 2.7], [65, 3.0], [60, 3.3],
  [55, 3.7], [50, 4.0], [0, 5.0],
]

export function ppToNote(pp) {
  if (pp == null) return null
  for (const [threshold, note] of PP_THRESHOLDS) {
    if (pp >= threshold) return note
  }
  return 5.0
}

export function noteToLabel(note) {
  if (note == null) return '–'
  if (note <= 1.5) return 'sehr gut'
  if (note <= 2.5) return 'gut'
  if (note <= 3.5) return 'befriedigend'
  if (note <= 4.0) return 'ausreichend'
  return 'nicht ausreichend'
}

export function noteColor(note) {
  if (note == null) return 'text-textsec'
  if (note <= 1.5)  return 'text-emerald-400'
  if (note <= 2.5)  return 'text-green-400'
  if (note <= 3.5)  return 'text-yellow-400'
  if (note <= 4.0)  return 'text-orange-400'
  return 'text-red-400'
}

export function statusColor(status) {
  switch (status) {
    case 'passed':      return 'text-emerald-400'
    case 'enrolled':    return 'text-blue-400'
    case 'failed':      return 'text-red-400'
    case 'not_started': return 'text-textsec'
    default:            return 'text-textsec'
  }
}

export function statusBadge(status) {
  switch (status) {
    case 'passed':      return { label: 'Bestanden', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
    case 'enrolled':    return { label: 'Belegt',    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' }
    case 'failed':      return { label: 'Nicht best.', cls: 'bg-red-500/15 text-red-400 border-red-500/30' }
    default:            return { label: 'Offen',     cls: 'bg-surface text-textsec border-border' }
  }
}

export function formatNote(note) {
  if (note == null) return '–'
  return note.toFixed(1)
}

export function formatPP(pp) {
  if (pp == null) return '–'
  return `${pp.toFixed(0)} PP`
}
