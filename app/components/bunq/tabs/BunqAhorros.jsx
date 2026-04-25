import { motion } from 'framer-motion'

const GOALS = [
  { name: 'Tokyo trip', target: 2400, current: 1840, emoji: '🗼', color: '#FF5A8F' },
  { name: 'Emergency fund', target: 5000, current: 3120, emoji: '🛟', color: '#5AC8FA' },
  { name: 'New laptop', target: 1800, current: 720, emoji: '💻', color: '#FFD66B' },
  { name: 'Apartment deposit', target: 8000, current: 1200, emoji: '🏡', color: '#9B6DFF' }
]

export default function BunqAhorros() {
  const total = GOALS.reduce((s, g) => s + g.current, 0)
  const target = GOALS.reduce((s, g) => s + g.target, 0)

  return (
    <div className="app-content h-full pt-[52px] px-5 pb-4">
      <h1 className="text-[24px] font-bold text-white tracking-tight">Savings</h1>
      <p className="text-[13px] text-bunq-mute mt-1">
        You're <span className="text-bunq-green font-semibold">{Math.round((total / target) * 100)}%</span> toward your goals
      </p>

      {/* Hero ring */}
      <div className="mt-5 bunq-card p-5 flex items-center gap-5">
        <RingProgress percent={Math.round((total / target) * 100)} />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wide text-bunq-mute">Total saved</div>
          <div className="text-[26px] font-bold text-white tabular-nums">€{total.toLocaleString()}</div>
          <div className="text-[12px] text-bunq-mute mt-1">of €{target.toLocaleString()} goal</div>
        </div>
      </div>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <div className="text-[13px] font-semibold text-white">Your goals</div>
        <button className="text-[12px] font-semibold text-bunq-green">+ New goal</button>
      </div>

      <div className="space-y-3">
        {GOALS.map((g, i) => {
          const pct = Math.round((g.current / g.target) * 100)
          return (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bunq-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bunq-black flex items-center justify-center text-lg">{g.emoji}</div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-white">{g.name}</div>
                  <div className="text-[11px] text-bunq-mute">€{g.current.toLocaleString()} of €{g.target.toLocaleString()}</div>
                </div>
                <div className="text-[13px] font-bold text-white">{pct}%</div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-bunq-black overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: g.color }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function RingProgress({ percent = 0 }) {
  const r = 36, c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <div className="relative w-[88px] h-[88px]">
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
        <motion.circle
          cx="44" cy="44" r={r}
          stroke="#00DCAA" strokeWidth="6" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[18px]">
        {percent}%
      </div>
    </div>
  )
}