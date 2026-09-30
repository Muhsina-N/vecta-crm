// Fills the database with a demo user, sample outlets, orders, visits and a
// sales target (handy for screenshots and the demo video). All data below is
// made up — no real customer information.
// Run: npm run seed
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import connectDB from './config/db.js'
import User from './models/User.js'
import Lead from './models/Lead.js'
import Order from './models/Order.js'
import Visit from './models/Visit.js'
import SalesTarget from './models/SalesTarget.js'
import Employee from './models/Employee.js'

const DEMO = { name: 'Demo User', email: 'demo@minicrm.dev', password: 'Demo@1234' }

const leads = [
  ['Al Noor Supermarket', 'Al Noor Trading LLC', 'Website', 'Won', 18000, 'Supermarket', 'Deira', ['Food', 'Beverages']],
  ['Fresh Mart Grocery', 'Fresh Mart', 'Referral', 'Order Taken', 9500, 'Grocery', 'Al Qusais', ['Grocery', 'Household']],
  ['Marina Restaurant', 'Marina Dining', 'Event', 'Qualified', 14000, 'Restaurant', 'Marina', ['Food', 'Beverages']],
  ['Pearl Retail Shop', 'Pearl Retail', 'Instagram', 'Contacted', 4000, 'Retail Shop', 'Bur Dubai', ['Household', 'Garments']],
  ['City Grocers', 'City Grocers LLC', 'Website', 'New', 0, 'Grocery', 'Karama', ['Grocery']],
  ['Sunrise Supermarket', 'Sunrise Trading', 'LinkedIn', 'Won', 26000, 'Supermarket', 'Sharjah', ['Food', 'Household']],
  ['Golden Spoon Restaurant', 'Golden Spoon', 'Referral', 'Order Taken', 8000, 'Restaurant', 'Al Barsha', ['Food', 'Beverages']],
]

async function run() {
  await connectDB()

  let user = await User.findOne({ email: DEMO.email })
  if (!user) {
    user = await User.create({ name: DEMO.name, email: DEMO.email, password: await bcrypt.hash(DEMO.password, 10) })
  }

  await Promise.all([
    Lead.deleteMany({ owner: user._id }),
    Order.deleteMany({ owner: user._id }),
    Visit.deleteMany({ owner: user._id }),
  ])

  const createdLeads = await Lead.insertMany(
    leads.map(([name, company, source, stage, value, outletType, area, categories]) => ({
      owner: user._id,
      name,
      company,
      source,
      stage,
      value,
      outletType,
      area,
      categories,
      contactPerson: 'Store Manager',
      email: `${name.split(' ')[0].toLowerCase()}@example.com`,
      isActive: true,
      notes: stage === 'Contacted' ? [{ text: 'Sent intro email, waiting for reply.' }] : [],
    }))
  )

  const today = new Date()
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const daysAgo = (n) => { const d = startOfDay(today); d.setDate(d.getDate() - n); return d }

  const orderRows = []
  const visitRows = []
  createdLeads.forEach((lead, i) => {
    // A few orders spread across the last two weeks, cycling through categories
    const cats = lead.categories.length ? lead.categories : ['Other']
    for (let j = 0; j < 3; j++) {
      orderRows.push({
        owner: user._id,
        lead: lead._id,
        date: daysAgo((i * 2 + j) % 14),
        amount: 800 + ((i + 1) * 350) + j * 120,
        category: cats[j % cats.length],
        status: j === 2 ? 'Delivered' : 'Confirmed',
      })
    }
    visitRows.push({
      owner: user._id,
      lead: lead._id,
      date: daysAgo(i % 5),
      status: 'Visited',
      orderTaken: i % 2 === 0,
      orderAmount: i % 2 === 0 ? 500 + i * 100 : 0,
      followUpDate: daysAgo(-3),
      notes: 'Discussed new arrivals and restock schedule.',
    })
  })
  await Order.insertMany(orderRows)
  await Visit.insertMany(visitRows)

  await Employee.deleteMany({ owner: user._id })
  await Employee.insertMany([
    { owner: user._id, name: 'Rashid Al Amri', role: 'Sales Executive', area: 'Deira', email: 'rashid@example.com' },
    { owner: user._id, name: 'Fatima Noor', role: 'Sales Executive', area: 'Al Barsha', email: 'fatima@example.com' },
    { owner: user._id, name: 'Demo User', role: 'Team Lead', area: 'Dubai', email: DEMO.email },
  ])

  const month = today.toISOString().slice(0, 7)
  await SalesTarget.findOneAndUpdate(
    { owner: user._id, month },
    { monthlyTarget: 325000, dailyTarget: 12500, workingDays: 26 },
    { upsert: true }
  )

  console.log(`Seeded ${createdLeads.length} outlets, ${orderRows.length} orders, ${visitRows.length} visits, 3 team members, and a monthly target.`)
  console.log(`Login: ${DEMO.email} / ${DEMO.password}`)
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
