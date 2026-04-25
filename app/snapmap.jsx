import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { py } from '../../../lib/api.js'
import { DEMO_USER_ID } from '../../../lib/supabase.js'
import { MOCK_COUNTRY_STATS, MOCK_PINS, MOCK_FEED } from '../../../lib/mock.js'

// Public TopoJSON of the world — small (~250kb) and CDN-hosted.
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const TIME_WINDOWS = [
  { id: 'day',   label: '1d',  ms: 1 * 24 * 3600 * 1000 },
  { id: 'week',  label: '7d',  ms: 7 * 24 * 3600 * 1000 },
  { id: 'month', label: '30d', ms: 30 * 24 * 3600 * 1000 },
  { id: 'year',  label: '1y',  ms: 365 * 24 * 3600 * 1000 },
  { id: 'all',   label: 'All', ms: Infinity }
]

// react-simple-maps uses ISO numeric ids (e.g. 'NLD'), we have ISO-2 ('NL').
// Quick lookup table for the countries we display.
const A2_TO_A3 = {
  NL: 'NLD', ES: 'ESP', DE: 'DEU', FR: 'FRA', IT: 'ITA', PT: 'PRT',
  GB: 'GBR', BE: 'BEL', US: 'USA', JP: 'JPN', CN: 'CHN', BR: 'BRA',
  AR: 'ARG', AU: 'AUS', IN: 'IND', MX: 'MEX', SE: 'SWE', NO: 'NOR',
  DK: 'DNK', FI: 'FIN', AT: 'AUT', CH: 'CHE', GR: 'GRC', PL: 'POL',
  IE: 'IRL', CZ: 'CZE', TR: 'TUR', AE: 'ARE', TH: 'THA', VN: 'VNM'
}

