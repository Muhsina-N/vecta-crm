import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import leadRoutes from './routes/leads.js'
import visitRoutes from './routes/visits.js'
import orderRoutes from './routes/orders.js'
import targetRoutes from './routes/targets.js'
import dashboardRoutes from './routes/dashboard.js'
import reportRoutes from './routes/reports.js'
import employeeRoutes from './routes/employees.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to server/.env')
  process.exit(1)
}

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/visits', visitRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/targets', targetRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/employees', employeeRoutes)
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Could not start server:', err.message)
    process.exit(1)
  })
