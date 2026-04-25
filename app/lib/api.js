// All API calls go to the Python FastAPI backend (snap-backend).

const PY   = import.meta.env.VITE_PY_BACKEND  || 'http://localhost:8000'
const NODE = import.meta.env.VITE_NODE_BACKEND || 'http://localhost:3001'

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, opts)
  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) {
    const detail = (data && data.detail) || (data && data.error) || res.statusText
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }
  return data
}

export const py = {
  /** Fire a fake transaction — used by the demo control panel. */
  simulate({ merchant, amount, currency = 'EUR', user_id }) {
    return jsonFetch(`${PY}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant, amount, currency, user_id })
    })
  },

  /** Upload a photo blob for a transaction. */
  uploadPhoto({ transactionId, blob, lat, lng }) {
    const fd = new FormData()
    fd.append('file', blob, 'snap.jpg')
    fd.append('transaction_id', transactionId)
    fd.append('lat', String(lat))
    fd.append('lng', String(lng))
    return jsonFetch(`${PY}/api/photos/upload`, { method: 'POST', body: fd })
  },

  updateCaption(transactionId, caption) {
    const fd = new FormData()
    fd.append('caption', caption)
    return jsonFetch(`${PY}/api/photos/${transactionId}/caption`, { method: 'PATCH', body: fd })
  },

  updateVisibility(transactionId, isPublic, showAmount) {
    const fd = new FormData()
    fd.append('is_public', String(isPublic))
    fd.append('show_amount', String(showAmount))
    return jsonFetch(`${PY}/api/photos/${transactionId}/visibility`, { method: 'PATCH', body: fd })
  },

  feed(userId) {
    return jsonFetch(`${PY}/api/feed/${userId}`)
  },

  mapPins(userId) {
    return jsonFetch(`${PY}/api/map/${userId}`)
  },

  countryStats(userId) {
    return jsonFetch(`${PY}/api/stats/${userId}`)
  },

  countryDetail(userId, countryCode) {
    return jsonFetch(`${PY}/api/country/${userId}/${countryCode}`)
  },

  countryMemory(userId, countryCode) {
    return jsonFetch(`${PY}/api/country-memory/${userId}/${countryCode}`)
  },

  weeklyWrap(userId) {
    return jsonFetch(`${PY}/api/wrap/${userId}`)
  },

  /** Submit a price guess for a friend's snap. */
  submitGuess({ transactionId, guesserUserId, guess }) {
    return jsonFetch(`${PY}/api/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_id: transactionId,
        guesser_user_id: guesserUserId,
        guess_amount: guess
      })
    })
  },

  /** Get an AI-generated price hint for a snap (NEW endpoint). */
  guessHint(transactionId) {
    return jsonFetch(`${PY}/api/guess-hint/${transactionId}`)
  },

  leaderboard() {
    return jsonFetch(`${PY}/api/leaderboard`)
  }
}

/** Node.js backend — Claude vision, identify, and AI hint endpoints. */
export const node = {
  simulate({ merchant, amount, currency = 'EUR', user_id }) {
    return jsonFetch(`${NODE}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant, amount, currency, user_id })
    })
  },

  health() {
    return jsonFetch(`${NODE}/health`)
  },

  identify(image_base64, media_type = 'image/jpeg') {
    return jsonFetch(`${NODE}/api/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64, media_type })
    })
  },

  guessHint({ photo_url, merchant }) {
    return jsonFetch(`${NODE}/api/guess-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_url, merchant })
    })
  }
}
