import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Cell, PieChart, Pie,
} from 'recharts'
import api, { errMsg } from '../api'
import { STAGE_COLORS, CATEGORY_COLORS } from '../constants.js'
import { money, shortDate } from '../format.js'
import Page from '../components/Page.jsx'
import CountUp from '../components/CountUp.jsx'
import StageBadge from '../components/StageBadge.jsx'
import DashboardHero3D from '../components/DashboardHero3D.jsx'

const tooltipStyle = { background: '#ffffff', border: '1px solid #dde3ee', borderRadius: 8, color: '#0f1b2d' }

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/dashboard/summary'), api.get('/leads/stats'), api.get('/leads')])
      .then(([sum, s, l]) => {
        setSummary(sum.data)
        setStats(s.data)
        setRecent(l.data.slice(0, 5))
      })
      .catch((e) => setError(errMsg(e)))
  }, [])

  if (error) return <p className="error">{error}</p>
  if (!stats || !summary) return <div className="center">Loading…</div>

  // ---- existing pipeline numbers (unchanged) ----
  const get = (stage) => stats.byStage.find((s) => s.stage === stage) || { count: 0, value: 0 }
  const won = get('Won')
  const lost = get('Lost')
  const openValue = stats.byStage
    .filter((s) => s.stage !== 'Won' && s.stage !== 'Lost')
    .reduce((sum, s) => sum + s.value, 0)
  const closed = won.count + lost.count
  const winRate = closed ? Math.round((won.count / closed) * 100) : 0
  const pieData = stats.byStage.filter((s) => s.value > 0)

  const pipelineCards = [
    { label: 'Open pipeline', value: openValue, format: money },
    { label: 'Won value', value: won.value, format: money },
    { label: 'Win rate', value: winRate, format: (n) => `${n}%` },
  ]

  // ---- new FMCG sales summary ----
  const salesCards = [
    { label: 'Total customers', value: summary.totalCustomers },
    { label: "Today's sales", value: summary.today.sales, format: money },
    { label: "Today's target", value: summary.today.target, format: money },
    { label: 'Orders today', value: summary.today.orders },
    { label: 'Visits today', value: summary.today.visits },
    { label: 'Monthly sales', value: summary.month.sales, format: money },
    { label: 'Monthly target', value: summary.month.target, format: money },
    { label: 'Remaining target', value: summary.month.remaining, format: money },
    { label: 'Achievement', value: summary.month.achievementPct, format: (n) => `${n}%` },
  ]

  const dayLabel = (iso) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short' })
  const trend = summary.last7Days.map((d) => ({ ...d, target: summary.today.target, label: dayLabel(d.date) }))

  return (
    <Page>
      <h1 className="title">Dashboard</h1>

      <div className="hero-banner card">
        <div className="hero-banner-3d"><DashboardHero3D /></div>
        <div className="hero-banner-text">
          <span className="section-label" style={{ margin: 0 }}>This month</span>
          <h2>{money(summary.month.sales)} <span className="muted" style={{ fontSize: '0.55em', fontWeight: 500 }}>of {money(summary.month.target)}</span></h2>
          <p className="muted" style={{ margin: 0 }}>{summary.month.achievementPct}% of monthly target achieved</p>
        </div>
      </div>

      <h3 className="section-label">Today &amp; this month</h3>
      <div className="stats">
        {salesCards.map((c) => (
          <div className="card stat" key={c.label}>
            <span className="stat-label">{c.label}</span>
            <strong className="stat-value">
              <CountUp value={c.value} format={c.format} />
            </strong>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="card">
          <h3>Daily sales vs daily target (last 7 days)</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="total" name="Sales" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#2563eb" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Sales by category (this month)</h3>
          <div className="chart-box">
            {summary.byCategory.length === 0 ? (
              <p className="muted">Record orders to see this chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.byCategory} dataKey="total" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {summary.byCategory.map((c) => (
                      <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Monthly target vs achieved</h3>
        <div className="chart-box" style={{ height: 90 }}>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(summary.month.achievementPct, 100)}%` }}
            />
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            {money(summary.month.sales)} of {money(summary.month.target)} target ({summary.month.achievementPct}%),
            working days: {summary.month.workingDays}
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Top outlets by sales (this month)</h3>
        {summary.byOutlet.length === 0 && <p className="muted">No orders recorded yet.</p>}
        <ul className="recent">
          {summary.byOutlet.map((o) => (
            <li key={o.name}>
              <div><strong>{o.name}</strong></div>
              <span>{money(o.total)}</span>
            </li>
          ))}
        </ul>
      </div>

      <h3 className="section-label">Sales pipeline</h3>
      <div className="stats">
        {pipelineCards.map((c) => (
          <div className="card stat" key={c.label}>
            <span className="stat-label">{c.label}</span>
            <strong className="stat-value">
              <CountUp value={c.value} format={c.format} />
            </strong>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="card">
          <h3>Leads by stage</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byStage}>
                <XAxis dataKey="stage" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: 'rgba(37,99,235,0.06)' }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.byStage.map((s) => (
                    <Cell key={s.stage} fill={STAGE_COLORS[s.stage]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Value by stage</h3>
          <div className="chart-box">
            {pieData.length === 0 ? (
              <p className="muted">Add leads with a value to see this chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="stage" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {pieData.map((s) => (
                      <Cell key={s.stage} fill={STAGE_COLORS[s.stage]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => money(v)}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Recent leads</h3>
        {recent.length === 0 && <p className="muted">No leads yet. Add your first one on the Leads page.</p>}
        <ul className="recent">
          {recent.map((l) => (
            <li key={l._id}>
              <div>
                <strong>{l.name}</strong>
                <small>{l.company || '—'} · {shortDate(l.createdAt)}</small>
              </div>
              <StageBadge stage={l.stage} />
            </li>
          ))}
        </ul>
      </div>
    </Page>
  )
}
