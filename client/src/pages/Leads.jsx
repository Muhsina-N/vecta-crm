import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import api, { errMsg } from '../api'
import { STAGES } from '../constants.js'
import { money } from '../format.js'
import Page from '../components/Page.jsx'
import StageBadge from '../components/StageBadge.jsx'
import Avatar from '../components/Avatar.jsx'
import LeadModal from '../components/LeadModal.jsx'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // null = closed, {} = add, {lead} = edit

  const load = useCallback(async () => {
    try {
      const res = await api.get('/leads', { params: { search, stage } })
      setLeads(res.data)
      setError('')
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [search, stage])

  // Wait 300ms after typing before asking the server
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  // Replace a lead in the list, or add it at the top
  const upsert = (lead) =>
    setLeads((list) =>
      list.some((l) => l._id === lead._id)
        ? list.map((l) => (l._id === lead._id ? lead : l))
        : [lead, ...list]
    )

  const remove = async (lead) => {
    if (!window.confirm(`Delete ${lead.name}?`)) return
    try {
      await api.delete(`/leads/${lead._id}`)
      setLeads((list) => list.filter((l) => l._id !== lead._id))
    } catch (e) {
      setError(errMsg(e))
    }
  }

  return (
    <Page>
      <div className="row-between">
        <h1 className="title">Leads</h1>
        <button className="btn primary" onClick={() => setModal({})}>+ Add lead</button>
      </div>

      <div className="filters">
        <input
          className="input"
          placeholder="Search name, company or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Contact</th>
              <th>Stage</th>
              <th className="num">Value</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {leads.map((l) => (
                <motion.tr
                  key={l._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <td className="cell-avatar">
                    <Avatar name={l.name} />
                    <div>
                      <strong>{l.name}</strong>
                      <small>{l.company || '—'}</small>
                    </div>
                  </td>
                  <td>
                    <span>{l.email || '—'}</span>
                    <small>{l.phone || l.source}</small>
                  </td>
                  <td><StageBadge stage={l.stage} /></td>
                  <td className="num">{money(l.value)}</td>
                  <td className="row-actions">
                    <button className="btn ghost small" onClick={() => setModal({ lead: l })}>Edit</button>
                    <button className="btn danger small" onClick={() => remove(l)}>Delete</button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {!loading && leads.length === 0 && <p className="muted pad">No leads found.</p>}
      </div>

      <AnimatePresence>
        {modal && (
          <LeadModal
            key={modal.lead?._id || 'new'}
            lead={modal.lead}
            onChanged={upsert}
            onSaved={(lead) => {
              upsert(lead)
              setModal(null)
            }}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </Page>
  )
}
