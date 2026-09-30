import mongoose from 'mongoose'

// One target record per user per calendar month (month stored as "YYYY-MM").
// The daily target is a field the user sets themselves, not something we
// always recompute from the monthly figure.
const salesTargetSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    monthlyTarget: { type: Number, min: [0, 'Target cannot be negative'], default: 0 },
    dailyTarget: { type: Number, min: [0, 'Target cannot be negative'], default: 0 },
    workingDays: { type: Number, min: [0, 'Working days cannot be negative'], default: 26 },
  },
  { timestamps: true }
)

salesTargetSchema.index({ owner: 1, month: 1 }, { unique: true })

export default mongoose.model('SalesTarget', salesTargetSchema)
