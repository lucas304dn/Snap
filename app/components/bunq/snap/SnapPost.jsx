import { useState } from 'react'
import { motion } from 'framer-motion'
import GuessThePrice from './GuessThePrice.jsx'

export default function SnapPost({ post }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const username = post.profiles?.username || post.profiles?.display_name || 'friend'
  const initial = (post.profiles?.display_name || username || '?')[0].toUpperCase()
  const when = relativeTime(post.snapped_at)

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
          style={{ background: `hsl(${stringHash(username) % 360}, 70%, 65%)` }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-white truncate">@{username}</span>
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
            <span className="font-bold mr-1.5">@{username}</span>
            <span className="text-white/95">{post.caption}</span>
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="px-1.5 py-0.5 rounded-md bg-bunq-green/15 text-bunq-green font-semibold uppercase tracking-wider text-[9px]">
              AI caption
            </span>
          </div>
        </div>
      )}

      {/* Reactions row */}
      <div className="px-4 py-2.5 flex items-center gap-3 text-bunq-mute border-t border-white/5">
        {['🔥', '💀', '😍', '🤑'].map(e => (
          <button key={e} className="text-lg hover:scale-110 transition-transform">{e}</button>
        ))}
        <div className="flex-1" />
        <button className="text-bunq-mute hover:text-white text-sm">↗ Share</button>
      </div>

      {/* Guess the price — only when amount is hidden */}
      {!post.show_amount && post.amount != null && (
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
