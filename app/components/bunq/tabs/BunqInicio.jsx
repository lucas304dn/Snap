import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, DEMO_USER_ID } from '../../../lib/supabase.js'
import { MOCK_TRANSACTIONS_HOME } from '../../../lib/mock.js'

// bunq rainbow palette (from the logo/brand screenshots)
const ACCOUNTS = [
  {
    name: 'Total balance',
    balance: '€3,640',
    cents: '.27',
    sub: 'NL42 BUNQ 0123 4567 89',
    gradient: 'linear-gradient(135deg, #00C896 0%, #00A878 50%, #007A58 100%)',
    glow: 'rgba(0,200,150,0.5)',
    tag: 'Main'
  },
  {
    name: 'Travel',
    balance: '€1,203',
    cents: '.10',
    sub: '0% FX · 8 currencies',
    gradient: 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
    glow: 'rgba(67,97,238,0.5)',
    tag: 'Travel'
  },
  {
    name: 'Easy Savings',
    balance: '€840',
    cents: '.00',
    sub: '2.1% APY · auto-save on',
    gradient: 'linear-gradient(135deg, #F72585 0%, #B5179E 100%)',
    glow: 'rgba(247,37,133,0.5)',
    tag: 'Savings'
  }
]

const QUICK_ACTIONS = [
  { icon: '↗', label: 'Pay',     color: '#00C896' },
  { icon: '↙', label: 'Request', color: '#4361EE' },
  { icon: '+', label: 'Add',     color: '#F72585' },
  { icon: '⚡', label: 'More',   color: '#FF9F1C' }
]

// bunq rainbow bar colors
const RAINBOW = ['#FF3A2D','#FF7A00','#FFD700','#00C896','#4361EE','#8B5CF6']

export default function BunqInicio({ onClose }) {
  const [recent, setRecent] = useState(null)

  useEffect(() => {
    if (!DEMO_USER_ID) { setRecent(MOCK_TRANSACTIONS_HOME); return }
    supabase
      .from('transactions')
      .select('id, merchant, amount, currency, created_at, snapped_at, photo_url')
      .eq('user_id', DEMO_USER_ID)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setRecent(MOCK_TRANSACTIONS_HOME)
        } else {
          setRecent(data.map(t => ({
            id: t.id,
            merchant: t.merchant || 'Unknown',
            amount: -Math.abs(Number(t.amount || 0)),
            category: t.photo_url ? '📸' : merchantIcon(t.merchant),
            when: relativeTime(t.created_at)
          })))
        }
      })
  }, [])

  return (
    <div className="app-content h-full overflow-y-auto pb-24">

      {/* Rainbow stripe — bunq brand signature */}
      <div className="flex h-[3px] w-full flex-shrink-0">
        {RAINBOW.map(c => (
          <div key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      {/* Top bar — pt-[56px] clears the Dynamic Island */}
      <div className="flex items-center justify-between px-5 pt-[52px] pb-3">
        <div>
          <div className="text-[11px] text-bunq-mute uppercase tracking-wider">Home</div>
          <div className="text-[20px] font-bold text-white">Erik</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-bunq-card border border-bunq-border flex items-center justify-center text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-bunq-card border border-bunq-border flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="8" r="1" fill="currentColor" />
              <path d="M12 12v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Ask Finn bar */}
      <button className="mx-5 mb-4 w-[calc(100%-40px)] flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-bunq-card border border-bunq-border text-left">
        <span style={{ color: '#00C896' }} className="text-[15px]">✦</span>
        <span className="text-bunq-mute text-[13px]">Ask Finn anything…</span>
      </button>

      {/* Account cards — horizontal scroll */}
      <div className="flex gap-3 pl-5 pr-3 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
        {ACCOUNTS.map((acc, i) => (
          <motion.div
            key={acc.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: i * 0.08 }}
            className="flex-shrink-0 rounded-3xl p-4 relative overflow-hidden"
            style={{
              width: '200px',
              background: acc.gradient,
              boxShadow: `0 16px 40px -12px ${acc.glow}`,
              scrollSnapAlign: 'start'
            }}
          >
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase tracking-widest text-white/70 font-bold">{acc.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] text-white font-bold uppercase tracking-wider">{acc.tag}</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[26px] font-bold text-white tracking-tight">{acc.balance}</span>
              <span className="text-[15px] font-semibold text-white/80">{acc.cents}</span>
            </div>
            <div className="mt-2 text-[9px] text-white/60 font-mono truncate">{acc.sub}</div>
          </motion.div>
        ))}
        <div className="w-2 flex-shrink-0" />
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-4 grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map(a => (
          <button key={a.label} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-bunq-card border border-bunq-border">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[15px]"
              style={{ background: a.color + '22', color: a.color }}
            >
              {a.icon}
            </div>
            <span className="text-[10px] text-white/80 font-semibold">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Spending insight strip */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-bunq-card border border-bunq-border p-3">
          <div className="text-[9px] uppercase tracking-wider text-bunq-mute mb-1">Monthly expenses</div>
          <div className="text-[18px] font-bold text-white">€1,200</div>
          <div className="mt-2 flex gap-0.5 h-[4px] rounded-full overflow-hidden">
            {[40, 25, 20, 15].map((w, i) => (
              <div key={i} className="rounded-full h-full" style={{ width: `${w}%`, background: RAINBOW[i] }} />
            ))}
          </div>
          <div className="mt-1 text-[9px]" style={{ color: '#00C896' }}>↓ 12% vs last month</div>
        </div>
        <div className="rounded-2xl bg-bunq-card border border-bunq-border p-3">
          <div className="text-[9px] uppercase tracking-wider text-bunq-mute mb-1">$nap streak</div>
          <div className="text-[18px] font-bold" style={{ color: '#00C896' }}>4 days</div>
          <div className="text-[11px] text-bunq-mute mt-1">📸 keep it up</div>
          <div className="mt-1 text-[9px] font-bold" style={{ color: '#FF9F1C' }}>🔥 on fire</div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-5 mt-5 flex items-center justify-between">
        <div className="text-[13px] font-semibold text-white">Recent activity</div>
        <button className="text-[12px] font-semibold" style={{ color: '#00C896' }}>See all →</button>
      </div>

      <div className="px-3 mt-2 space-y-0.5">
        {(recent || []).map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: RAINBOW[i % RAINBOW.length] + '22' }}>
              {tx.category}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">{tx.merchant}</div>
              <div className="text-[11px] text-bunq-mute">{tx.when}</div>
            </div>
            <div className={`text-[13px] font-bold tabular-nums flex-shrink-0 ${tx.amount >= 0 ? '' : 'text-white'}`}
              style={tx.amount >= 0 ? { color: '#00C896' } : {}}>
              {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function merchantIcon(merchant) {
  if (!merchant) return '💳'
  const m = merchant.toLowerCase()
  if (m.includes('albert') || m.includes('lidl') || m.includes('aldi')) return '🛒'
  if (m.includes('spotify') || m.includes('netflix') || m.includes('apple')) return '📱'
  if (m.includes('uber') || m.includes('bolt')) return '🚗'
  if (m.includes('coffee') || m.includes('café') || m.includes('starbucks')) return '☕'
  if (m.includes('pizza') || m.includes('burger')) return '🍔'
  if (m.includes('salary') || m.includes('acme')) return '💼'
  return '💳'
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
