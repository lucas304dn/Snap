import { motion } from 'framer-motion'

export default function BunqTarjetas() {
  return (
    <div className="app-content h-full pt-[52px] px-5">
      <h1 className="text-[24px] font-bold text-white tracking-tight">Cards</h1>
      <p className="text-[13px] text-bunq-mute mt-1">Manage all your bunq cards in one place</p>

      {/* Card stack */}
      <div className="mt-8 relative h-[230px]">
        {/* back card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }} animate={{ y: 30, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-3 top-0 h-[200px] rounded-3xl"
          style={{ background: 'linear-gradient(135deg, #2a2a3a 0%, #15151f 100%)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6)' }}
        />
        {/* front card */}
        <motion.div
          initial={{ y: 0, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 top-2 h-[210px] rounded-3xl p-5 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00DCAA 0%, #0F8F6F 50%, #062f24 100%)',
            boxShadow: '0 25px 60px -15px rgba(0,220,170,0.55)'
          }}
        >
          <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">bunq Metal</div>
              <div className="text-[12px] text-white/85 mt-0.5">Free for life</div>
            </div>
            <svg width="44" height="28" viewBox="0 0 60 36" fill="none">
              <circle cx="22" cy="18" r="14" fill="#EB001B" opacity="0.95" />
              <circle cx="38" cy="18" r="14" fill="#F79E1B" opacity="0.95" />
              <path d="M30 8a14 14 0 0 0 0 20 14 14 0 0 0 0-20z" fill="#FF5F00" />
            </svg>
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <div className="text-[18px] tracking-[0.3em] font-mono text-white">•••• 4729</div>
            <div className="mt-2 flex justify-between items-end">
              <div>
                <div className="text-[9px] uppercase tracking-wide text-white/60">Card holder</div>
                <div className="text-[13px] text-white font-semibold">Erik van der Berg</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wide text-white/60">Expires</div>
                <div className="text-[13px] text-white font-semibold font-mono">11/29</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card actions */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { icon: '❄️', label: 'Freeze' },
          { icon: '🔒', label: 'PIN' },
          { icon: '⚙️', label: 'Limits' }
        ].map(a => (
          <button key={a.label} className="bunq-card py-4 flex flex-col items-center gap-1.5">
            <span className="text-xl">{a.icon}</span>
            <span className="text-[11px] font-semibold text-white">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 mb-4 text-[13px] font-semibold text-white">Other cards</div>
      <div className="space-y-2">
        {[
          { name: 'HYROX athlete card', sub: 'Co-branded · €0/mo', emoji: '🏋️' },
          { name: 'Travel card', sub: '0% FX · 8 currencies', emoji: '✈️' },
          { name: 'Virtual card', sub: 'For online only', emoji: '🌐' }
        ].map(c => (
          <div key={c.name} className="bunq-card flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-bunq-black flex items-center justify-center text-lg">{c.emoji}</div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-white">{c.name}</div>
              <div className="text-[11px] text-bunq-mute">{c.sub}</div>
            </div>
            <span className="text-bunq-mute">›</span>
          </div>
        ))}
      </div>

      <div className="h-6" />
    </div>
  )
}