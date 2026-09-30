import { useEffect, useState } from 'react'
import api, { errMsg } from '../api'
import { CATEGORIES, ORDER_STATUSES } from '../constants.js'
import { money, shortDate } from '../format.js'
import Page from '../components/Page.jsx'

export default function Reports() {
  const [leads, setLeads] = useState([])
  const [filters, setFilters] = useState({ from: '', to: '', customer: '', category: '', status: '' })
  const [data, setData] = useState({ orders: [], summary: { totalSales: 0, orderCount: 0, customersVisited: 0, uniqueCustomersOrdered: 0 } })
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/leads').then((res) => setLeads(res.data)).catch((e) => setError(errMsg(e)))
  }, [])

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    api.get('/reports', { params }).then((res) => setData(res.data)).catch((e) => setError(errMsg(e)))
  }, [filters])

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))
  const { summary, orders } = data

  return (
    <Page>
      <h1 className="title">Sales report</h1>

      <div className="card">
        <div className="filters filters-5">
          <input className="input" type="date" value={filters.from} onChange={setFilter('from')} />
          <input className="input" type="date" value={filters.to} onChange={setFilter('to')} />
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

      {error && <p className="error">{error}</p>}

      <div className="stats">
        <div className="card stat"><span className="stat-label">Total sales</span><strong className="stat-value">{money(summary.totalSales)}</strong></div>
        <div className="card stat"><span className="stat-label">Orders</span><strong className="stat-value">{summary.orderCount}</strong></div>
        <div className="card stat"><span className="stat-label">Customers visited</span><strong className="stat-value">{summary.customersVisited}</strong></div>
        <div className="card stat"><span className="stat-label">Customers with orders</span><strong className="stat-value">{summary.uniqueCustomersOrdered}</strong></div>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th>Outlet</th><th>Date</th><th>Category</th><th>Status</th><th className="num">Amount</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td><strong>{o.lead?.name || '—'}</strong><small>{o.lead?.area || ''}</small></td>
                <td>{shortDate(o.date)}</td>
                <td>{o.category}</td>
                <td>{o.status}</td>
                <td className="num">{money(o.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="muted pad">No orders match these filters.</p>}
      </div>
    </Page>
  )
}
