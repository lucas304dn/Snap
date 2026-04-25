const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function handle(res) {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

export async function uploadPhoto({ transactionId, lat, lng, blob }) {
  const form = new FormData()
  form.append('file', blob, 'snap.jpg')
  form.append('transaction_id', transactionId)
  form.append('lat', lat)
  form.append('lng', lng)
  return handle(await fetch(`${BASE}/api/photos/upload`, { method: 'POST', body: form }))
}

export async function getFeed(userId) {
  return handle(await fetch(`${BASE}/api/feed/${userId}`))
}

export async function getWrap(userId) {
  return handle(await fetch(`${BASE}/api/wrap/${userId}`))
}

export async function getStats(userId) {
  return handle(await fetch(`${BASE}/api/stats/${userId}`))
}

export async function submitGuess({ transactionId, guesserUserId, guessAmount }) {
  return handle(await fetch(`${BASE}/api/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: transactionId,
      guesser_user_id: guesserUserId,
      guess_amount: guessAmount,
    }),
  }))
}

export async function getReactions(transactionId) {
  return handle(await fetch(`${BASE}/api/reactions/${transactionId}`))
}

export async function fireFakePayment({ merchant, amount }) {
  return handle(await fetch(`${BASE}/webhook/bunq/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant, amount }),
  }))
}

export async function updateCaption(transactionId, caption) {
  const form = new FormData()
  form.append('caption', caption)
  return handle(await fetch(`${BASE}/api/photos/${transactionId}/caption`, {
    method: 'PATCH',
    body: form,
  }))
}
