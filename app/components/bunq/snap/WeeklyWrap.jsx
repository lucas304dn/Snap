import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { py } from '../../../lib/api.js'
import { DEMO_USER_ID } from '../../../lib/supabase.js'

const RAINBOW = ['#FF3A2D','#FF7A00','#FFD700','#00C896','#4361EE','#8B5CF6']

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
    // Keep raw fields so we can open them in a post modal
    _raw: tx,
  }))

  const mention_tx = (raw.transactions || []).find(tx => tx.photo_url && tx.caption)
  return {
    spending,
    transactions,
    mention: mention_tx?.caption || null,
    mention_photo: mention_tx?.photo_url || null,
    mention_merchant: mention_tx?.merchant || null,
  }
}

function rawToPost(tx) {
  return {
    id: tx.snapped_at || tx.merchant,
    user_id: DEMO_USER_ID,
    merchant: tx.merchant,
    amount: tx.amount,
    currency: tx.currency || 'EUR',
    photo_url: tx.photo_url,
    caption: tx.caption,
    location_name: tx.location_name,
    country_code: tx.country_code,
    snapped_at: tx.snapped_at,
    show_amount: true,
    profiles: { username: 'you', display_name: 'You' },
  }
}

export default function WeeklyWrap({ onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openPost, setOpenPost] = useState(null) // raw tx for post modal

  const fetchWrap = useCallback(() => {
    setLoading(true)
    setError(null)
    setData(null)
    py.weeklyWrap(DEMO_USER_ID)
      .then(raw => { setData(mapWrapData(raw)); setLoading(false) })
      .catch(e => { setError(e.message || 'Could not reach the backend.'); setLoading(false) })
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
                      <button
                        key={i}
                        onClick={() => tx._raw?.photo_url && setOpenPost(tx._raw)}
                        className={`w-full flex items-center gap-3 rounded-xl bg-bunq-card border border-bunq-border px-3 py-2.5 text-left transition-opacity ${tx._raw?.photo_url ? 'active:opacity-70' : ''}`}
                      >
                        {tx.photo_url ? (
                          <div className="relative flex-shrink-0">
                            <img src={tx.photo_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                            <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/20">
                              <span className="text-[9px] text-white font-bold opacity-0 group-hover:opacity-100">👁</span>
                            </div>
                          </div>
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
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="text-[13px] font-bold" style={{ color: '#00C896' }}>€{tx.amount}</div>
                          {tx.photo_url && <span className="text-bunq-mute text-[11px]">›</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Memorable mention */}
              {data.mention && (
                <button
                  onClick={() => {
                    const raw = data.transactions?.find(t => t.photo_url === data.mention_photo)?._raw
                    if (raw) setOpenPost(raw)
                  }}
                  className="w-full rounded-2xl overflow-hidden border-l-4 text-left active:opacity-70 transition-opacity"
                  style={{ background: '#1a1030', borderColor: '#8B5CF6' }}
                >
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
                </button>
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

      {/* Post modal — tap a photo to open */}
      <AnimatePresence>
        {openPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
            style={{ zIndex: 50 }}
            onClick={() => setOpenPost(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="bg-bunq-navy rounded-t-3xl overflow-hidden max-h-[90%] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle + close */}
              <div className="flex items-center justify-between px-5 pt-3 pb-2">
                <div className="w-10 h-1 bg-bunq-border rounded-full mx-auto" />
              </div>
              <div className="flex justify-end px-5 pb-2">
                <button onClick={() => setOpenPost(null)} className="text-bunq-mute text-xl w-8 h-8 flex items-center justify-center">×</button>
              </div>

              {/* Photo */}
              {openPost.photo_url && (
                <img src={openPost.photo_url} alt="" className="w-full aspect-square object-cover" />
              )}

              {/* Details */}
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[15px] font-bold text-white">{openPost.merchant}</div>
                  <div className="text-[14px] font-bold text-bunq-green">€{Number(openPost.amount).toFixed(2)}</div>
                </div>
                {openPost.location_name && (
                  <div className="text-[12px] text-bunq-mute flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M6 11s-4-3.5-4-7a4 4 0 1 1 8 0c0 3.5-4 7-4 7z" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="6" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    {openPost.location_name}{openPost.country_code ? ` · ${openPost.country_code}` : ''}
                  </div>
                )}
                {openPost.caption && (
                  <p className="text-[14px] text-white/90 leading-snug">
                    <span className="font-bold mr-1">You</span>{openPost.caption}
                  </p>
                )}
                {openPost.snapped_at && (
                  <div className="text-[11px] text-bunq-mute-2">
                    {new Date(openPost.snapped_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
