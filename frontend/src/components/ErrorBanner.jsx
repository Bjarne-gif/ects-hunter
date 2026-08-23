export default function ErrorBanner({ message, onClose }) {
  return (
    <div className="mx-4 mt-3 px-4 py-3 rounded-xl text-sm flex items-start gap-3 fade-in"
         style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#FCA5A5' }}>
      <span className="text-red-400 mt-0.5">⚠</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-red-400 hover:text-red-300 flex-shrink-0">✕</button>
    </div>
  )
}
