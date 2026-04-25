import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fireFakePayment } from '../lib/api'

const APPS = [
  { name: 'Messages', color: '#34c759', icon: '💬' },
  { name: 'Maps', color: '#ff9500', icon: '🗺️' },
  { name: 'Camera', color: '#1c1c1e', icon: '📷' },
  { name: 'Spotify', color: '#1db954', icon: '🎵' },
  { name: 'Instagram', color: '#e1306c', icon: '📸' },
  { name: 'WhatsApp', color: '#25d366', icon: '💚' },
  { name: 'Settings', color: '#8e8e93', icon: '⚙️' },
  { name: 'Safari', color: '#0a84ff', icon: '🌐' },
  { name: 'Uber', color: '#000', icon: '🚗' },
  { name: 'X', color: '#000', icon: '𝕏' },
  { name: 'Netflix', color: '#e50914', icon: '🎬' },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const [notifVisible, setNotifVisible] = useState(false)
  const [notifData, setNotifData] = useState(null)
  const [firing, setFiring] = useState(false)

  // Auto-show notification after 3s for demo
  useEffect(() => {
    const t = setTimeout(() => {
      setNotifData({ merchant: 'Albert Heijn', amount: 12.50 })
      setNotifVisible(true)
    }, 3000)
    return () => clearTimeout(t)
  }, [])

  const handleBunqClick = () => navigate('/bunq')

  const handleNotifTap = async () => {
    if (firing) return
    setFiring(true)
    try {
      await fireFakePayment(notifData)
    } catch {
      // Realtime will still fire if backend is up; ignore error in demo
    }
    // navigation happens via useTransactionListener in App.jsx
    // but also provide a fallback direct route
    navigate('/camera/demo', { state: { merchant: notifData.merchant, amount: notifData.amount, snap_deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString() } })
  }

  return (
    <div style={styles.screen}>
      {/* Status bar */}
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span>📶 🔋</span>
      </div>

      {/* Notification banner */}
      {notifVisible && (
        <div style={styles.notif} onClick={handleNotifTap}>
          <div style={styles.notifIcon}>🏦</div>
          <div style={styles.notifText}>
            <div style={styles.notifTitle}>bunq</div>
            <div style={styles.notifBody}>
              Payment of €{notifData?.amount?.toFixed(2)} at {notifData?.merchant} — $nap it!
            </div>
          </div>
          <div style={styles.notifTime}>now</div>
        </div>
      )}

      {/* App grid */}
      <div style={styles.grid}>
        {APPS.map((app) => (
          <div key={app.name} style={styles.appItem}>
            <div style={{ ...styles.appIcon, background: app.color }}>
              <span style={{ fontSize: 28 }}>{app.icon}</span>
            </div>
            <span style={styles.appName}>{app.name}</span>
          </div>
        ))}

        {/* bunq app */}
        <div style={styles.appItem} onClick={handleBunqClick}>
          <div style={{ ...styles.appIcon, background: 'linear-gradient(135deg, #00d4aa, #0a6eff)' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>bunq</span>
          </div>
          <span style={styles.appName}>bunq</span>
        </div>
      </div>

      {/* Dock */}
      <div style={styles.dock}>
        {['📞', '📧', '🌐', '🎵'].map((icon, i) => (
          <div key={i} style={styles.dockIcon}>{icon}</div>
        ))}
      </div>

      {/* Demo hint */}
      {!notifVisible && (
        <div style={styles.hint}>Tap bunq or wait for notification →</div>
      )}
    </div>
  )
}

const styles = {
  screen: {
    flex: 1,
    background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 20px 40px',
    position: 'relative',
    minHeight: '100dvh',
  },
  statusBar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '14px 4px 8px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
  },
  notif: {
    position: 'absolute',
    top: 48,
    left: 12,
    right: 12,
    background: 'rgba(30,30,40,0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    zIndex: 100,
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'slideDown 0.4s ease',
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #00d4aa, #0a6eff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  notifText: { flex: 1 },
  notifTitle: { fontSize: 13, fontWeight: 700, color: '#fff' },
  notifBody: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  notifTime: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  grid: {
    marginTop: 80,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px 12px',
    width: '100%',
  },
  appItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
  },
  dock: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-around',
  },
  dockIcon: {
    fontSize: 32,
    cursor: 'pointer',
  },
  hint: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
}
