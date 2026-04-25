import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

function mockGuesses(postId, actual) {
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
  const [submitted, setSubmitted] = useState(false)
  const [userGuess, setUserGuess] = useState(null)

  const actual = Number(post.amount)

  function handleSubmit() {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0) return
    setUserGuess(val)
    setSubmitted(true)
  }

  const friends = mockGuesses(post.id, actual)

  const allEntries = submitted
    ? [...friends, { name: 'You', guess: userGuess, isYou: true }]
        .map(e => ({ ...e, diff: Math.abs(e.guess - actual) }))
        .sort((a, b) => a.diff - b.diff)
    : []

  return (
    <div className="border-t border-white/5">
      <div className="px-4 pt-3 pb-4">

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[15px]">💸</span>
          <span className="text-[12px] font-bold text-white">Guess the price</span>
          {!submitted && (
            <span className="text-[11px] text-bunq-mute">— amount is hidden</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
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
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {/* Reveal */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-1"
                style={{ background: '#00C89618' }}>
                <span className="text-[12px] text-bunq-mute">Actual price</span>
                <span className="text-[15px] font-bold" style={{ color: '#00C896' }}>€{actual.toFixed(2)}</span>
              </div>

              {/* Leaderboard */}
              {allEntries.map((entry, i) => (
                <motion.div
                  key={entry.name}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${entry.isYou ? 'border' : ''}`}
                  style={{
                    background: entry.isYou ? '#00C89610' : '#161622',
                    borderColor: entry.isYou ? '#00C896' : 'transparent'
                  }}
                >
                  {/* Rank */}
                  <div className="w-6 text-center flex-shrink-0">
                    {i < 3
                      ? <span className="text-[14px]">{['🥇','🥈','🥉'][i]}</span>
                      : <span className="text-[12px] font-bold text-bunq-mute">#{i + 1}</span>
                    }
                  </div>

                  {/* Name */}
                  <span className={`flex-1 text-[13px] font-semibold ${entry.isYou ? 'text-white' : 'text-white/80'}`}>
                    {entry.name}
                  </span>

                  {/* Guess */}
                  <span className="text-[12px] text-bunq-mute">€{entry.guess.toFixed(2)}</span>

                  {/* Diff */}
                  <span className={`text-[11px] font-bold w-14 text-right flex-shrink-0 ${entry.diff < 1 ? '' : entry.diff < 3 ? '' : ''}`}
                    style={{ color: entry.diff < 1 ? '#00C896' : entry.diff < 4 ? '#FFD700' : '#FF7A7A' }}>
                    {entry.diff === 0 ? 'exact!' : `±€${entry.diff.toFixed(2)}`}
                  </span>
                </motion.div>
              ))}

              <button
                onClick={() => { setSubmitted(false); setInput(''); setUserGuess(null) }}
                className="w-full mt-1 py-2 rounded-xl bg-bunq-card text-bunq-mute text-[11px] font-semibold"
              >
                Guess again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
