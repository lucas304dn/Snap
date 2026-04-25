import { motion, AnimatePresence } from 'framer-motion'
import BunqInicio from './tabs/BunqInicio.jsx'
import BunqTarjetas from './tabs/BunqTarjetas.jsx'
import BunqAhorros from './tabs/BunqAhorros.jsx'
import BunqCrypto from './tabs/BunqCrypto.jsx'
import BunqSnap from './tabs/BunqSnap.jsx'

const TABS = [
  { id: 'inicio',   label: 'Home',     icon: HomeIcon },
  { id: 'tarjetas', label: 'Cards',    icon: CardIcon },
  { id: 'ahorros',  label: 'Savings',  icon: SavingsIcon },
  { id: 'crypto',   label: 'Stocks',   icon: ChartIcon },
  { id: 'snap',     label: '$nap',     icon: SnapIcon, accent: true }
]

export default function BunqAppShell({ tab, onTabChange, onClose }) {
  return (
    <div className="absolute inset-0 flex flex-col bunq-gradient">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="flex-1 min-h-0 overflow-hidden"
        >
          {tab === 'inicio'   && <BunqInicio onClose={onClose} />}
          {tab === 'tarjetas' && <BunqTarjetas />}
          {tab === 'ahorros'  && <BunqAhorros />}
          {tab === 'crypto'   && <BunqCrypto />}
          {tab === 'snap'     && <BunqSnap />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav */}
      <nav className="px-2 pt-2 pb-5 border-t border-white/5 bg-bunq-black/60 backdrop-blur-xl">
        <div className="flex justify-around">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className="nav-item flex flex-col items-center gap-1 px-2 py-1 min-w-[58px]"
              >
                <div className={`flex items-center justify-center transition-colors ${
                  active ? (t.accent ? 'text-bunq-green' : 'text-white') : 'text-bunq-mute-2'
                }`}>
                  <Icon active={active} accent={t.accent} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide transition-colors ${
                  active ? (t.accent ? 'text-bunq-green' : 'text-white') : 'text-bunq-mute-2'
                }`}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
        {/* Home indicator */}
        <div className="mt-2 mx-auto w-32 h-[5px] rounded-full bg-white/70" />
      </nav>
    </div>
  )
}

/* ───────── Nav icons ───────── */
function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
    </svg>
  )
}
function CardIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="13" rx="3" stroke="currentColor" strokeWidth="2" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <line x1="2" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
function SavingsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 8h11a4 4 0 0 1 4 4v4a3 3 0 0 1-3 3h-2v2h-2v-2H8v2H6v-2.2A5 5 0 0 1 3 14V10a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <circle cx="16" cy="13" r="1" fill="currentColor" />
    </svg>
  )
}
function ChartIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 18l5-5 4 4 7-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SnapIcon({ active, accent }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.18 : 0} />
      <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M9 6l1-2h4l1 2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <text x="12" y="14.2" fontSize="6" fontWeight="900" textAnchor="middle" fill="currentColor">$</text>
    </svg>
  )
}