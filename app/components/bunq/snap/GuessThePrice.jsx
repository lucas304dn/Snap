import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { py, node } from '../../../lib/api.js'
import { DEMO_USER_ID } from '../../../lib/supabase.js'
import { addPoints } from '../../../lib/points.js'

const LOCAL_HINTS = [
  { match: /pizza|pasta|italian/i,              hints: ['Carbs are the cheapest currency 🍝', 'Less than a Lambo, more than a Lego'] },
  { match: /ramen|noodle|sushi|tokyo/i,         hints: ['Worth every slurp 🍜', 'Late-night taxes apply'] },
  { match: /coffee|café|espresso|latte|sugarbird/i, hints: ['About a sip of Paris ☕', 'Liquid productivity'] },
  { match: /uber|taxi|cab/i,                    hints: ['Surge pricing has feelings 🚗', 'Cheaper than a scooter'] },
  { match: /albert heijn|lidl|grocery|supermarket|hema/i, hints: ['Bulk savings, single regret 🛒', 'Snack math is hard'] },
  { match: /spotify|music|netflix/i,            hints: ['Subscription guilt activated 🎧', 'Less than a vinyl, more than a stream'] },
  { match: /beer|brouwerij|bar|pub/i,           hints: ['Cheaper than wine, classier than water 🍺', 'Liquid decision-making'] },
  { match: /cafe|jaren|petit/i,                 hints: ['Canal view included in the price 🌊', 'Ambiance tax applies'] },
]

const FRIENDS = [
  { name: 'Lena', color: '#FF7A00' },
  { name: 'Tim',  color: '#4361EE' },
  { name: 'Ali',  color: '#8B5CF6' },
  { name: 'Maya', color: '#FF3A2D' },
]