export default function SnapMap() {
  const [stats, setStats] = useState(null)
  const [pins, setPins] = useState([])
  const [window, setWindow] = useState('all')
  const [selected, setSelected] = useState(null)        // { country_code, ... }
  const [detail, setDetail] = useState(null)            // detail payload
  const [loadingDetail, setLoadingDetail] = useState(false)

  const userId = DEMO_USER_ID || 'demo'

  useEffect(() => {
    py.countryStats(userId)
      .then(d => setStats(d?.visited_countries?.length ? d : MOCK_COUNTRY_STATS))
      .catch(() => setStats(MOCK_COUNTRY_STATS))

    py.mapPins(userId)
      .then(d => setPins(d?.pins?.length ? d.pins : MOCK_PINS))
      .catch(() => setPins(MOCK_PINS))
  }, [userId])

  // Filter pins by selected time window
  const filteredPins = pins.filter(p => {
    if (window === 'all') return true
    const w = TIME_WINDOWS.find(t => t.id === window)
    if (!w || !p.snapped_at) return true
    return Date.now() - new Date(p.snapped_at).getTime() <= w.ms
  })

  const visitedCountries = new Set((stats?.visited_countries || []).map(c => c.country_code))
  const visitedA3 = new Set(Array.from(visitedCountries).map(cc => A2_TO_A3[cc]).filter(Boolean))

  async function openCountry(cc) {
    if (!cc) return
    setSelected({ country_code: cc })
    setLoadingDetail(true)
    try {
      const d = await py.countryDetail(userId, cc)
      setDetail(d)
    } catch {
      // Build a fake detail from local mocks
      const snaps = MOCK_FEED.filter(p => p.country_code === cc)
      const total = snaps.reduce((s, p) => s + (p.amount || 0), 0)
      setDetail(snaps.length ? {
        country_code: cc,
        total_spent: total,
        currency: 'EUR',
        snap_count: snaps.length,
        cities: groupByCity(snaps)
      } : null)
    } finally {
      setLoadingDetail(false)
    }
  }

  function closeCountry() {
    setSelected(null)
    setDetail(null)
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Time window pills */}
      <div className="px-5 pt-1 pb-2 flex items-center justify-between">
        <div className="text-[12px] text-bunq-mute">
          <span className="text-white font-bold">{stats?.total_countries_visited || 0}</span> countries · <span className="text-white font-bold">{filteredPins.length}</span> snaps
        </div>
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
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 95, center: [10, 35] }}
          width={400}
          height={460}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const a3 = geo.id
                const visited = visitedA3.has(a3)
                const a2 = Object.entries(A2_TO_A3).find(([, v]) => v === a3)?.[0]
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => visited && openCountry(a2)}
                    style={{
                      default: {
                        fill: visited ? '#00DCAA' : '#1a1a26',
                        stroke: visited ? '#0a5c48' : '#0a0a0f',
                        strokeWidth: 0.6,
                        outline: 'none',
                        cursor: visited ? 'pointer' : 'default',
                        opacity: visited ? 0.85 : 1
                      },
                      hover: {
                        fill: visited ? '#38EF7D' : '#1a1a26',
                        outline: 'none',
                        opacity: 1
                      },
                      pressed: { fill: '#0F8F6F', outline: 'none' }
                    }}
                  />
                )
              })
            }
          </Geographies>

          {filteredPins.map((pin, i) => (
            <Marker key={pin.id || i} coordinates={[pin.lng, pin.lat]}>
              <g onClick={() => openCountry(pin.country_code)} style={{ cursor: 'pointer' }}>
                <circle r="6" fill="#00DCAA" opacity="0.4" className="pin-ping origin-center" />
                <circle r="3.5" fill="#fff" stroke="#00DCAA" strokeWidth="1.5" />
              </g>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* Country drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 max-h-[70%] bg-bunq-navy rounded-t-3xl border-t border-bunq-border shadow-card flex flex-col"
          >
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <div className="w-12 h-1 bg-bunq-border rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
              <div className="flex items-baseline gap-2">
                <span className="text-3xl">{flagEmoji(selected.country_code)}</span>
                <span className="text-[18px] font-bold text-white">{countryName(selected.country_code)}</span>
              </div>
              <button onClick={closeCountry} className="text-bunq-mute text-2xl leading-none w-8 h-8">×</button>
            </div>

            {loadingDetail && <div className="px-5 py-8 text-center text-bunq-mute text-sm">Loading…</div>}

            {detail && (
              <div className="app-content flex-1 px-5 pb-5">
                {/* Summary */}
                <div className="bunq-card p-4 mb-4 grid grid-cols-3 gap-3">
                  <Stat label="Spent" value={`€${Number(detail.total_spent).toFixed(0)}`} />
                  <Stat label="Snaps" value={detail.snap_count} />
                  <Stat label="Cities" value={detail.cities?.length || 0} />
                </div>

                {/* Cities */}
                {(detail.cities || []).map(city => (
                  <div key={city.city} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[14px] font-bold text-white">{city.city}</div>
                      <div className="text-[12px] text-bunq-green font-mono font-bold">€{Number(city.total).toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {city.snaps.map(s => (
                        <SnapThumb key={s.id} snap={s} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!detail && !loadingDetail && (
              <div className="px-5 py-8 text-center text-bunq-mute text-sm">No snaps here yet.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wide text-bunq-mute">{label}</div>
      <div className="text-[18px] font-bold text-white tabular-nums">{value}</div>
    </div>
  )
}

function SnapThumb({ snap }) {
  return (
    <div className="aspect-square rounded-lg bg-bunq-card overflow-hidden relative">
      {snap.photo_url ? (
        <img src={snap.photo_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-bunq-mute text-xs">no photo</div>
      )}
      <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/60 text-white text-[9px] font-mono truncate">
        {snap.merchant}
      </div>
    </div>
  )
}

function groupByCity(snaps) {
  const m = new Map()
  for (const s of snaps) {
    const key = s.location_name || 'Unknown'
    if (!m.has(key)) m.set(key, { city: key, total: 0, snap_count: 0, snaps: [] })
    const c = m.get(key)
    c.total += s.amount || 0
    c.snap_count += 1
    c.snaps.push(s)
  }
  return [...m.values()].sort((a, b) => b.total - a.total)
}

function flagEmoji(cc) {
  if (!cc || cc.length !== 2) return '🌍'
  const codePoints = cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

const COUNTRY_NAMES = {
  NL: 'Netherlands', ES: 'Spain', DE: 'Germany', FR: 'France', IT: 'Italy',
  PT: 'Portugal', GB: 'United Kingdom', BE: 'Belgium', US: 'United States',
  JP: 'Japan', CN: 'China', BR: 'Brazil', AR: 'Argentina', AU: 'Australia',
  IN: 'India', MX: 'Mexico', SE: 'Sweden', NO: 'Norway', DK: 'Denmark',
  FI: 'Finland', AT: 'Austria', CH: 'Switzerland', GR: 'Greece', PL: 'Poland',
  IE: 'Ireland', CZ: 'Czechia', TR: 'Turkey', AE: 'UAE', TH: 'Thailand', VN: 'Vietnam'
}
function countryName(cc) {
  return COUNTRY_NAMES[cc] || cc || 'Unknown'
}