import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { errMsg } from '../api'
import Hero3D from '../components/Hero3D.jsx'
import Logo from '../components/Logo.jsx'

export default function Login() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <section className="login-hero">
        <div className="hero3d">
          <Hero3D />
        </div>
        <motion.div
          className="login-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="login-brand"><Logo size={44} /></div>
          <h1>Vecta CRM</h1>
          <p>Track every lead from first contact to a closed deal.</p>
        </motion.div>
      </section>

      <section className="login-panel">
        <motion.form
          onSubmit={submit}
          className="login-form"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>

          {mode === 'register' && (
            <label>
              Name
              <input className="input" value={form.name} onChange={set('name')} />
            </label>
          )}
          <label>
            Email
            <input className="input" type="email" value={form.email} onChange={set('email')} />
          </label>
          <label>
            Password
            <input className="input" type="password" value={form.password} onChange={set('password')} />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn primary wide" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>

          <p className="switch">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button
              type="button"
              className="link"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </button>
          </p>
        </motion.form>
      </section>
    </div>
  )
}
