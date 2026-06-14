# Crypton — Reddit Crypto Sentiment Analyzer

> Senior Capstone Project · Sprint 1

Crypton is a real-time cryptocurrency sentiment dashboard that decodes Reddit opinion across 10+ subreddits. Users can search any coin, view bullish/bearish/mixed verdicts with confidence scores, compare two coins head-to-head, and track favorites in a personal watchlist.

---

## Live Demo

Run locally with:

```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Features

| Screen | Route | Description |
|--------|-------|-------------|
| Home | `/` | Hero search bar, trending coins grid, latest news |
| Search Results | `/results/:coin` | Sentiment verdict, confidence meter, keyword pills, subreddit bar chart |
| Coin Detail | `/coin/:coin` | 7-day sentiment history chart, top Reddit post, Hot/New post feed |
| Compare | `/compare` | Side-by-side sentiment, confidence, keywords, and subreddit breakdown |
| Watchlist | `/watchlist` | Starred coins grid (persisted to localStorage) |
| News | `/news` | Full scrollable crypto headline feed |
| Login / Register / Forgot Password | `/login` `/register` `/forgot-password` | Auth screens |
| Profile | `/profile` | Account info, watchlist management, clickable search history |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context API + localStorage |

---

## Architecture

### N-Tier Architecture

This project follows a three-tier architecture to separate concerns and prepare for backend integration:

```
┌─────────────────────────────────────────────┐
│  Tier 1 — Presentation                      │
│  React pages + components (src/pages/,      │
│  src/components/)                           │
├─────────────────────────────────────────────┤
│  Tier 2 — Application / Middle Tier         │
│  src/lib/api.ts — single gateway for all    │
│  data requests; swappable between mock      │
│  data and a real REST backend via one       │
│  environment variable (VITE_API_URL)        │
├─────────────────────────────────────────────┤
│  Tier 3 — Data                              │
│  src/lib/mockData.ts (dev) /                │
│  REST API backend (production)              │
│  + localStorage for user state              │
└─────────────────────────────────────────────┘
```

### Twelve-Factor App Compliance

| Factor | Implementation |
|--------|---------------|
| I. Codebase | Single Git repo, multiple deploys |
| II. Dependencies | Declared in `package.json`, isolated in `node_modules` |
| III. Config | All config via environment variables (`VITE_API_URL`). See `.env.example` |
| IV. Backing services | Backend API treated as an attached resource — swap the URL to change providers |
| V. Build/Release/Run | `npm run build` produces a static artifact; `npm run dev` runs locally |
| VI. Processes | Stateless React components; no in-memory session state |
| VII. Port binding | Vite exports the app on a configurable port (default 5173) |
| VIII. Concurrency | Static SPA can be served by N parallel CDN/server processes |
| IX. Disposability | Fast startup (<500 ms cold start with Vite) |
| X. Dev/prod parity | Same `node_modules` deps in dev and prod build |
| XI. Logs | All data-tier calls logged to console as event streams (`src/lib/api.ts`) |
| XII. Admin processes | `npm run build` / type-check scripts run as one-off processes |

---

## Project Structure

```
SeniorProject/
├── frontend/
│   ├── .env.example            # 12-Factor: documented env vars
│   ├── index.html
│   ├── tailwind.config.js      # Design tokens (colors, gradients)
│   ├── vite.config.ts
│   └── src/
│       ├── context/
│       │   └── AppContext.tsx  # Global watchlist + search history (N-tier state)
│       ├── lib/
│       │   ├── api.ts          # Middle tier: all data fetching
│       │   └── mockData.ts     # Data tier: mock dataset
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── CoinCard.tsx
│       │   ├── SearchBar.tsx
│       │   ├── SentimentBadge.tsx
│       │   └── NewsCard.tsx
│       └── pages/
│           ├── Home.tsx
│           ├── Results.tsx         # Screen 2: Search Results
│           ├── CoinDetail.tsx      # Screen 3: Coin Detail
│           ├── Compare.tsx         # Screen 4
│           ├── Watchlist.tsx       # Screen 5
│           ├── News.tsx            # Screen 6
│           ├── Login.tsx           # Screen 7a
│           ├── Register.tsx        # Screen 7b
│           ├── ForgotPassword.tsx  # Screen 7c
│           └── Profile.tsx         # Screen 8
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | *(empty)* | Base URL of the backend REST API. Leave empty to run entirely on mock data. |
| `VITE_APP_NAME` | `Crypton` | Application display name |

---

## Design System

| Token | Color | Usage |
|-------|-------|-------|
| Navy | `#0D0F14` | Page background |
| Surface | `#1A1D27` | Card background |
| Border | `#2A2D3A` | Dividers, card borders |
| Bullish | `#00C896` | Positive sentiment |
| Bearish | `#FF4D4D` | Negative sentiment |
| Mixed | `#FFB830` | Neutral/mixed sentiment |
| Accent | `#4B6BFB` | Primary blue, CTAs |
| Muted | `#8A8FA8` | Secondary text |
| Hero | `#4B6BFB → #9B59B6` | Home page gradient |

---

## Available Scripts

Run all commands from the `frontend/` directory.

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Type-check and produce production build in dist/
npm run preview  # Preview the production build locally
```

---

## Backend Integration

To connect a real backend, set `VITE_API_URL` in your `.env`:

```env
VITE_API_URL=https://api.yourbackend.com
```

The API service (`src/lib/api.ts`) will automatically route all requests to the backend instead of mock data. Expected endpoints:

| Endpoint | Response |
|----------|----------|
| `GET /api/trending` | Array of `Coin` objects |
| `GET /api/news` | Array of `NewsItem` objects |
| `GET /api/sentiment/:coin` | `CoinSentimentResult` object |

All types are exported from `src/lib/api.ts`.

---

## Team

Ahmed Iqbal — Senior Capstone Project, Spring 2025
