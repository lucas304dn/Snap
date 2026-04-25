import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, DEMO_USER_ID } from '../lib/supabase'

export function useTransactionListener() {
  const navigate = useNavigate()

  useEffect(() => {
    const channel = supabase
      .channel('snap-trigger')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${DEMO_USER_ID}`,
        },
        (payload) => {
          const tx = payload.new
          navigate(`/camera/${tx.id}`, { state: tx })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [navigate])
}
