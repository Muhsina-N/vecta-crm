import { Router } from 'express'
import Order from '../models/Order.js'
import Lead from '../models/Lead.js'
import protect from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { CATEGORIES, ORDER_STATUSES } from '../constants.js'

const router = Router()
router.use(protect)

// GET /api/orders?from=&to=&customer=&category=&status=
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
    res.json(orders)
  })
)

// POST /api/orders
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { lead, date, amount, category, status, notes } = req.body
    if (!lead) return res.status(400).json({ message: 'A customer/outlet is required' })
    if (amount === undefined || Number(amount) < 0)
      return res.status(400).json({ message: 'Enter a valid order amount' })

    const owns = await Lead.exists({ _id: lead, owner: req.user.id })
    if (!owns) return res.status(404).json({ message: 'Customer/outlet not found' })

    const order = await Order.create({
      owner: req.user.id,
      lead,
      date: date || Date.now(),
      amount: Number(amount),
      category: category || 'Other',
      status: status || 'Confirmed',
      notes: notes || '',
    })
    const populated = await order.populate('lead', 'name company area')
    res.status(201).json(populated)
  })
)

// PUT /api/orders/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { amount, category, status, notes, date } = req.body
    const patch = {}
    if (amount !== undefined) patch.amount = Number(amount)
    if (category !== undefined) patch.category = category
    if (status !== undefined) patch.status = status
    if (notes !== undefined) patch.notes = notes
    if (date !== undefined) patch.date = date

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      patch,
      { new: true, runValidators: true }
    ).populate('lead', 'name company area')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  })
)

// DELETE /api/orders/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findOneAndDelete({ _id: req.params.id, owner: req.user.id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ message: 'Order deleted' })
  })
)

export default router
