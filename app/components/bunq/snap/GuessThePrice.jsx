import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { py } from '../../../lib/api.js'
import { DEMO_USER_ID } from '../../../lib/supabase.js'

// Deterministic fake friend guesses seeded from post id + actual amount
function mockFriendGuesses(postId, actual) {
  const seed = (postId || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const spread = (n, offset) => parseFloat((actual * (offset + (((seed * n) % 31) / 100))).toFixed(2))
  return [
    { name: 'Tim',  guess: spread(3, 0.72) },
    { name: 'Lena', guess: spread(7, 0.88) },
    { name: 'Ali',  guess: spread(11, 1.12) },
    { name: 'Maya', guess: spread(5, 0.55) },
  ]
}

export default function GuessThePrice({ post }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [actualAmount, setActualAmount] = useState(null)
  const [aiReaction, setAiReaction] = useState(null)
  const [userGuess, setUserGuess] = useState(null)

  // post.amount is null for real DB posts (backend hides it) and a number for mock posts
  const isMockPost = post.amount != null

  async function handleSubmit() {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0) return
    setUserGuess(val)

    if (isMockPost) {
      // Mock path — amount already known locally
      setActualAmount(Number(post.amount))
      setSubmitted(true)
      return
    }

    // Real API path — backend reveals actual amount
    setLoading(true)
    try {
      const res = await py.submitGuess({
        transactionId: post.id,
        guesserUserId: DEMO_USER_ID || 'demo',
        guess: val,
      })
      setActualAmount(res.actual_amount)
      setAiReaction(res.ai_reaction)
      setSubmitted(true)
    } catch {
      // Backend unreachable — still show the guess as submitted, amount stays hidden
      setActualAmount(null)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const friends = actualAmount != null ? mockFriendGuesses(post.id, actualAmount) : []

  const allEntries = submitted && actualAmount != null
    ? [...friends, { name: 'You', guess: userGuess, isYou: true }]
        .map(e => ({ ...e, diff: Math.abs(e.guess - actualAmount) }))
        .sort((a, b) => a.diff - b.diff)
    : []

  return (
    <div className="border-t border-white/5">
      <div className="px-4 pt-3 pb-4">

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[15px]">💸</span>
          <span className="text-[12px] font-bold text-white">Guess the price</span>
          {!submitted && <span className="text-[11px] text-bunq-mute">— amount is hidden</span>}
        </div>

        <AnimatePresence mode="wait">
          {!submitted && !loading && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-bunq-black border border-bunq-border">
                  <span className="text-bunq-mute text-[13px] font-semibold">€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="flex-1 bg-transparent text-white text-[13px] font-semibold outline-none placeholder-bunq-mute"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2.5 rounded-xl font-bold text-[13px] text-bunq-black flex-shrink-0"
                  style={{ background: '#00C896' }}
                >
                  Guess
                </button>
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3">
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#00C896', borderTopColor: 'transparent' }} />
              <span className="text-[12px] text-bunq-mute">Checking the price…</span>
            </motion.div>
          )}

          {submitted && (
            <motion.div key="results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }} className="space-y-2">

              {/* Actual price reveal */}
              {actualAmount != null ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-1"
                  style={{ background: '#00C89618' }}>
                  <span className="text-[12px] text-bunq-mute">Actual price</span>
                  <span className="text-[15px] font-bold" style={{ color: '#00C896' }}>
                    €{actualAmount.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl mb-1" style={{ background: '#ffffff08' }}>
                  <span className="text-[12px] text-bunq-mute">Guess submitted — price stays hidden 🤫</span>
                </div>
              )}

              {/* AI reaction */}
              {aiReaction && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="px-3 py-2 rounded-xl text-[12px] text-white/80 italic"
                  style={{ background: '#8B5CF615', borderLeft: '2px solid #8B5CF6' }}
                >
                  {aiReaction}
                </motion.div>
              )}

              {/* Leaderboard */}
              {allEntries.map((entry, i) => (
                <motion.div
                  key={entry.name}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${entry.isYou ? 'border' : ''}`}
                  style={{
                    background: entry.isYou ? '#00C89610' : '#161622',
                    borderColor: entry.isYou ? '#00C896' : 'transparent',
                  }}
                >
                  <div className="w-6 text-center flex-shrink-0">
                    {i < 3
                      ? <span className="text-[14px]">{['🥇','🥈','🥉'][i]}</span>
                      : <span className="text-[12px] font-bold text-bunq-mute">#{i + 1}</span>
                    }
                  </div>
                  <span className={`flex-1 text-[13px] font-semibold ${entry.isYou ? 'text-white' : 'text-white/80'}`}>
                    {entry.name}
                  </span>
                  <span className="text-[12px] text-bunq-mute">€{entry.guess.toFixed(2)}</span>
                  <span className="text-[11px] font-bold w-14 text-right flex-shrink-0"
                    style={{ color: entry.diff < 1 ? '#00C896' : entry.diff < 4 ? '#FFD700' : '#FF7A7A' }}>
                    {entry.diff < 0.01 ? 'exact!' : `±€${entry.diff.toFixed(2)}`}
                  </span>
                </motion.div>
              ))}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
