import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, DEMO_USER_ID, DEMO_MODE } from './lib/supabase.js'

import StatusBar from './components/phone/StatusBar.jsx'
import PhoneHomeScreen from './components/phone/PhoneHomeScreen.jsx'
import PushNotification from './components/phone/PushNotification.jsx'
import DemoControls from './components/phone/DemoControls.jsx'

import BunqAppShell from './components/bunq/BunqAppShell.jsx'
import CameraScreen from './components/bunq/CameraScreen.jsx'

export default function App() {
  // Top-level screen state: 'home' (phone home), 'bunq' (inside the app), 'camera' (snapping)
  const [screen, setScreen] = useState('home')
  // Which bunq tab is active when screen === 'bunq'
  const [bunqTab, setBunqTab] = useState('inicio')

  // Pending notification (a transaction that needs snapping). Cleared on tap or timeout.
  const [pendingTx, setPendingTx] = useState(null)
  // Transaction currently being snapped (when screen === 'camera')
  const [activeCameraTx, setActiveCameraTx] = useState(null)

  const userId = DEMO_USER_ID

  // ── Listen for new transactions via Supabase Realtime ──────────────────────
  useEffect(() => {
    if (!userId) {
      console.warn('[realtime] no DEMO_USER_ID — realtime listener disabled')
      return
    }

    const channel = supabase
      .channel('snap-incoming-tx')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const tx = payload.new
          // Only notify if no photo yet and within snap window
          if (tx.photo_url) return
          const deadline = tx.snap_deadline ? new Date(tx.snap_deadline).getTime() : Date.now() + 5 * 60 * 1000
          if (deadline < Date.now()) return
          console.log('💳 New transaction →', tx)
          setPendingTx(tx)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // ── Notification interactions ──────────────────────────────────────────────
  const dismissNotification = useCallback(() => setPendingTx(null), [])

  const openSnap = useCallback((tx) => {
    setPendingTx(null)
    setActiveCameraTx(tx)
    setScreen('camera')
  }, [])

  const exitCamera = useCallback(() => {
    setActiveCameraTx(null)
    setScreen('bunq')
    setBunqTab('snap')
  }, [])

  const openBunq = useCallback((tab = 'inicio') => {
    setScreen('bunq')
    setBunqTab(tab)
  }, [])

  const closeBunq = useCallback(() => setScreen('home'), [])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="dynamic-island" />

          <StatusBar inApp={screen !== 'home'} />

          {/* Pending notification overlays the entire screen */}
          <AnimatePresence>
            {pendingTx && (
              <PushNotification
                key={pendingTx.id}
                tx={pendingTx}
                onTap={() => openSnap(pendingTx)}
                onDismiss={dismissNotification}
              />
            )}
          </AnimatePresence>

          {/* Screen router */}
          <AnimatePresence mode="wait">
            {screen === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <PhoneHomeScreen onOpenBunq={() => openBunq('inicio')} />
              </motion.div>
            )}

            {screen === 'bunq' && (
              <motion.div
                key="bunq"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <BunqAppShell tab={bunqTab} onTabChange={setBunqTab} onClose={closeBunq} />
              </motion.div>
            )}

            {screen === 'camera' && activeCameraTx && (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <CameraScreen tx={activeCameraTx} onDone={exitCamera} onCancel={exitCamera} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grain" />
        </div>
      </div>

      {DEMO_MODE && (
        <DemoControls
          userId={userId}
          onTriggerLocal={(tx) => setPendingTx(tx)}
        />
      )}
    </>
  )
}