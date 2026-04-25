import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { py } from '../../../lib/api.js'
import { MOCK_LEADERBOARD } from '../../../lib/mock.js'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    py.leaderboard()
      .then(d => setRows(d?.leaderboard?.length ? d.leaderboard : MOCK_LEADERBOARD))
      .catch(() => setRows(MOCK_LEADERBOARD))
  }, [])

  if (!rows) return null

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)

  return (
    <div className="app-content h-full px-5 pb-4">
      {/* Hero */}
      <div className="bunq-card p-4 mb-5">
        <div className="text-[10px] uppercase tracking-widest text-bunq-mute font-semibold">This week</div>
        <div className="flex items-baseline justify-between mt-1">
          <h2 className="text-[20px] font-bold text-white">Price Guess Champions</h2>
          <span className="text-[11px] text-bunq-mute">resets Sunday</span>
        </div>

        {/* Podium */}
        <div className="mt-4 flex items-end justify-around h-[140px]">
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((p, idx) => {
            const heightMap = [80, 110, 65]
            const podiumIdx = idx === 1 ? 0 : (idx === 0 ? 1 : 2)
            const colors = ['#C0C0C0', '#FFD66B', '#CD7F32']
            return (
              <motion.div
                key={p.username}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 + 0.1 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="text-2xl">{MEDALS[podiumIdx]}</span>
                <div className="text-[12px] font-bold text-white">@{p.username}</div>
                <div className="text-[11px] text-bunq-green font-mono font-bold">{p.score} pts</div>
                <div
                  className="w-[60px] rounded-t-lg"
                  style={{ height: heightMap[idx], background: `linear-gradient(180deg, ${colors[podiumIdx]} 0%, transparent 200%)` }}
                />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Full ranking */}
      <div className="text-[13px] font-semibold text-white mb-3">Full ranking</div>
      <div className="space-y-1.5">
        {rest.map((r, i) => (
          <motion.div
            key={r.username}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
              r.isYou ? 'bg-bunq-green/10 border border-bunq-green/30' : 'bunq-card'
            }`}
          >
            <div className="w-8 text-center font-bold text-bunq-mute font-mono">#{r.rank}</div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-bunq-black text-sm"
              style={{ background: `hsl(${stringHash(r.username) % 360}, 70%, 65%)` }}
            >
              {(r.display_name || r.username)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-white truncate">
                {r.isYou ? 'You' : `@${r.username}`}
                {r.isYou && <span className="ml-2 text-[10px] text-bunq-green uppercase tracking-wider">you</span>}
              </div>
              <div className="text-[11px] text-bunq-mute">{r.accuracy} accuracy</div>
            </div>
            <div className="text-[14px] font-bold text-white font-mono">{r.score}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 mb-4 bunq-card p-4 text-center">
        <div className="text-[12px] text-bunq-mute">Closest guess of the week wins</div>
        <div className="text-[18px] font-bold text-bunq-green mt-1">€10 to your savings goal</div>
      </div>
    </div>
  )
}

function stringHash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}