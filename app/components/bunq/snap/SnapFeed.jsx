import { useEffect, useState } from 'react'
import { py } from '../../../lib/api.js'
import { DEMO_USER_ID } from '../../../lib/supabase.js'
import { MOCK_FEED } from '../../../lib/mock.js'
import SnapPost from './SnapPost.jsx'

export default function SnapFeed() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    py.feed(DEMO_USER_ID || 'demo')
      .then(data => {
        if (cancelled) return
        const snaps = data?.snaps || []
        setPosts(snaps.length > 0 ? snaps : MOCK_FEED)
      })
      .catch(e => {
        if (cancelled) return
        console.warn('[feed] backend unreachable, using mock', e.message)
        setPosts(MOCK_FEED)
        setError(null) // never break the demo
      })
    return () => { cancelled = true }
  }, [])

  if (!posts) {
    return (
      <div className="px-5 pt-2 space-y-4">
        {[0, 1].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="app-content h-full px-5 pb-4 space-y-5">
      {posts.length === 0 && (
        <div className="text-center text-bunq-mute py-12">
          No snaps yet — your friends are being shy 😴
        </div>
      )}
      {posts.map(p => (
        <SnapPost key={p.id} post={p} />
      ))}
      <div className="text-center text-[11px] text-bunq-mute-2 pt-2 pb-6">
        ✨ You're all caught up
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-bunq-card animate-pulse">
      <div className="h-12 bg-bunq-border" />
      <div className="aspect-square bg-bunq-border/50" />
      <div className="h-16 bg-bunq-card" />
    </div>
  )
}