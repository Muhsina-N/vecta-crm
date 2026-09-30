import { Router } from 'express'
import Order from '../models/Order.js'
import Visit from '../models/Visit.js'
import protect from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { CATEGORIES, ORDER_STATUSES } from '../constants.js'

const router = Router()
router.use(protect)

// GET /api/reports?from=&to=&customer=&category=&status=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { from, to, customer, category, status } = req.query
    const filter = { owner: req.user.id }
    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = new Date(from)
      if (to) filter.date.$lt = new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000)
    }
    if (customer) filter.lead = customer
    if (category && CATEGORIES.includes(category)) filter.category = category
    if (status && ORDER_STATUSES.includes(status)) filter.status = status

    const orders = await Order.find(filter).populate('lead', 'name company area').sort({ date: -1 })
    const totalSales = orders.reduce((sum, o) => sum + (o.status === 'Cancelled' ? 0 : o.amount), 0)
    const uniqueCustomers = new Set(orders.map((o) => String(o.lead?._id || o.lead)))

    const visitFilter = { owner: req.user.id }
    if (filter.date) visitFilter.date = filter.date
    if (customer) visitFilter.lead = customer
    const visitsCount = await Visit.countDocuments(visitFilter)

    res.json({
      orders,
      summary: {
        totalSales,
        orderCount: orders.length,
        customersVisited: visitsCount,
        uniqueCustomersOrdered: uniqueCustomers.size,
      },
    })
  })
)

export default router
