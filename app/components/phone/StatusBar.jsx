import { useEffect, useState } from 'react'

export default function StatusBar({ inApp = false }) {
  const [time, setTime] = useState(formatTime())

  useEffect(() => {
    const i = setInterval(() => setTime(formatTime()), 30_000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="status-bar" style={{ color: inApp ? '#fff' : '#fff' }}>
      <span className="time">{time}</span>
      <span className="status-bar-icons">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </span>
    </div>
  )
}

function formatTime() {
  const d = new Date()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function SignalIcon() {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
      <rect x="0" y="7" width="3" height="4" rx="0.5" fill="currentColor" />
      <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="currentColor" />
      <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="currentColor" />
    </svg>
  )
}
function WifiIcon() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
      <path d="M8 10.5l1.8-1.8a2.5 2.5 0 0 0-3.6 0L8 10.5z" fill="currentColor" />
      <path d="M8 7.4a4.5 4.5 0 0 1 3.2 1.3l1.4-1.4a6.5 6.5 0 0 0-9.2 0l1.4 1.4A4.5 4.5 0 0 1 8 7.4z" fill="currentColor" />
      <path d="M8 4.3a8 8 0 0 1 5.7 2.4L15.1 5.3a10 10 0 0 0-14.2 0l1.4 1.4A8 8 0 0 1 8 4.3z" fill="currentColor" />
    </svg>
  )
}
function BatteryIcon() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="19" height="9" rx="1.5" fill="currentColor" />
      <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  )
}