import { useNavigate } from 'react-router-dom'

export default function BunqHome() {
  const navigate = useNavigate()

  return (
    <div style={styles.screen}>
      {/* Fake bunq header */}
      <div style={styles.header}>
        <div style={styles.avatar}>L</div>
        <span style={styles.headerTitle}>Good morning, Lucas 👋</span>
        <div style={styles.bellIcon}>🔔</div>
      </div>

      {/* Main balance card */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLabel}>Total Balance</div>
        <div style={styles.balanceAmount}>€ 2,847.50</div>
        <div style={styles.balanceSub}>+€ 340 this month</div>
        <div style={styles.cardRow}>
          <div style={styles.cardChip} />
          <div style={styles.cardNetwork}>VISA</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={styles.actions}>
        {[
          { icon: '↑', label: 'Pay' },
          { icon: '↓', label: 'Request' },
          { icon: '⊕', label: 'Top Up' },
          { icon: '⋯', label: 'More' },
        ].map(({ icon, label }) => (
          <div key={label} style={styles.action}>
            <div style={styles.actionBtn}>{icon}</div>
            <span style={styles.actionLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Recent</div>
        {FAKE_TXS.map((tx) => (
          <div key={tx.id} style={styles.txRow}>
            <div style={{ ...styles.txIcon, background: tx.color }}>{tx.icon}</div>
            <div style={styles.txInfo}>
              <div style={styles.txMerchant}>{tx.merchant}</div>
              <div style={styles.txDate}>{tx.date}</div>
            </div>
            <div style={{ ...styles.txAmount, color: tx.amount < 0 ? '#ff3b7f' : '#00d4aa' }}>
              {tx.amount < 0 ? '-' : '+'}€{Math.abs(tx.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* THE $NAP BUTTON — floating, glowing */}
      <button style={styles.snapBtn} onClick={() => navigate('/feed')}>
        <span style={styles.snapBtnText}>$nap</span>
        <span style={styles.snapBtnSub}>See what friends spent</span>
      </button>
    </div>
  )
}

const FAKE_TXS = [
  { id: 1, merchant: 'Albert Heijn', icon: '🛒', color: '#00a0e3', amount: -12.50, date: 'Today, 14:32' },
  { id: 2, merchant: 'Salary — ACME Corp', icon: '💼', color: '#00d4aa', amount: 2400.00, date: 'Yesterday' },
  { id: 3, merchant: 'Starbucks', icon: '☕', color: '#00704a', amount: -5.20, date: 'Yesterday' },
  { id: 4, merchant: 'Netflix', icon: '🎬', color: '#e50914', amount: -13.99, date: 'Apr 20' },
]

const styles = {
  screen: {
    flex: 1,
    background: '#0a0a14',
    display: 'flex',
    flexDirection: 'column',
    padding: '0 0 120px',
    overflowY: 'auto',
    minHeight: '100dvh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '52px 20px 16px',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d4aa, #0a6eff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: { flex: 1, fontWeight: 600, color: '#fff', fontSize: 16 },
  bellIcon: { fontSize: 20 },
  balanceCard: {
    margin: '0 20px',
    background: 'linear-gradient(135deg, #00d4aa 0%, #0a6eff 100%)',
    borderRadius: 20,
    padding: '24px 24px 20px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  balanceLabel: { fontSize: 13, opacity: 0.8, marginBottom: 4 },
  balanceAmount: { fontSize: 36, fontWeight: 800, letterSpacing: -1 },
  balanceSub: { fontSize: 13, opacity: 0.8, marginTop: 4 },
  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  cardChip: {
    width: 32,
    height: 24,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.4)',
  },
  cardNetwork: { fontSize: 18, fontWeight: 800, opacity: 0.9 },
  actions: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px',
  },
  action: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: '#1a1a26',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    color: '#fff',
    cursor: 'pointer',
  },
  actionLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  section: { padding: '0 20px' },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },
  txRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txMerchant: { fontWeight: 600, color: '#fff', fontSize: 14 },
  txDate: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  txAmount: { fontWeight: 700, fontSize: 15 },
  snapBtn: {
    position: 'fixed',
    bottom: 30,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #00d4aa, #ffd60a)',
    border: 'none',
    borderRadius: 28,
    padding: '14px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(0,212,170,0.4), 0 0 60px rgba(0,212,170,0.15)',
    zIndex: 50,
    minWidth: 160,
  },
  snapBtnText: { fontSize: 22, fontWeight: 900, color: '#0a0a14', letterSpacing: -0.5 },
  snapBtnSub: { fontSize: 11, color: 'rgba(10,10,20,0.65)', marginTop: 2 },
}
