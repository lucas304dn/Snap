import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { uploadPhoto } from '../lib/api'

export default function CameraScreen() {
  const navigate = useNavigate()
  const { txId } = useParams()
  const { state: tx } = useLocation()

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [secsLeft, setSecsLeft] = useState(300)
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)

  const merchant = tx?.merchant || 'Unknown merchant'
  const amount = tx?.amount ?? null
  const snapDeadline = tx?.snap_deadline ? new Date(tx.snap_deadline) : new Date(Date.now() + 5 * 60 * 1000)

  // Start countdown from snap_deadline
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((snapDeadline - Date.now()) / 1000))
      setSecsLeft(diff)
      if (diff <= 0) navigate('/feed')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [snapDeadline, navigate])

  // Start camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraReady(true)
        }
      } catch (e) {
        setError('Camera not available — using demo mode')
        setCameraReady(true)
      }
    }
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const captureAndUpload = async () => {
    if (capturing) return
    setCapturing(true)

    try {
      let blob

      if (streamRef.current && canvasRef.current && videoRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        canvas.getContext('2d').drawImage(video, 0, 0)
        blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85))
      } else {
        // Demo: create a placeholder blob
        const canvas = document.createElement('canvas')
        canvas.width = 640
        canvas.height = 480
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, 640, 480)
        ctx.fillStyle = '#00d4aa'
        ctx.font = 'bold 48px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('$nap', 320, 220)
        ctx.font = '24px sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.fillText(merchant, 320, 280)
        blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85))
      }

      // Get location
      let lat = 52.3676, lng = 4.9041 // Amsterdam fallback
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        )
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch { /* use fallback */ }

      const actualTxId = txId === 'demo' ? null : txId

      let result = null
      if (actualTxId) {
        result = await uploadPhoto({ transactionId: actualTxId, lat, lng, blob })
      }

      const photoUrl = URL.createObjectURL(blob)
      navigate('/review', {
        state: {
          photoUrl,
          blob,
          caption: result?.caption || `Just dropped €${amount?.toFixed(2) ?? '?'} at ${merchant} 👀`,
          location: result?.location_name || 'Amsterdam',
          transactionId: actualTxId,
        },
      })
    } catch (e) {
      setError(`Upload failed: ${e.message}`)
      setCapturing(false)
    }
  }

  const mm = String(Math.floor(secsLeft / 60)).padStart(2, '0')
  const ss = String(secsLeft % 60).padStart(2, '0')
  const urgency = secsLeft < 60

  return (
    <div style={styles.screen}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={styles.video}
      />

      {/* No camera overlay */}
      {!streamRef.current && cameraReady && (
        <div style={styles.noCamOverlay}>
          <div style={styles.noCamContent}>
            <div style={{ fontSize: 64 }}>📷</div>
            <div style={{ color: '#fff', fontWeight: 600, marginTop: 12 }}>Demo Mode</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>{merchant}</div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={{ ...styles.timer, color: urgency ? '#ff3b7f' : '#fff' }}>
          ⏱ {mm}:{ss}
        </div>
        <div style={styles.txBadge}>
          <span style={styles.txBadgeMerchant}>{merchant}</span>
          {amount && <span style={styles.txBadgeAmount}>€{Number(amount).toFixed(2)}</span>}
        </div>
        <button style={styles.closeBtn} onClick={() => navigate('/feed')}>✕</button>
      </div>

      {/* Shutter */}
      <div style={styles.bottomBar}>
        {error && <div style={styles.errorMsg}>{error}</div>}
        <button
          style={{ ...styles.shutter, opacity: capturing ? 0.6 : 1 }}
          onClick={captureAndUpload}
          disabled={capturing}
        >
          {capturing ? (
            <div style={styles.spinner} />
          ) : (
            <div style={styles.shutterInner} />
          )}
        </button>
        <div style={styles.shutterHint}>
          {capturing ? 'Processing with Claude AI...' : 'Tap to $nap'}
        </div>
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
    position: 'relative',
    minHeight: '100dvh',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noCamOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, #1a1a2e, #0f3460)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCamContent: { textAlign: 'center' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '48px 20px 16px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  timer: {
    fontSize: 18,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  txBadge: {
    flex: 1,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: '6px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txBadgeMerchant: { fontSize: 13, color: '#fff', fontWeight: 600 },
  txBadgeAmount: { fontSize: 13, color: '#00d4aa', fontWeight: 700 },
  closeBtn: {
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    borderRadius: '50%',
    width: 36,
    height: 36,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '20px 0 48px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  errorMsg: {
    fontSize: 13,
    color: '#ff3b7f',
    background: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: '6px 12px',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: '50%',
    border: '4px solid #fff',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: '#fff',
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spin 0.8s linear infinite',
  },
  shutterHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 500,
  },
}
