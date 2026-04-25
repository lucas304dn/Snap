import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, DEMO_USER_ID } from '../../../lib/supabase.js'
import { MOCK_TRANSACTIONS_HOME } from '../../../lib/mock.js'

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
            category: t.photo_url ? '📸' : '💳',
            when: relativeTime(t.created_at)
          })))
        }
      })
  }, [])

  return (
    <div className="app-content h-full pt-2">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-2 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bunq-green to-bunq-green-dim flex items-center justify-center text-bunq-black font-bold">
            E
          </div>
          <div>
            <div className="text-[11px] text-bunq-mute uppercase tracking-wide">Welcome back</div>
            <div className="text-[15px] font-semibold text-white">Erik</div>
          </div>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-bunq-card flex items-center justify-center text-bunq-mute">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
            <path d="M12 12v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Balance card */}
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl p-5 overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #00DCAA 0%, #0F8F6F 60%, #0A5C48 100%)',
            boxShadow: '0 20px 50px -20px rgba(0,220,170,0.6)'
          }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="text-[11px] uppercase tracking-widest text-white/80 font-semibold">Total balance</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[40px] font-bold text-white tracking-tight">€2,840</span>
            <span className="text-[22px] font-semibold text-white/85">.27</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-white/85">
            <span className="px-2 py-0.5 rounded-full bg-white/20 font-semibold">+€420 this month</span>
            <span>↑ 17.4%</span>
          </div>

          {/* Quick actions */}
          <div className="mt-5 grid grid-cols-4 gap-1.5">
            {[
              { icon: '↗', label: 'Send' },
              { icon: '↙', label: 'Request' },
              { icon: '⌹', label: 'Top up' },
              { icon: '⚡', label: 'Pay' }
            ].map(a => (
              <button key={a.label} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-black/20 backdrop-blur-sm">
                <span className="text-white text-lg">{a.icon}</span>
                <span className="text-[10px] text-white/90 font-semibold">{a.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights row */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <InsightCard label="This week" value="€186.40" sub="6 transactions" delta="-12%" />
        <InsightCard label="$nap streak" value="4 days" sub="📸 keep it up" delta="🔥" green />
      </div>

      {/* Recent transactions */}
      <div className="px-5 mt-5 mb-4 flex items-center justify-between">
        <div className="text-[13px] font-semibold text-white">Recent activity</div>
        <button className="text-[12px] text-bunq-green font-semibold">See all →</button>
      </div>

      <div className="px-3 space-y-1 pb-20">
        {(recent || []).map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/3"
          >
            <div className="w-10 h-10 rounded-xl bg-bunq-card flex items-center justify-center text-lg">
              {tx.category}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-white truncate">{tx.merchant}</div>
              <div className="text-[11px] text-bunq-mute">{tx.when}</div>
            </div>
            <div className={`text-[14px] font-bold tabular-nums ${tx.amount < 0 ? 'text-white' : 'text-bunq-green'}`}>
              {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function InsightCard({ label, value, sub, delta, green }) {
  return (
    <div className="bunq-card p-3">
      <div className="text-[10px] uppercase tracking-wide text-bunq-mute">{label}</div>
      <div className={`text-[20px] font-bold mt-1 ${green ? 'text-bunq-green' : 'text-white'}`}>{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-bunq-mute">{sub}</span>
        <span className="text-[11px] font-semibold text-bunq-green">{delta}</span>
      </div>
    </div>
  )
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}