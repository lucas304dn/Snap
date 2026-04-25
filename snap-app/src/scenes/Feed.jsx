import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFeed, submitGuess, getReactions } from '../lib/api'
import { DEMO_USER_ID } from '../lib/supabase'

const SEED_SNAPS = [
  {
    id: 'seed-1',
    user_id: 'friend-1',
    merchant: 'Starbucks',
    location_name: 'Amsterdam',
    caption: 'Oat latte fuelling another existential crisis ☕',
    photo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    show_amount: false,
    amount: null,
    snapped_at: new Date(Date.now() - 3600000).toISOString(),
    displayName: 'Sara K.',
  },
  {
    id: 'seed-2',
    user_id: 'friend-2',
    merchant: 'Zara',
    location_name: 'Rotterdam',
    caption: 'Called it "investment clothing". Therapist disagrees 🛍️',
    photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    show_amount: true,
    amount: 89.95,
    snapped_at: new Date(Date.now() - 7200000).toISOString(),
    displayName: 'Jake M.',
  },
  {
    id: 'seed-3',
    user_id: 'friend-3',
    merchant: 'McDonald\'s',
    location_name: 'Utrecht',
    caption: 'No thoughts, head empty, just nuggets 🍟',
    photo_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80',
    show_amount: false,
    amount: null,
    snapped_at: new Date(Date.now() - 86400000).toISOString(),
    displayName: 'Mia V.',
  },
]

