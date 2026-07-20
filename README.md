# Crypton — Crypto Market Dashboard

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![CoinGecko](https://img.shields.io/badge/CoinGecko-8DC63F?style=for-the-badge&logo=coingecko&logoColor=white)
![RSS](https://img.shields.io/badge/RSS-FFA500?style=for-the-badge&logo=rss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-000000?style=for-the-badge)
![TOTP MFA](https://img.shields.io/badge/TOTP-MFA-6A5ACD?style=for-the-badge)

> Senior Capstone Project

Crypton is a full-stack cryptocurrency analytics platform built as a Senior Capstone project. The application provides live cryptocurrency market data, historical price charts, secure multi-factor authentication, personalized watchlists, cryptocurrency comparisons, and curated news from trusted industry sources. The project demonstrates modern React development, REST API integration, responsive UI design, and scalable software architecture following Twelve-Factor App principles.

---

## Features

- 📈 Live cryptocurrency prices from CoinGecko
- 🔍 Search over thousands of cryptocurrencies
- 📊 Advanced price + volume charts with 24H / 7D / 30D / 1Y / Max ranges
- 🤖 AI market sentiment (Gemini) — Bullish/Neutral/Bearish with catalysts & risks
- 💼 **Portfolio tracker** — transactions, average-cost holdings, live P/L, allocation donut
- 🎮 **Paper trading** — $100k virtual cash, live-price order fills, positions & P/L
- 🔔 **Price alerts** — above/below targets polled live, with browser notifications
- 🌍 **Market overview** — global market cap, BTC/ETH dominance, top gainers & losers
- 🧮 Historical DCA calculator, crypto/fiat converter, and tax estimator
- 📰 Crypto news with source/keyword filters and saved-article bookmarks
- 💱 Multi-currency display (USD, EUR, GBP, JPY, BTC, ETH, and more)
- 📤 CSV export for watchlist, portfolio, and trade history
- ⚖️ Side-by-side cryptocurrency comparison
- ⭐ Personal watchlist with persistent storage
- 🔐 Multi-Factor Authentication (TOTP) with brute-force lockout
- 👤 User profiles with search history
- 🌙 Dark/Light theme support and a fully responsive interface

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| State Management | React Context API |
| Authentication | TOTP / MFA |
| Backend | Java Spring Boot (Optional) |
| APIs | CoinGecko, RSS Feeds |

---

## Architecture

Crypton follows a standard three-tier architecture:

```text
Presentation Layer
    React + TypeScript + Tailwind

            ↓

Application Layer
API Service
Authentication
Business Logic

            ↓

Data Layer
CoinGecko API
RSS News Sources
Local Storage
Spring Boot Backend
```

---

## Installation

```bash
git clone https://github.com/your-repository/crypton.git

cd frontend

npm install

cp .env.example .env

npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file from `.env.example`.

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Java/Spring backend URL (accounts, watchlist, AI sentiment cache) |
| VITE_PYTHON_API_URL | Python/FastAPI Gemini service URL (AI `/classify`) |
| VITE_APP_NAME | Application name |

---

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Runs the production build locally.

```bash
npm test
```

Runs the Vitest unit suite (CSV export, portfolio average-cost math, and
paper-trading buy/sell logic). Also runs in CI on every push and PR.

---

## Data Sources

- CoinGecko API
- CoinDesk RSS
- CoinTelegraph RSS
- Decrypt RSS
- Bitcoin Magazine RSS
- Blockworks RSS
- CryptoSlate RSS

---

## Authentication

Crypton implements secure two-factor authentication using Time-based One-Time Passwords (TOTP).

Authentication includes:

- Username & Password
- PBKDF2 Password Hashing
- SHA-256 Encryption
- TOTP Verification
- Session Persistence
- Automatic Local Authentication Fallback

---

## Backend Integration

Setting `VITE_API_URL` automatically switches the frontend from live API calls to a Spring Boot backend without modifying application code.

Supported endpoints include:

- `/api/trending`
- `/api/news`
- `/api/sentiment/:coin`
- `/api/auth/watchlist`

---

## Project Structure

```text
SeniorProject/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   └── src/
│       └── main/java/com/crypton/
│
└── README.md
```

---

## Design System

| Token | Hex Value | Usage |
|-------|-----------|-------|
| Navy | <span style="color:#08080F">`#08080F`</span> | Primary page background (dark theme) |
| Surface | <span style="color:#0F0F1A">`#0F0F1A`</span> | Card and panel backgrounds |
| Border | <span style="color:#21213A">`#21213A`</span> | Borders, dividers, and outlines |
| Orange Accent | <span style="color:#F7931A">`#F7931A`</span> | Primary buttons, links, and highlights |
| Bullish Green | <span style="color:#00E676">`#00E676`</span> | Positive price changes and gains |
| Bearish Red | <span style="color:#FF3355">`#FF3355`</span> | Negative price changes and losses |
| Watchlist Gold | <span style="color:#FFB020">`#FFB020`</span> | Favorite/watchlist indicators |
| Muted Gray | <span style="color:#5A5A7A">`#5A5A7A`</span> | Secondary text and icons |
| White | <span style="color:#FFFFFF">`#FFFFFF`</span> | Primary text on dark backgrounds |

---

## Future Enhancements

- Server-side session tokens so per-user endpoints are authenticated
- TradingView-grade charting
- Native mobile application
- Installable PWA with offline support
- Wider automated test coverage (component/E2E)

---

## Team

- Ahmed I.
- Jon Z.
- Umar
- Derek Z.
- Ryan Cuccurullo
