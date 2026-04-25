# $nap — bunq for the free 📸💸

Social banking on top of bunq. Snap your transaction within 5 minutes, post it to your friends, let them guess the price, and see your spending unfold across the world map.

> Built for **bunq Hackathon 7.0** — multimodal AI for banking.

---

## What's in this bundle

```
snap-app/
├── frontend/              ← React + Vite + Tailwind PWA (the phone simulator)
├── node-backend/          ← Express server: bunq webhook + simulator endpoint
├── python-additions.py    ← Two new endpoints to drop into your existing Python backend
└── README.md              ← You are here
```

> The **Python FastAPI backend** (photos, AI, map, feed, country stats) lives in your existing `backend/` folder from the docx — this bundle adds two new endpoints to it.

---

## Architecture

```
                 bunq sandbox payment
                          │
                          ▼
                ┌──────────────────────┐
                │  Node.js Express     │ ← also exposes /api/simulate
                │  /webhook/bunq       │   for fake demo transactions
                └──────────┬───────────┘
                           │ inserts row
                           ▼
                 ┌──────────────────────┐
                 │      SUPABASE        │ ← tables + storage + Realtime
                 └──────────┬───────────┘
                            │ Realtime push
              ┌─────────────┼──────────────────┐
              │             │                  │
              ▼             ▼                  ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │ React PWA    │  │ Python       │  │ Python       │
     │ (this app)   │→ │ FastAPI      │  │ FastAPI      │
     │ shows        │  │ /api/photos  │  │ /api/feed    │
     │ notification │  │ /upload      │  │ /api/map     │
     │ + camera     │  │ + Claude     │  │ /api/wrap    │
     └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Quick start (5 terminals, ~10 minutes)

### 0. Prerequisites

- Node 20+
- Python 3.11+
- A Supabase project with the schema from the docx already applied (you've done this)
- Anthropic API key
- *(Optional)* bunq sandbox account & ngrok — only if you want REAL bunq webhooks instead of the simulator

### 1. Apply the two new Python endpoints

Open `python-additions.py`. It contains:
- A `generate_price_hint()` function → paste into your `backend/services/claude.py`
- Two routes (`/api/guess-hint/{tx_id}` and `/api/leaderboard`) → paste into your `backend/routes/ai.py`
- Update the import line in `routes/ai.py` to include `generate_price_hint`

These endpoints power the Guess-the-Price AI hint and the leaderboard. The frontend gracefully falls back to local hints if these endpoints aren't present, so you can also skip this step for a stripped-down demo.

### 2. Start the Python backend (terminal 1)

```bash
cd backend                        # your existing FastAPI from the docx
pip install -r requirements.txt
cp .env.example .env              # fill SUPABASE_*, ANTHROPIC_API_KEY, DEMO_USER_ID
uvicorn main:app --reload --port 8000
```

Verify: <http://localhost:8000/health> → `{"status":"ok"}`

### 3. Start the Node.js backend (terminal 2)

```bash
cd node-backend
npm install
cp .env.example .env              # fill SUPABASE_URL, SUPABASE_SERVICE_KEY, DEMO_USER_ID
npm run dev
```

Verify: <http://localhost:3001/health> → `{"status":"ok","service":"snap-node"}`

### 4. Start the React frontend (terminal 3)

```bash
cd frontend
npm install
cp .env.example .env              # fill VITE_SUPABASE_*, VITE_DEMO_USER_ID
npm run dev
```

Open <http://localhost:5173> on your laptop **or** scan the LAN URL on your phone (Vite prints both). Mobile is best — you get the real camera.

### 5. Enable Supabase Realtime (one-time)

Supabase Dashboard → Table Editor → `transactions` → toggle **Realtime ON**.

Without this, the React app won't see new transactions until you refresh.

### 6. *(Optional)* Wire up REAL bunq sandbox webhooks

Skip this if the simulator is enough for your demo.

```bash
# Terminal 4 — expose Node to the public internet
ngrok http 3001

# Edit node-backend/.env:
# BUNQ_API_KEY=your-sandbox-key
# BUNQ_CALLBACK_URL=https://abc123.ngrok-free.app/webhook/bunq

