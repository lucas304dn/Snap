import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SnapFeed from '../snap/SnapFeed.jsx'
import SnapMap from '../snap/SnapMap.jsx'
import WeeklyWrap from '../snap/WeeklyWrap.jsx'

export default function BunqSnap() {
  // Single overlay state — guarantees map and wrap are never both mounted
  const [overlay, setOverlay] = useState(null) // null | 'map' | 'wrap'

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-[56px] pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[28px] font-bold tracking-tight font-display"
            style={{
              background: 'linear-gradient(90deg, #FF3A2D, #FF7A00, #FFD700, #00C896, #4361EE, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >$nap</span>
          <span className="text-[10px] uppercase tracking-widest text-bunq-mute font-semibold">for the free</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Weekly Wrap button — bunq face */}
          <button
            onClick={() => setOverlay('wrap')}
            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
            aria-label="Weekly Wrap"
          >
            <BunqFaceSmall />
          </button>
          {/* Map toggle */}
          <button
            onClick={() => setOverlay(v => v === 'map' ? null : 'map')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              overlay === 'map' ? 'text-bunq-black' : 'bg-bunq-card text-white'
            }`}
            style={overlay === 'map' ? { background: '#00C896' } : {}}
            aria-label="Toggle map"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 3L3 5.5v15.5l6-2.5 6 2.5 6-2.5V3l-6 2.5L9 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 3v15.5M15 5.5V21" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 relative">
        <SnapFeed />

        <AnimatePresence>
          {overlay === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <SnapMap onClose={() => setOverlay(null)} />
            </motion.div>
          )}

          {overlay === 'wrap' && (
            <motion.div
              key="wrap"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <WeeklyWrap onClose={() => setOverlay(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function BunqFaceSmall() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="ring-s" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3A2D"/>
          <stop offset="20%" stopColor="#FF7A00"/>
          <stop offset="40%" stopColor="#FFD700"/>
          <stop offset="60%" stopColor="#00C896"/>
          <stop offset="80%" stopColor="#4361EE"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill="url(#ring-s)"/>
      <circle cx="18" cy="18" r="13" fill="#1a1030"/>
      <rect x="13" y="14" width="3" height="4" rx="1.5" fill="white"/>
      <rect x="20" y="14" width="3" height="4" rx="1.5" fill="white"/>
      <path d="M13 22 Q18 27 23 22" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}
