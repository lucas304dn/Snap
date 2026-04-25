import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { py } from '../../../lib/api.js'
import { MOCK_LEADERBOARD } from '../../../lib/mock.js'
import { getPoints, subscribe } from '../../../lib/points.js'

const MEDALS = ['🥇', '🥈', '🥉']
const FRIEND_COLORS = {
  lena: '#FF7A00',
  tim:  '#4361EE',
  ali:  '#8B5CF6',
  maya: '#FF3A2D',
  you:  '#00C896',
}

function avatarColor(username) {
  return FRIEND_COLORS[username?.toLowerCase()] || `hsl(${stringHash(username || '') % 360}, 70%, 65%)`
}

export default function SnapLeaderboard({ onClose }) {
  const [baseRows, setBaseRows] = useState(null)
  const [myPoints, setMyPoints] = useState(getPoints)

  useEffect(() => {
    py.leaderboard()
      .then(d => setBaseRows(d?.leaderboard?.length ? d.leaderboard : MOCK_LEADERBOARD))
      .catch(() => setBaseRows(MOCK_LEADERBOARD))
  }, [])

  // Subscribe to real-time point updates from GuessThePrice
  useEffect(() => subscribe(setMyPoints), [])

  // Merge live "You" score and re-sort every time points change
  const rows = useMemo(() => {
    if (!baseRows) return null
    return baseRows
      .map(r => r.isYou ? { ...r, score: myPoints } : r)
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({ ...r, rank: i + 1 }))
  }, [baseRows, myPoints])

  const top3 = (rows || []).slice(0, 3)
  const rest  = (rows || []).slice(3)

  return (
    <div className="absolute inset-0 flex flex-col bg-bunq-black">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[22px] font-bold text-white tracking-tight">🏆 Leaderboard</div>
          <div className="text-[11px] text-bunq-mute uppercase tracking-wider">Price guess points · resets Sunday</div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-bunq-card flex items-center justify-center text-white text-lg"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">

        {/* Scoring key */}
        <div className="mb-4 px-3 py-2.5 rounded-xl bg-bunq-card border border-bunq-border flex items-center gap-3">
          <span className="text-lg">💡</span>
          <div className="text-[11px] text-bunq-mute leading-relaxed">
            <span className="text-white font-semibold">How points work:</span>
            {' '}Exact = 100 pts · &lt;5% off = 75 pts · &lt;10% = 50 pts · &lt;20% = 25 pts
          </div>
        </div>

        {/* Podium */}
        {rows && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-bunq-card border border-bunq-border p-4 mb-4"
          >
            <div className="flex items-end justify-around h-[190px]">
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((p, idx) => {
                const heightMap = [65, 90, 50]
                const podiumIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2
                const barColors = ['#C0C0C080', '#FFD66B80', '#CD7F3280']
                return (
                  <motion.div
                    key={p.username}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 + 0.1 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px] text-white mb-0.5"
                      style={{ background: avatarColor(p.username) }}
                    >
                      {(p.display_name || p.username)[0].toUpperCase()}
                    </div>
                    <div className="text-[11px] font-bold text-white">{p.isYou ? 'You' : `@${p.username}`}</div>
                    <div className="text-[11px] font-mono font-bold" style={{ color: '#00C896' }}>{p.score} pts</div>
                    <div className="text-[13px]">{MEDALS[podiumIdx]}</div>
                    <div
                      className="w-[56px] rounded-t-lg"
                      style={{ height: heightMap[idx], background: barColors[podiumIdx] }}
                    />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Full ranking */}
        {rows && (
          <>
            <div className="text-[11px] uppercase tracking-widest font-bold text-bunq-mute mb-2">All players</div>
            <div className="space-y-1.5">
              {rows.map((r, i) => (
                <motion.div
                  key={r.username}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: r.isYou ? '#00C89610' : '#ffffff08',
                    border: r.isYou ? '1px solid #00C89640' : '1px solid transparent',
                  }}
                >
                  <div className="w-6 text-center flex-shrink-0">
                    {i < 3
                      ? <span className="text-[15px]">{MEDALS[i]}</span>
                      : <span className="text-[11px] font-bold text-bunq-mute">#{r.rank}</span>
                    }
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] text-white flex-shrink-0"
                    style={{ background: avatarColor(r.username) }}
                  >
                    {(r.display_name || r.username)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
                      {r.isYou ? 'You' : `@${r.username}`}
                      {r.isYou && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                          style={{ background: '#00C89620', color: '#00C896' }}>
                          you
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-bunq-mute">{r.accuracy} accuracy</div>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-white">{r.score}</div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Prize card */}
        <div className="mt-5 rounded-2xl bg-bunq-card border border-bunq-border p-4 text-center">
          <div className="text-[12px] text-bunq-mute">Closest guess of the week wins</div>
          <div className="text-[20px] font-bold mt-1" style={{ color: '#00C896' }}>€10 to your savings goal 🎯</div>
        </div>
      </div>
    </div>
  )
}

function stringHash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}
