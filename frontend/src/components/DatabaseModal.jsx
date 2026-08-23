import { useState } from 'react'
import useAppStore from '../store/appStore'

export default function DatabaseModal({ onClose }) {
  const { createDb } = useAppStore()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!name.trim()) return 'Bitte einen Datenbanknamen eingeben.'
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) return 'Name darf nur Buchstaben, Zahlen, _ und - enthalten.'
    if (password.length < 4) return 'Passwort muss mindestens 4 Zeichen lang sein.'
    if (password !== confirm) return 'Passwörter stimmen nicht überein.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const error = validate()
    if (error) { setErr(error); return }
    setLoading(true)
    setErr('')
    try {
      await createDb(name.trim(), password)
      onClose()
    } catch (ex) {
      setErr(ex?.response?.data?.detail || ex.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{ background: '#00000080', backdropFilter: 'blur(4px)' }}
         onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md mx-4 rounded-2xl border p-6 fade-in"
           style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--textpri)' }}>
          Neue Datenbank erstellen
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--textsec)' }}>
          Die Datei wird AES-256-GCM verschlüsselt im <code className="font-mono text-xs">/data</code>-Verzeichnis gespeichert.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                   style={{ color: 'var(--textsec)' }}>Datenbankname</label>
            <input
              type="text"
              placeholder="z.B. mein-studium-2024"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Nur Buchstaben, Zahlen, Bindestriche und Unterstriche
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                   style={{ color: 'var(--textsec)' }}>Passwort</label>
            <input
              type="password"
              placeholder="Starkes Passwort wählen"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                   style={{ color: 'var(--textsec)' }}>Passwort bestätigen</label>
            <input
              type="password"
              placeholder="Passwort wiederholen"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          {err && (
            <div className="px-3 py-2 rounded-lg text-sm"
                 style={{ background: '#EF444415', color: 'var(--danger)', border: '1px solid #EF444430' }}>
              {err}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--textsec)' }}>
              Abbrechen
            </button>
            <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              {loading ? 'Erstelle…' : 'Erstellen & Öffnen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
