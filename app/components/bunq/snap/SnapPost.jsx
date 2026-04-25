import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DEMO_USER_ID } from '../../../lib/supabase.js'
import GuessThePrice from './GuessThePrice.jsx'

const REACTIONS = ['🔥', '💀', '😍', '🤑']

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
  const [burst, setBurst] = useState(null) // { emoji, particles, key, origin }
  const burstRef = useRef(0)
  const rowRef = useRef(null)

  const isOwnPost = post.user_id === DEMO_USER_ID
  const username = post.profiles?.username || post.profiles?.display_name || 'friend'
  const displayName = isOwnPost ? 'You' : `@${username}`
  const initial = isOwnPost ? 'Y' : (post.profiles?.display_name || username || '?')[0].toUpperCase()
  const when = relativeTime(post.snapped_at)

  function handleReaction(emoji, event) {
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden bunq-card"
    >
      {/* Header */}
      <header className="px-3 py-2.5 flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-bunq-black font-bold text-[14px]"
          style={{ background: isOwnPost ? '#00DCAA' : `hsl(${stringHash(username) % 360}, 70%, 65%)` }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-white truncate">{displayName}</span>
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

      {/* Photo */}
      <div className="relative aspect-square bg-bunq-black overflow-hidden">
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
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pt-3 pb-2">
          <p className="text-[14px] leading-snug text-white">
            <span className="font-bold mr-1.5">{displayName}</span>
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
      <div ref={rowRef} className="relative px-4 py-2.5 flex items-center gap-3 border-t border-white/5 overflow-visible">
        {REACTIONS.map(e => (
          <motion.button
            key={e}
            onClick={(ev) => handleReaction(e, ev)}
            whileTap={{ scale: 1.4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="text-lg relative z-10"
          >
            {e}
          </motion.button>
        ))}
        <div className="flex-1" />
        <button className="text-bunq-mute hover:text-white text-sm">↗ Share</button>

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
      {!isOwnPost && !post.show_amount && (
        <GuessThePrice post={post} />
      )}
    </motion.article>
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
