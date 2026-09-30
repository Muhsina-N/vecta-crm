import dns from 'node:dns'
import mongoose from 'mongoose'

// Some networks block MongoDB's SRV DNS lookup. Using public DNS servers fixes it.
dns.setServers(['8.8.8.8', '1.1.1.1'])

export default async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is missing. Add it to server/.env')
  await mongoose.connect(uri)
  console.log('MongoDB connected')
}