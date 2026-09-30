import { useEffect, useState } from 'react'
import api, { errMsg } from '../api'
import { VISIT_STATUSES } from '../constants.js'
import { money } from '../format.js'
import Page from '../components/Page.jsx'

const today = () => new Date().toISOString().slice(0, 10)

export default function Visits() {
  const [date, setDate] = useState(today())
  const [visits, setVisits] = useState([])
  const [leads, setLeads] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    lead: '', status: 'Visited', orderTaken: false, orderAmount: 0, followUpDate: '', notes: '',
  })

  useEffect(() => {
    api.get('/leads').then((res) => setLeads(res.data)).catch((e) => setError(errMsg(e)))
  }, [])

  const load = () => {
    api.get('/visits', { params: { date } }).then((res) => setVisits(res.data)).catch((e) => setError(errMsg(e)))
  }
  useEffect(load, [date])

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: val }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.lead) return setError('Choose a customer/outlet')
    setBusy(true)
    setError('')
    try {
      await api.post('/visits', { ...form, date, orderAmount: Number(form.orderAmount) || 0 })
      setForm({ lead: '', status: 'Visited', orderTaken: false, orderAmount: 0, followUpDate: '', notes: '' })
      load()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (visit) => {
    if (!window.confirm('Delete this visit?')) return
    try {
      await api.delete(`/visits/${visit._id}`)
      setVisits((list) => list.filter((v) => v._id !== visit._id))
    } catch (err) {
      setError(errMsg(err))
    }
  }

  const visitedCount = visits.length
  const ordersCount = visits.filter((v) => v.orderTaken).length

  return (
    <Page>
      <div className="row-between">
        <h1 className="title">Customer visits</h1>
        <input className="input" style={{ width: 180 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="stats stats-2">
        <div className="card stat"><span className="stat-label">Visits this day</span><strong className="stat-value">{visitedCount}</strong></div>
        <div className="card stat"><span className="stat-label">Orders taken on visit</span><strong className="stat-value">{ordersCount}</strong></div>
      </div>

      <div className="card">
        <h3>Log a visit</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit} className="form-grid">
          <label className="full">
            Customer / outlet *
            <select className="input" value={form.lead} onChange={set('lead')}>
              <option value="">Select…</option>
              {leads.map((l) => <option key={l._id} value={l._id}>{l.name}{l.area ? ` — ${l.area}` : ''}</option>)}
            </select>
          </label>
          <label>
            Status
            <select className="input" value={form.status} onChange={set('status')}>
              {VISIT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>
            Follow-up date
            <input className="input" type="date" value={form.followUpDate} onChange={set('followUpDate')} />
          </label>
          <label className="check">
            <input type="checkbox" checked={form.orderTaken} onChange={set('orderTaken')} />
            Order taken on this visit
          </label>
          {form.orderTaken && (
            <label>
              Order amount (AED)
              <input className="input" type="number" min="0" value={form.orderAmount} onChange={set('orderAmount')} />
            </label>
          )}
          <label className="full">
            Notes
            <input className="input" value={form.notes} onChange={set('notes')} />
          </label>
          <div className="actions full">
            <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Log visit'}</button>
          </div>
        </form>
      </div>

      <div className="card table-wrap">
        <h3>Visits on {date}</h3>
        <table className="table">
          <thead>
            <tr><th>Outlet</th><th>Status</th><th>Order</th><th>Follow-up</th><th /></tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v._id}>
                <td><strong>{v.lead?.name || '—'}</strong><small>{v.lead?.area || ''}</small></td>
                <td>{v.status}</td>
                <td>{v.orderTaken ? money(v.orderAmount) : '—'}</td>
                <td>{v.followUpDate ? v.followUpDate.slice(0, 10) : '—'}</td>
                <td><button className="btn danger small" onClick={() => remove(v)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {visits.length === 0 && <p className="muted pad">No visits logged for this date.</p>}
      </div>
    </Page>
  )
}