export default function Feed() {
  const navigate = useNavigate()
  const [snaps, setSnaps] = useState(SEED_SNAPS)
  const [guessModal, setGuessModal] = useState(null)
  const [guessValue, setGuessValue] = useState('')
  const [guessResult, setGuessResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    getFeed(DEMO_USER_ID)
      .then((d) => {
        if (d.snaps?.length) {
          setSnaps([...d.snaps, ...SEED_SNAPS])
        }
      })
      .catch(() => {})
  }, [])

  const openGuess = (snap) => {
    setGuessModal(snap)
    setGuessValue('')
    setGuessResult(null)
  }

  const handleGuess = async () => {
    if (!guessModal || !guessValue || submitting) return
    setSubmitting(true)
    try {
      const result = await submitGuess({
        transactionId: guessModal.id,
        guesserUserId: DEMO_USER_ID,
        guessAmount: parseFloat(guessValue),
      })
      setGuessResult(result)
      if (result.correct) {
        setConfetti(true)
        setTimeout(() => setConfetti(false), 3000)
      }
    } catch {
      setGuessResult({ ai_reaction: 'Too shy to guess, huh? 😏' })
    }
    setSubmitting(false)
  }

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/bunq')}>←</button>
        <div style={styles.logo}>$nap</div>
        <button style={styles.wrappedBtn} onClick={() => navigate('/wrapped')}>
          🎁 Wrapped
        </button>
      </div>

      {/* Confetti */}
      {confetti && (
        <div style={styles.confettiOverlay}>
          {'🎉🎊✨💥🎯'.split('').map((e, i) => (
            <div key={i} style={{ ...styles.confettiPiece, left: `${10 + i * 18}%`, animationDelay: `${i * 0.1}s` }}>
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Feed */}
      <div style={styles.feed}>
        {snaps.map((snap) => (
          <SnapCard
            key={snap.id}
            snap={snap}
            onGuess={() => openGuess(snap)}
            isMine={snap.user_id === DEMO_USER_ID}
          />
        ))}
      </div>

      {/* Guess modal */}
      {guessModal && (
        <div style={styles.modalOverlay} onClick={() => setGuessModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Guess the price 🎯</div>
            <div style={styles.modalMerchant}>{guessModal.merchant} · {guessModal.location_name}</div>

            {!guessResult ? (
              <>
                <div style={styles.guessInputWrap}>
                  <span style={styles.euroSign}>€</span>
                  <input
                    style={styles.guessInput}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={guessValue}
                    onChange={(e) => setGuessValue(e.target.value)}
                    autoFocus
                  />
                </div>
                <button
                  style={{ ...styles.guessSubmit, opacity: submitting ? 0.6 : 1 }}
                  onClick={handleGuess}
                  disabled={submitting || !guessValue}
                >
                  {submitting ? 'Guessing...' : 'Submit guess'}
                </button>
              </>
            ) : (
              <div style={styles.guessResultArea}>
                {guessResult.correct && (
                  <div style={styles.correctBadge}>🎯 Spot on!</div>
                )}
                {guessResult.actual_amount !== undefined && (
                  <div style={styles.actualAmount}>
                    Actual: €{Number(guessResult.actual_amount).toFixed(2)}
                  </div>
                )}
                <div style={styles.aiReaction}>"{guessResult.ai_reaction}"</div>
                <button style={styles.guessSubmit} onClick={() => setGuessModal(null)}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SnapCard({ snap, onGuess, isMine }) {
  const timeAgo = getTimeAgo(snap.snapped_at)
  const displayName = snap.displayName || (isMine ? 'You' : 'Friend')

  return (
    <div style={styles.card}>
      {/* Card header */}
      <div style={styles.cardHeader}>
        <div style={styles.cardAvatar}>
          {displayName[0]}
        </div>
        <div style={styles.cardInfo}>
          <div style={styles.cardName}>{displayName}</div>
          <div style={styles.cardMeta}>{snap.merchant} · {snap.location_name} · {timeAgo}</div>
        </div>
        {isMine && <div style={styles.myBadge}>You</div>}
      </div>

      {/* Photo */}
      {snap.photo_url && (
        <img src={snap.photo_url} alt="snap" style={styles.cardPhoto} />
      )}

      {/* Caption */}
      {snap.caption && (
        <div style={styles.cardCaption}>{snap.caption}</div>
      )}

      {/* Footer */}
      <div style={styles.cardFooter}>
        {snap.show_amount && snap.amount !== null ? (
          <div style={styles.priceReveal}>€{Number(snap.amount).toFixed(2)}</div>
        ) : (
          <div style={styles.priceHidden}>€ ???</div>
        )}
        {!isMine && (
          <button style={styles.guessBtn} onClick={onGuess}>
            🎯 Guess price
          </button>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const styles = {
  screen: {
    flex: 1,
    background: '#0a0a14',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '52px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    gap: 12,
    background: '#0a0a14',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  backBtn: {
    background: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 22,
    padding: '4px 8px',
  },
  logo: {
    flex: 1,
    fontSize: 22,
    fontWeight: 900,
    background: 'linear-gradient(135deg, #00d4aa, #ffd60a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  wrappedBtn: {
    background: 'linear-gradient(135deg, #ff3b7f, #ffd60a)',
    color: '#0a0a14',
    borderRadius: 20,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  confettiOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'none',
    height: 200,
  },
  confettiPiece: {
    position: 'absolute',
    top: -20,
    fontSize: 28,
    animation: 'fall 1.5s ease-in forwards',
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 20,
  },
  card: {
    background: '#14141c',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
  },
  cardAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d4aa, #0a6eff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#fff',
    fontSize: 15,
    flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardName: { fontWeight: 700, color: '#fff', fontSize: 14 },
  cardMeta: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  myBadge: {
    background: 'rgba(0,212,170,0.15)',
    color: '#00d4aa',
    borderRadius: 10,
    padding: '3px 8px',
    fontSize: 11,
    fontWeight: 700,
  },
  cardPhoto: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover',
    display: 'block',
  },
  cardCaption: {
    padding: '10px 16px 4px',
    fontSize: 14,
    color: '#fff',
    lineHeight: 1.4,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px 14px',
  },
  priceReveal: {
    fontSize: 18,
    fontWeight: 800,
    color: '#00d4aa',
  },
  priceHidden: {
    fontSize: 18,
    fontWeight: 800,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 2,
  },
  guessBtn: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    borderRadius: 20,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 50,
  },
  modal: {
    background: '#14141c',
    borderRadius: '24px 24px 0 0',
    padding: '24px 24px 48px',
    width: '100%',
    maxWidth: 430,
    margin: '0 auto',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    marginBottom: 6,
  },
  modalMerchant: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 24,
  },
  guessInputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#0a0a14',
    border: '2px solid rgba(0,212,170,0.4)',
    borderRadius: 14,
    padding: '12px 16px',
    marginBottom: 16,
  },
  euroSign: { fontSize: 22, fontWeight: 700, color: '#00d4aa' },
  guessInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: 28,
    fontWeight: 800,
  },
  guessSubmit: {
    width: '100%',
    background: 'linear-gradient(135deg, #00d4aa, #ffd60a)',
    color: '#0a0a14',
    borderRadius: 14,
    padding: '16px',
    fontSize: 16,
    fontWeight: 800,
  },
  guessResultArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  correctBadge: {
    fontSize: 28,
    fontWeight: 900,
    color: '#00d4aa',
  },
  actualAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
  },
  aiReaction: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.5,
  },
}
