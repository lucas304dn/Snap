import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { updateCaption } from '../lib/api'

export default function ReviewScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const { photoUrl, caption: initialCaption, location: loc, transactionId } = state || {}
  const [caption, setCaption] = useState(initialCaption || '')
  const [posting, setPosting] = useState(false)

  const handlePost = async () => {
    setPosting(true)
    try {
      if (transactionId) {
        await updateCaption(transactionId, caption)
      }
    } catch { /* ignore */ }
    navigate('/feed')
  }

  if (!photoUrl) {
    return (
      <div style={{ ...styles.screen, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>No photo to review</div>
        <button style={styles.btnSecondary} onClick={() => navigate('/')}>Go home</button>
      </div>
    )
  }

  return (
    <div style={styles.screen}>
      {/* Photo */}
      <div style={styles.photoWrap}>
        <img src={photoUrl} alt="snap" style={styles.photo} />

        {/* Location pill */}
        {loc && (
          <div style={styles.locationPill}>
            📍 {loc}
          </div>
        )}
      </div>

      {/* Caption editor */}
      <div style={styles.captionArea}>
        <div style={styles.captionLabel}>AI Caption (edit if you want)</div>
        <textarea
          style={styles.captionInput}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          maxLength={120}
        />
        <div style={styles.charCount}>{caption.length}/120</div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button
          style={styles.btnSecondary}
          onClick={() => navigate(-1)}
          disabled={posting}
        >
          Discard
        </button>
        <button
          style={{ ...styles.btnPrimary, opacity: posting ? 0.6 : 1 }}
          onClick={handlePost}
          disabled={posting}
        >
          {posting ? 'Posting...' : 'Post to $nap 🚀'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  screen: {
    flex: 1,
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
  },
  photoWrap: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  locationPill: {
    position: 'absolute',
    top: 52,
    left: 16,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 13,
    color: '#fff',
    fontWeight: 600,
  },
  captionArea: {
    background: '#0a0a14',
    padding: '16px 20px 4px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  captionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  captionInput: {
    width: '100%',
    background: '#14141c',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    padding: '10px 14px',
    resize: 'none',
    outline: 'none',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
  },
  actions: {
    display: 'flex',
    gap: 12,
    padding: '12px 20px 40px',
    background: '#0a0a14',
  },
  btnSecondary: {
    flex: 1,
    background: '#1a1a26',
    color: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    padding: '14px',
    fontSize: 15,
    fontWeight: 600,
  },
  btnPrimary: {
    flex: 2,
    background: 'linear-gradient(135deg, #00d4aa, #ffd60a)',
    color: '#0a0a14',
    borderRadius: 14,
    padding: '14px',
    fontSize: 15,
    fontWeight: 800,
  },
}
