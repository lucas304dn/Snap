import { motion } from 'framer-motion'

const HOLDINGS = [
  { sym: 'BTC',  name: 'Bitcoin',   amount: '0.0142', value: 612.40, change: '+2.4%', up: true,  color: '#F7931A' },
  { sym: 'ETH',  name: 'Ethereum',  amount: '0.380',  value: 884.50, change: '+5.1%', up: true,  color: '#627EEA' },
  { sym: 'SOL',  name: 'Solana',    amount: '4.2',    value: 312.10, change: '-1.8%', up: false, color: '#9945FF' },
  { sym: 'AAPL', name: 'Apple',     amount: '2',      value: 412.20, change: '+0.8%', up: true,  color: '#A2AAAD' },
  { sym: 'NVDA', name: 'NVIDIA',    amount: '3',      value: 590.10, change: '+3.2%', up: true,  color: '#76B900' }
]

export default function BunqCrypto() {
  const total = HOLDINGS.reduce((s, h) => s + h.value, 0)

  return (
    <div className="app-content h-full pt-[52px] px-5 pb-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-[24px] font-bold text-white tracking-tight">Stocks & crypto</h1>
        <span className="text-[10px] text-bunq-mute uppercase tracking-wider">via Kraken</span>
      </div>

      {/* Portfolio header */}
      <div className="mt-4 bunq-card p-5">
        <div className="text-[10px] uppercase tracking-wide text-bunq-mute">Portfolio value</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[32px] font-bold text-white tabular-nums">€{total.toFixed(2)}</span>
          <span className="text-[13px] font-semibold text-bunq-green">+€68.20 (2.7%)</span>
        </div>
        {/* Sparkline */}
        <Sparkline />
      </div>

      <div className="mt-5 mb-3 flex items-center justify-between">
        <div className="text-[13px] font-semibold text-white">Your holdings</div>
        <button className="text-[12px] font-semibold text-bunq-green">+ Buy</button>
      </div>

      <div className="space-y-2">
        {HOLDINGS.map((h, i) => (
          <motion.div
            key={h.sym}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bunq-card flex items-center gap-3 p-3"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: h.color }}>
              {h.sym}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">{h.name}</div>
              <div className="text-[11px] text-bunq-mute">{h.amount} {h.sym}</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-bold text-white tabular-nums">€{h.value.toFixed(2)}</div>
              <div className={`text-[11px] font-semibold ${h.up ? 'text-bunq-green' : 'text-bunq-accent'}`}>
                {h.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Sparkline() {
  // Cute hand-rolled sparkline — no external lib needed
  const points = [40, 38, 42, 39, 45, 50, 48, 56, 60, 58, 65, 72, 68, 75]
  const w = 280, h = 60
  const max = Math.max(...points), min = Math.min(...points)
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((p - min) / (max - min)) * h
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  const area = `${path} L ${w} ${h} L 0 ${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[60px] mt-3">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00DCAA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00DCAA" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={path} fill="none" stroke="#00DCAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}