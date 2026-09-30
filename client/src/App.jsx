import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Leads from './pages/Leads.jsx'
import Pipeline from './pages/Pipeline.jsx'
import Visits from './pages/Visits.jsx'
import Orders from './pages/Orders.jsx'
import Targets from './pages/Targets.jsx'
import Reports from './pages/Reports.jsx'
import Team from './pages/Team.jsx'

// Only logged-in users can see the app pages
function Protected() {
  const { user, loading } = useAuth()
  if (loading) return <div className="center">Loading…</div>
  return user ? <Layout /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="visits" element={<Visits />} />
        <Route path="orders" element={<Orders />} />
        <Route path="targets" element={<Targets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="team" element={<Team />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
