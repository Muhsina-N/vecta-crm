import mongoose from 'mongoose'
import { CATEGORIES, ORDER_STATUSES } from '../constants.js'

// A recorded sale/order against a customer or outlet
const orderSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: [true, 'Order amount is required'], min: [0, 'Order amount cannot be negative'] },
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    status: { type: String, enum: ORDER_STATUSES, default: 'Confirmed' },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

orderSchema.index({ owner: 1, date: 1 })

export default mongoose.model('Order', orderSchema)
