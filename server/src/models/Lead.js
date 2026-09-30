import mongoose from 'mongoose'
import { STAGES, SOURCES, OUTLET_TYPES, CATEGORIES } from '../constants.js'

const noteSchema = new mongoose.Schema(
  { text: { type: String, required: true, trim: true } },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const leadSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // --- original fields (unchanged) ---
    name: { type: String, required: [true, 'Lead name is required'], trim: true },
    company: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    source: { type: String, enum: SOURCES, default: 'Other' },
    stage: { type: String, enum: STAGES, default: 'New' },
    value: { type: Number, min: [0, 'Value cannot be negative'], default: 0 },
    notes: [noteSchema],

    // --- FMCG / outlet fields (all optional, so existing leads keep working) ---
    contactPerson: { type: String, trim: true, default: '' },
    area: { type: String, trim: true, default: '' },
    outletType: { type: String, enum: [...OUTLET_TYPES, ''], default: '' },
    categories: [{ type: String, enum: CATEGORIES }],
    lastVisitDate: { type: Date, default: null },
    nextFollowUpDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

leadSchema.index({ owner: 1, nextFollowUpDate: 1 })

export default mongoose.model('Lead', leadSchema)
