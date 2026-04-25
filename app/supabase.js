import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

let _client = null
export function supabase() {
  if (_client) return _client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  }
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}