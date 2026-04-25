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
    id: 'mock-you-1',
    user_id: YOU,
    merchant: 'Sugarbird Coffee',
    amount: 4.80,
    currency: 'EUR',
    show_amount: false,
    location_name: 'Amsterdam',
    country_code: 'NL',
    lat: 52.3738,
    lng: 4.8910,
    photo_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    caption: 'Morning fuel secured ☕',
    snapped_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    profiles: { username: 'you', display_name: 'You', avatar_url: null }
  },
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
const ago = h => new Date(Date.now() - h * 3600000).toISOString()

// Extra pins spanning Amsterdam, Europe & beyond
const EXTRA_PINS = [
  // Amsterdam
  { id: 'pin-a', merchant: 'Uber Eats', amount: 22.80, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3655, lng: 4.9122, location_name: 'Amsterdam', country_code: 'NL', snapped_at: ago(1.5), user_id: 'friend-2' },
  { id: 'pin-b', merchant: 'Lidl', amount: 8.35, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3790, lng: 4.9070, location_name: 'Amsterdam', country_code: 'NL', snapped_at: ago(2), user_id: 'friend-1' },
  { id: 'pin-c', merchant: 'Dampkring', amount: 5.00, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3720, lng: 4.8830, location_name: 'Amsterdam', country_code: 'NL', snapped_at: ago(4), user_id: 'friend-3' },
  { id: 'pin-d', merchant: 'Foodhallen', amount: 16.50, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3600, lng: 4.8770, location_name: 'Amsterdam', country_code: 'NL', snapped_at: ago(6), user_id: 'friend-4' },
  { id: 'pin-e', merchant: 'Anne Frank House', amount: 14.00, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3752, lng: 4.8839, location_name: 'Amsterdam', country_code: 'NL', snapped_at: ago(9), user_id: 'friend-1' },
  { id: 'pin-f', merchant: 'Rijksmuseum', amount: 22.50, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3600, lng: 4.8852, location_name: 'Amsterdam', country_code: 'NL', snapped_at: ago(12), user_id: 'friend-2' },
  { id: 'pin-g', merchant: 'Vondelpark Café', amount: 7.20, currency: 'EUR', show_amount: false, photo_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&q=70', caption: 'Park hours ☀️', lat: 52.3580, lng: 4.8686, location_name: 'Amsterdam', country_code: 'NL', snapped_at: ago(18), user_id: 'friend-3' },
  { id: 'pin-h', merchant: 'Paradiso', amount: 18.00, currency: 'EUR', show_amount: false, photo_url: null, caption: null, lat: 52.3624, lng: 4.8811, location_name: 'Amsterdam', country_code: 'NL', snapped_at: ago(30), user_id: 'friend-4' },

  // London
  { id: 'pin-lon1', merchant: 'Dishoom', amount: 24.50, currency: 'GBP', photo_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=70', caption: 'Bombay-style brunch 🫶', lat: 51.5123, lng: -0.1245, location_name: 'London', country_code: 'GB', snapped_at: ago(40), user_id: 'friend-1' },
  { id: 'pin-lon2', merchant: 'Borough Market', amount: 12.80, currency: 'GBP', photo_url: null, caption: null, lat: 51.5055, lng: -0.0910, location_name: 'London', country_code: 'GB', snapped_at: ago(48), user_id: 'friend-2' },
  { id: 'pin-lon3', merchant: 'Tate Modern', amount: 0, currency: 'GBP', photo_url: null, caption: null, lat: 51.5076, lng: -0.0994, location_name: 'London', country_code: 'GB', snapped_at: ago(52), user_id: 'friend-3' },
  { id: 'pin-lon4', merchant: 'Pret a Manger', amount: 8.40, currency: 'GBP', photo_url: null, caption: null, lat: 51.5150, lng: -0.1415, location_name: 'London', country_code: 'GB', snapped_at: ago(60), user_id: 'friend-4' },

  // Rome
  { id: 'pin-rom1', merchant: 'Pizzarium Bonci', amount: 9.00, currency: 'EUR', photo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70', caption: 'Roman pizza al taglio 🍕', lat: 41.9022, lng: 12.4539, location_name: 'Rome', country_code: 'IT', snapped_at: ago(72), user_id: 'friend-2' },
  { id: 'pin-rom2', merchant: "Caffè Sant'Eustachio", amount: 2.50, currency: 'EUR', photo_url: null, caption: null, lat: 41.8976, lng: 12.4739, location_name: 'Rome', country_code: 'IT', snapped_at: ago(75), user_id: 'friend-1' },
  { id: 'pin-rom3', merchant: 'Colosseum Ticket', amount: 16.00, currency: 'EUR', photo_url: null, caption: null, lat: 41.8902, lng: 12.4922, location_name: 'Rome', country_code: 'IT', snapped_at: ago(80), user_id: 'friend-3' },
  { id: 'pin-rom4', merchant: 'Gelato dei Gracchi', amount: 3.50, currency: 'EUR', photo_url: null, caption: null, lat: 41.9097, lng: 12.4617, location_name: 'Rome', country_code: 'IT', snapped_at: ago(84), user_id: 'friend-4' },

  // Madrid
  { id: 'pin-mad1', merchant: 'Mercado San Miguel', amount: 18.40, currency: 'EUR', photo_url: null, caption: null, lat: 40.4151, lng: -3.7090, location_name: 'Madrid', country_code: 'ES', snapped_at: ago(90), user_id: 'friend-1' },
  { id: 'pin-mad2', merchant: 'Museo del Prado', amount: 15.00, currency: 'EUR', photo_url: null, caption: null, lat: 40.4138, lng: -3.6921, location_name: 'Madrid', country_code: 'ES', snapped_at: ago(96), user_id: 'friend-2' },
  { id: 'pin-mad3', merchant: 'Cervecería Alemana', amount: 11.00, currency: 'EUR', photo_url: null, caption: null, lat: 40.4145, lng: -3.6997, location_name: 'Madrid', country_code: 'ES', snapped_at: ago(100), user_id: 'friend-3' },

  // Lisbon
  { id: 'pin-lis1', merchant: 'Time Out Market', amount: 21.00, currency: 'EUR', photo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70', caption: 'Food hall dreams 🫶', lat: 38.7071, lng: -9.1459, location_name: 'Lisbon', country_code: 'PT', snapped_at: ago(110), user_id: 'friend-4' },
  { id: 'pin-lis2', merchant: 'Pastéis de Belém', amount: 4.20, currency: 'EUR', photo_url: null, caption: null, lat: 38.6973, lng: -9.2039, location_name: 'Lisbon', country_code: 'PT', snapped_at: ago(115), user_id: 'friend-1' },
  { id: 'pin-lis3', merchant: 'A Cevicheria', amount: 28.00, currency: 'EUR', photo_url: null, caption: null, lat: 38.7165, lng: -9.1490, location_name: 'Lisbon', country_code: 'PT', snapped_at: ago(120), user_id: 'friend-2' },

  // Copenhagen
  { id: 'pin-cop1', merchant: 'Noma', amount: 380.00, currency: 'DKK', photo_url: null, caption: null, lat: 55.6801, lng: 12.5992, location_name: 'Copenhagen', country_code: 'DK', snapped_at: ago(130), user_id: 'friend-3' },
  { id: 'pin-cop2', merchant: 'Reffen Street Food', amount: 14.00, currency: 'EUR', photo_url: null, caption: null, lat: 55.6779, lng: 12.6020, location_name: 'Copenhagen', country_code: 'DK', snapped_at: ago(136), user_id: 'friend-4' },

  // Vienna
  { id: 'pin-vie1', merchant: 'Café Central', amount: 11.50, currency: 'EUR', photo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=70', caption: 'Imperial coffee ☕', lat: 48.2101, lng: 16.3666, location_name: 'Vienna', country_code: 'AT', snapped_at: ago(145), user_id: 'friend-1' },
  { id: 'pin-vie2', merchant: 'Naschmarkt', amount: 16.80, currency: 'EUR', photo_url: null, caption: null, lat: 48.1993, lng: 16.3647, location_name: 'Vienna', country_code: 'AT', snapped_at: ago(150), user_id: 'friend-2' },

  // Prague
  { id: 'pin-pra1', merchant: 'Lokál Hamburk', amount: 8.50, currency: 'EUR', photo_url: null, caption: null, lat: 50.0877, lng: 14.4237, location_name: 'Prague', country_code: 'CZ', snapped_at: ago(160), user_id: 'friend-3' },
  { id: 'pin-pra2', merchant: 'Trdelník Stand', amount: 3.00, currency: 'EUR', photo_url: null, caption: null, lat: 50.0874, lng: 14.4213, location_name: 'Prague', country_code: 'CZ', snapped_at: ago(165), user_id: 'friend-4' },

  // Stockholm
  { id: 'pin-sto1', merchant: 'Aifur Viking Bar', amount: 22.00, currency: 'EUR', photo_url: null, caption: null, lat: 59.3233, lng: 18.0712, location_name: 'Stockholm', country_code: 'SE', snapped_at: ago(175), user_id: 'friend-1' },
  { id: 'pin-sto2', merchant: 'Fotografiska Café', amount: 17.00, currency: 'EUR', photo_url: null, caption: null, lat: 59.3183, lng: 18.0858, location_name: 'Stockholm', country_code: 'SE', snapped_at: ago(180), user_id: 'friend-2' },

  // Tokyo
  { id: 'pin-tok1', merchant: 'Ichiran Ramen', amount: 1300, currency: 'JPY', photo_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=70', caption: 'Solo ramen booth at midnight 🍜', lat: 35.6595, lng: 139.7004, location_name: 'Tokyo', country_code: 'JP', snapped_at: ago(200), user_id: 'friend-3' },
  { id: 'pin-tok2', merchant: 'Tsukiji Outer Market', amount: 2400, currency: 'JPY', photo_url: null, caption: null, lat: 35.6655, lng: 139.7697, location_name: 'Tokyo', country_code: 'JP', snapped_at: ago(205), user_id: 'friend-4' },
  { id: 'pin-tok3', merchant: 'Family Mart', amount: 620, currency: 'JPY', photo_url: null, caption: null, lat: 35.6812, lng: 139.7671, location_name: 'Tokyo', country_code: 'JP', snapped_at: ago(210), user_id: 'friend-1' },
  { id: 'pin-tok4', merchant: 'TeamLab Planets', amount: 3200, currency: 'JPY', photo_url: null, caption: null, lat: 35.6468, lng: 139.7959, location_name: 'Tokyo', country_code: 'JP', snapped_at: ago(215), user_id: 'friend-2' },

  // New York
  { id: 'pin-nyc1', merchant: "Joe's Pizza", amount: 5.00, currency: 'USD', photo_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=70', caption: 'A dollar slice, undefeated 🍕', lat: 40.7308, lng: -74.0025, location_name: 'New York', country_code: 'US', snapped_at: ago(240), user_id: 'friend-3' },
  { id: 'pin-nyc2', merchant: 'Shake Shack', amount: 14.50, currency: 'USD', photo_url: null, caption: null, lat: 40.7412, lng: -73.9897, location_name: 'New York', country_code: 'US', snapped_at: ago(245), user_id: 'friend-4' },
  { id: 'pin-nyc3', merchant: 'MoMA', amount: 25.00, currency: 'USD', photo_url: null, caption: null, lat: 40.7614, lng: -73.9776, location_name: 'New York', country_code: 'US', snapped_at: ago(250), user_id: 'friend-1' },
  { id: 'pin-nyc4', merchant: "Katz's Delicatessen", amount: 22.00, currency: 'USD', photo_url: null, caption: null, lat: 40.7223, lng: -73.9873, location_name: 'New York', country_code: 'US', snapped_at: ago(255), user_id: 'friend-2' },

  // Bangkok
  { id: 'pin-bkk1', merchant: 'Or Tor Kor Market', amount: 180, currency: 'THB', photo_url: null, caption: null, lat: 13.7994, lng: 100.5502, location_name: 'Bangkok', country_code: 'TH', snapped_at: ago(300), user_id: 'friend-3' },
  { id: 'pin-bkk2', merchant: 'Gaggan Anand', amount: 5800, currency: 'THB', photo_url: null, caption: null, lat: 13.7463, lng: 100.5418, location_name: 'Bangkok', country_code: 'TH', snapped_at: ago(305), user_id: 'friend-4' },

  // Dubai
  { id: 'pin-dub1', merchant: 'At.mosphere (Burj Khalifa)', amount: 120.00, currency: 'AED', photo_url: null, caption: null, lat: 25.1972, lng: 55.2744, location_name: 'Dubai', country_code: 'AE', snapped_at: ago(350), user_id: 'friend-1' },
  { id: 'pin-dub2', merchant: 'Dubai Mall Food Court', amount: 45.00, currency: 'AED', photo_url: null, caption: null, lat: 25.1985, lng: 55.2796, location_name: 'Dubai', country_code: 'AE', snapped_at: ago(355), user_id: 'friend-2' },

  // Mexico City
  { id: 'pin-cdmx1', merchant: 'Contramar', amount: 520, currency: 'MXN', photo_url: null, caption: null, lat: 19.4143, lng: -99.1678, location_name: 'Mexico City', country_code: 'MX', snapped_at: ago(400), user_id: 'friend-3' },
  { id: 'pin-cdmx2', merchant: 'Mercado de Medellín', amount: 85, currency: 'MXN', photo_url: null, caption: null, lat: 19.4024, lng: -99.1700, location_name: 'Mexico City', country_code: 'MX', snapped_at: ago(405), user_id: 'friend-4' },

  // São Paulo
  { id: 'pin-sao1', merchant: 'D.O.M.', amount: 380, currency: 'BRL', photo_url: null, caption: null, lat: -23.5673, lng: -46.6734, location_name: 'São Paulo', country_code: 'BR', snapped_at: ago(450), user_id: 'friend-1' },
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
