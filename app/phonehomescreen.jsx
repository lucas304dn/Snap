import { motion } from 'framer-motion'

const APPS = [
  // row 1
  { name: 'Messages', icon: '💬', bg: 'linear-gradient(135deg,#34d853,#0a8a2c)' },
  { name: 'Mail', icon: '✉️', bg: 'linear-gradient(135deg,#5ac8fa,#0066d6)' },
  { name: 'Maps', icon: '🗺️', bg: 'linear-gradient(135deg,#bdf3a3,#3f9b7c)' },
  { name: 'Photos', icon: '🌷', bg: 'linear-gradient(135deg,#ffd66b,#ff5a5f)' },
  // row 2
  { name: 'Calendar', icon: '📅', bg: 'linear-gradient(135deg,#fff,#e8e8ee)', dark: true },
  { name: 'Camera', icon: '📷', bg: 'linear-gradient(135deg,#3a3a3f,#1a1a1f)' },
  { name: 'Spotify', icon: '🎧', bg: 'linear-gradient(135deg,#1ed760,#0a8a2c)' },
  { name: 'Notes', icon: '📓', bg: 'linear-gradient(135deg,#ffe07a,#d99e00)' },
  // row 3
  { name: 'Settings', icon: '⚙️', bg: 'linear-gradient(135deg,#9b9b9f,#3a3a3f)' },
  { name: 'Wallet', icon: '💳', bg: 'linear-gradient(135deg,#1a1a1f,#0a0a0d)' },
  { name: 'Weather', icon: '☁️', bg: 'linear-gradient(135deg,#5ac8fa,#256bb8)' },
  { name: 'Health', icon: '❤️', bg: 'linear-gradient(135deg,#ff5a5f,#a30016)' }
]

export default function PhoneHomeScreen({ onOpenBunq }) {
  return (
    <div
      className="absolute inset-0 pt-12 pb-8 px-6 flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse at top, #2c2842 0%, #14101e 35%, #0a0a0f 100%), url("data:image/svg+xml,%3Csvg viewBox=\'0 0 600 800\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3CradialGradient id=\'g1\' cx=\'30%25\' cy=\'20%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23ff5a8f\' stop-opacity=\'0.35\'/%3E%3Cstop offset=\'100%25\' stop-color=\'transparent\'/%3E%3C/radialGradient%3E%3CradialGradient id=\'g2\' cx=\'80%25\' cy=\'80%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%2300dcaa\' stop-opacity=\'0.3\'/%3E%3Cstop offset=\'100%25\' stop-color=\'transparent\'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'600\' height=\'800\' fill=\'url(%23g1)\'/%3E%3Crect width=\'600\' height=\'800\' fill=\'url(%23g2)\'/%3E%3C/svg%3E")'
      }}
    >
      {/* Big lock-screen-ish time */}
      <div className="text-center mt-2 mb-8">
        <div className="text-[11px] font-medium tracking-widest text-white/60 uppercase">
          Saturday, 25 April
        </div>
      </div>

      {/* App grid */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-6 px-1">
        {APPS.map((app, i) => (
          <AppIcon key={app.name} {...app} delay={i * 0.025} />
        ))}

        {/* Hero — bunq, given pride of place */}
        <motion.button
          onClick={onOpenBunq}
          className="flex flex-col items-center gap-1 col-span-1"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.32, type: 'spring', stiffness: 220 }}
        >
          <div
            className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center relative shadow-glow"
            style={{
              background: 'linear-gradient(145deg, #00DCAA 0%, #0F8F6F 100%)',
              boxShadow: '0 8px 24px -8px rgba(0,220,170,0.6), inset 0 1px 0 rgba(255,255,255,0.25)'
            }}
          >
            <BunqLogo />
            <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-red-500 flex items-center justify-center text-[11px] font-bold border-2 border-black">
              1
            </div>
          </div>
          <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            bunq
          </span>
        </motion.button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Dock */}
      <div className="mx-2 rounded-[28px] backdrop-blur-xl bg-white/10 border border-white/10 px-4 py-3 grid grid-cols-4 gap-4">
        <DockIcon icon="📞" name="Phone" bg="linear-gradient(135deg,#34d853,#0a8a2c)" />
        <DockIcon icon="🌐" name="Safari" bg="linear-gradient(135deg,#a4cef0,#0a6fd6)" />
        <DockIcon icon="🎵" name="Music" bg="linear-gradient(135deg,#fb5a91,#a8043f)" />
        <DockIcon icon="📷" name="Camera" bg="linear-gradient(135deg,#3a3a3f,#1a1a1f)" />
      </div>

      {/* Home indicator */}
      <div className="mt-4 mx-auto w-32 h-[5px] rounded-full bg-white/70" />
    </div>
  )
}

function AppIcon({ name, icon, bg, dark, delay = 0 }) {
  return (
    <motion.button
      className="flex flex-col items-center gap-1"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    >
      <div
        className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center text-[28px]"
        style={{ background: bg, boxShadow: '0 4px 12px -4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}
      >
        <span style={{ filter: dark ? 'none' : 'none' }}>{icon}</span>
      </div>
      <span className="text-[11px] font-medium text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
        {name}
      </span>
    </motion.button>
  )
}

function DockIcon({ icon, name, bg }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[24px]"
        style={{ background: bg, boxShadow: '0 4px 12px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}
      >
        {icon}
      </div>
    </div>
  )
}

function BunqLogo() {
  // Simplified $ mark in white — riffs on bunq's wordmark identity
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 5v3.2M16 23.8V27"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M22 11.5C22 9 19.5 7.5 16.5 7.5H15c-3 0-5.5 1.7-5.5 4.5 0 2.6 2 4 5 4.5l2 .3c3 .5 5 1.9 5 4.5 0 2.8-2.5 4.7-5.5 4.7H15c-3 0-5.5-1.5-5.5-4"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}