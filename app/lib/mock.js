// Must match the UUIDs in seed_friends.sql
const YOU   = import.meta.env.VITE_DEMO_USER_ID || 'demo-user'
const LENA  = 'aa000001-0000-0000-0000-000000000001'
const TIM   = 'aa000002-0000-0000-0000-000000000002'
const ALI   = 'aa000003-0000-0000-0000-000000000003'
const MAYA  = 'aa000004-0000-0000-0000-000000000004'
const SOFIA = 'aa000005-0000-0000-0000-000000000005'

export const MOCK_FEED = [
  // ── Your own posts (show "You") ──────────────────────────────────────────
  {
    id: 'you-1',
    user_id: YOU,
    merchant: 'Albert Heijn',
    amount: 12.45,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3676,
    lng: 4.9041,
    photo_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
    caption: 'Weekly haul complete. Fridge survives another day 🛒',
    snapped_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    profiles: { username: 'you', display_name: 'You', avatar_url: null }
  },

  // ── Friends ───────────────────────────────────────────────────────────────
  {
    id: 'mock-1',
    user_id: LENA,
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
    snapped_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    profiles: { username: 'lena', display_name: 'Lena', avatar_url: null }
  },
  {
    id: 'mock-2',
    user_id: TIM,
    merchant: 'Westergasfabriek Market',
    amount: 4.80,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3872,
    lng: 4.8766,
    photo_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    caption: 'Farmers market therapy. Cheaper than a shrink 🌿',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    profiles: { username: 'tim', display_name: 'Tim', avatar_url: null }
  },
  {
    id: 'mock-5',
    user_id: ALI,
    merchant: "Brouwerij 't IJ",
    amount: 9.50,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3614,
    lng: 4.9393,
    photo_url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80',
    caption: 'Beer brewed in a windmill. Amsterdam is built different 🍺',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    profiles: { username: 'ali', display_name: 'Ali', avatar_url: null }
  },
  {
    id: 'mock-9',
    user_id: MAYA,
    merchant: 'Poke Perfect',
    amount: 13.90,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3731,
    lng: 4.8922,
    photo_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    caption: 'Healthy decisions occasionally 🥗',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    profiles: { username: 'maya', display_name: 'Maya', avatar_url: null }
  },
  {
    id: 'mock-6',
    user_id: SOFIA,
    merchant: 'Sugarbird Coffee',
    amount: 4.20,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3738,
    lng: 4.8910,
    photo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    caption: 'Oat milk flat white. Unironically worth it every time ☕',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    profiles: { username: 'sofia', display_name: 'Sofia', avatar_url: null }
  },
  {
    id: 'mock-10',
    user_id: LENA,
    merchant: 'Zara',
    amount: 49.95,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Barcelona',
    country_code: 'ES',
    lat: 41.3799,
    lng: 2.1699,
    photo_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
    caption: 'Called it "investment clothing". Closet disagrees 🛍️',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    profiles: { username: 'lena', display_name: 'Lena', avatar_url: null }
  },
  {
    id: 'mock-3',
    user_id: ALI,
    merchant: 'Tokyo Ramen Bar',
    amount: 18.20,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Berlin',
    country_code: 'DE',
    lat: 52.5200,
    lng: 13.4050,
    photo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    caption: 'Late-night ramen hits different 🍜',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    profiles: { username: 'ali', display_name: 'Ali', avatar_url: null }
  },
  {
    id: 'mock-11',
    user_id: TIM,
    merchant: 'Paradiso',
    amount: 22.00,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3626,
    lng: 4.8813,
    photo_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    caption: 'Worth every cent. My ears disagree 🎶',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString(),
    profiles: { username: 'tim', display_name: 'Tim', avatar_url: null }
  },
  {
    id: 'mock-7',
    user_id: SOFIA,
    merchant: 'HEMA',
    amount: 6.90,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3731,
    lng: 4.8922,
    photo_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    caption: 'Stroopwafel + socks combo. Peak Dutch 🇳🇱',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    profiles: { username: 'sofia', display_name: 'Sofia', avatar_url: null }
  },
  {
    id: 'mock-12',
    user_id: MAYA,
    merchant: 'Rijksmuseum',
    amount: 22.50,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3600,
    lng: 4.8852,
    photo_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
    caption: 'Culture loading… please wait ☁️',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    profiles: { username: 'maya', display_name: 'Maya', avatar_url: null }
  },
  {
    id: 'mock-8',
    user_id: MAYA,
    merchant: 'Cafe de Jaren',
    amount: 7.50,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3689,
    lng: 4.8975,
    photo_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
    caption: 'Canal view, overpriced OJ, zero regrets 🌊',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    profiles: { username: 'maya', display_name: 'Maya', avatar_url: null }
  },
  {
    id: 'mock-4',
    user_id: LENA,
    merchant: 'Le Petit Café',
    amount: 3.20,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Paris',
    country_code: 'FR',
    lat: 48.8566,
    lng: 2.3522,
    photo_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',
    caption: 'Croissant + espresso = main character energy ☕',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    profiles: { username: 'lena', display_name: 'Lena', avatar_url: null }
  },
  {
    id: 'mock-13',
    user_id: ALI,
    merchant: 'KaDeWe',
    amount: 67.00,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Berlin',
    country_code: 'DE',
    lat: 52.5027,
    lng: 13.3357,
    photo_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    caption: 'Department store dangers. Send help 🏬',
    snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    profiles: { username: 'ali', display_name: 'Ali', avatar_url: null }
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

// Map pins — spread across day/week/month/year so time filters are visible
const EXTRA_PINS = [
  { id: 'pin-a', merchant: 'Uber Eats', amount: 22.80, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3655, lng: 4.9122, location_name: 'Amsterdam', country_code: 'NL', snapped_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), user_id: 'friend-2' },
  { id: 'pin-b', merchant: 'Lidl', amount: 8.35, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3790, lng: 4.9070, location_name: 'Amsterdam', country_code: 'NL', snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), user_id: 'friend-1' },
  { id: 'pin-c', merchant: 'Dampkring', amount: 5.00, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3720, lng: 4.8830, location_name: 'Amsterdam', country_code: 'NL', snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), user_id: 'friend-3' },
  { id: 'pin-d', merchant: 'Foodhallen', amount: 16.50, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3600, lng: 4.8770, location_name: 'Amsterdam', country_code: 'NL', snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), user_id: 'friend-4' },
  { id: 'pin-e', merchant: 'Anne Frank House', amount: 14.00, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3752, lng: 4.8839, location_name: 'Amsterdam', country_code: 'NL', snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), user_id: 'friend-1' },
  { id: 'pin-f', merchant: 'Rijksmuseum', amount: 22.50, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3600, lng: 4.8852, location_name: 'Amsterdam', country_code: 'NL', snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), user_id: 'friend-2' },
  { id: 'pin-g', merchant: 'Vondelpark Café', amount: 6.00, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3580, lng: 4.8690, location_name: 'Amsterdam', country_code: 'NL', snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), user_id: 'friend-3' },
  { id: 'pin-h', merchant: 'Artis Zoo', amount: 24.00, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3664, lng: 4.9163, location_name: 'Amsterdam', country_code: 'NL', snapped_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(), user_id: 'friend-4' },
]

export const MOCK_PINS = [
  ...MOCK_FEED.filter(t => t.lat).map(t => ({
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
  })),
  ...EXTRA_PINS
]

export const MOCK_TRANSACTIONS_HOME = [
  { id: 't1', merchant: 'Albert Heijn', amount: -12.45, category: '🛒', when: 'Today, 14:22' },
  { id: 't2', merchant: 'Spotify', amount: -10.99, category: '🎧', when: 'Today, 09:00' },
  { id: 't3', merchant: 'Salary — Acme BV', amount: 2840.00, category: '💼', when: 'Yesterday' },
  { id: 't4', merchant: 'Uber', amount: -8.20, category: '🚗', when: 'Yesterday' },
  { id: 't5', merchant: 'La Pizza del Sol', amount: -14.50, category: '🍕', when: '2 days ago' }
]
