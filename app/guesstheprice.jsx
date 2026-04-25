import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { py } from '../../../lib/api.js'
import { DEMO_USER_ID } from '../../../lib/supabase.js'

// Local fallback hints by merchant keyword — kicks in if backend hint fails.
const LOCAL_HINTS = [
  { match: /pizza|pasta|italian/i, hints: ['Carbs are the cheapest currency 🍝', 'Less than a Lambo, more than a Lego'] },
  { match: /ramen|noodle|sushi|tokyo/i, hints: ['Worth every slurp 🍜', 'Late-night taxes apply'] },
  { match: /coffee|café|espresso|latte/i, hints: ['About a sip of Paris ☕', 'Liquid productivity'] },
  { match: /uber|taxi|cab/i, hints: ['Surge pricing has feelings 🚗', 'Cheaper than a scooter'] },
  { match: /albert heijn|grocery|supermarket/i, hints: ['Bulk savings, single regret 🛒', 'Snack math is hard'] },
  { match: /spotify|music/i, hints: ['Subscription guilt activated 🎧', 'Less than a vinyl, more than a stream'] }
]

export default function GuessThePrice({ post }) {
  const [open, setOpen] = useState(false)
  const [guess, setGuess] = useState('')
  const [hint, setHint] = useState(null)
  const [loadingHint, setLoadingHint] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function loadHint() {
    if (hint) return
    setLoadingHint(true)
    try {
      const data = await py.guessHint(post.id)
      setHint(data?.hint || pickLocalHint(post.merchant))
    } catch {
      setHint(pickLocalHint(post.merchant))
    } finally {
      setLoadingHint(false)
    }
  }

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) loadHint()
  }

  async function submit() {
    if (!guess) return
    setSubmitting(true)
    try {
      const data = await py.submitGuess({
        transactionId: post.id,
        guesserUserId: DEMO_USER_ID || 'demo',
        guess: parseFloat(guess)
      })
      setResult({
        actual: data?.actual_amount,
        reaction: data?.ai_reaction || 'Locked in!',
      })
    } catch {
      // Offline: simulate result if mock has amount
      const actual = post.amount ?? null
      setResult({
        actual,
        reaction: actual
          ? Math.abs(actual - parseFloat(guess)) < 1
            ? 'Spot on! 🎯'
            : `€${Math.abs(actual - parseFloat(guess)).toFixed(2)} off — close enough!`
          : 'Locked in! Reveal when the friend opens it.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 pb-4 pt-1 border-t border-white/5">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-2.5 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">💸</span>
          <span className="text-[13px] font-bold text-white">Guess the price</span>
          <span className="px-1.5 py-0.5 rounded-md bg-snap-gold/20 text-snap-gold font-semibold text-[9px] uppercase tracking-wider">
            +25 pts
          </span>
        </span>
        <span className="text-bunq-mute text-sm">{open ? '−' : '+'}</span>
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
            <div className="pt-2 space-y-3">
              {/* AI hint */}
              <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-bunq-green/8 border border-bunq-green/20">
                <span className="text-bunq-green text-sm">✨</span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wide text-bunq-green font-bold">AI hint</div>
                  <div className="text-[12px] text-white/95 mt-0.5 italic">
                    {loadingHint ? 'Thinking…' : hint || 'No hint this time.'}
                  </div>
                </div>
              </div>

              {/* Input */}
              {!result && (
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-1 px-3 py-2 rounded-xl bg-bunq-black border border-bunq-border focus-within:border-bunq-green">
                    <span className="text-bunq-mute text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Your guess"
                      value={guess}
                      onChange={e => setGuess(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                      className="flex-1 bg-transparent text-white font-mono outline-none text-sm"
                    />
                  </div>
                  <button
                    onClick={submit}
                    disabled={!guess || submitting}
                    className="px-4 py-2 rounded-xl bg-bunq-green text-bunq-black font-bold text-sm disabled:opacity-40"
                  >
                    {submitting ? '…' : 'Lock'}
                  </button>
                </div>
              )}

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-bunq-black border border-bunq-border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-bunq-mute">Your guess</div>
                      <div className="text-[16px] font-bold text-white font-mono">€{Number(guess).toFixed(2)}</div>
                    </div>
                    {result.actual != null && (
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wide text-bunq-mute">Actual</div>
                        <div className="text-[16px] font-bold text-bunq-green font-mono">€{Number(result.actual).toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-[12px] text-white/80 mt-2 italic">{result.reaction}</div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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