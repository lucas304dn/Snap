import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function PushNotification({ tx, onTap, onDismiss }) {
  const [secsLeft, setSecsLeft] = useState(() => Math.max(0, secsUntilDeadline(tx)))

  useEffect(() => {
    const i = setInterval(() => {
      const s = Math.max(0, secsUntilDeadline(tx))
      setSecsLeft(s)
      if (s <= 0) onDismiss()
    }, 1000)
    return () => clearInterval(i)
  }, [tx, onDismiss])

  // Auto-dismiss after 12s if user ignores it
  useEffect(() => {
    const t = setTimeout(onDismiss, 12_000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const mins = String(Math.floor(secsLeft / 60)).padStart(1, '0')
  const secs = String(secsLeft % 60).padStart(2, '0')
  const currency = tx.currency === 'EUR' ? '€' : tx.currency || '€'

  return (
    <motion.button
      onClick={onTap}
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -120, opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-14 left-3 right-3 z-40 rounded-[22px] backdrop-blur-2xl text-left"
      style={{
        background: 'linear-gradient(135deg, rgba(28,28,40,0.92) 0%, rgba(20,20,32,0.92) 100%)',
        border: '1px solid rgba(0, 220, 170, 0.25)',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.6), 0 0 30px -10px rgba(0,220,170,0.4)'
      }}
    >
      <div className="px-3 py-3 flex items-start gap-3">
        {/* App icon */}
        <div
          className="w-[38px] h-[38px] rounded-[10px] flex-shrink-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #00DCAA 0%, #0F8F6F 100%)',
            boxShadow: '0 2px 8px -2px rgba(0,220,170,0.5)'
          }}
        >
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 5v3.2M16 23.8V27" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M22 11.5C22 9 19.5 7.5 16.5 7.5H15c-3 0-5.5 1.7-5.5 4.5 0 2.6 2 4 5 4.5l2 .3c3 .5 5 1.9 5 4.5 0 2.8-2.5 4.7-5.5 4.7H15c-3 0-5.5-1.5-5.5-4" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[12px] font-semibold tracking-wide text-white/90 uppercase">bunq</span>
            <span className="text-[11px] text-white/55 font-mono tabular-nums">{mins}:{secs}</span>
          </div>
          <div className="text-[14px] font-semibold text-white leading-tight mb-0.5">
            💳 {currency}{Number(tx.amount).toFixed(2)} at {tx.merchant}
          </div>
          <div className="text-[12px] text-bunq-green leading-snug font-medium">
            $nap it before time runs out — tap to capture the moment
          </div>
        </div>
      </div>

      {/* Countdown progress bar */}
      <div className="h-[3px] mx-3 mb-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-bunq-green"
          initial={{ width: '100%' }}
          animate={{ width: `${(secsLeft / (5 * 60)) * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
    </motion.button>
  )
}

function secsUntilDeadline(tx) {
  if (!tx.snap_deadline) return 5 * 60
  return Math.floor((new Date(tx.snap_deadline).getTime() - Date.now()) / 1000)
}