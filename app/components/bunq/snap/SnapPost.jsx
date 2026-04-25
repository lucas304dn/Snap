import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DEMO_USER_ID } from '../../../lib/supabase.js'
import GuessThePrice from './GuessThePrice.jsx'

const REACTION_EMOJIS = ['🔥', '💀', '😍', '🤑']

const FRIEND_NAMES = ['Lena', 'Tim', 'Ali', 'Maya', 'Sara', 'Max', 'Jo', 'Kim']
function nameFromId(userId) {
  const h = (userId || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return FRIEND_NAMES[h % FRIEND_NAMES.length]
}

function seedReactions(postId) {
  const seed = (postId || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return Object.fromEntries(REACTION_EMOJIS.map((e, i) => [e, 1 + ((seed + i * 7) % 8)]))
}

// Per-emoji animation flavour
const EMOJI_STYLE = {
  '🔥': { count: 7, spread: 40, yMin: 50, yMax: 90, rotate: 30 },
  '💀': { count: 5, spread: 25, yMin: 30, yMax: 60, rotate: 180 },
  '😍': { count: 8, spread: 50, yMin: 60, yMax: 100, rotate: 20 },
  '🤑': { count: 6, spread: 45, yMin: 40, yMax: 80, rotate: 45 },
}

function makeBurst(emoji) {
  const style = EMOJI_STYLE[emoji] || EMOJI_STYLE['🔥']
  return Array.from({ length: style.count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * style.spread * 2,
    y: -(style.yMin + Math.random() * (style.yMax - style.yMin)),
    rotate: (Math.random() - 0.5) * style.rotate * 2,
    scale: 0.8 + Math.random() * 0.8,
    delay: i * 0.04,
  }))
}

export default function SnapPost({ post }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [reactions, setReactions] = useState(() => seedReactions(post.id))
  const [myReactions, setMyReactions] = useState(new Set())
  const [burst, setBurst] = useState(null) // { emoji, particles, key, origin }
  const burstRef = useRef(0)
  const rowRef = useRef(null)

  const isOwn = post.user_id === DEMO_USER_ID
  const fallbackName = nameFromId(post.user_id)
  const rawUsername  = post.profiles?.username || post.profiles?.display_name || fallbackName
  const username     = isOwn ? 'you' : rawUsername.toLowerCase()
  const displayName  = isOwn ? 'You' : (post.profiles?.display_name || rawUsername)
  const initial      = displayName[0].toUpperCase()
  const when = relativeTime(post.snapped_at)

  function toggleReaction(emoji, event) {
    const alreadyReacted = myReactions.has(emoji)
    setMyReactions(prev => {
      const next = new Set(prev)
      alreadyReacted ? next.delete(emoji) : next.add(emoji)
      return next
    })
    setReactions(prev => ({
      ...prev,
      [emoji]: prev[emoji] + (alreadyReacted ? -1 : 1),
    }))

    // Trigger burst animation on reaction (not on un-react)
    if (!alreadyReacted) {
      burstRef.current += 1
      let origin = { x: 24, y: 12 }
      if (rowRef.current && event?.currentTarget) {
        const rowRect = rowRef.current.getBoundingClientRect()
        const btnRect = event.currentTarget.getBoundingClientRect()
        origin = {
          x: btnRect.left - rowRect.left + btnRect.width / 2 - 10,
          y: rowRect.bottom - btnRect.bottom + btnRect.height / 2 - 10,
        }
      }
      setBurst({ emoji, particles: makeBurst(emoji), key: burstRef.current, origin })
      setTimeout(() => setBurst(null), 1100)
    }
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl bunq-card"
      >
        {/* Header */}
        <header className="px-3 py-2.5 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-bunq-black font-bold text-[14px] flex-shrink-0"
            style={{ background: isOwn ? '#00C896' : `hsl(${stringHash(username) % 360}, 70%, 65%)` }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-white truncate">
                {isOwn ? 'You' : `@${username}`}
              </span>
              {isOwn && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: '#00C89620', color: '#00C896' }}>
                  your snap
                </span>
              )}
              <span className="text-bunq-mute text-[12px]">·</span>
              <span className="text-[12px] text-bunq-mute">{when}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-bunq-mute mt-0.5">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 11s-4-3.5-4-7a4 4 0 1 1 8 0c0 3.5-4 7-4 7z" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="6" cy="4.5" r="1.3" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              <span className="truncate">
                {post.location_name || 'Somewhere'}
                {post.country_code && <span className="text-bunq-mute-2"> · {post.country_code}</span>}
              </span>
            </div>
          </div>
          <button className="text-bunq-mute text-xl px-1">⋯</button>
        </header>

        {/* Photo — tappable to open lightbox */}
        <button
          className="relative w-full aspect-square bg-bunq-black overflow-hidden block"
          onClick={() => setLightboxOpen(true)}
        >
          {!imgLoaded && <div className="absolute inset-0 bg-bunq-card animate-pulse" />}
          <img
            src={post.photo_url}
            alt={post.caption || 'snap'}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-bunq-black/65 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white">
            💳 {post.merchant}
          </div>
          {post.show_amount && post.amount != null && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-bunq-green/90 backdrop-blur-md text-[11px] font-bold text-bunq-black">
              €{Number(post.amount).toFixed(2)}
            </div>
          )}
          {/* Tap to expand hint */}
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur text-[10px] text-white/70">
            tap to expand
          </div>
        </button>

        {/* Caption */}
        {post.caption && (
          <div className="px-4 pt-3 pb-2">
            <p className="text-[14px] leading-snug text-white">
              <span className="font-bold mr-1.5">{isOwn ? 'You' : `@${username}`}</span>
              <span className="text-white/95">{post.caption}</span>
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-bunq-green/15 text-bunq-green font-semibold uppercase tracking-wider text-[9px]">
                AI caption
              </span>
            </div>
          </div>
        )}

        {/* Reactions row with burst animation */}
        <div ref={rowRef} className="relative px-3 py-2 flex items-center gap-1.5 border-t border-white/5 overflow-visible">
          {REACTION_EMOJIS.map(emoji => {
            const active = myReactions.has(emoji)
            return (
              <motion.button
                key={emoji}
                whileTap={{ scale: 0.85 }}
                onClick={(ev) => toggleReaction(emoji, ev)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? 'text-bunq-black'
                    : 'bg-bunq-card text-bunq-mute hover:bg-bunq-border'
                }`}
                style={active ? { background: '#00C896' } : {}}
              >
                <span>{emoji}</span>
                <span className="text-[11px]">{reactions[emoji]}</span>
              </motion.button>
            )
          })}
          <div className="flex-1" />
          <button className="text-bunq-mute hover:text-white text-[12px] font-medium transition-colors">↗ Share</button>

          {/* Burst particles */}
          <AnimatePresence>
            {burst && burst.particles.map(p => (
              <motion.span
                key={`${burst.key}-${p.id}`}
                initial={{ opacity: 1, x: 0, y: 0, scale: p.scale, rotate: 0 }}
                animate={{ opacity: 0, x: p.x, y: p.y, scale: p.scale * 1.3, rotate: p.rotate }}
                exit={{}}
                transition={{ duration: 0.85, ease: 'easeOut', delay: p.delay }}
                className="absolute pointer-events-none text-xl select-none"
                style={{ left: burst.origin.x, bottom: burst.origin.y, zIndex: 20 }}
              >
                {burst.emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Guess the price — only on other people's posts where amount is hidden */}
        {!isOwn && !post.show_amount && (
          <GuessThePrice post={post} />
        )}
      </motion.article>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm px-4"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={post.photo_url}
                alt={post.caption || 'snap'}
                className="w-full rounded-2xl object-cover shadow-2xl"
              />
              <div className="mt-3 flex items-center justify-between px-1">
                <div>
                  <div className="text-white font-bold text-[15px]">{isOwn ? 'You' : `@${username}`} · {post.merchant}</div>
                  {post.caption && (
                    <div className="text-white/70 text-[13px] mt-0.5 italic">{post.caption}</div>
                  )}
                </div>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-xl flex-shrink-0 ml-3"
                >
                  ×
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function relativeTime(iso) {
  if (!iso) return 'just now'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function stringHash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}
