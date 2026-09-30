import { Router } from 'express'
import SalesTarget from '../models/SalesTarget.js'
import protect from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(protect)

const currentMonth = () => new Date().toISOString().slice(0, 7) // "YYYY-MM"

// GET /api/targets/:month?  (month like "2026-09"; defaults to the current month)
router.get(
  '/:month?',
  asyncHandler(async (req, res) => {
    const month = req.params.month || currentMonth()
    let target = await SalesTarget.findOne({ owner: req.user.id, month })
    if (!target) {
      // Return a sensible default rather than a 404, so the dashboard has something to show
      target = { owner: req.user.id, month, monthlyTarget: 0, dailyTarget: 0, workingDays: 26 }
    }
    res.json(target)
  })
)

// PUT /api/targets/:month  (creates the record the first time it is set)
router.put(
  '/:month',
  asyncHandler(async (req, res) => {
    const { monthlyTarget, dailyTarget, workingDays } = req.body
    const target = await SalesTarget.findOneAndUpdate(
      { owner: req.user.id, month: req.params.month },
      {
        ...(monthlyTarget !== undefined && { monthlyTarget: Number(monthlyTarget) }),
        ...(dailyTarget !== undefined && { dailyTarget: Number(dailyTarget) }),
        ...(workingDays !== undefined && { workingDays: Number(workingDays) }),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
    res.json(target)
  })
)

export default router
