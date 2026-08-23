import { useState, useEffect } from 'react'
import useAppStore from '../store/appStore'
import { QRCodeSVG } from 'qrcode.react'

export default function StudentSettings() {
  const { studentInfo, updateInfo } = useAppStore()
  const [form, setForm] = useState({ full_name: '', matrikelnr: '', enroll_sem: '', info_set: 'new' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (studentInfo) setForm({ ...form, ...studentInfo })
  }, [studentInfo])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateInfo(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (ex) {
      console.error(ex)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      {/* Profile */}
      <div className="rounded-2xl border p-6"
           style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--textpri)' }}>
          Studierendenprofil
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" name="full_name" value={form.full_name}
                 placeholder="Vollständiger Name" onChange={handleChange} />
          <Field label="Matrikelnummer" name="matrikelnr" value={form.matrikelnr}
                 placeholder="Ihre Matrikelnummer" onChange={handleChange} />
          <Field label="Einschreibungssemester" name="enroll_sem" value={form.enroll_sem}
                 placeholder="z.B. WiSe 22/23" onChange={handleChange} />

          <div>
            <label className="label-sm">Informatik-Modulset</label>
            <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
              Welches Set haben Sie gewählt? (beeinflusst den Modulkatalog)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: 'new', l: 'Neu (ab WiSe 25/26)', sub: '65001 + 65002 + 63017', badge: 'Aktuell' },
                { v: 'old', l: 'Alt (bis SoSe 25)',   sub: '63016 + 63511 + 63017', badge: 'Legacy' },
              ].map(o => (
                <button key={o.v} type="button"
                        onClick={() => setForm(f => ({ ...f, info_set: o.v }))}
                        className="p-3 rounded-xl border text-left transition-all"
                        style={form.info_set === o.v
                          ? { borderColor: 'var(--accent)', background: '#6366F115' }
                          : { borderColor: 'var(--border)', background: 'var(--panel)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--textpri)' }}>{o.l}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: '#6366F120', color: 'var(--textsec)' }}>{o.badge}</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 items-center pt-1">
            <button type="submit" disabled={loading}
                    className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--accent)' }}>
              {loading ? 'Speichert…' : 'Profil speichern'}
            </button>
            {saved && (
              <span className="text-sm" style={{ color: 'var(--success)' }}>✓ Gespeichert</span>
            )}
          </div>
        </form>
      </div>

      {/* Donation */}
      <DonateSection />
    </div>
  )
}

function Field({ label, name, value, placeholder, onChange }) {
  return (
    <div>
      <label className="label-sm">{label}</label>
      <input name={name} value={value} placeholder={placeholder}
             onChange={onChange} className="mt-1.5" />
    </div>
  )
}

function DonateSection() {
  const XRP_ADDR = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(XRP_ADDR)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border p-6"
         style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--textpri)' }}>
        ☕ Kaffee ausgeben?
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--textsec)' }}>
        Dieses Tool ist kostenlos und wird in meiner Freizeit gepflegt.
        Wenn es dir nützlich ist, freue ich mich über einen freiwilligen Kaffee via XRP (Ripple).
        Kein Druck — jede Nutzung ist willkommen! 🙏
      </p>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="bg-white p-3 rounded-xl flex-shrink-0">
          <QRCodeSVG
            value={`ripple:${XRP_ADDR}`}
            size={148}
            bgColor="#ffffff"
            fgColor="#1A1D27"
            level="M"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2"
             style={{ color: 'var(--textsec)' }}>XRP-Adresse (Ripple)</p>
          <div className="flex gap-2 items-start">
            <code className="flex-1 text-xs p-3 rounded-xl break-all leading-relaxed"
                  style={{ background: 'var(--panel)', color: 'var(--textsec)', border: '1px solid var(--border)' }}>
              {XRP_ADDR}
            </code>
            <button onClick={copy}
                    className="px-3 py-3 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                    style={copied
                      ? { background: '#10B98120', color: '#10B981', border: '1px solid #10B98130' }
                      : { background: 'var(--panel)', color: 'var(--textsec)', border: '1px solid var(--border)' }}>
              {copied ? '✓ Kopiert' : 'Kopieren'}
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
            ⚠ Nur XRP auf dieses Wallet senden — andere Token können verloren gehen.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
            Placeholder-Adresse — wird durch die echte Adresse ersetzt.
          </p>
        </div>
      </div>
    </div>
  )
}
