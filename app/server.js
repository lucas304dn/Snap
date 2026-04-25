import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { handleBunqWebhook, handleSimulate } from './webhookHandler.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '1mb' }))

// Real bunq webhook
app.post('/webhook/bunq', handleBunqWebhook)

// Simulator — what the demo control panel hits
app.post('/api/simulate', handleSimulate)

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'snap-node' }))

app.get('/', (_req, res) => res.send('snap-node backend — see /health'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 snap-node backend running on http://localhost:${PORT}`)
  console.log(`   POST /webhook/bunq   ← bunq sends real payments here`)
  console.log(`   POST /api/simulate   ← demo control panel fires fake transactions here`)
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn('⚠️  Missing SUPABASE_URL / SUPABASE_SERVICE_KEY — inserts will fail.')
  }
})