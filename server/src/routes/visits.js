import { Router } from 'express'
import Visit from '../models/Visit.js'
import Lead from '../models/Lead.js'
import protect from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { VISIT_STATUSES } from '../constants.js'

const router = Router()
router.use(protect)

// day range helper: [start of day, start of next day) in the server's local time
function dayRange(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

// GET /api/visits?date=YYYY-MM-DD  (defaults to today)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { start, end } = dayRange(req.query.date)
    const visits = await Visit.find({ owner: req.user.id, date: { $gte: start, $lt: end } })
      .populate('lead', 'name company area outletType')
      .sort({ createdAt: -1 })
    res.json(visits)
  })
)

// POST /api/visits
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { lead, date, status, orderTaken, orderAmount, followUpDate, notes } = req.body
    if (!lead) return res.status(400).json({ message: 'A customer/outlet is required' })
    if (status && !VISIT_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid visit status' })

    const owns = await Lead.exists({ _id: lead, owner: req.user.id })
    if (!owns) return res.status(404).json({ message: 'Customer/outlet not found' })

    const visit = await Visit.create({
      owner: req.user.id,
      lead,
      date: date || Date.now(),
      status: status || 'Visited',
      orderTaken: Boolean(orderTaken),
      orderAmount: Number(orderAmount) || 0,
      followUpDate: followUpDate || null,
      notes: notes || '',
    })

    // keep the lead's own "last visit" / "next follow-up" fields in sync
    const update = { lastVisitDate: visit.date }
    if (followUpDate) update.nextFollowUpDate = followUpDate
    await Lead.findByIdAndUpdate(lead, update)

    const populated = await visit.populate('lead', 'name company area outletType')
    res.status(201).json(populated)
  })
)

// DELETE /api/visits/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const visit = await Visit.findOneAndDelete({ _id: req.params.id, owner: req.user.id })
    if (!visit) return res.status(404).json({ message: 'Visit not found' })
    res.json({ message: 'Visit deleted' })
  })
)

export default router
