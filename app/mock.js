// When the backend is offline (e.g. judges seeing a static demo), every screen
// falls back to this mock data so the UI is always populated and impressive.
// The real backend takes over the moment it responds successfully.

export const MOCK_FEED = [
  {
    id: 'mock-1',
    user_id: 'friend-1',
    merchant: 'La Pizza del Sol',
    amount: 14.50,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Barcelona',
    country_code: 'ES',
    lat: 41.3851,
    lng: 2.1734,
    photo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    caption: 'Pizza for one, regrets for two 🍕',
    snapped_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    profiles: { username: 'lena', display_name: 'Lena', avatar_url: null }
  },
  {
    id: 'mock-2',
    user_id: 'friend-2',
    merchant: 'Albert Heijn',
    amount: 4.80,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3676,
    lng: 4.9041,
    photo_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    caption: 'Ice cream emergency averted 🍦',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    profiles: { username: 'tim', display_name: 'Tim', avatar_url: null }
  },
  {
    id: 'mock-3',
    user_id: 'friend-3',
    merchant: 'Tokyo Ramen Bar',
    amount: 18.20,
    currency: 'EUR',
    show_amount: true,
    location_name: 'Berlin',
    country_code: 'DE',
    lat: 52.5200,
    lng: 13.4050,
    photo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    caption: 'Late-night ramen hits different 🍜',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    profiles: { username: 'ali', display_name: 'Ali', avatar_url: null }
  },
  {
    id: 'mock-4',
    user_id: 'friend-1',
    merchant: 'Le Petit Café',
    amount: 3.20,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Paris',
    country_code: 'FR',
    lat: 48.8566,
    lng: 2.3522,
    photo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    caption: 'Croissant + espresso = main character energy ☕',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    profiles: { username: 'lena', display_name: 'Lena', avatar_url: null }
  }
]

export const MOCK_LEADERBOARD = [
  { rank: 1, username: 'tim', display_name: 'Tim', score: 1240, accuracy: '94%' },
  { rank: 2, username: 'lena', display_name: 'Lena', score: 1180, accuracy: '91%' },
  { rank: 3, username: 'you', display_name: 'You', score: 980, accuracy: '88%', isYou: true },
  { rank: 4, username: 'ali', display_name: 'Ali', score: 720, accuracy: '76%' },
  { rank: 5, username: 'maya', display_name: 'Maya', score: 510, accuracy: '68%' }
]

export const MOCK_COUNTRY_STATS = {
  visited_countries: [
    { country_code: 'NL', total_spent: 412.30, snap_count: 14, currency: 'EUR' },
    { country_code: 'ES', total_spent: 287.10, snap_count: 9, currency: 'EUR' },
    { country_code: 'DE', total_spent: 156.80, snap_count: 5, currency: 'EUR' },
    { country_code: 'FR', total_spent: 94.50, snap_count: 4, currency: 'EUR' }
  ],
  total_countries_visited: 4
}

export const MOCK_PINS = MOCK_FEED.map(t => ({
  id: t.id,
  merchant: t.merchant,
  amount: t.amount,
  currency: t.currency,
  show_amount: t.show_amount,
  photo_url: t.photo_url,
  caption: t.caption,
  lat: t.lat,
  lng: t.lng,
  location_name: t.location_name,
  country_code: t.country_code,
  snapped_at: t.snapped_at,
  user_id: t.user_id
}))

export const MOCK_TRANSACTIONS_HOME = [
  { id: 't1', merchant: 'Albert Heijn', amount: -12.45, category: '🛒', when: 'Today, 14:22' },
  { id: 't2', merchant: 'Spotify', amount: -10.99, category: '🎧', when: 'Today, 09:00' },
  { id: 't3', merchant: 'Salary — Acme BV', amount: 2840.00, category: '💼', when: 'Yesterday' },
  { id: 't4', merchant: 'Uber', amount: -8.20, category: '🚗', when: 'Yesterday' },
  { id: 't5', merchant: 'La Pizza del Sol', amount: -14.50, category: '🍕', when: '2 days ago' }
]