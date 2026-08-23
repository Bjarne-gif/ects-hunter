import { useEffect, useState } from 'react'
import useAppStore from './store/appStore'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import DatabaseModal from './components/DatabaseModal'
import ErrorBanner from './components/ErrorBanner'

export default function App() {
  const { fetchDatabases, isLocked, error, clearError } = useAppStore()
  const [showDbModal, setShowDbModal] = useState(false)

  useEffect(() => { fetchDatabases() }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header onOpenDbModal={() => setShowDbModal(true)} />

      {error && <ErrorBanner message={error} onClose={clearError} />}

      <main className="flex-1 overflow-auto">
        {isLocked
          ? <LockScreen onOpen={() => setShowDbModal(true)} />
          : <Dashboard />
        }
      </main>

      <AppFooter />

      {showDbModal && <DatabaseModal onClose={() => setShowDbModal(false)} />}
    </div>
  )
}

function LockScreen({ onOpen }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 fade-in px-4">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--textpri)' }}>
          FernUni Tracker
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--textsec)' }}>
          BSc Wirtschaftsinformatik · FernUniversität in Hagen
        </p>
        <p className="mt-4 max-w-sm text-sm" style={{ color: 'var(--textsec)' }}>
          Wählen oder erstellen Sie eine verschlüsselte Datenbank, um mit dem Tracking zu beginnen.
        </p>
      </div>
      <button
        onClick={onOpen}
        className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
      >
        Datenbank öffnen / erstellen
      </button>
    </div>
  )
}

function AppFooter() {
  return (
    <footer className="border-t py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        Inoffizieller Tracker · ohne Gewähr · stets die offiziellen FernUni-Dokumente prüfen
      </p>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        ☕ XRP-Spende in den Einstellungen
      </p>
    </footer>
  )
}
