import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import api, { errMsg } from '../api'
import Page from '../components/Page.jsx'
import Avatar from '../components/Avatar.jsx'

export default function Team() {
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', area: '' })

  const load = () => {
    api.get('/employees').then((res) => setEmployees(res.data)).catch((e) => setError(errMsg(e)))
  }
  useEffect(() => { load() }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Name is required')
    setBusy(true)
    setError('')
    try {
      await api.post('/employees', form)
      setForm({ name: '', role: '', email: '', phone: '', area: '' })
      load()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (emp) => {
    if (!window.confirm(`Remove ${emp.name} from the team?`)) return
    try {
      await api.delete(`/employees/${emp._id}`)
      setEmployees((list) => list.filter((e) => e._id !== emp._id))
    } catch (err) {
      setError(errMsg(err))
    }
  }

  return (
    <Page>
      <h1 className="title">Team</h1>

      <div className="card">
        <h3>Add a team member</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit} className="form-grid">
          <label>
            Name *
            <input className="input" value={form.name} onChange={set('name')} />
          </label>
          <label>
            Role
            <input className="input" placeholder="Sales Executive" value={form.role} onChange={set('role')} />
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
            Area
            <input className="input" value={form.area} onChange={set('area')} />
          </label>
          <div className="actions full">
            <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Add member'}</button>
          </div>
        </form>
      </div>

      <div className="team-grid">
        <AnimatePresence>
          {employees.map((emp) => (
            <motion.div
              key={emp._id}
              className="card team-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar name={emp.name} size={56} />
              <div className="team-info">
                <strong>{emp.name}</strong>
                <small>{emp.role || 'Team member'}</small>
                <small>{emp.area || '—'}</small>
              </div>
              <button className="btn danger small" onClick={() => remove(emp)}>Remove</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {employees.length === 0 && <p className="muted">No team members yet.</p>}
    </Page>
  )
}