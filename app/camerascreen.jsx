import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { py } from '../../lib/api.js'

export default function CameraScreen({ tx, onDone, onCancel }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [stage, setStage] = useState('camera') // 'camera' | 'preview' | 'uploading' | 'success'
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewBlob, setPreviewBlob] = useState(null)

  const [secsLeft, setSecsLeft] = useState(() => secsUntilDeadline(tx))
  const [error, setError] = useState(null)

  const [aiCaption, setAiCaption] = useState(null)
  const [editedCaption, setEditedCaption] = useState('')
  const [showAmount, setShowAmount] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [uploadResult, setUploadResult] = useState(null)

  const currency = tx.currency === 'EUR' ? '€' : (tx.currency || '€')

  // ── Open camera on mount ─────────────────────────────────────────────────
  const openCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch (e) {
      setError('Camera unavailable. Tap "Use a sample photo" to continue the demo.')
    }
  }, [])

  useEffect(() => {
    openCamera()
    return () => stopCamera()
  }, [openCamera])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  // ── Countdown ────────────────────────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => {
      const s = secsUntilDeadline(tx)
      setSecsLeft(s)
      if (s <= 0 && stage === 'camera') {
        setError('Snap deadline passed.')
      }
    }, 1000)
    return () => clearInterval(i)
  }, [tx, stage])

  // ── Capture ──────────────────────────────────────────────────────────────
  function capture() {
    const v = videoRef.current
    const c = canvasRef.current
    if (!v || !c || !v.videoWidth) return

    // Square crop (center)
    const size = Math.min(v.videoWidth, v.videoHeight)
    const sx = (v.videoWidth - size) / 2
    const sy = (v.videoHeight - size) / 2

    c.width = size
    c.height = size
    c.getContext('2d').drawImage(v, sx, sy, size, size, 0, 0, size, size)

    c.toBlob(blob => {
      if (!blob) return
      setPreviewBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
      setStage('preview')
      stopCamera()
    }, 'image/jpeg', 0.85)
  }

  function useSamplePhoto() {
    // Demo fallback: generate a colored canvas that looks like a real snap
    const c = canvasRef.current || document.createElement('canvas')
    c.width = 800; c.height = 800
    const ctx = c.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 800, 800)
    grad.addColorStop(0, '#00DCAA'); grad.addColorStop(1, '#0F8F6F')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 800, 800)
    ctx.fillStyle = '#fff'; ctx.font = 'bold 72px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(tx.merchant || 'Sample snap', 400, 400)
    ctx.font = '32px Inter, sans-serif'
    ctx.fillText(`${currency}${Number(tx.amount).toFixed(2)}`, 400, 460)
    c.toBlob(blob => {
      setPreviewBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
      setStage('preview')
      stopCamera()
    }, 'image/jpeg', 0.85)
  }

  // ── Retake ───────────────────────────────────────────────────────────────
  async function retake() {
    setPreviewBlob(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setAiCaption(null)
    setEditedCaption('')
    setStage('camera')
    await openCamera()
  }

  // ── Upload ───────────────────────────────────────────────────────────────
  async function upload() {
    if (!previewBlob) return
    setStage('uploading')
    try {
      // Try to get GPS, fallback to bunq HQ Amsterdam
      const pos = await new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
          p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve({ lat: 52.3676, lng: 4.9041 }),
          { timeout: 4000, enableHighAccuracy: false }
        )
      })

      const data = await py.uploadPhoto({
        transactionId: tx.id,
        blob: previewBlob,
        lat: pos.lat,
        lng: pos.lng
      })

      setUploadResult(data)
      setAiCaption(data.caption)
      setEditedCaption(data.caption || '')
      setStage('success')

      // Persist visibility settings (fire-and-forget)
      py.updateVisibility(tx.id, isPublic, showAmount).catch(() => {})
    } catch (e) {
      // Demo fallback: pretend it worked
      setAiCaption(generateLocalCaption(tx))
      setEditedCaption(generateLocalCaption(tx))
      setUploadResult({ photo_url: previewUrl, caption: generateLocalCaption(tx), location: { city: 'Amsterdam' } })
      setStage('success')
    }
  }

  async function saveAndClose() {
    if (uploadResult && editedCaption !== aiCaption) {
      try { await py.updateCaption(tx.id, editedCaption) } catch {}
    }
    onDone()
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const mins = String(Math.floor(Math.max(0, secsLeft) / 60)).padStart(1, '0')
  const secs = String(Math.max(0, secsLeft) % 60).padStart(2, '0')

  return (
    <div className="absolute inset-0 bg-black flex flex-col text-white">
      {/* Top bar */}
      <div className="absolute top-12 left-0 right-0 z-30 px-5 flex items-center justify-between">
        <button onClick={onCancel} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-xl">
          ×
        </button>
        <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-mono font-bold tabular-nums">{mins}:{secs}</span>
        </div>
        <div className="w-9 h-9" />
      </div>

      {/* Transaction banner */}
      <div className="absolute top-24 left-5 right-5 z-30 rounded-2xl bg-bunq-green/95 backdrop-blur p-3 flex items-center gap-3">
        <div className="text-2xl">💳</div>
        <div className="flex-1">
          <div className="text-[12px] uppercase tracking-wider font-bold text-bunq-black/70">Snap your transaction</div>
          <div className="text-[15px] font-bold text-bunq-black">
            {currency}{Number(tx.amount).toFixed(2)} at {tx.merchant}
          </div>
        </div>
      </div>

      {/* Stage: live camera */}
      {stage === 'camera' && (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          {error && (
            <div className="absolute inset-x-5 bottom-44 z-30 bg-black/80 backdrop-blur p-4 rounded-2xl text-center">
              <div className="text-white/90 text-sm mb-3">{error}</div>
              <button onClick={useSamplePhoto} className="px-4 py-2 rounded-xl bg-bunq-green text-bunq-black font-bold text-sm">
                Use a sample photo
              </button>
            </div>
          )}

          {/* Shutter */}
          <div className="absolute bottom-12 inset-x-0 z-30 flex items-center justify-center">
            <button
              onClick={capture}
              className="w-[78px] h-[78px] rounded-full bg-white flex items-center justify-center"
              aria-label="Capture"
            >
              <div className="w-[68px] h-[68px] rounded-full border-[3px] border-bunq-black bg-white" />
            </button>
          </div>
        </>
      )}

      {/* Stage: preview */}
      {(stage === 'preview' || stage === 'uploading' || stage === 'success') && (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 relative bg-black mt-40">
            {previewUrl && (
              <img src={previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>

          {/* Bottom sheet */}
          <motion.div
            layout
            className="bg-bunq-navy rounded-t-3xl p-5 pb-7 border-t border-bunq-border space-y-3"
            style={{ maxHeight: '55%', overflowY: 'auto' }}
          >
            {stage === 'preview' && (
              <>
                <div className="text-[12px] uppercase tracking-wider text-bunq-mute font-bold">Looks good?</div>
                <div className="flex gap-2">
                  <button onClick={retake} className="flex-1 py-3 rounded-xl bg-bunq-card text-white font-bold text-sm">
                    🔄 Retake
                  </button>
                  <button onClick={upload} className="flex-1 py-3 rounded-xl bg-bunq-green text-bunq-black font-bold text-sm">
                    ✓ Use this
                  </button>
                </div>
              </>
            )}

            {stage === 'uploading' && (
              <div className="py-6 text-center space-y-2">
                <div className="text-bunq-green text-3xl animate-pulse-soft">✦</div>
                <div className="text-[14px] font-bold text-white">Uploading & captioning…</div>
                <div className="text-[12px] text-bunq-mute">Claude is finding the perfect words</div>
              </div>
            )}

            {stage === 'success' && (
              <AnimatePresence mode="wait">
                <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {/* AI caption */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-bunq-green/15 text-bunq-green font-bold text-[9px] uppercase tracking-wider">
                        ✨ AI Caption
                      </span>
                      <span className="text-[11px] text-bunq-mute">tap to edit</span>
                    </div>
                    <input
                      value={editedCaption}
                      onChange={e => setEditedCaption(e.target.value)}
                      className="w-full px-3 py-2.5 bg-bunq-black border border-bunq-border rounded-xl text-white text-sm focus:outline-none focus:border-bunq-green"
                    />
                  </div>

                  {/* Privacy toggles */}
                  <div className="space-y-2">
                    <ToggleRow
                      icon="👀"
                      label="Show in friends feed"
                      sub="Public to your $nap circle"
                      checked={isPublic}
                      onChange={setIsPublic}
                    />
                    <ToggleRow
                      icon="💸"
                      label="Reveal price"
                      sub="Or let friends guess it"
                      checked={showAmount}
                      onChange={setShowAmount}
                    />
                  </div>

                  <button
                    onClick={saveAndClose}
                    className="w-full py-3 rounded-xl bg-bunq-green text-bunq-black font-bold text-sm"
                  >
                    Post to $nap →
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

function ToggleRow({ icon, label, sub, checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-bunq-card border border-bunq-border text-left"
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="text-[13px] font-bold text-white">{label}</div>
        <div className="text-[11px] text-bunq-mute">{sub}</div>
      </div>
      <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${checked ? 'bg-bunq-green' : 'bg-bunq-border'}`}>
        <div
          className="w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
    </button>
  )
}

function secsUntilDeadline(tx) {
  if (!tx.snap_deadline) return 5 * 60
  return Math.floor((new Date(tx.snap_deadline).getTime() - Date.now()) / 1000)
}

function generateLocalCaption(tx) {
  const m = (tx.merchant || '').toLowerCase()
  if (m.includes('pizza')) return 'Slice of paradise 🍕'
  if (m.includes('coffee') || m.includes('café')) return 'Liquid productivity ☕'
  if (m.includes('uber')) return 'Door-to-door luxury 🚗'
  if (m.includes('ramen')) return 'Worth every slurp 🍜'
  if (m.includes('albert heijn')) return 'Snack run, again 🛒'
  return 'Worth it 💸'
}