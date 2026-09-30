import { useEffect, useState } from 'react'
import api, { errMsg } from '../api'
import { CATEGORIES, ORDER_STATUSES } from '../constants.js'
import { money, shortDate } from '../format.js'
import Page from '../components/Page.jsx'

const today = () => new Date().toISOString().slice(0, 10)

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [leads, setLeads] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [filters, setFilters] = useState({ from: '', to: '', customer: '', category: '', status: '' })
  const [form, setForm] = useState({ lead: '', date: today(), amount: '', category: 'Food', status: 'Confirmed', notes: '' })

  useEffect(() => {
    api.get('/leads').then((res) => setLeads(res.data)).catch((e) => setError(errMsg(e)))
  }, [])

  const load = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    api.get('/orders', { params }).then((res) => setOrders(res.data)).catch((e) => setError(errMsg(e)))
  }
  useEffect(load, [filters])

  const setForm_ = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.lead) return setError('Choose a customer/outlet')
    if (form.amount === '' || Number(form.amount) < 0) return setError('Enter a valid amount')
    setBusy(true)
    setError('')
    try {
      await api.post('/orders', { ...form, amount: Number(form.amount) })
      setForm({ lead: '', date: today(), amount: '', category: 'Food', status: 'Confirmed', notes: '' })
      load()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (order) => {
    if (!window.confirm('Delete this order?')) return
    try {
      await api.delete(`/orders/${order._id}`)
      setOrders((list) => list.filter((o) => o._id !== order._id))
    } catch (err) {
      setError(errMsg(err))
    }
  }

  const total = orders.reduce((sum, o) => sum + (o.status === 'Cancelled' ? 0 : o.amount), 0)

  return (
    <Page>
      <h1 className="title">Orders / sales</h1>

      <div className="card">
        <h3>Record an order</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit} className="form-grid">
          <label className="full">
            Customer / outlet *
            <select className="input" value={form.lead} onChange={setForm_('lead')}>
              <option value="">Select…</option>
              {leads.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </label>
          <label>
            Date
            <input className="input" type="date" value={form.date} onChange={setForm_('date')} />
          </label>
          <label>
            Amount (AED) *
            <input className="input" type="number" min="0" value={form.amount} onChange={setForm_('amount')} />
          </label>
          <label>
            Category
            <select className="input" value={form.category} onChange={setForm_('category')}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Status
            <select className="input" value={form.status} onChange={setForm_('status')}>
              {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="full">
            Notes
            <input className="input" value={form.notes} onChange={setForm_('notes')} />
          </label>
          <div className="actions full">
            <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Add order'}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Filter</h3>
        <div className="filters filters-5">
          <input className="input" type="date" value={filters.from} onChange={setFilter('from')} placeholder="From" />
          <input className="input" type="date" value={filters.to} onChange={setFilter('to')} placeholder="To" />
          <select className="input" value={filters.customer} onChange={setFilter('customer')}>
            <option value="">All customers</option>
            {leads.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <select className="input" value={filters.category} onChange={setFilter('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input" value={filters.status} onChange={setFilter('status')}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card table-wrap">
        <div className="row-between"><h3>Orders</h3><strong>{money(total)}</strong></div>
        <table className="table">
          <thead>
            <tr><th>Outlet</th><th>Date</th><th>Category</th><th>Status</th><th className="num">Amount</th><th /></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td><strong>{o.lead?.name || '—'}</strong><small>{o.lead?.area || ''}</small></td>
                <td>{shortDate(o.date)}</td>
                <td>{o.category}</td>
                <td>{o.status}</td>
                <td className="num">{money(o.amount)}</td>
                <td><button className="btn danger small" onClick={() => remove(o)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="muted pad">No orders found.</p>}
      </div>
    </Page>
  )
}
