/**
 * N-Tier Architecture — Application/Middle Tier
 *
 * This module is the single point of contact between the presentation tier
 * (React components) and the data tier (backend REST API or mock data).
 *
 * 12-Factor App:
 *   Factor III  — Config: API base URL comes from the environment (VITE_API_URL).
 *   Factor IV   — Backing services: the backend is treated as an attached resource
 *                 swapped by changing one env var, with no code changes required.
 *   Factor XI   — Logs: every request/error is logged as an event stream entry.
 */

import {
  mockCoins,
  mockNews,
  mockSentimentHistory,
  mockSubredditBreakdown,
  mockPosts,
  mockKeywords,
} from './mockData';

// Factor III: config comes from environment, not hardcoded
const API_BASE = import.meta.env.VITE_API_URL ?? '';

// ─── Types (shared across presentation tier) ──────────────────────────────────

export type Sentiment = 'Bullish' | 'Bearish' | 'Mixed';

export interface Coin {
  ticker: string;
  name: string;
  price: string;
  change: number;
  sentiment: Sentiment;
  confidence: number;
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  timeAgo: string;
  url: string;
  imageUrl?: string;
}

export interface Post {
  id: number;
  title: string;
  upvotes: number;
  subreddit: string;
  timeAgo: string;
  sentiment: Sentiment;
}

export interface SubredditEntry {
  subreddit: string;
  sentiment: string;
  score: number;
}

export interface SentimentPoint {
  day: string;
  score: number;
}

export interface CoinSentimentResult {
  name: string;
  ticker: string;
  sentiment: Sentiment;
  confidence: number;
  price: string;
  change: number;
  keywords: { bullish: string[]; bearish: string[] };
  subredditBreakdown: SubredditEntry[];
  sentimentHistory: SentimentPoint[];
  posts: Post[];
  topPost: Post;
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function get<T>(path: string, mockFactory: () => T): Promise<T> {
  // Factor XI: log every data-tier request as an event
  console.log(`[api] GET ${API_BASE ? API_BASE + path : path + ' (mock)'}`);

  if (!API_BASE) {
    // No backend configured — return mock data with a small simulated delay
    await new Promise(r => setTimeout(r, 250));
    return mockFactory();
  }

  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    console.error(`[api] HTTP ${res.status} for ${path}`);
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const api = {
  getTrending: (): Promise<Coin[]> =>
    get('/api/trending', () => mockCoins),

  getNews: (): Promise<NewsItem[]> =>
    get('/api/news', () => mockNews),

  getCoinSentiment: (coin: string): Promise<CoinSentimentResult> =>
    get(`/api/sentiment/${encodeURIComponent(coin.toLowerCase())}`, () => {
      const name = coin.charAt(0).toUpperCase() + coin.slice(1);
      const topPost = [...mockPosts].sort((a, b) => b.upvotes - a.upvotes)[0];
      return {
        name,
        ticker: coin.toUpperCase(),
        sentiment: 'Bullish' as Sentiment,
        confidence: 87,
        price: '$67,234',
        change: 2.4,
        keywords: mockKeywords,
        subredditBreakdown: mockSubredditBreakdown,
        sentimentHistory: mockSentimentHistory,
        posts: mockPosts,
        topPost,
      };
    }),
};
