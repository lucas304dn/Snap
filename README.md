<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/camera_1f4f7.png" width="120" />
</p>

<h1 align="center">$nap</h1>

<p align="center">
  <strong>pay. snap. flex.</strong>
</p>

<p align="center">
  <a href="#what-is-this">What</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#features">Features</a> •
  <a href="#running-it">Run it</a> •
  <a href="#database">Database</a> •
  <a href="#api-reference">API</a>
</p>

---

A social layer on top of [bunq](https://www.bunq.com). Every time you make a payment, you get a **5-minute window** to snap a photo of what you bought. That photo becomes a post in a social feed — like Instagram, but your bank account is the content.

Built for the **bunq hackathon** in one session.

```
┌──────────────────────────────────────────┐
│  Payment triggers →  5-min snap window   │
│  You snap a photo  →  AI writes caption  │
│  Friends see feed  →  Guess the price    │
│  Weekly Wrap AI    →  Claude reviews you │
└──────────────────────────────────────────┘
```

## What is this

Two projects that work together:

| Folder | What it is | Port |
|--------|-----------|------|
| `app/` | React frontend — phone UI, feed, map, camera | 5173 |
| `snap-backend/` | Python FastAPI — webhooks, photo upload, AI, feed API | 8000 |

Supabase handles the database, auth, realtime, and photo storage.

## Architecture

```
bunq webhook → snap-backend → Supabase DB
                    ↓
               Claude AI (caption + weekly wrap + guess reactions)
                    ↓
               Supabase Storage (photos)
                    ↓
               app/ (React) ← reads feed, map, wrap via API
```

**Transaction flow:**
1. User makes a bunq payment
2. `POST /webhook/bunq` fires → row inserted in `transactions` with a 5-minute `snap_deadline`
3. User opens the camera and uploads a photo within the window
4. Backend reverse-geocodes lat/lng → Claude Vision writes a caption → photo stored in Supabase
5. Post appears in friends' feeds

## Features

### 📸 Feed
- Social feed of snapped transactions from you and your friends
- Emoji reactions (🔥 💀 😍 🤑) with burst particle animations
- AI-generated captions on every post
- Amount shown or hidden per post — poster's choice

### 💸 Guess the Price
- On posts where the amount is hidden, friends can guess the price
- Submit a guess → see the real amount + a ranked leaderboard
- Claude generates a reaction to how close (or far off) your guess was

### 🗺️ Snap Map
- Every snapped transaction plotted on a dark map
- Filter by time window: 1d / 7d / 30d / 1y / All
- Tap any pin to see the merchant, amount, photo, and caption

### ✦ Weekly Wrap
- Powered by Claude — hit the button, get a full AI summary of your week
- Spending paragraph + memorable mention + full transaction list with photos
- Regenerate any time

### 📷 Camera
- Opens directly from a payment notification
- 5-minute countdown snap window
- Gets back an AI caption + reverse-geocoded location automatically

## Running it

Two terminals.

**Terminal 1 — snap-backend (Python)**

```bash
cd snap-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

`.env` file needed:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
ANTHROPIC_API_KEY=sk-ant-...
BUNQ_API_KEY=sandbox_...
BUNQ_ENVIRONMENT=SANDBOX
DEMO_USER_ID=your-user-uuid
```

**Terminal 2 — app (React + Vite)**

```bash
cd app
npm install
npm run dev
```

`.env` file needed:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:8000
VITE_DEMO_USER_ID=your-user-uuid
```

Open **http://localhost:5173**

## Database

Run `snap-backend/schema.sql` in the Supabase SQL Editor once.

| Table | What it stores |
|-------|---------------|
| `profiles` | User display names, avatars |
| `friends` | Friend relationships (pending / accepted) |
| `transactions` | Every payment — photo, caption, lat/lng, snap deadline |
| `reactions` | Emoji reactions + price guesses + AI reactions |

Also creates a `snaps` storage bucket (public) for photo uploads.

## API Reference

All endpoints on port 8000.

| Method | Path | What it does |
|--------|------|-------------|
| `POST` | `/webhook/bunq` | Receives real bunq payment notifications |
| `POST` | `/webhook/bunq/test` | Fire a fake payment for local dev |
| `GET` | `/api/feed/{user_id}` | Friend feed |
| `GET` | `/api/map/{user_id}` | Map pins |
| `GET` | `/api/wrap/{user_id}` | Weekly Wrap AI summary |
| `GET` | `/api/stats/{user_id}` | Spending by country + city |
| `GET` | `/api/place-memory/{user_id}` | AI memory of a specific location |
| `POST` | `/api/photos/upload` | Upload a snap photo |
| `PATCH` | `/api/photos/{id}/caption` | Edit a caption |
| `PATCH` | `/api/photos/{id}/visibility` | Toggle public / show amount |
| `POST` | `/api/guess` | Submit a price guess |
| `GET` | `/api/reactions/{transaction_id}` | Get all guesses for a post |
| `GET` | `/health` | Health check |

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, Tailwind CSS, Framer Motion |
| Map | react-leaflet, CartoDB Dark Matter tiles |
| Backend | Python, FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL + Realtime + Storage) |
| AI | Anthropic Claude (captions, weekly wrap, guess reactions) |
| Payments | bunq API (sandbox + production webhooks) |

---

Built at the bunq hackathon.
