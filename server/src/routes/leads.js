import { Router } from 'express'
import mongoose from 'mongoose'
import Lead from '../models/Lead.js'
import protect from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { STAGES } from '../constants.js'

const router = Router()
router.use(protect) // every lead route needs a logged-in user

const FIELDS = [
  'name', 'company', 'email', 'phone', 'source', 'stage', 'value',
  'contactPerson', 'area', 'outletType', 'categories',
  'lastVisitDate', 'nextFollowUpDate', 'isActive',
]
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]))
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// GET /api/leads?search=&stage=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = { owner: req.user.id }
    if (req.query.stage && STAGES.includes(req.query.stage)) filter.stage = req.query.stage
    if (req.query.search) {
      const rx = new RegExp(escapeRegex(String(req.query.search)), 'i')
      filter.$or = [{ name: rx }, { company: rx }, { email: rx }]
    }
    const leads = await Lead.find(filter).sort({ createdAt: -1 })
    res.json(leads)
  })
)

// GET /api/leads/stats  (must be above "/:id")
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const rows = await Lead.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ])
    const byStage = STAGES.map((stage) => {
      const row = rows.find((r) => r._id === stage)
      return { stage, count: row ? row.count : 0, value: row ? row.value : 0 }
    })
    res.json({ total: byStage.reduce((n, s) => n + s.count, 0), byStage })
  })
)

// POST /api/leads
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const lead = await Lead.create({ ...pick(req.body), owner: req.user.id })
    res.status(201).json(lead)
  })
)

// PUT /api/leads/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      pick(req.body),
      { new: true, runValidators: true }
    )
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  })
)

// PATCH /api/leads/:id/stage
router.patch(
  '/:id/stage',
  asyncHandler(async (req, res) => {
    const { stage } = req.body
    if (!STAGES.includes(stage)) return res.status(400).json({ message: 'Invalid stage' })
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { stage },
      { new: true }
    )
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  })
)

// POST /api/leads/:id/notes
router.post(
  '/:id/notes',
  asyncHandler(async (req, res) => {
    const text = (req.body.text || '').trim()
    if (!text) return res.status(400).json({ message: 'Note cannot be empty' })
    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user.id })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    lead.notes.unshift({ text })
    await lead.save()
    res.status(201).json(lead)
  })
)

// DELETE /api/leads/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user.id })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json({ message: 'Lead deleted' })
  })
)

export default router
