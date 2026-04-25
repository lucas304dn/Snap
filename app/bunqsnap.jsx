import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SnapFeed from '../snap/SnapFeed.jsx'
import SnapMap from '../snap/SnapMap.jsx'
import Leaderboard from '../snap/Leaderboard.jsx'

export default function BunqSnap() {
  const [view, setView] = useState('feed') // feed | leaderboard | map

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[26px] font-bold text-bunq-green tracking-tight font-display">$nap</span>
          <span className="text-[10px] uppercase tracking-widest text-bunq-mute font-semibold">for the free</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('leaderboard')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              view === 'leaderboard' ? 'bg-bunq-green text-bunq-black' : 'bg-bunq-card text-white'
            }`}
            aria-label="Leaderboard"
          >
            🏆
          </button>
          <button
            onClick={() => setView('map')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              view === 'map' ? 'bg-bunq-green text-bunq-black' : 'bg-bunq-card text-white'
            }`}
            aria-label="Map"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 3L3 5.5v15.5l6-2.5 6 2.5 6-2.5V3l-6 2.5L9 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 3v15.5M15 5.5V21" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <button
            onClick={() => setView('feed')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              view === 'feed' ? 'bg-bunq-green text-bunq-black' : 'bg-bunq-card text-white'
            }`}
            aria-label="Feed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <rect x="4" y="14" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {view === 'feed' && (
            <motion.div key="feed" {...slideFx} className="h-full">
              <SnapFeed />
            </motion.div>
          )}
          {view === 'leaderboard' && (
            <motion.div key="lb" {...slideFx} className="h-full">
              <Leaderboard />
            </motion.div>
          )}
          {view === 'map' && (
            <motion.div key="map" {...slideFx} className="h-full">
              <SnapMap />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const slideFx = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 }
}