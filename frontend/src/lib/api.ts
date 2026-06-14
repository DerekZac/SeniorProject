/**
 * N-Tier Architecture — Application / Middle Tier
 *
 * All data flows through this module. Real data sources:
 *   • CoinGecko v3  — live crypto prices (free, no key required)
 *   • Reddit JSON   — public Reddit posts for sentiment analysis
 *   • CryptoCompare — crypto news headlines (free, no key required)
 *
 * 12-Factor App compliance:
 *   Factor III — optional API keys from environment variables
 *   Factor IV  — each data source is an attached backing service
 *   Factor XI  — every fetch is logged as a console event stream
 */

import { analyzeSentiment } from './sentiment';
import { resolveCoin, TRENDING_GECKO_IDS } from './coinMapping';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  permalink?: string;
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

// ─── Internal TTL cache ───────────────────────────────────────────────────────

const _cache = new Map<string, { data: unknown; exp: number }>();

function getCache<T>(key: string): T | null {
  const hit = _cache.get(key);
  if (!hit || Date.now() > hit.exp) return null;
  console.log(`[cache] hit ${key}`);
  return hit.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  _cache.set(key, { data, exp: Date.now() + ttlMs });
}

const TTL = {
  prices: 60_000,       // 1 min  – prices change frequently
  reddit: 5 * 60_000,   // 5 min  – Reddit posts are stable
  news:   10 * 60_000,  // 10 min – headlines rotate slowly
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(unixSeconds: number): string {
  const s = Math.floor(Date.now() / 1000) - unixSeconds;
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function formatPrice(usd: number): string {
  if (usd >= 1000) return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (usd >= 1)    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (usd >= 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(8)}`;
}

// ─── CoinGecko ───────────────────────────────────────────────────────────────

const GECKO = 'https://api.coingecko.com/api/v3';

interface GeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

async function fetchGeckoMarkets(ids: string[]): Promise<GeckoMarket[]> {
  const key = `gecko:${ids.join(',')}`;
  const cached = getCache<GeckoMarket[]>(key);
  if (cached) return cached;

  const url =
    `${GECKO}/coins/markets?vs_currency=usd` +
    `&ids=${ids.join(',')}` +
    `&order=market_cap_desc&per_page=${ids.length}&page=1&sparkline=false`;

  console.log('[api] GET CoinGecko markets');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  const data: GeckoMarket[] = await res.json();
  setCache(key, data, TTL.prices);
  return data;
}

// ─── Reddit ───────────────────────────────────────────────────────────────────

interface RedditRaw {
  id: string;
  title: string;
  selftext: string;
  score: number;
  subreddit: string;
  created_utc: number;
  permalink: string;
}

async function fetchRedditPosts(query: string, subreddits: string[]): Promise<RedditRaw[]> {
  const subs = subreddits.join('+');
  const key = `reddit:${query}:${subs}`;
  const cached = getCache<RedditRaw[]>(key);
  if (cached) return cached;

  const url =
    `https://www.reddit.com/r/${subs}/search.json` +
    `?q=${encodeURIComponent(query)}&sort=hot&limit=100&t=week&raw_json=1`;

  console.log(`[api] GET Reddit posts for "${query}"`);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts: RedditRaw[] = (json.data?.children ?? []).map((c: any) => ({
    id: c.data.id,
    title: c.data.title,
    selftext: c.data.selftext || '',
    score: c.data.score,
    subreddit: c.data.subreddit,
    created_utc: c.data.created_utc,
    permalink: `https://reddit.com${c.data.permalink}`,
  }));

  setCache(key, posts, TTL.reddit);
  return posts;
}

// ─── CryptoCompare News ───────────────────────────────────────────────────────

async function fetchCCNews(): Promise<NewsItem[]> {
  const key = 'cc:news';
  const cached = getCache<NewsItem[]>(key);
  if (cached) return cached;

  console.log('[api] GET CryptoCompare news');
  const res = await fetch(
    'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest'
  );
  if (!res.ok) throw new Error(`CryptoCompare HTTP ${res.status}`);

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const news: NewsItem[] = (json.Data ?? []).slice(0, 12).map((item: any, i: number) => ({
    id: i + 1,
    title: item.title,
    source: item.source_info?.name ?? item.source,
    timeAgo: timeAgo(item.published_on),
    url: item.url,
    imageUrl: item.imageurl || undefined,
  }));

  setCache(key, news, TTL.news);
  return news;
}

// ─── Derived data builders ────────────────────────────────────────────────────

function buildSentimentHistory(posts: RedditRaw[]): SentimentPoint[] {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const nowSec = Math.floor(Date.now() / 1000);

  // Build ordered buckets for the last 7 days (oldest → newest)
  const buckets: { label: string; texts: string[] }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date((nowSec - i * 86400) * 1000);
    buckets.push({ label: DAY_LABELS[d.getDay()], texts: [] });
  }

  for (const post of posts) {
    const daysAgo = Math.floor((nowSec - post.created_utc) / 86400);
    const idx = 6 - daysAgo;
    if (idx >= 0 && idx < 7) {
      buckets[idx].texts.push(post.title + ' ' + post.selftext);
    }
  }

  return buckets.map(({ label, texts }) => ({
    day: label,
    score: texts.length === 0 ? 50 : analyzeSentiment(texts).confidence,
  }));
}

function buildSubredditBreakdown(posts: RedditRaw[]): SubredditEntry[] {
  const bySubreddit = new Map<string, string[]>();

  for (const post of posts) {
    const sub = `r/${post.subreddit}`;
    if (!bySubreddit.has(sub)) bySubreddit.set(sub, []);
    bySubreddit.get(sub)!.push(post.title + ' ' + post.selftext);
  }

  return Array.from(bySubreddit.entries())
    .filter(([, texts]) => texts.length >= 2)
    .map(([subreddit, texts]) => {
      const { sentiment, confidence } = analyzeSentiment(texts);
      return { subreddit, sentiment, score: confidence };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function toPost(raw: RedditRaw, sentiment: Sentiment, idx: number): Post {
  return {
    id: idx,
    title: raw.title,
    upvotes: raw.score,
    subreddit: `r/${raw.subreddit}`,
    timeAgo: timeAgo(raw.created_utc),
    sentiment,
    permalink: raw.permalink,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {

  async getTrending(): Promise<Coin[]> {
    // 1. Fetch live prices
    const markets = await fetchGeckoMarkets(TRENDING_GECKO_IDS);

    // 2. Fetch Reddit sentiment for each coin in parallel (3 subs each for speed)
    const sentiments = await Promise.allSettled(
      TRENDING_GECKO_IDS.map(async (id) => {
        const info = resolveCoin(id)!;
        const posts = await fetchRedditPosts(id, info.subreddits.slice(0, 3));
        return { id, ...analyzeSentiment(posts.map(p => p.title + ' ' + p.selftext)) };
      })
    );

    const sentMap = new Map<string, { sentiment: Sentiment; confidence: number }>();
    sentiments.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        sentMap.set(TRENDING_GECKO_IDS[i], {
          sentiment: r.value.sentiment,
          confidence: r.value.confidence,
        });
      } else {
        console.warn(`[api] Trending sentiment failed for ${TRENDING_GECKO_IDS[i]}:`, r.reason);
        sentMap.set(TRENDING_GECKO_IDS[i], { sentiment: 'Mixed', confidence: 50 });
      }
    });

    return markets.map((m) => {
      const info = resolveCoin(m.id);
      const sent = sentMap.get(m.id) ?? { sentiment: 'Mixed' as Sentiment, confidence: 50 };
      return {
        ticker: info?.ticker ?? m.symbol.toUpperCase(),
        name: m.name,
        price: formatPrice(m.current_price),
        change: parseFloat((m.price_change_percentage_24h ?? 0).toFixed(2)),
        sentiment: sent.sentiment,
        confidence: sent.confidence,
      };
    });
  },

  async getNews(): Promise<NewsItem[]> {
    return fetchCCNews();
  },

  async getWatchlistCoins(tickers: string[]): Promise<Coin[]> {
    if (tickers.length === 0) return [];
    const geckoIds = tickers
      .map(t => resolveCoin(t)?.geckoId)
      .filter((id): id is string => !!id);

    if (geckoIds.length === 0) return [];

    const markets = await fetchGeckoMarkets(geckoIds);

    const sentiments = await Promise.allSettled(
      geckoIds.map(async (id) => {
        const info = resolveCoin(id)!;
        const posts = await fetchRedditPosts(id, info.subreddits.slice(0, 2));
        return { id, ...analyzeSentiment(posts.map(p => p.title)) };
      })
    );

    const sentMap = new Map<string, { sentiment: Sentiment; confidence: number }>();
    sentiments.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        sentMap.set(geckoIds[i], { sentiment: r.value.sentiment, confidence: r.value.confidence });
      } else {
        sentMap.set(geckoIds[i], { sentiment: 'Mixed', confidence: 50 });
      }
    });

    return markets.map((m) => {
      const info = resolveCoin(m.id);
      const sent = sentMap.get(m.id) ?? { sentiment: 'Mixed' as Sentiment, confidence: 50 };
      return {
        ticker: info?.ticker ?? m.symbol.toUpperCase(),
        name: m.name,
        price: formatPrice(m.current_price),
        change: parseFloat((m.price_change_percentage_24h ?? 0).toFixed(2)),
        sentiment: sent.sentiment,
        confidence: sent.confidence,
      };
    });
  },

  async getCoinSentiment(query: string): Promise<CoinSentimentResult> {
    const info = resolveCoin(query);
    const geckoId = info?.geckoId ?? query.toLowerCase();

    // ── Price ──
    let price = 'N/A';
    let change = 0;
    let name = info?.name ?? (query.charAt(0).toUpperCase() + query.slice(1));

    try {
      const markets = await fetchGeckoMarkets([geckoId]);
      if (markets[0]) {
        price  = formatPrice(markets[0].current_price);
        change = parseFloat((markets[0].price_change_percentage_24h ?? 0).toFixed(2));
        name   = markets[0].name;
      }
    } catch (e) {
      console.warn('[api] CoinGecko price failed:', e);
    }

    // ── Reddit posts ──
    const subreddits = info?.subreddits ?? ['CryptoCurrency', 'wallstreetbets', 'investing'];
    let rawPosts: RedditRaw[] = [];

    try {
      rawPosts = await fetchRedditPosts(query, subreddits);
    } catch (e) {
      console.warn('[api] Reddit fetch failed:', e);
    }

    // ── Sentiment ──
    const texts = rawPosts.map(p => p.title + ' ' + p.selftext);
    const overallSentiment = analyzeSentiment(texts);

    // ── Score each post individually ──
    const scoredPosts: Post[] = rawPosts
      .slice(0, 15)
      .map((raw, i) => {
        const { sentiment } = analyzeSentiment([raw.title + ' ' + raw.selftext]);
        return toPost(raw, sentiment, i + 1);
      });

    const topPost = [...scoredPosts].sort((a, b) => b.upvotes - a.upvotes)[0] ?? scoredPosts[0];

    return {
      name,
      ticker: info?.ticker ?? query.toUpperCase(),
      sentiment: overallSentiment.sentiment,
      confidence: overallSentiment.confidence,
      price,
      change,
      keywords: overallSentiment.keywords,
      subredditBreakdown: buildSubredditBreakdown(rawPosts),
      sentimentHistory: buildSentimentHistory(rawPosts),
      posts: scoredPosts,
      topPost,
    };
  },
};
