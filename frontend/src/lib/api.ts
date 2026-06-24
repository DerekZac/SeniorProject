import { analyzeSentiment } from './sentiment';
import { resolveCoin, TRENDING_GECKO_IDS } from './coinMapping';
import { logger } from './logger';

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
  trusted: boolean;
}

export interface RedditDiscussion {
  id: string;
  title: string;
  subreddit: string;
  upvotes: number;
  numComments: number;
  timeAgo: string;
  permalink: string;
  sentiment: Sentiment;
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
  topPost: Post | undefined;
}

// ─── Internal TTL cache ───────────────────────────────────────────────────────

const _cache = new Map<string, { data: unknown; exp: number }>();

function getCache<T>(key: string): T | null {
  const hit = _cache.get(key);
  if (!hit || Date.now() > hit.exp) return null;
  return hit.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  _cache.set(key, { data, exp: Date.now() + ttlMs });
}

const TTL = {
  prices: 60_000,
  reddit: 5 * 60_000,
  news:   10 * 60_000,
  error:  30_000,       // cache failures for 30s to avoid hammering
};

// ─── Reddit CORS proxy ────────────────────────────────────────────────────────
// Reddit blocks direct browser requests from non-localhost origins.
// corsproxy.io is a free CORS proxy that relays the request server-side.

const REDDIT = (path: string) =>
  `https://proxy.cors.sh/https://www.reddit.com${path}`;

// ─── RSS news sources ─────────────────────────────────────────────────────────

const RSS_SOURCES = [
  { feed: 'https://feeds.feedburner.com/CoinDesk',  source: 'CoinDesk' },
  { feed: 'https://cointelegraph.com/rss',           source: 'CoinTelegraph' },
  { feed: 'https://decrypt.co/feed',                 source: 'Decrypt' },
  { feed: 'https://blockworks.co/feed',              source: 'Blockworks' },
];

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(unixSeconds: number): string {
  const s = Math.max(60, Math.floor(Date.now() / 1000) - unixSeconds);
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

  logger.debug('api', 'GET CoinGecko markets');
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

  const url = REDDIT(
    `/r/${subs}/search.json?q=${encodeURIComponent(query)}&sort=hot&limit=100&t=week&raw_json=1`
  );

  logger.debug('api', `GET Reddit posts for "${query}"`);
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

// ─── News — RSS from trusted outlets via rss2json ────────────────────────────

async function fetchRSSNews(): Promise<NewsItem[]> {
  const cacheKey = 'news:rss';
  const cached = getCache<NewsItem[]>(cacheKey);
  if (cached) return cached;

  logger.debug('api', 'GET RSS feeds from trusted outlets');

  const results = await Promise.allSettled(
    RSS_SOURCES.map(async ({ feed, source }) => {
      const res = await fetch(RSS2JSON + encodeURIComponent(feed));
      if (!res.ok) return [] as NewsItem[];
      const json = await res.json();
      if (json.status !== 'ok') return [] as NewsItem[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (json.items ?? []).slice(0, 6).map((item: any) => ({
        title: item.title as string,
        source,
        timeAgo: item.pubDate
          ? timeAgo(Math.floor(new Date(item.pubDate).getTime() / 1000))
          : 'recently',
        url: item.link as string,
        trusted: true,
      }));
    })
  );

  const all: NewsItem[] = results
    .flatMap(r => r.status === 'fulfilled' ? r.value : [])
    .map((item, i) => ({ ...item, id: i + 1 }));

  if (all.length > 0) {
    setCache(cacheKey, all, TTL.news);
  } else {
    // Cache the empty result briefly so we don't hammer rss2json on every render
    setCache(cacheKey, [], TTL.error);
  }

  return all;
}

// ─── Derived data builders ────────────────────────────────────────────────────

function buildSentimentHistory(posts: RedditRaw[]): SentimentPoint[] {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const nowSec = Math.floor(Date.now() / 1000);

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
    const markets = await fetchGeckoMarkets(TRENDING_GECKO_IDS);

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
        sentMap.set(TRENDING_GECKO_IDS[i], { sentiment: r.value.sentiment, confidence: r.value.confidence });
      } else {
        logger.warn('api', `Sentiment failed for ${TRENDING_GECKO_IDS[i]}`, { reason: String(r.reason) });
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
    return fetchRSSNews();
  },

  async getRedditDiscussions(): Promise<RedditDiscussion[]> {
    const cacheKey = 'reddit:top-discussions';
    const cached = getCache<RedditDiscussion[]>(cacheKey);
    if (cached) return cached;

    const subs = 'CryptoCurrency+Bitcoin+ethereum+CryptoMarkets';
    const url = REDDIT(`/r/${subs}/hot.json?limit=35&raw_json=1`);

    logger.debug('api', 'GET Reddit hot discussions');
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);

    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const discussions: RedditDiscussion[] = (json.data?.children ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any) => c.data.score >= 30 && !c.data.stickied)
      .slice(0, 15)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => {
        const d = c.data;
        const { sentiment } = analyzeSentiment([d.title + ' ' + (d.selftext || '')]);
        return {
          id: d.id,
          title: d.title,
          subreddit: `r/${d.subreddit}`,
          upvotes: d.score,
          numComments: d.num_comments,
          timeAgo: timeAgo(d.created_utc),
          permalink: `https://reddit.com${d.permalink}`,
          sentiment,
        };
      });

    setCache(cacheKey, discussions, TTL.reddit);
    return discussions;
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
      logger.warn('api', 'CoinGecko price failed', { error: String(e) });
    }

    const subreddits = info?.subreddits ?? ['CryptoCurrency', 'wallstreetbets', 'investing'];
    let rawPosts: RedditRaw[] = [];

    try {
      rawPosts = await fetchRedditPosts(query, subreddits);
    } catch (e) {
      logger.warn('api', 'Reddit fetch failed', { error: String(e) });
    }

    const texts = rawPosts.map(p => p.title + ' ' + p.selftext);
    const overallSentiment = analyzeSentiment(texts);

    const scoredPosts: Post[] = rawPosts
      .slice(0, 15)
      .map((raw, i) => {
        const { sentiment } = analyzeSentiment([raw.title + ' ' + raw.selftext]);
        return toPost(raw, sentiment, i + 1);
      });

    const topPost = [...scoredPosts].sort((a, b) => b.upvotes - a.upvotes)[0];

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
