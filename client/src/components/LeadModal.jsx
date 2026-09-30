import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api, { errMsg } from '../api'
import { SOURCES, STAGES, OUTLET_TYPES, CATEGORIES } from '../constants.js'
import { shortDate } from '../format.js'

// Add a new lead, or edit an existing one (with notes)
export default function LeadModal({ lead, onSaved, onChanged, onClose }) {
  const editing = Boolean(lead)
  const [form, setForm] = useState({
    name: lead?.name || '',
    company: lead?.company || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || 'Website',
    stage: lead?.stage || 'New',
    value: lead?.value ?? 0,
    contactPerson: lead?.contactPerson || '',
    area: lead?.area || '',
    outletType: lead?.outletType || '',
    categories: lead?.categories || [],
    nextFollowUpDate: lead?.nextFollowUpDate ? lead.nextFollowUpDate.slice(0, 10) : '',
    isActive: lead?.isActive ?? true,
  })
  const [notes, setNotes] = useState(lead?.notes || [])
  const [noteText, setNoteText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Close with the Escape key
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const toggleCategory = (cat) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = { ...form, value: Number(form.value) || 0 }
      const res = editing
        ? await api.put(`/leads/${lead._id}`, payload)
        : await api.post('/leads', payload)
      onSaved(res.data)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const addNote = async () => {
    if (!noteText.trim()) return
    try {
      const res = await api.post(`/leads/${lead._id}/notes`, { text: noteText })
      setNotes(res.data.notes)
      setNoteText('')
      onChanged(res.data)
    } catch (err) {
      setError(errMsg(err))
    }
  }

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{editing ? 'Edit lead' : 'Add lead'}</h2>

        <form onSubmit={submit} className="form-grid">
          <label className="full">
            Name *
            <input className="input" value={form.name} onChange={set('name')} autoFocus />
          </label>
          <label>
            Company
            <input className="input" value={form.company} onChange={set('company')} />
          </label>
          <label>
            Value (AED)
            <input className="input" type="number" min="0" value={form.value} onChange={set('value')} />
          </label>
          <label>
            Email
            <input className="input" type="email" value={form.email} onChange={set('email')} />
          </label>
          <label>
            Phone
            <input className="input" value={form.phone} onChange={set('phone')} />
          </label>
          <label>
            Source
            <select className="input" value={form.source} onChange={set('source')}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>
            Stage
            <select className="input" value={form.stage} onChange={set('stage')}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>
            Contact person
            <input className="input" value={form.contactPerson} onChange={set('contactPerson')} />
          </label>
          <label>
            Area / location
            <input className="input" value={form.area} onChange={set('area')} />
          </label>
          <label>
            Outlet type
            <select className="input" value={form.outletType} onChange={set('outletType')}>
              <option value="">Not set</option>
              {OUTLET_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Next follow-up date
            <input className="input" type="date" value={form.nextFollowUpDate} onChange={set('nextFollowUpDate')} />
          </label>
          <label className="full">
            Product categories
            <div className="check-row">
              {CATEGORIES.map((c) => (
                <label key={c} className="check">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(c)}
                    onChange={() => toggleCategory(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </label>
          <label className="check full">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active outlet
          </label>

          {error && <p className="error full">{error}</p>}

          <div className="actions full">
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Add lead'}
            </button>
          </div>
        </form>

        {editing && (
          <div className="notes">
            <h3>Notes</h3>
            <div className="note-add">
              <input
                className="input"
                placeholder="Write a note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNote())}
              />
              <button type="button" className="btn small" onClick={addNote}>Add</button>
            </div>
            {notes.length === 0 && <p className="muted">No notes yet.</p>}
            <ul>
              {notes.map((n) => (
                <li key={n._id}>
                  <span>{n.text}</span>
                  <small>{shortDate(n.createdAt)}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
