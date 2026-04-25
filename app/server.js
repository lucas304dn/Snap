import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'
import { handleBunqWebhook, handleSimulate } from './webhookHandler.js'
import { supabase } from './supabase.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '1mb' }))

const MOCK_TXS_WRAP = [
  { merchant: 'Albert Heijn', amount: -12.45, currency: 'EUR', location_name: 'Amsterdam', created_at: new Date(Date.now() - 1 * 3600000).toISOString(), photo_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&q=70' },
  { merchant: 'Brouwerij \'t IJ', amount: -9.50, currency: 'EUR', location_name: 'Amsterdam', created_at: new Date(Date.now() - 5 * 3600000).toISOString(), photo_url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200&q=70' },
  { merchant: 'Sugarbird Coffee', amount: -4.80, currency: 'EUR', location_name: 'Amsterdam', created_at: new Date(Date.now() - 10 * 3600000).toISOString(), photo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=70' },
  { merchant: 'Spotify', amount: -10.99, currency: 'EUR', location_name: 'Amsterdam', created_at: new Date(Date.now() - 24 * 3600000).toISOString(), photo_url: null },
  { merchant: 'La Pizza del Sol', amount: -14.50, currency: 'EUR', location_name: 'Barcelona', created_at: new Date(Date.now() - 36 * 3600000).toISOString(), photo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=70' },
  { merchant: 'Uber', amount: -8.20, currency: 'EUR', location_name: 'Amsterdam', created_at: new Date(Date.now() - 48 * 3600000).toISOString(), photo_url: null },
  { merchant: 'Tokyo Ramen Bar', amount: -18.20, currency: 'EUR', location_name: 'Berlin', created_at: new Date(Date.now() - 60 * 3600000).toISOString(), photo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&q=70' },
  { merchant: 'Le Petit Café', amount: -3.20, currency: 'EUR', location_name: 'Paris', created_at: new Date(Date.now() - 72 * 3600000).toISOString(), photo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=70' },
]

// Real bunq webhook
app.post('/webhook/bunq', handleBunqWebhook)

// Simulator — what the demo control panel hits
app.post('/api/simulate', handleSimulate)

// Weekly Wrap — AI financial summary via Claude
app.post('/api/wrap', async (req, res) => {
  try {
    const userId = process.env.DEMO_USER_ID || '00000000-0000-0000-0000-000000000001'
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

    const { data: txs } = await supabase()
      .from('transactions')
      .select('merchant, amount, currency, created_at, location_name, photo_url')
      .eq('user_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(30)

    const source = (txs && txs.length > 0) ? txs : MOCK_TXS_WRAP
    const txList = source.map(t =>
      `${t.merchant} | EUR ${Math.abs(Number(t.amount)).toFixed(2)} | ${t.location_name || 'Unknown'} | ${(t.created_at || '').slice(0, 10)}`
    ).join('\n')

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are the AI behind bunq $nap Weekly Wrap. Analyze these transactions and respond with ONLY valid JSON — no markdown, no asterisks, no ** formatting whatsoever.

Return exactly this shape:
{
  "spending": "3-4 sentences covering: total approximate spend, which cities were visited, main spending categories, and one observation about the pattern. Factual and specific.",
  "top_category": "The dominant spending category as a short label with one emoji, e.g. 'Dining 🍽️' or 'Groceries 🛒'",
  "fun_fact": "One quirky, specific observation about this week's spending — e.g. an unusual pattern, a surprising amount, or a funny streak. Keep it under 20 words. Dry wit welcome.",
  "mention": "2-3 sentences about the single most interesting or memorable transaction. Be specific about why it stands out. Light wit, not forced.",
  "mention_merchant": "exact merchant name from the list that the mention is about"
}

Transactions:
${txList}`
      }]
    })

    let parsed
    try {
      const raw = msg.content[0].text.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(raw)
    } catch {
      parsed = { spending: msg.content[0].text.replace(/\*\*/g, ''), mention: '' }
    }

    const mentionMerchant = (parsed.mention_merchant || '').toLowerCase()
    const mentionTx = source.find(t => (t.merchant || '').toLowerCase().includes(mentionMerchant) && t.photo_url)
      || source.find(t => t.photo_url)

    res.json({
      spending: (parsed.spending || '').replace(/\*\*/g, ''),
      top_category: (parsed.top_category || '').replace(/\*\*/g, ''),
      fun_fact: (parsed.fun_fact || '').replace(/\*\*/g, ''),
      mention: (parsed.mention || '').replace(/\*\*/g, ''),
      mention_photo: mentionTx?.photo_url || null,
      mention_merchant: mentionTx?.merchant || '',
      transactions: source.map(t => ({
        merchant: t.merchant,
        amount: Math.abs(Number(t.amount)).toFixed(2),
        location: t.location_name || '',
        date: (t.created_at || '').slice(5, 10).replace('-', '/'),
        photo_url: t.photo_url || null
      }))
    })
  } catch (e) {
    console.error('/api/wrap error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

// AI hint for GuessThePrice — looks at the actual photo URL
app.post('/api/guess-hint', async (req, res) => {
  try {
    const { photo_url, merchant } = req.body
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const content = []
    if (photo_url) {
      content.push({ type: 'image', source: { type: 'url', url: photo_url } })
    }
    content.push({
      type: 'text',
      text: photo_url
        ? `This is a purchase photo from "${merchant || 'a place'}". Give ONE witty, cryptic hint about the price in under 12 words. Be clever and funny. Do NOT say the price or any number. No quotes.`
        : `Give ONE witty cryptic price hint for a purchase at "${merchant || 'a place'}" in under 12 words. Be funny. No numbers. No quotes.`
    })

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{ role: 'user', content }]
    })

    res.json({ hint: msg.content[0].text.trim() })
  } catch (e) {
    console.error('/api/guess-hint error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

// AI Vision — identify what's in a photo
app.post('/api/identify', async (req, res) => {
  try {
    const { image_base64, media_type = 'image/jpeg' } = req.body
    if (!image_base64) return res.status(400).json({ error: 'image_base64 required' })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type, data: image_base64 }
          },
          {
            type: 'text',
            text: 'Look at this photo and identify the main item or scene. Respond with ONLY valid JSON, no markdown:\n{"item": "short item name (2-4 words max)", "emoji": "one relevant emoji", "category": "one of: Food & Drink, Coffee, Shopping, Transport, Entertainment, Travel, Groceries, Other"}'
          }
        ]
      }]
    })

    let parsed
    try {
      parsed = JSON.parse(msg.content[0].text.replace(/```json|```/g, '').trim())
    } catch {
      parsed = { item: 'Something tasty', emoji: '✨', category: 'Other' }
    }
    res.json(parsed)
  } catch (e) {
    console.error('/api/identify error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'snap-node' }))
app.get('/', (_req, res) => res.send('snap-node backend — see /health'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 snap-node backend running on http://localhost:${PORT}`)
  console.log(`   POST /api/wrap  ← AI weekly financial summary`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  Missing ANTHROPIC_API_KEY — /api/wrap will fail.')
  }
})