# Terminal 5
cd node-backend
npm run register-webhook
```

Now any sandbox payment from <https://sandbox.bunq.com> will fire `/webhook/bunq` → Supabase → React.

---

## The demo flow (what to show judges)

1. **Open the app** → an iPhone-style frame appears with the bunq icon prominent on the home screen
2. **Click the green "DEMO" button** (bottom-right) → a control panel opens with merchant presets
3. **Tap "🍕 La Pizza del Sol"** → the Node backend inserts a fake transaction into Supabase
4. **A push notification slides down** from the top of the phone with a 5-minute countdown
5. **Tap the notification** → the bunq app opens directly to the camera
6. **Take a photo** (or tap "Use a sample photo" if no camera available) → preview screen
7. **Retake or post** → AI caption appears, you can edit it, toggle "Show price" / "Show in feed"
8. **Hit "Post to $nap"** → transitions to the $nap tab
9. **The $nap feed** shows all friends' snaps with photo, caption, location, "Guess the Price" tab
10. **Expand "Guess the Price"** → Claude generates a contextual hint based on the merchant + amount → enter a guess → AI reaction
11. **Tap the 🏆 icon** → weekly leaderboard with podium
12. **Tap the 🗺️ icon** → world map with visited countries highlighted in bunq green, pinpoints pulse on each transaction location → tap a country → bottom drawer shows total spent, cities, photo grid → filter by 1d/7d/30d/1y/All

The **bottom nav** (Home / Cards / Savings / Stocks / **$nap**) is fully clickable — every tab has real content so the judges can wander.

---

## Environment variables cheat sheet

### `frontend/.env`
| Var | Where to find |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon** (NOT service_role) |
| `VITE_PY_BACKEND` | `http://localhost:8000` (or Railway URL) |
| `VITE_NODE_BACKEND` | `http://localhost:3001` (or Railway URL) |
| `VITE_DEMO_USER_ID` | Same UUID as backend `.env` files |
| `VITE_DEMO_MODE` | `true` to show the demo control panel |

### `node-backend/.env`
| Var | Notes |
|---|---|
| `SUPABASE_URL` | Same as frontend |
| `SUPABASE_SERVICE_KEY` | **service_role** key (bypasses RLS) |
| `DEMO_USER_ID` | A row in your `profiles` table |
| `BUNQ_API_KEY` | Optional — only for real bunq |
| `BUNQ_CALLBACK_URL` | Optional — your ngrok URL |
| `PORT` | Default 3001 |

### `backend/.env` (existing Python)
Already covered in the docx — `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`, `DEMO_USER_ID`.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind + framer-motion + react-simple-maps |
| Realtime | Supabase Postgres Changes WebSocket |
| Camera | `navigator.mediaDevices.getUserMedia()` |
| Backend (webhook) | Node 20 + Express + Supabase JS SDK |
| Backend (AI/media) | Python 3.11 + FastAPI + Anthropic SDK + httpx |
| Storage | Supabase Storage (`snaps` bucket, public read) |
| AI | Claude Sonnet 4.5 (caption, wrap, place memory, friend reaction, **price hint**) |
| Geocode | Nominatim (OpenStreetMap, free) |
| Map | react-simple-maps with `world-atlas` TopoJSON |
| Payments source | bunq sandbox webhooks → Node `/webhook/bunq` |

---

## Notable design choices

- **Offline-resilient demo**: every screen has a mock-data fallback (`frontend/src/lib/mock.js`). If the Python or Node backend is down, the UI still renders so judges never see an error state.
- **Local AI hint fallback**: `GuessThePrice` matches the merchant against keyword regexes and picks a reasonable canned hint if `/api/guess-hint` is unreachable. The Claude version is much better, but the demo never breaks.
- **Phone frame is responsive**: on screens ≤420px the iPhone bezel disappears and the app fills the viewport — perfect for showing the demo on an actual phone.
- **Single-user demo by default**: everything is attributed to `DEMO_USER_ID` to avoid auth setup. Magic-link auth is wired in `lib/supabase.js` if you want to enable multi-user.
- **Two backends, one DB**: Node owns the webhook + simulator (everything that *creates* transactions). Python owns photos, AI, and analytics (everything that *enriches* and *queries* them). They never talk to each other — only to Supabase.

---

## Troubleshooting

**Notification doesn't appear when I fire a fake transaction**
→ Realtime is off. Supabase → Table Editor → `transactions` → toggle Realtime ON.

**Camera doesn't open**
→ Browsers block camera on HTTP for non-localhost. Use `localhost` directly, or run Vite with HTTPS, or tap "Use a sample photo" in the camera screen.

**`/api/photos/upload` returns 404**
→ Python backend isn't running. Check `VITE_PY_BACKEND` matches `http://localhost:8000`.

**Map shows no highlighted countries**
→ Backend returned no data and mock fallback should kick in. Check browser console — if you see a CORS error, add the frontend origin to FastAPI's CORS middleware.

**`POST /api/simulate` 500**
→ Service-role key is missing or wrong. Check `node-backend/.env`.

---

Built with ❤️ in Amsterdam by a hackathon team that ran on coffee and Claude.