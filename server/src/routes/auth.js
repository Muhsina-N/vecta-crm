import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import protect from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email })
const validEmail = (v) => /^\S+@\S+\.\S+$/.test(v || '')

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' })
    if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email' })
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    if (exists) return res.status(400).json({ message: 'That email is already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) })
  })
)

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!validEmail(email) || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    const ok = user && (await bcrypt.compare(password, user.password))
    if (!ok) return res.status(401).json({ message: 'Wrong email or password' })

    res.json({ token: signToken(user._id), user: publicUser(user) })
  })
)

// GET /api/auth/me
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(401).json({ message: 'User no longer exists' })
    res.json({ user: publicUser(user) })
  })
)

export default router