// Returns the canonical price for a post — always a valid number, never null.
// Uses post.amount if available, otherwise derives a stable price from postId seed.
function postPrice(postId, postAmount) {
  if (postAmount != null && Number(postAmount) > 0) return Number(postAmount)
  // Seeded fallback: consistent per post, €5–€28 range (typical food/drink)
  const s = (postId || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return parseFloat((5 + (s % 230) / 10).toFixed(2))
}

function friendGuesses(postId, actualPrice) {
  const s = (postId || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  // Each friend has a fixed bias relative to actual:
  // Lena: −15%, Tim: +15%, Ali: −7%, Maya: +7%  (plus small seeded noise ±4%)
  // → user has a real chance to beat Lena/Tim with a decent guess
  return FRIENDS.map((f, i) => {
    const noisePct = (((s * (i + 1) * 31) % 80) - 40) / 1000  // ±4%
    const bias     = [0.85, 1.15, 0.93, 1.07][i]
    const g        = Math.max(0.10, parseFloat((actualPrice * (bias + noisePct)).toFixed(2)))
    return { ...f, guess: g }
  })
}

function reaction(diff) {
  if (diff < 0.5)  return 'Are you psychic?! 🎯🎯🎯'
  if (diff < 2)    return 'So close! 🔥'
  if (diff < 5)    return 'Not bad at all 👏'
  if (diff < 10)   return 'Bold guess 😬'
  return 'Back to the drawing board 😅'
}

// Points based on finishing position (1st = 100, 2nd = 75, 3rd = 50, 4th = 25, 5th = 10)
const RANK_POINTS = [100, 75, 50, 25, 10]
function pointsForRank(rank) {
  return RANK_POINTS[rank - 1] ?? 10
}

export default function GuessThePrice({ post }) {
  const [open, setOpen]               = useState(true)
  const [guess, setGuess]             = useState('')
  const [hint, setHint]               = useState(null)
  const [loadingHint, setLoadingHint] = useState(false)
  const [result, setResult]           = useState(null)   // { actual, friends }
  const [submitting, setSubmitting]   = useState(false)

  // Load hint — uses actual photo via Claude vision on the Node backend
  async function loadHint() {
    if (hint) return
    setLoadingHint(true)
    try {
      const data = await node.guessHint({ photo_url: post.photo_url, merchant: post.merchant })
      setHint(data?.hint || pickLocalHint(post.merchant))
    } catch {
      setHint(pickLocalHint(post.merchant))
    } finally {
      setLoadingHint(false)
    }
  }

  // Section starts open — fetch hint immediately on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadHint() }, [])

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) loadHint()
  }

  async function submit() {
    const val = parseFloat(guess)
    if (!guess || isNaN(val) || val <= 0) return
    setSubmitting(true)
    try {
      const data = await py.submitGuess({
        transactionId: post.id,
        guesserUserId: DEMO_USER_ID || 'demo',
        guess: val,
      })
      const actual  = postPrice(post.id, data?.actual_amount ?? post.amount)
      const friends = friendGuesses(post.id, actual)
      commitResult(val, actual, friends)
    } catch {
      const actual  = postPrice(post.id, post.amount)
      const friends = friendGuesses(post.id, actual)
      commitResult(val, actual, friends)
    } finally {
      setSubmitting(false)
    }
  }

  function commitResult(val, actual, friends) {
    // Rank user among all guesses, then push points to the shared leaderboard store
    const allEntries = [
      ...friends.map(f => ({ diff: Math.abs(f.guess - actual), isYou: false })),
      { diff: Math.abs(val - actual), isYou: true },
    ].sort((a, b) => a.diff - b.diff)
    const rank = allEntries.findIndex(e => e.isYou) + 1
    addPoints(pointsForRank(rank))
    setResult({ actual, friends })
  }

  return (
    <div className="border-t border-white/5">
      {/* Header — collapses only if not yet guessed */}
      <button
        onClick={result ? undefined : toggle}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-left ${result ? 'cursor-default' : ''}`}
      >
        <span className="flex items-center gap-2">
          <span className="text-[16px]">{result ? '✅' : '💸'}</span>
          <span className="text-[13px] font-bold text-white">
            {result ? 'Guess locked in' : 'Guess the price'}
          </span>
          {!result && (
            <span className="px-1.5 py-0.5 rounded-md bg-yellow-400/20 text-yellow-400 font-bold text-[9px] uppercase tracking-wider">
              up to 100 pts
            </span>
          )}
        </span>
        {!result && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-bunq-mute text-sm"
          >
            ▾
          </motion.span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {/* AI hint */}
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border"
                      style={{ background: '#00C89610', borderColor: '#00C89630' }}>
                      <span className="text-sm mt-0.5" style={{ color: '#00C896' }}>✨</span>
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-wide font-bold mb-0.5" style={{ color: '#00C896' }}>
                          AI hint
                        </div>
                        <div className="text-[12px] text-white/90 italic leading-snug">
                          {loadingHint ? 'Thinking…' : (hint || 'Smaller than rent, bigger than a tip 💸')}
                        </div>
                      </div>
                    </div>

                    {/* Input row */}
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-1 px-3 py-2 rounded-xl bg-bunq-black border border-bunq-border focus-within:border-bunq-green transition-colors min-w-0">
                        <span className="text-bunq-mute text-[13px] font-semibold flex-shrink-0">€</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Your guess"
                          value={guess}
                          onChange={e => setGuess(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && submit()}
                          className="flex-1 min-w-0 bg-transparent text-white font-mono text-sm outline-none placeholder-bunq-mute"
                        />
                      </div>
                      <button
                        onClick={submit}
                        disabled={!guess || submitting}
                        className="px-3 py-2 rounded-xl font-bold text-[12px] text-bunq-black disabled:opacity-40 transition-opacity flex-shrink-0"
                        style={{ background: '#00C896' }}
                      >
                        {submitting ? '…' : 'Lock in'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <Leaderboard
                    actual={result.actual}
                    yourGuess={parseFloat(guess)}
                    friends={result.friends}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Leaderboard({ actual, yourGuess, friends }) {
  const hasActual = actual != null

  const entries = [
    ...friends.map(f => ({ name: f.name, color: f.color, guess: f.guess, isYou: false })),
    { name: 'You', color: '#00C896', guess: yourGuess, isYou: true },
  ]
    .map(e => ({ ...e, diff: hasActual ? Math.abs(e.guess - actual) : null }))
    .sort((a, b) => (a.diff ?? 999) - (b.diff ?? 999))

  const yourEntry   = entries.find(e => e.isYou)
  const yourRank    = entries.indexOf(yourEntry) + 1
  const yourDiff    = yourEntry?.diff ?? null
  const reactionMsg = yourDiff != null ? reaction(yourDiff) : 'Locked in!'
  const earnedPts   = pointsForRank(yourRank)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <motion.div
      key="leaderboard"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      {/* Actual price reveal */}
      {hasActual && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: '#00C89618', border: '1px solid #00C89640' }}
        >
          <span className="text-[11px] uppercase tracking-widest font-bold text-bunq-mute">Actual price</span>
          <span className="text-[22px] font-bold font-mono" style={{ color: '#00C896' }}>
            €{Number(actual).toFixed(2)}
          </span>
        </motion.div>
      )}

      {/* Reaction + points earned */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[12px] text-white/70 italic">{reactionMsg}</span>
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
          className="px-2 py-0.5 rounded-full font-bold text-[11px]"
          style={{ background: '#FFD70025', color: '#FFD700' }}
        >
          +{earnedPts} pts
        </motion.span>
      </div>

      {/* Ranked rows */}
      <div className="space-y-1.5">
        {entries.map((entry, i) => {
          const pts = pointsForRank(i + 1)
          return (
            <motion.div
              key={entry.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.06 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{
                background: entry.isYou ? '#00C89614' : '#ffffff08',
                border: entry.isYou ? '1px solid #00C89640' : '1px solid transparent',
              }}
            >
              {/* Medal / rank */}
              <div className="w-6 text-center flex-shrink-0">
                {i < 3
                  ? <span className="text-[15px]">{medals[i]}</span>
                  : <span className="text-[11px] font-bold text-bunq-mute">#{i + 1}</span>
                }
              </div>

              {/* Avatar dot + name */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: entry.color }}
                >
                  {entry.name[0]}
                </div>
                <span className={`text-[13px] font-semibold truncate ${entry.isYou ? 'text-white' : 'text-white/80'}`}>
                  {entry.name}
                </span>
                {entry.isYou && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                    style={{ background: '#00C89620', color: '#00C896' }}>
                    you
                  </span>
                )}
              </div>

              {/* Guess + diff */}
              <div className="text-right flex-shrink-0">
                <div className="text-[12px] font-mono text-white/70">
                  €{Number(entry.guess).toFixed(2)}
                </div>
                {entry.diff != null && (
                  <div className="text-[10px]"
                    style={{ color: entry.diff < 0.5 ? '#00C896' : entry.diff < 2 ? '#FFD700' : '#FF7A7A' }}>
                    {entry.diff < 0.01 ? 'exact!' : `±€${entry.diff.toFixed(2)}`}
                  </div>
                )}
              </div>

              {/* Points badge */}
              <span
                className="text-[10px] font-bold w-10 text-right flex-shrink-0"
                style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#ffffff40' }}
              >
                {pts}pts
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function pickLocalHint(merchant) {
  for (const r of LOCAL_HINTS) {
    if (r.match.test(merchant || '')) {
      return r.hints[Math.floor(Math.random() * r.hints.length)]
    }
  }
  return 'Smaller than rent, bigger than a tip 💸'
}
