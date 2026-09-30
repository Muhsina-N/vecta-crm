import { Router } from 'express'
import Employee from '../models/Employee.js'
import protect from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(protect)

const FIELDS = ['name', 'role', 'email', 'phone', 'area', 'isActive']
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]))

router.get('/', asyncHandler(async (req, res) => {
  const employees = await Employee.find({ owner: req.user.id }).sort({ createdAt: -1 })
  res.json(employees)
}))

router.post('/', asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.name.trim()) return res.status(400).json({ message: 'Name is required' })
  const employee = await Employee.create({ ...pick(req.body), owner: req.user.id })
  res.status(201).json(employee)
}))

router.put('/:id', asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    pick(req.body),
    { new: true, runValidators: true }
  )
  if (!employee) return res.status(404).json({ message: 'Employee not found' })
  res.json(employee)
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  const employee = await Employee.findOneAndDelete({ _id: req.params.id, owner: req.user.id })
  if (!employee) return res.status(404).json({ message: 'Employee not found' })
  res.json({ message: 'Employee deleted' })
}))

export default router
