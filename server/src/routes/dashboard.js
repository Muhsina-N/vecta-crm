import { Router } from 'express'
import mongoose from 'mongoose'
import Lead from '../models/Lead.js'
import Order from '../models/Order.js'
import Visit from '../models/Visit.js'
import SalesTarget from '../models/SalesTarget.js'
import protect from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { CATEGORIES } from '../constants.js'

const router = Router()
router.use(protect)

function startOfDay(d = new Date()) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function addDays(d, n) { const c = new Date(d); c.setDate(c.getDate() + n); return c }

// Sum of confirmed/delivered order amounts for one owner between two dates
async function sumOrders(ownerId, from, to) {
  const rows = await Order.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(ownerId),
        date: { $gte: from, $lt: to },
        status: { $ne: 'Cancelled' },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])
  return rows[0]?.total || 0
}

// GET /api/dashboard/summary
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const ownerId = req.user.id
    const today = startOfDay()
    const tomorrow = addDays(today, 1)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const month = today.toISOString().slice(0, 7)

    const [totalCustomers, todaySales, monthSales, ordersToday, visitsToday, target, byCategoryRaw, byOutletRaw, last7Raw] =
      await Promise.all([
        Lead.countDocuments({ owner: ownerId }),
        sumOrders(ownerId, today, tomorrow),
        sumOrders(ownerId, monthStart, monthEnd),
        Order.countDocuments({ owner: ownerId, date: { $gte: today, $lt: tomorrow } }),
        Visit.countDocuments({ owner: ownerId, date: { $gte: today, $lt: tomorrow } }),
        SalesTarget.findOne({ owner: ownerId, month }),
        Order.aggregate([
          { $match: { owner: new mongoose.Types.ObjectId(ownerId), date: { $gte: monthStart, $lt: monthEnd }, status: { $ne: 'Cancelled' } } },
          { $group: { _id: '$category', total: { $sum: '$amount' } } },
        ]),
        Order.aggregate([
          { $match: { owner: new mongoose.Types.ObjectId(ownerId), date: { $gte: monthStart, $lt: monthEnd }, status: { $ne: 'Cancelled' } } },
          { $group: { _id: '$lead', total: { $sum: '$amount' } } },
          { $sort: { total: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'leads', localField: '_id', foreignField: '_id', as: 'lead' } },
          { $unwind: '$lead' },
          { $project: { name: '$lead.name', total: 1 } },
        ]),
        (async () => {
          const rows = []
          for (let i = 6; i >= 0; i--) {
            const day = addDays(today, -i)
            const next = addDays(day, 1)
            rows.push({ date: day.toISOString().slice(0, 10), total: await sumOrders(ownerId, day, next) })
          }
          return rows
        })(),
      ])

    const monthlyTarget = target?.monthlyTarget || 0
    const dailyTarget = target?.dailyTarget || 0
    const remaining = Math.max(monthlyTarget - monthSales, 0)
    const achievementPct = monthlyTarget ? Math.round((monthSales / monthlyTarget) * 1000) / 10 : 0

    const byCategory = CATEGORIES.map((cat) => ({
      category: cat,
      total: byCategoryRaw.find((r) => r._id === cat)?.total || 0,
    })).filter((r) => r.total > 0)

    res.json({
      totalCustomers,
      today: { sales: todaySales, target: dailyTarget, remaining: Math.max(dailyTarget - todaySales, 0), orders: ordersToday, visits: visitsToday },
      month: { sales: monthSales, target: monthlyTarget, remaining, achievementPct, workingDays: target?.workingDays || 26 },
      byCategory,
      byOutlet: byOutletRaw.map((r) => ({ name: r.name, total: r.total })),
      last7Days: last7Raw,
    })
  })
)

export default router
