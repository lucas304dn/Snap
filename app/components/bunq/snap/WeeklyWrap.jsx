import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const RAINBOW = ['#FF3A2D','#FF7A00','#FFD700','#00C896','#4361EE','#8B5CF6']

export default function WeeklyWrap({ onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWrap = useCallback(() => {
    setLoading(true)
    setError(null)
    setData(null)
    fetch('http://localhost:3001/api/wrap', { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return }
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not reach the backend. Make sure npm run server is running.')
        setLoading(false)
      })
  }, [])

  useEffect(() => { fetchWrap() }, [fetchWrap])

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: 'linear-gradient(160deg, #0d0d1a 0%, #0A0A0F 60%, #0d1a14 100%)' }}>

      {/* Rainbow stripe */}
      <div className="flex h-[3px] flex-shrink-0">
        {RAINBOW.map(c => <div key={c} className="flex-1" style={{ background: c }} />)}
      </div>

      {/* Header */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <BunqFace size={40} />
          <div>
            <div className="text-[17px] font-bold text-white tracking-tight">Weekly Wrap</div>
            <div className="text-[10px] text-bunq-mute uppercase tracking-wider">Powered by Claude AI</div>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-bunq-card flex items-center justify-center text-white text-lg">
          ×
        </button>
      </div>

      {/* Date range pill */}
      <div className="px-5 mb-3 flex-shrink-0">
        <span className="px-3 py-1 rounded-full bg-bunq-card text-[11px] text-bunq-mute font-semibold border border-bunq-border">
          {weekRange()}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-28">
        <AnimatePresence mode="wait">

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-16 gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#00C896', borderTopColor: 'transparent' }} />
              <div className="text-[14px] font-semibold text-white">Analysing your week…</div>
              <div className="text-[12px] text-bunq-mute">Claude is reading your transactions</div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="pt-12 text-center space-y-3">
              <div className="text-3xl">⚠️</div>
              <div className="text-[14px] font-semibold text-white">Could not generate wrap</div>
              <div className="text-[12px] text-bunq-mute leading-relaxed max-w-[240px] mx-auto">{error}</div>
              <button onClick={fetchWrap} className="mt-4 px-5 py-2.5 rounded-xl font-bold text-sm text-bunq-black"
                style={{ background: '#00C896' }}>
                Try again
              </button>
            </motion.div>
          )}

          {data && !loading && (
            <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }} className="space-y-4">

              {/* Spending paragraph */}
              {data.spending && (
                <div className="rounded-2xl bg-bunq-card border border-bunq-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00C896' }} />
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#00C896' }}>
                      This week
                    </span>
                  </div>
                  <p className="text-[13px] text-white/90 leading-relaxed">{data.spending}</p>
                </div>
              )}

              {/* Transaction list */}
              {data.transactions && data.transactions.length > 0 && (
                <div>
                  <div className="text-[11px] uppercase tracking-widest font-bold text-bunq-mute mb-2">Transactions</div>
                  <div className="space-y-2">
                    {data.transactions.map((tx, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-bunq-card border border-bunq-border px-3 py-2.5">
                        {tx.photo_url ? (
                          <img src={tx.photo_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                            style={{ background: RAINBOW[i % RAINBOW.length] + '22' }}>
                            💳
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-white truncate">{tx.merchant}</div>
                          <div className="text-[11px] text-bunq-mute">{tx.location}{tx.date ? ` · ${tx.date}` : ''}</div>
                        </div>
                        <div className="text-[13px] font-bold flex-shrink-0" style={{ color: '#00C896' }}>
                          €{tx.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memorable mention */}
              {data.mention && (
                <div className="rounded-2xl overflow-hidden border-l-4" style={{ background: '#1a1030', borderColor: '#8B5CF6' }}>
                  {data.mention_photo && (
                    <img
                      src={data.mention_photo}
                      alt={data.mention_merchant || 'mention'}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[14px]">🏆</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8B5CF6' }}>
                        Memorable mention
                      </span>
                      {data.mention_merchant && (
                        <span className="ml-auto text-[10px] text-bunq-mute font-semibold truncate max-w-[100px]">
                          {data.mention_merchant}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-white/90 leading-relaxed italic">{data.mention}</p>
                  </div>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Regenerate button */}
      {!loading && (
        <div className="absolute bottom-0 inset-x-0 px-5 pb-6 pt-3"
          style={{ background: 'linear-gradient(to top, #0A0A0F 60%, transparent)' }}>
          <button onClick={fetchWrap}
            className="w-full py-3 rounded-2xl bg-bunq-card border border-bunq-border text-white font-semibold text-[13px] flex items-center justify-center gap-2">
            <span style={{ color: '#00C896' }}>↺</span> Regenerate
          </button>
        </div>
      )}
    </div>
  )
}

function BunqFace({ size = 36 }) {
  const id = `ring-${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FF3A2D"/>
          <stop offset="20%"  stopColor="#FF7A00"/>
          <stop offset="40%"  stopColor="#FFD700"/>
          <stop offset="60%"  stopColor="#00C896"/>
          <stop offset="80%"  stopColor="#4361EE"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${id})`}/>
      <circle cx="18" cy="18" r="13" fill="#1a1030"/>
      <rect x="13" y="14" width="3" height="4" rx="1.5" fill="white"/>
      <rect x="20" y="14" width="3" height="4" rx="1.5" fill="white"/>
      <path d="M13 22 Q18 27 23 22" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function weekRange() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 6)
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(now)}`
}
