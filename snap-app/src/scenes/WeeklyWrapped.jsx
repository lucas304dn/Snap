import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWrap, getStats } from '../lib/api'
import { DEMO_USER_ID } from '../lib/supabase'

const MOCK_WRAP = {
  snap_count: 7,
  wrap: `This week you lived like a local across 3 Dutch cities — Amsterdam's coffee scene, Utrecht's canals, and Rotterdam's surprise late-night McDonald's run.

You dropped €127.40 in total, with Zara taking the biggest hit at €89.95. The rest? Guilt-free fuel for the soul (and maybe one regrettable bubble tea).

Your most memorable moment: that oat latte at Starbucks that somehow cost €6.50. You stared at the receipt, shrugged, and snapped it anyway.

PERSONALITY: Impulsive but self-aware spender`,
  transactions: [],
}

const PERSONALITY_RE = /PERSONALITY:\s*(.+)/

function extractPersonality(wrap) {
  const m = wrap?.match(PERSONALITY_RE)
  return m ? m[1].trim() : null
}

function cleanWrap(wrap) {
  return wrap?.replace(PERSONALITY_RE, '').trim() || ''
}

export default function WeeklyWrapped() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visibleChars, setVisibleChars] = useState(0)
  const [phase, setPhase] = useState(0) // 0=stats, 1=narrative, 2=personality

  useEffect(() => {
    Promise.all([
      getWrap(DEMO_USER_ID).catch(() => MOCK_WRAP),
      getStats(DEMO_USER_ID).catch(() => ({ countries: [] })),
    ]).then(([wrapData, statsData]) => {
      setData(wrapData)
      setStats(statsData)
      setLoading(false)
    })
  }, [])

  // Animate through phases
  useEffect(() => {
    if (loading) return
    const t1 = setTimeout(() => setPhase(1), 800)
    const t2 = setTimeout(() => setPhase(2), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [loading])

  // Typewriter effect for narrative
  const wrap = data?.wrap || MOCK_WRAP.wrap
  const narrative = cleanWrap(wrap)
  const personality = extractPersonality(wrap)

  useEffect(() => {
    if (phase < 1) return
    let i = 0
    const id = setInterval(() => {
      i += 3
      setVisibleChars(i)
      if (i >= narrative.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [phase, narrative])

  const snapCount = data?.snap_count ?? MOCK_WRAP.snap_count
  const countries = stats?.countries || []
  const totalSpent = countries.reduce((s, c) => s + c.total_spent, 0)
  const citiesCount = countries.reduce((s, c) => s + c.cities.length, 0) || 3

  const handleShare = () => {
    const text = `My $nap by bunq weekly wrap:\n\n"${personality ?? 'Adventurous spender'}"\n\n${snapCount} snaps · €${totalSpent.toFixed(2)} spent · ${citiesCount} cities`
    if (navigator.share) {
      navigator.share({ title: '$nap Weekly Wrapped', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.loadingWrap}>
          <div style={styles.loadingSpinner} />
          <div style={styles.loadingText}>Generating your wrap...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.screen}>
      {/* Back */}
      <button style={styles.backBtn} onClick={() => navigate('/feed')}>← Back</button>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroTitle}>Your $nap</div>
        <div style={styles.heroSubtitle}>Weekly Wrapped ✨</div>
      </div>

      {/* Stat cards */}
      <div style={{ ...styles.statsRow, opacity: phase >= 0 ? 1 : 0, transition: 'opacity 0.5s' }}>
        <StatCard value={snapCount} label="Snaps" icon="📸" color="#00d4aa" />
        <StatCard value={`€${totalSpent.toFixed(0)}`} label="Spent" icon="💸" color="#ffd60a" />
        <StatCard value={citiesCount} label="Cities" icon="🏙️" color="#ff3b7f" />
      </div>

      {/* Country breakdown */}
      {countries.length > 0 && (
        <div style={styles.countrySection}>
          {countries.slice(0, 3).map((c) => (
            <div key={c.country_code} style={styles.countryRow}>
              <span style={styles.countryFlag}>{getFlagEmoji(c.country_code)}</span>
              <span style={styles.countryName}>{c.country_code}</span>
              <div style={styles.countryBar}>
                <div
                  style={{
                    ...styles.countryBarFill,
                    width: `${Math.min(100, (c.total_spent / (totalSpent || 1)) * 100)}%`,
                  }}
                />
              </div>
              <span style={styles.countryAmount}>€{c.total_spent.toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Narrative */}
      {phase >= 1 && (
        <div style={styles.narrativeCard}>
          <div style={styles.narrativeText}>
            {narrative.slice(0, visibleChars)}
            {visibleChars < narrative.length && <span style={styles.cursor}>|</span>}
          </div>
        </div>
      )}

      {/* Personality label */}
      {phase >= 2 && personality && (
        <div style={styles.personalitySection}>
          <div style={styles.personalityLabel}>You are a</div>
          <div style={styles.personalityValue}>{personality}</div>
        </div>
      )}

      {/* Share */}
      {phase >= 2 && (
        <button style={styles.shareBtn} onClick={handleShare}>
          Share your wrap 🚀
        </button>
      )}

      <div style={{ height: 40 }} />
    </div>
  )
}

function StatCard({ value, label, icon, color }) {
  return (
    <div style={{ ...styles.statCard, borderColor: color + '30' }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode === '??') return '🌍'
  const code = countryCode.toUpperCase()
  return code.split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
}

const styles = {
  screen: {
    flex: 1,
    background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1b2a 50%, #0a0a1a 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 20px',
    minHeight: '100dvh',
    overflowY: 'auto',
  },
  loadingWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '3px solid rgba(0,212,170,0.2)',
    borderTopColor: '#00d4aa',
    animation: 'spin 1s linear infinite',
  },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 15 },
  backBtn: {
    alignSelf: 'flex-start',
    background: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    padding: '52px 0 0',
    marginBottom: -16,
  },
  hero: {
    textAlign: 'center',
    padding: '32px 0 8px',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 900,
    background: 'linear-gradient(135deg, #00d4aa, #ffd60a, #ff3b7f)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: -2,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  statsRow: {
    display: 'flex',
    gap: 12,
    width: '100%',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    background: '#14141c',
    border: '1px solid',
    borderRadius: 16,
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countrySection: {
    width: '100%',
    background: '#14141c',
    borderRadius: 16,
    padding: '16px',
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  countryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  countryFlag: { fontSize: 20, flexShrink: 0 },
  countryName: {
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.6)',
    width: 32,
    flexShrink: 0,
  },
  countryBar: {
    flex: 1,
    height: 6,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  countryBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00d4aa, #ffd60a)',
    borderRadius: 3,
    transition: 'width 1s ease',
  },
  countryAmount: {
    fontSize: 13,
    fontWeight: 700,
    color: '#00d4aa',
    width: 40,
    textAlign: 'right',
    flexShrink: 0,
  },
  narrativeCard: {
    background: '#14141c',
    borderRadius: 16,
    padding: '20px',
    marginTop: 16,
    width: '100%',
    border: '1px solid rgba(0,212,170,0.15)',
  },
  narrativeText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
  },
  cursor: {
    display: 'inline-block',
    width: 2,
    color: '#00d4aa',
    animation: 'blink 1s step-end infinite',
  },
  personalitySection: {
    textAlign: 'center',
    marginTop: 28,
    width: '100%',
  },
  personalityLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  personalityValue: {
    fontSize: 26,
    fontWeight: 900,
    background: 'linear-gradient(135deg, #ffd60a, #ff3b7f)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1.2,
  },
  shareBtn: {
    marginTop: 24,
    background: 'linear-gradient(135deg, #00d4aa, #ffd60a)',
    color: '#0a0a14',
    borderRadius: 20,
    padding: '16px 40px',
    fontSize: 16,
    fontWeight: 800,
    width: '100%',
  },
}
