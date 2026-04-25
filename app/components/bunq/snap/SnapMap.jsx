import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import { py } from '../../../lib/api.js'
import { DEMO_USER_ID } from '../../../lib/supabase.js'
import { MOCK_PINS } from '../../../lib/mock.js'

const TIME_WINDOWS = [
  { id: 'day',   label: '1d',  ms: 1 * 24 * 3600 * 1000 },
  { id: 'week',  label: '7d',  ms: 7 * 24 * 3600 * 1000 },
  { id: 'month', label: '30d', ms: 30 * 24 * 3600 * 1000 },
  { id: 'year',  label: '1y',  ms: 365 * 24 * 3600 * 1000 },
  { id: 'all',   label: 'All', ms: Infinity }
]

function FlyToPin({ pin }) {
  const map = useMap()
  useEffect(() => {
    if (pin) map.flyTo([pin.lat, pin.lng], Math.max(map.getZoom(), 10), { duration: 0.8 })
  }, [pin, map])
  return null
}

export default function SnapMap({ onClose }) {
  const [pins, setPins] = useState([])
  const [window, setWindow] = useState('all')
  const [selected, setSelected] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)

  const userId = DEMO_USER_ID || 'demo'

  useEffect(() => {
    py.mapPins(userId)
      .then(d => setPins(d?.pins?.length ? d.pins : MOCK_PINS))
      .catch(() => setPins(MOCK_PINS))
  }, [userId])

  const filteredPins = pins.filter(p => {
    if (window === 'all') return true
    const w = TIME_WINDOWS.find(t => t.id === window)
    if (!w || !p.snapped_at) return true
    return Date.now() - new Date(p.snapped_at).getTime() <= w.ms
  })

  function openPin(pin) {
    setSelected(pin)
    setFlyTarget(pin)
  }

  function closePin() {
    setSelected(null)
    setFlyTarget(null)
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-bunq-black">
      {/* Top bar */}
      <div className="px-4 pt-2 pb-2 flex items-center justify-between flex-shrink-0 z-10 relative">
        <div className="flex gap-1">
          {TIME_WINDOWS.map(t => (
            <button
              key={t.id}
              onClick={() => setWindow(t.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                window === t.id ? 'bg-bunq-green text-bunq-black' : 'bg-bunq-card text-bunq-mute'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-bunq-card flex items-center justify-center text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Snap count */}
      <div className="px-4 pb-2 flex-shrink-0 z-10 relative">
        <span className="text-[11px] text-bunq-mute">
          <span className="text-white font-semibold">{filteredPins.length}</span> snaps on the map
        </span>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <MapContainer
          center={[48, 10]}
          zoom={3}
          style={{ height: '100%', width: '100%', background: '#0A0A0F' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {flyTarget && <FlyToPin pin={flyTarget} />}

          {filteredPins.map((pin, i) => (
            <CircleMarker
              key={pin.id || i}
              center={[pin.lat, pin.lng]}
              radius={7}
              pathOptions={{
                fillColor: '#00DCAA',
                fillOpacity: 0.9,
                color: '#fff',
                weight: 1.5,
              }}
              eventHandlers={{ click: () => openPin(pin) }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Pin detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 bg-bunq-navy rounded-t-3xl border-t border-bunq-border shadow-card"
            style={{ zIndex: 500 }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-bunq-border rounded-full mx-auto mt-3" />

            <div className="px-5 pt-3 pb-6 flex items-start gap-3">
              {/* Photo thumb */}
              {selected.photo_url ? (
                <img
                  src={selected.photo_url}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-bunq-card flex items-center justify-center text-2xl flex-shrink-0">
                  💳
                </div>
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-white truncate">{selected.merchant}</div>
                {selected.amount != null && (
                  <div className="text-[13px] font-semibold text-bunq-green mt-0.5">
                    €{Number(selected.amount).toFixed(2)}
                  </div>
                )}
                {(selected.location_name || selected.country_code) && (
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-bunq-mute">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M6 11s-4-3.5-4-7a4 4 0 1 1 8 0c0 3.5-4 7-4 7z" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="6" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    {selected.location_name || selected.country_code}
                  </div>
                )}
                {selected.caption && (
                  <div className="mt-1.5 text-[12px] text-white/75 italic leading-snug line-clamp-2">
                    "{selected.caption}"
                  </div>
                )}
              </div>

              <button onClick={closePin} className="text-bunq-mute text-xl leading-none w-8 h-8 flex items-center justify-center flex-shrink-0">
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
