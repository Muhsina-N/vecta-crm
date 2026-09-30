import { useEffect, useState } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import api, { errMsg } from '../api'
import { STAGES, STAGE_COLORS } from '../constants.js'
import { money } from '../format.js'
import Page from '../components/Page.jsx'
import Avatar from '../components/Avatar.jsx'

export default function Pipeline() {
  const [leads, setLeads] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/leads').then((res) => setLeads(res.data)).catch((e) => setError(errMsg(e)))
  }, [])

  // Move a card right away, then tell the server. Undo if the server says no.
  const move = async (lead, stage) => {
    const before = leads
    setLeads((list) => list.map((l) => (l._id === lead._id ? { ...l, stage } : l)))
    try {
      await api.patch(`/leads/${lead._id}/stage`, { stage })
    } catch (e) {
      setLeads(before)
      setError(errMsg(e))
    }
  }

  return (
    <Page>
      <h1 className="title">Pipeline</h1>
      {error && <p className="error">{error}</p>}

      <LayoutGroup>
        <div className="board">
          {STAGES.map((stage) => {
            const items = leads.filter((l) => l.stage === stage)
            const total = items.reduce((sum, l) => sum + (l.value || 0), 0)
            return (
              <div className="column" key={stage}>
                <header style={{ borderColor: STAGE_COLORS[stage] }}>
                  <strong>{stage}</strong>
                  <span>{items.length} · {money(total)}</span>
                </header>

                {items.map((l) => (
                  <motion.div
                    layout
                    layoutId={l._id}
                    key={l._id}
                    className="pcard"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  >
                    <div className="pcard-head">
                      <Avatar name={l.name} size={30} />
                      <div>
                        <strong>{l.name}</strong>
                        <small>{l.company || '—'}</small>
                      </div>
                    </div>
                    <div className="pcard-foot">
                      <span>{money(l.value)}</span>
                      <select
                        className="mini-select"
                        value={l.stage}
                        onChange={(e) => move(l, e.target.value)}
                        aria-label={`Move ${l.name} to another stage`}
                      >
                        {STAGES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </motion.div>
                ))}

                {items.length === 0 && <p className="muted">Empty</p>}
              </div>
            )
          })}
        </div>
      </LayoutGroup>
    </Page>
  )
}
