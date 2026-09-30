import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <Logo size={30} /> Vecta CRM
        </div>
        <nav className="nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/leads">Customers</NavLink>
          <NavLink to="/pipeline">Pipeline</NavLink>
          <NavLink to="/visits">Visits</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/targets">Target</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/team">Team</NavLink>
        </nav>
        <div className="user">
          <span className="user-name">{user.name}</span>
          <button className="btn ghost small" onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
