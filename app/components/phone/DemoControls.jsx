import { useState } from 'react'
import { py } from '../../lib/api.js'

const PRESETS = [
  { merchant: 'Albert Heijn', amount: 12.45, emoji: '🛒' },
  { merchant: 'La Pizza del Sol', amount: 14.50, emoji: '🍕' },
  { merchant: 'Tokyo Ramen Bar', amount: 18.20, emoji: '🍜' },
  { merchant: 'Le Petit Café', amount: 3.20, emoji: '☕' },
  { merchant: 'Uber', amount: 8.40, emoji: '🚗' },
  { merchant: 'Spotify', amount: 10.99, emoji: '🎧' }
]

export default function DemoControls({ userId, onTriggerLocal }) {
  const [open, setOpen] = useState(false)
  const [merchant, setMerchant] = useState('Albert Heijn')
  const [amount, setAmount] = useState('12.45')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function fireTransaction(m = merchant, a = amount) {
    setBusy(true)
    setFeedback('')
    try {
      const result = await py.simulate({ merchant: m, amount: parseFloat(a), user_id: userId })
      setFeedback(`✅ Sent — waiting for Realtime to deliver…`)
      // Belt-and-suspenders: also trigger locally if Realtime is slow
      setTimeout(() => {
        if (result?.transaction) onTriggerLocal(result.transaction)
      }, 1200)
    } catch (e) {
      // Fully offline fallback so the demo never dies
      const fakeTx = {
        id: `local-${Date.now()}`,
        user_id: userId,
        merchant: m,
        amount: parseFloat(a),
        currency: 'EUR',
        snap_deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }
      onTriggerLocal(fakeTx)
      setFeedback(`⚠️ Backend offline — fired locally only`)
    } finally {
      setBusy(false)
      setTimeout(() => setFeedback(''), 4000)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full px-4 py-3 text-xs font-bold tracking-wide bg-bunq-green text-bunq-black shadow-glow flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-bunq-black animate-pulse-soft" />
        DEMO
      </button>
    )
  }

  return (
    <div className="fixed top-6 right-6 z-50 w-[280px] rounded-2xl bg-bunq-card border border-bunq-border shadow-card p-4 font-sans">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-bunq-green uppercase">Demo Controls</div>
          <div className="text-[11px] text-bunq-mute">Trigger fake transactions</div>
        </div>
        <button onClick={() => setOpen(false)} className="text-bunq-mute text-lg leading-none px-1">×</button>
      </div>

      {/* Custom transaction */}
      <div className="space-y-2 mb-3">
        <div>
          <label className="text-[10px] uppercase tracking-wide text-bunq-mute">Merchant</label>
          <input
            value={merchant}
            onChange={e => setMerchant(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-bunq-black border border-bunq-border rounded-lg text-sm text-white focus:outline-none focus:border-bunq-green"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wide text-bunq-mute">Amount (€)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-bunq-black border border-bunq-border rounded-lg text-sm text-white font-mono focus:outline-none focus:border-bunq-green"
          />
        </div>
        <button
          onClick={() => fireTransaction()}
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-bunq-green text-bunq-black text-sm font-bold disabled:opacity-50"
        >
          {busy ? 'Firing…' : '⚡ Fire transaction'}
        </button>
      </div>

      <div className="text-[10px] uppercase tracking-wide text-bunq-mute mb-2">Quick Presets</div>
      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p.merchant}
            onClick={() => fireTransaction(p.merchant, p.amount)}
            className="px-2 py-1.5 rounded-md bg-bunq-black border border-bunq-border text-[11px] text-white text-left hover:border-bunq-green transition-colors"
          >
            <div className="flex items-center gap-1">
              <span>{p.emoji}</span>
              <span className="truncate">{p.merchant}</span>
            </div>
            <div className="text-[10px] text-bunq-mute font-mono">€{p.amount}</div>
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mt-3 text-[11px] text-bunq-mute text-center">{feedback}</div>
      )}
    </div>
  )
}