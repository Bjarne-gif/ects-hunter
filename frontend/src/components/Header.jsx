import { useState, useRef, useEffect } from 'react'
import useAppStore from '../store/appStore'

export default function Header({ onOpenDbModal }) {
  const { databases, activeDb, isLocked, openDb, closeDb, fetchDatabases } = useAppStore()
  const [open, setOpen] = useState(false)
  const [unlockModal, setUnlockModal] = useState(null) // name of db to unlock
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelectDb = (name) => {
    setOpen(false)
    if (name === activeDb) return
    setUnlockModal(name)
    setPassword('')
    setErr('')
  }

  const handleUnlock = async (e) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setErr('')
    try {
      await openDb(unlockModal, password)
      setUnlockModal(null)
    } catch (ex) {
      setErr(ex?.response?.data?.detail || 'Falsches Passwort')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b flex items-center justify-between px-6 h-14"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm" style={{ color: 'var(--textpri)' }}>FernUni Tracker</span>
            <span className="ml-2 text-xs font-mono" style={{ color: 'var(--muted)' }}>BSc WiInf</span>
          </div>
        </div>

        {/* DB Selector (top-right) */}
        <div className="flex items-center gap-3" ref={ref}>
          <div className="relative">
            <button
              onClick={() => { setOpen(v => !v); fetchDatabases() }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all hover:border-accent"
              style={{ borderColor: 'var(--border)', background: 'var(--panel)', color: 'var(--textsec)' }}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isLocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="max-w-[140px] truncate" style={{ color: 'var(--textpri)' }}>
                {activeDb || 'Keine DB'}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                   className={`transition-transform ${open ? 'rotate-180' : ''}`}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border shadow-2xl z-50 overflow-hidden fade-in"
                   style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
                <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--textsec)' }}>
                    Datenbanken
                  </p>
                </div>

                <div className="max-h-56 overflow-y-auto">
                  {databases.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-center" style={{ color: 'var(--muted)' }}>
                      Noch keine Datenbanken vorhanden
                    </div>
                  ) : databases.map(db => (
                    <button
                      key={db.name}
                      onClick={() => handleSelectDb(db.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${db.is_active ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--textpri)' }}>{db.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{db.size_kb} KB</p>
                      </div>
                      {db.is_active && (
                        <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: '#10B98120', color: '#10B981' }}>aktiv</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => { setOpen(false); onOpenDbModal() }}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors hover:bg-white/5 flex items-center gap-2"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>+</span> Neue Datenbank erstellen
                  </button>
                  {!isLocked && (
                    <button
                      onClick={() => { setOpen(false); closeDb() }}
                      className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors hover:bg-white/5 flex items-center gap-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      <span>⎋</span> Datenbank schließen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Unlock modal */}
      {unlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
             style={{ background: '#00000080', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl border p-6 fade-in"
               style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--textpri)' }}>
              Datenbank öffnen
            </h2>
            <p className="text-sm mb-4 font-mono" style={{ color: 'var(--textsec)' }}>{unlockModal}</p>

            <form onSubmit={handleUnlock} className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              {err && <p className="text-xs" style={{ color: 'var(--danger)' }}>{err}</p>}
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setUnlockModal(null)}
                        className="flex-1 py-2 rounded-lg text-sm border transition-colors hover:border-border"
                        style={{ borderColor: 'var(--border)', color: 'var(--textsec)' }}>
                  Abbrechen
                </button>
                <button type="submit" disabled={loading}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'var(--accent)' }}>
                  {loading ? 'Öffne…' : 'Öffnen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
