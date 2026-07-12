# Crypton — Crypto Market Dashboard

> Senior Capstone Project \u00b7 Sprint 1

Crypton is a real-time cryptocurrency market dashboard that aggregates live price data from CoinGecko and crypto news headlines from trusted outlets (CoinDesk, CoinTelegraph, Decrypt, Bitcoin Magazine, etc.). Users can search any coin, view detailed market metrics, compare two coins side-by-side, track favorites in a personal watchlist, and browse an authenticated feed of curated headlines.

---


## Live Demo

Run locally with:

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Then open [http://localhost:5173](http://localhost:5173).

---

## Features

| Screen | Route | Description |
|--------|-------|-------------|
| Home | \`/\` | Hero search bar, trending coins grid (live from CoinGecko), latest news headlines |
| Search Results | \`/results/:coin\` | Market data: price, 24h change, market cap, volume, circulating supply, all-time high, description, official links, where-to-buy exchanges |
| Coin Detail | \`/coin/:coin\` | Full coin profile with 7-day price history chart (Recharts), top related news |
| Compare | \`/compare\` | Side-by-side live market data for any two cryptocurrencies |
| Watchlist | \`/watchlist\` | Starred coins grid (persisted to localStorage, synced to backend when logged in) |
| News | \`/news\` | Full scrollable crypto headline feed from 6 trusted RSS sources |
| Exchanges | \`/exchanges\` | Exchange comparison data |
| Learn | \`/learn\` | Educational content |
| Regulations | \`/regulations\` | Crypto regulation information |
| Tools | \`/tools\` | Utility features |
| Login / Register / Forgot Password | \`/login\` \`/register\` \`/forgot-password\` | Auth screens with TOTP/MFA support |
| Profile | \`/profile\` | Account info, watchlist management, clickable search history |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 (with custom design tokens) |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context API + localStorage |

---

## Architecture

### Three-Tier Architecture

This project follows a three-tier architecture to separate concerns and prepare for backend integration:

\`\`\`
┌─────────────────────────────────────────────┐
│  Tier 1 — Presentation                      │
│  React pages + components (src/pages/,      │
│  src/components/)                           │
├─────────────────────────────────────────────┤
│  Tier 2 — Application / Middle Tier         │
│  src/lib/api.ts \u2014 single gateway for all    │
│  data requests; swappable between mock      │
│  data and a real REST backend via one       │
│  environment variable (VITE_API_URL)        │
├─────────────────────────────────────────────┤
│  Tier 3 — Data                              │
│  src/lib/mockData.ts + CoinGecko API (live) │
│  + RSS feeds from 6 trusted news outlets    │
│  + localStorage for user state              │
│  + Java Spring backend (backend/src/)       │
└─────────────────────────────────────────────┘
\`\`\`

### Twelve-Factor App Compliance

| Factor | Implementation |
|--------|---------------|
| I. Codebase | Single Git repo, multiple deploys |
| II. Dependencies | Declared in \`package.json\`, isolated in \`node_modules\` |
| III. Config | All config via environment variables (\`VITE_API_URL\`). See \`.env.example\` |
| IV. Backing services | Backend API treated as an attached resource \u2014 swap the URL to change providers |
| V. Build/Release/Run | \`npm run build\` produces a static artifact; \`npm run dev\` runs locally |
| VI. Processes | Stateless React components; no in-memory session state |
| VII. Port binding | Vite exports the app on a configurable port (default 5173) |
| VIII. Concurrency | Static SPA can be served by N parallel CDN/server processes |
| IX. Disposability | Fast startup (<500 ms cold start with Vite) |
| X. Dev/prod parity | Same \`node_modules\` deps in dev and prod build |
| XI. Logs | All data-tier calls logged to console as event streams (\`src/lib/logger.ts\`) |
| XII. Admin processes | \`npm run build\` / type-check scripts run as one-off processes |

---

## Project Structure

\`\`\`
SeniorProject/
\u251c\u2500\u2500 frontend/
    \u251c\u2500\u2500 .env.example            # 12-Factor: documented env vars
    \u251c\u2500\u2500 index.html
    \u251c\u2500\u2500 tailwind.config.js      # Design tokens (colors, gradients)
    \u251c\u2500\u2500 vite.config.ts
    \u2514\u2500\u2500 src/
        \u251c\u2500\u2500 components/         |\
        |       \u251c\u2500\u2500 Navbar.tsx\
        |       \u251c\u2500\u2500 CoinCard.tsx\
        |       \u251c\u2500\u2500 SearchBar.tsx\
        |       \u251c\u2500\u2500 Skeleton.tsx    |\
        |       \u251c\u2500\u2500 TickerStrip.tsx |\
        |       \u2514\u2500\u2500 ProtectedRoute.tsx\
        \u251c\u2500\u2500 context/            |\
        |       \u251c\u2500\u2500 AppContext.tsx  # Global watchlist + search history (N-tier state)\
        |       \u2514\u2500\u2500 AuthContext.tsx # Authentication state management\
        \u251c\u2500\u2500 lib/                |\
        |       \u251c\u2500\u2500 api.ts          # Middle tier: all data fetching (CoinGecko + RSS)\
        |       \u251c\u2500\u2500 auth.ts         # Local TOTP/MFA authentication with backend fallback\
        |       \u251c\u2500\u2500 coinDescriptions.ts  # Coin metadata and descriptions\
        |       \u251c\u2500\u2500 exchangeData.ts     # Exchange comparison data\
        |       \u251c\u2500\u2500 displayCurrency.ts  # Multi-currency display formatting\
        |       \u251c\u2500\u2500 learnData.ts        # Educational content data\
        |       \u251c\u2500\u2500 logger.ts           # Structured logging\
        |       \u251c\u2500\u2500 rateLimit.ts        # Rate limiting utilities\
        |       \u251c\u2500\u2500 regulationData.ts   # Regulation information data\
        |       \u2514\u2500\u2500 useTheme.ts         # Dark/light theme switching\
        \u2514\u2500\u2500 pages/              |\
        |       \u251c\u2500\u2500 Home.tsx\
        |       \u251c\u2500\u2500 Results.tsx      # Screen 2: Search Results (market data)\
        |       \u251c\u2500\u2500 CoinDetail.tsx   # Screen 3: Coin Detail with price chart\
        |       \u251c\u2500\u2500 Compare.tsx      # Screen 4: Side-by-side coin comparison\
        |       \u251c\u2500\u2500 Watchlist.tsx    # Screen 5: Starred coins grid\
        |       \u251c\u2500\u2500 News.tsx         # Screen 6: Crypto news feed\
        |       \u251c\u2500\u2500 Learn.tsx        # Educational content\
        |       \u251c\u2500\u2500 Regulations.tsx  # Regulation information\
        |       \u251c\u2500\u2500 Exchanges.tsx    # Exchange comparison\
        |       \u251c\u2500\u2500 Tools.tsx        # Utility features\
        |       \u251c\u2500\u2500 Login.tsx        # TOTP/MFA login (step 1 + step 2)\
        |       \u251c\u2500\u2500 Register.tsx     # Registration with MFA setup\
        |       \u251c\u2500\u2500 ForgotPassword.tsx # Password reset flow\
        |       \u2514\u2500\u2500 Profile.tsx      # Account info and watchlist management\
    \u251c\u2500\u2500 backend/                |\
    |       \u2514\u2500\u2500 src/            |\
    |           \u251c\u2500\u2500 main/java/com/crypton/service/SentimentCacheService.java  |\
    |           \u251c\u2500\u2500 main/java/com/crypton/repository/CoinSentimentCacheRepository.java\
    |           \u251c\u2500\u2500 main/java/com/crypton/controller/SentimentCacheController.java\
    |           \u251c\u2500\u2500 main/java/com/crypton/model/CoinSentimentCache.java\
    |           \u2514\u2500\u2500 ... (Spring Boot backend \u2014 AI sentiment pipeline)\
    \u2514\u2500\u2500 README.md
\`\`\`

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

\`\`\`bash
cp frontend/.env.example frontend/.env
\`\`\`

| Variable | Default | Description |
|----------|---------|-------------|
| \`VITE_API_URL\` | *(empty)* | Base URL of the backend REST API. Leave empty to run entirely on live data (CoinGecko + RSS). |
| \`VITE_APP_NAME\` | \`Crypton\` | Application display name |

---

## Design System

| Token | Color | Usage |
|-------|-------|-------|
| Navy | \`#08080F\` | Page background (dark theme) |
| Surface | \`#0F0F1A\` | Card background |
| Border | \`#21213A\` | Dividers, card borders |
| Orange Accent | \`#F7931A\` | Primary CTA color, highlights |
| Bullish | \`#00E676\` | Positive price change (24h) |
| Bearish | \`#FF3355\` | Negative price change (24h) |
| Star/Watchlist | \`#FFB020\` | Star/watchlist active state |
| Muted | \`#5A5A7A\` | Secondary text |

---

## Available Scripts

Run all commands from the `frontend/` directory.

\`\`\`bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Type-check and produce production build in dist/
npm run preview  # Preview the production build locally
\`\`\`

---

## Data Sources

| Source | What It Provides | How It's Fetched |
|--------|------------------|------------------|
| **CoinGecko API** | Live coin prices, market cap, volume, ATH, price history charts | REST calls with in-memory TTL cache (60s for prices) |
| **RSS Feeds** | News headlines from 6 trusted outlets (CoinDesk, CoinTelegraph, Decrypt, Blockworks, Bitcoin Magazine, CryptoSlate) | Via rss2json proxy API, aggregated and deduplicated |
| **Local Auth (localStorage)** | User accounts with TOTP/MFA secrets stored locally | PBKDF2 password hashing (100k iterations, SHA-256), SHA-256 hashes |
| **Java Spring Backend** *(disconnected in dev)* | AI sentiment analysis pipeline for Reddit data, sentiment caching, watchlist sync to server | REST API at `/api/*` endpoints (toggle via `VITE_API_URL`) |

---

## Authentication Flow

Crypton uses a two-step TOTP/MFA authentication system:

1. **Login Step 1** \u2014 Username + password verification
2. **Login Step 2** \u2014 Time-based One-Time Password (TOTP) from authenticator app

Registration includes MFA secret generation and QR code setup. Passwords are hashed with PBKDF2 (100,000 iterations, SHA-256). All auth state is persisted in `sessionStorage`. When a backend URL is configured, the frontend automatically falls back to local auth if the backend is unreachable.

---

## Backend Integration

To connect a real backend, set `VITE_API_URL` in your `.env`:

\`\`\`env
VITE_API_URL=https://api.yourbackend.com
\`\`\`

The API service (`src/lib/api.ts`) will automatically route all requests to the backend instead of live data. Expected endpoints:

| Endpoint | Response |
|----------|----------|
| \`GET /api/trending\` | Array of `Coin` objects |
| \`GET /api/news\` | Array of `NewsItem` objects |
| \`GET /api/sentiment/:coin\` | Sentiment analysis result object |

All types are exported from `src/lib/api.ts`.

When connected, the watchlist is also synced server-side via `/api/auth/watchlist/{username}`.

---

## Team

Ahmed I.
Jon Z.
Umar
Derek Z.
Ryan