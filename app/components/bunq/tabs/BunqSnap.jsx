import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SnapFeed from '../snap/SnapFeed.jsx'
import SnapMap from '../snap/SnapMap.jsx'

export default function BunqSnap() {
  const [showMap, setShowMap] = useState(false)

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-bold text-bunq-green tracking-tight font-display">$nap</span>
          <span className="text-[10px] uppercase tracking-widest text-bunq-mute font-semibold">for the free</span>
        </div>
        <button
          onClick={() => setShowMap(v => !v)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            showMap ? 'bg-bunq-green text-bunq-black' : 'bg-bunq-card text-white'
          }`}
          aria-label="Toggle map"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 3L3 5.5v15.5l6-2.5 6 2.5 6-2.5V3l-6 2.5L9 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 3v15.5M15 5.5V21" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 relative">
        <SnapFeed />

        <AnimatePresence>
          {showMap && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <SnapMap onClose={() => setShowMap(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
