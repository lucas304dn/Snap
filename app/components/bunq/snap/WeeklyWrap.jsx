import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { py } from '../../../lib/api.js'
import { DEMO_USER_ID } from '../../../lib/supabase.js'

const RAINBOW = ['#FF3A2D', '#FF7A00', '#FFD700', '#00C896', '#4361EE', '#8B5CF6']

function mapWrapData(raw) {
  const wrap = raw.wrap || ''
  const spending = wrap.replace(/PERSONALITY:.*$/m, '').trim()

  const transactions = (raw.transactions || []).map(tx => ({
    merchant: tx.merchant,
    location: tx.location_name,
    date: tx.snapped_at
      ? new Date(tx.snapped_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      : '',
    amount: Number(tx.amount).toFixed(2),
    photo_url: tx.photo_url || null,
    // Keep raw fields so we can open them in a lightbox
    _raw: tx,
  }))

  const mention_tx = (raw.transactions || []).find(tx => tx.photo_url && tx.caption)
  return {
    spending,
    transactions,
    top_category: raw.top_category || null,
    fun_fact: raw.fun_fact || null,
    mention: mention_tx?.caption || null,
    mention_photo: mention_tx?.photo_url || null,
    mention_merchant: mention_tx?.merchant || null,
  }
}

export default function WeeklyWrap({ onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  const fetchWrap = useCallback(() => {
    setLoading(true)
    setError(null)
    setData(null)
    py.weeklyWrap(DEMO_USER_ID)
      .then(raw => { setData(mapWrapData(raw)); setLoading(false) })
      .catch(e => { setError(e.message || 'Could not reach the backend.'); setLoading(false) })
  }, [])

  useEffect(() => { fetchWrap() }, [fetchWrap])

  const totalSpent = data?.transactions
    ? data.transactions.reduce((s, t) => s + parseFloat(t.amount || 0), 0)
    : 0

  const cities = data?.transactions
    ? [...new Set(data.transactions.map(t => t.location).filter(Boolean))].length
    : 0

  return (
    <>
      <div className="absolute inset-0 flex flex-col" style={{ background: 'linear-gradient(160deg, #0d0d1a 0%, #0A0A0F 60%, #0d1a14 100%)' }}>

        {/* Rainbow stripe */}
        <div className="flex h-[3px] flex-shrink-0">
          {RAINBOW.map(c => <div key={c} className="flex-1" style={{ background: c }} />)}
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <BunqFace size={40} />
            <div>
              <div className="text-[18px] font-bold text-white tracking-tight">Weekly Wrap</div>
              <div className="text-[10px] text-bunq-mute uppercase tracking-wider">Powered by Claude AI</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-bunq-card flex items-center justify-center text-white text-lg">
            ×
          </button>
        </div>

        {/* Date range */}
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
                <div className="w-14 h-14 rounded-full border-2 animate-spin"
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

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Spent" value={`€${totalSpent.toFixed(0)}`} color="#00C896" />
                  <StatCard label="Transactions" value={data.transactions?.length ?? 0} color="#4361EE" />
                  <StatCard label="Cities" value={cities || '—'} color="#FF7A00" />
                </div>

                {/* Top category badge */}
                {data.top_category && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-bunq-card border border-bunq-border">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-bunq-mute">Top category</span>
                    <span className="text-[13px] font-bold text-white ml-auto">{data.top_category}</span>
                  </div>
                )}

                {/* AI spending analysis */}
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

                {/* Fun fact */}
                {data.fun_fact && (
                  <div className="rounded-2xl px-4 py-3 border border-yellow-400/20"
                    style={{ background: '#FFD70010' }}>
                    <div className="flex items-start gap-2">
                      <span className="text-[16px]">💡</span>
                      <p className="text-[12px] text-white/85 leading-relaxed italic">{data.fun_fact}</p>
                    </div>
                  </div>
                )}

                {/* Memorable mention */}
                {data.mention && (
                  <div className="rounded-2xl border-l-4 p-4" style={{ background: '#1a1030', borderColor: '#8B5CF6' }}>
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
                    <p className="text-[13px] text-white/90 leading-relaxed italic mb-3">{data.mention}</p>
                    {data.mention_photo && (
                      <button
                        onClick={() => setLightbox(data.mention_photo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border"
                        style={{ borderColor: '#8B5CF640', color: '#8B5CF6', background: '#8B5CF610' }}
                      >
                        <span>📸</span> View photo
                      </button>
                    )}
                  </div>
                )}

                {/* Transaction list */}
                {data.transactions && data.transactions.length > 0 && (
                  <div>
                    <div className="text-[11px] uppercase tracking-widest font-bold text-bunq-mute mb-2">All transactions</div>
                    <div className="space-y-2">
                      {data.transactions.map((tx, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-3 rounded-xl bg-bunq-card border border-bunq-border px-3 py-2.5"
                        >
                          {tx.photo_url ? (
                            <button onClick={() => setLightbox(tx.photo_url)} className="flex-shrink-0">
                              <img
                                src={tx.photo_url}
                                alt=""
                                className="w-11 h-11 rounded-xl object-cover hover:opacity-80 transition-opacity"
                              />
                            </button>
                          ) : (
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                              style={{ background: RAINBOW[i % RAINBOW.length] + '22' }}
                            >
                              💳
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-white truncate">{tx.merchant}</div>
                            <div className="text-[11px] text-bunq-mute">
                              {tx.location}{tx.date ? ` · ${tx.date}` : ''}
                            </div>
                          </div>
                          <div className="text-[14px] font-bold flex-shrink-0" style={{ color: '#00C896' }}>
                            €{tx.amount}
                          </div>
                        </motion.div>
                      ))}
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

      {/* Photo lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <img src={lightbox} alt="" className="w-full rounded-2xl object-cover shadow-2xl" />
              <button
                onClick={() => setLightbox(null)}
                className="mt-4 w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-bunq-card border border-bunq-border p-3 text-center">
      <div className="text-[20px] font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-bunq-mute mt-0.5 font-semibold">{label}</div>
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
