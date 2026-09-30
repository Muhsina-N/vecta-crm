import { useEffect, useState } from 'react'
import api, { errMsg } from '../api'
import { money } from '../format.js'
import Page from '../components/Page.jsx'

const currentMonth = () => new Date().toISOString().slice(0, 7)

export default function Targets() {
  const [month, setMonth] = useState(currentMonth())
  const [form, setForm] = useState({ monthlyTarget: 0, dailyTarget: 0, workingDays: 26 })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/targets/${month}`).then((res) => {
      const { monthlyTarget, dailyTarget, workingDays } = res.data
      setForm({ monthlyTarget, dailyTarget, workingDays })
    }).catch((e) => setError(errMsg(e)))
  }, [month])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      await api.put(`/targets/${month}`, form)
      setSaved(true)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const suggestedDaily = form.workingDays > 0
    ? Math.round((Number(form.monthlyTarget) || 0) / Number(form.workingDays))
    : 0

  return (
    <Page>
      <h1 className="title">Sales target</h1>

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={submit} className="form-grid">
          <label className="full">
            Month
            <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
          <label className="full">
            Monthly target (AED)
            <input className="input" type="number" min="0" value={form.monthlyTarget} onChange={set('monthlyTarget')} />
          </label>
          <label>
            Working days
            <input className="input" type="number" min="0" value={form.workingDays} onChange={set('workingDays')} />
          </label>
          <label>
            Daily target (AED)
            <input className="input" type="number" min="0" value={form.dailyTarget} onChange={set('dailyTarget')} />
          </label>
          <p className="muted full" style={{ margin: 0 }}>
            Suggested daily target based on the monthly figure: {money(suggestedDaily)}. The daily target above is
            not calculated automatically — set it yourself and adjust any time.
          </p>
          {error && <p className="error full">{error}</p>}
          {saved && <p className="full" style={{ color: '#059669', margin: 0 }}>Target saved.</p>}
          <div className="actions full">
            <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save target'}</button>
          </div>
        </form>
      </div>
    </Page>
  )
}
