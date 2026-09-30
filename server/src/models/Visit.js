import mongoose from 'mongoose'
import { VISIT_STATUSES } from '../constants.js'

// A single customer/outlet visit made by a sales executive
const visitSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: VISIT_STATUSES, default: 'Visited' },
    orderTaken: { type: Boolean, default: false },
    orderAmount: { type: Number, min: [0, 'Order amount cannot be negative'], default: 0 },
    followUpDate: { type: Date, default: null },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

visitSchema.index({ owner: 1, date: 1 })

export default mongoose.model('Visit', visitSchema)
