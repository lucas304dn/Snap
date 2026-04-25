import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)
export const DEMO_USER_ID = import.meta.env.VITE_DEMO_USER_ID || null
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
