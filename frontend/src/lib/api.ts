import { resolveCoin, TRENDING_GECKO_IDS } from './coinMapping';
import { logger } from './logger';
import { fetchJson } from './apiRequest';
// ─── Types ────────────────────────────────────────────────────────────────────

export interface Coin {
  ticker: string;
  name: string;
  price: string;
  priceUsd: number;
  change: number;
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  timeAgo: string;
  url: string;
  trusted: boolean;
}

export interface CoinMarketDetail {
  geckoId: string;
  ticker: string;
  name: string;
  price: string;
  priceUsd: number;
  change: number;
  marketCap: string;
  marketCapUsd: number;
  volume24h: string;
  volume24hUsd: number;
  circulatingSupply: string;
  allTimeHigh: string;
  allTimeHighUsd: number;
  athDate: string;
  rank: number;
}

export interface PricePoint {
  day: string;
  price: number;
}

export type Timeframe = 1 | 7 | 30 | 365 | 'max';

export interface ChartPoint {
  t: number;      // unix ms
  label: string;  // axis label for the timeframe
  price: number;
  volume: number;
}

export interface GlobalMarket {
  totalMarketCapUsd: number;
  totalVolumeUsd: number;
  btcDominance: number;
  ethDominance: number;
  marketCapChange24h: number;
}

export interface Mover {
  ticker: string;
  name: string;
  geckoId: string;
  priceUsd: number;
  change: number;
}

// ─── AI Sentiment from Python/Gemini backend ──────────────────────────────────

export interface AISentiment {
  classification: 'Bullish' | 'Neutral' | 'Bearish';
  confidence: number;
  market_score: number;
  summary: string;
  bullish_points: string[];
  bearish_points: string[];
  important_events: string[];
  short_term: string;
  long_term: string;
}

export interface CoinSentimentResult {
  name: string;
  ticker: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  confidence: number;
  price: string;
  change: number;
  keywords: string[];
  aiSentiment?: AISentiment;
}

export interface SentimentPoint {
  date: string;
  score: number;
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
  news:   10 * 60_000,
  ai:     15 * 60_000,
  error:  30_000,
};

// ─── Python AI backend ────────────────────────────────────────────────────────

const AI_URL = import.meta.env.VITE_PYTHON_API_URL || 'https://merry-stillness-production-b20d.up.railway.app';
const JAVA_URL = import.meta.env.VITE_API_URL || 'https://industrious-amazement-production.up.railway.app';

async function fetchAISentiment(
  coin: string,
  ticker: string,
  articles: { title: string; source: string; url: string }[]
): Promise<AISentiment | null> {
  const cacheKey = `ai:${ticker}`;
  const cached = getCache<AISentiment>(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchJson<{
      success: boolean;
      cached: boolean;
      data: AISentiment;
    }>(`${JAVA_URL}/api/sentiment/${ticker}`, {
      timeoutMs: 10_000,
      retries: 1,
    });
    if (data.success && data.cached) {
      const d = data.data;
      const ai: AISentiment = {
        classification: d.classification,
        confidence: d.confidence,
        market_score: d.market_score,
        summary: d.summary,
        bullish_points: d.bullish_points,
        bearish_points: d.bearish_points,
        important_events: d.important_events,
        short_term: d.short_term,
        long_term: d.long_term,
      };
      setCache(cacheKey, ai, TTL.ai);
      logger.debug('api', `AI sentiment loaded from DB cache for ${ticker}`);
      return ai;
    }
  } catch (e) {
    logger.warn('api', 'DB cache check failed', { error: String(e) });
  }

  if (articles.length === 0) return null;

  try {
    logger.debug('api', `GET AI sentiment for ${coin}`);
    const result = await fetchJson<AISentiment>(`${AI_URL}/classify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    coin,
    ticker,
    articles: articles.slice(0, 5),
  }),
  timeoutMs: 30_000,
  retries: 0,
  dedupe: false,
});

    try {
     await fetchJson<{ success: boolean }>(
  `${JAVA_URL}/api/sentiment/${ticker}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...result, coinName: coin }),
    timeoutMs: 10_000,
    retries: 0,
    dedupe: false,
  }
);
      logger.debug('api', `AI sentiment saved to DB for ${ticker}`);
    } catch (e) {
      logger.warn('api', 'Failed to save AI sentiment to DB', { error: String(e) });
    }

    setCache(cacheKey, result, TTL.ai);
    return result;
  } catch (e) {
    logger.warn('api', 'AI sentiment fetch failed', { error: String(e) });
    return null;
  }
}


// ─── News filtering ────────────────────────────────────────────────────────────

async function fetchRSSNews(): Promise<NewsItem[]> {
  const cacheKey = 'news:rss';
  const cached = getCache<NewsItem[]>(cacheKey);
  if (cached) return cached;

  logger.debug('api', 'GET RSS feeds from trusted outlets');

  const results = await Promise.allSettled(
    RSS_SOURCES.map(async ({ feed, source }) => {
      const json = await fetchJson<{
      status: string;
      items?: Array<{
      title: string;
      pubDate?: string;
      link: string;
  }>;
}>(RSS2JSON + encodeURIComponent(feed), {
  timeoutMs: 10_000,
  retries: 1,
});

if (json.status !== 'ok') return [] as NewsItem[];
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
    setCache(cacheKey, [], TTL.error);
  }

  return all;
}

function filterNewsByCoin(news: NewsItem[], coinName: string, ticker: string): NewsItem[] {
  const lower = coinName.toLowerCase();
  const tick  = ticker.toLowerCase();
  const exact = news.filter(n =>
    n.title.toLowerCase().includes(lower) ||
    n.title.toLowerCase().includes(tick)
  );

  if (exact.length > 0) return exact;

  return news.slice(0, 5);
}

// ─── Public API ───────────────────────────────────────────────────────────────



// ─── RSS news sources ─────────────────────────────────────────────────────────

const RSS_SOURCES = [
  { feed: 'https://feeds.feedburner.com/CoinDesk',   source: 'CoinDesk' },
  { feed: 'https://cointelegraph.com/rss',           source: 'CoinTelegraph' },
  { feed: 'https://decrypt.co/feed',                 source: 'Decrypt' },
  { feed: 'https://blockworks.co/feed',              source: 'Blockworks' },
  { feed: 'https://bitcoinmagazine.com/.rss/full/',  source: 'Bitcoin Magazine' },
  { feed: 'https://cryptoslate.com/feed/',           source: 'CryptoSlate' },
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

function formatLargeNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

// ─── CoinGecko ───────────────────────────────────────────────────────────────

const GECKO = 'https://api.coingecko.com/api/v3';

interface GeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  ath: number;
  ath_date: string;
  market_cap_rank: number;
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
  const data = await fetchJson<GeckoMarket[]>(url, {
  timeoutMs: 10_000,
  retries: 1,
});
  setCache(key, data, TTL.prices);
  return data;
}

// ─── News — RSS from trusted outlets via rss2json ────────────────────────────

// async function fetchRSSNews(): Promise<NewsItem[]> {
//   const cacheKey = 'news:rss';
//   const cached = getCache<NewsItem[]>(cacheKey);
//   if (cached) return cached;

//   logger.debug('api', 'GET RSS feeds from trusted outlets');

//   const results = await Promise.allSettled(
//     RSS_SOURCES.map(async ({ feed, source }) => {
//       const res = await fetch(RSS2JSON + encodeURIComponent(feed));
//       if (!res.ok) return [] as NewsItem[];
//       const json = await res.json();
//       if (json.status !== 'ok') return [] as NewsItem[];
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       return (json.items ?? []).slice(0, 6).map((item: any) => ({
//         title: item.title as string,
//         source,
//         timeAgo: item.pubDate
//           ? timeAgo(Math.floor(new Date(item.pubDate).getTime() / 1000))
//           : 'recently',
//         url: item.link as string,
//         trusted: true,
//       }));
//     })
//   );

//   const all: NewsItem[] = results
//     .flatMap(r => r.status === 'fulfilled' ? r.value : [])
//     .map((item, i) => ({ ...item, id: i + 1 }));

//   if (all.length > 0) {
//     setCache(cacheKey, all, TTL.news);
//   } else {
//     setCache(cacheKey, [], TTL.error);
//   }

//   return all;
// }

// // ─── Public utilities ─────────────────────────────────────────────────────────

// export function filterNewsByCoin(news: NewsItem[], coinName: string, ticker: string): NewsItem[] {
//   const lower = coinName.toLowerCase();
//   const tick  = ticker.toLowerCase();
//   const exact = news.filter(n =>
//     n.title.toLowerCase().includes(lower) ||
//     n.title.toLowerCase().includes(tick)
//   );
//   return exact.length > 0 ? exact.slice(0, 5) : news.slice(0, 5);
// }

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {

  async getTrending(): Promise<Coin[]> {
    const markets = await fetchGeckoMarkets(TRENDING_GECKO_IDS);
    return markets.map((m) => {
      const info = resolveCoin(m.id);
      return {
        ticker: info?.ticker ?? m.symbol.toUpperCase(),
        name: m.name,
        price: formatPrice(m.current_price),
        priceUsd: m.current_price,
        change: parseFloat((m.price_change_percentage_24h ?? 0).toFixed(2)),
      };
    });
  },

  async getNews(): Promise<NewsItem[]> {
    return fetchRSSNews();
  },

  async getWatchlistCoins(tickers: string[]): Promise<Coin[]> {
    if (tickers.length === 0) return [];
    const geckoIds = tickers
      .map(t => resolveCoin(t)?.geckoId)
      .filter((id): id is string => !!id);
    if (geckoIds.length === 0) return [];
    const markets = await fetchGeckoMarkets(geckoIds);
    return markets.map((m) => {
      const info = resolveCoin(m.id);
      return {
        ticker: info?.ticker ?? m.symbol.toUpperCase(),
        name: m.name,
        price: formatPrice(m.current_price),
        priceUsd: m.current_price,
        change: parseFloat((m.price_change_percentage_24h ?? 0).toFixed(2)),
      };
    });
  },

  async getCoinDetail(query: string): Promise<CoinMarketDetail> {
    const info = resolveCoin(query);
    const geckoId = info?.geckoId ?? query.toLowerCase();

    const markets = await fetchGeckoMarkets([geckoId]);
    const m = markets[0];
    if (!m) throw new Error(`Coin not found: ${query}`);

    const athDate = m.ath_date
      ? new Date(m.ath_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '—';

    const ticker = info?.ticker ?? m.symbol.toUpperCase();
    const supplyStr = m.circulating_supply
      ? `${(m.circulating_supply / 1e6).toFixed(2)}M ${ticker}`
      : '—';

    return {
      geckoId: m.id,
      ticker,
      name: m.name,
      price: formatPrice(m.current_price),
      priceUsd: m.current_price,
      change: parseFloat((m.price_change_percentage_24h ?? 0).toFixed(2)),
      marketCap: formatLargeNumber(m.market_cap),
      marketCapUsd: m.market_cap,
      volume24h: formatLargeNumber(m.total_volume),
      volume24hUsd: m.total_volume,
      circulatingSupply: supplyStr,
      allTimeHigh: formatPrice(m.ath),
      allTimeHighUsd: m.ath,
      athDate,
      rank: m.market_cap_rank ?? 0,
    };
  },

  async getCoinPriceHistory(geckoId: string): Promise<PricePoint[]> {
    const cacheKey = `price-history:${geckoId}`;
    const cached = getCache<PricePoint[]>(cacheKey);
    if (cached) return cached;

    const url = `${GECKO}/coins/${geckoId}/market_chart?vs_currency=usd&days=7&interval=daily`;
    logger.debug('api', `GET price history for ${geckoId}`);
    const data = await fetchJson<{ prices: [number, number][] }>(url, {
      timeoutMs: 10_000,
      retries: 1,
});
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const points: PricePoint[] = data.prices.map(([ts, price]) => ({
      day: DAY_LABELS[new Date(ts).getDay()],
      price: parseFloat(price.toFixed(price >= 1 ? 2 : 6)),
    }));

    setCache(cacheKey, points, TTL.prices);
    return points;
  },


  /** Live USD prices for a set of tickers (used by Portfolio, Paper Trading, Alerts). */
  async getPricesByTickers(tickers: string[]): Promise<Record<string, Coin>> {
    const coins = await this.getWatchlistCoins(tickers);
    const map: Record<string, Coin> = {};
    for (const c of coins) map[c.ticker.toUpperCase()] = c;
    return map;
  },

  /** Global market overview (total cap, volume, BTC/ETH dominance). */
  async getGlobalMarket(): Promise<GlobalMarket | null> {
    const key = 'global';
    const cached = getCache<GlobalMarket>(key);
    if (cached) return cached;
    try {
      const { data } = await fetchJson<{
  data: {
    total_market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    market_cap_percentage?: { btc?: number; eth?: number };
    market_cap_change_percentage_24h_usd?: number;
    };
      }>(`${GECKO}/global`, {
        timeoutMs: 10_000,
        retries: 1,
    });
      const g: GlobalMarket = {
        totalMarketCapUsd: data.total_market_cap?.usd ?? 0,
        totalVolumeUsd: data.total_volume?.usd ?? 0,
        btcDominance: parseFloat((data.market_cap_percentage?.btc ?? 0).toFixed(1)),
        ethDominance: parseFloat((data.market_cap_percentage?.eth ?? 0).toFixed(1)),
        marketCapChange24h: parseFloat((data.market_cap_change_percentage_24h_usd ?? 0).toFixed(2)),
      };
      setCache(key, g, TTL.prices);
      return g;
    } catch (e) {
      logger.warn('api', 'Global market fetch failed', { error: String(e) });
      return null;
    }
  },

  /** Top gainers and losers over 24h among the top ~100 coins by market cap. */
  async getTopMovers(): Promise<{ gainers: Mover[]; losers: Mover[] }> {
    const key = 'movers';
    const cached = getCache<{ gainers: Mover[]; losers: Mover[] }>(key);
    if (cached) return cached;

    const url =
      `${GECKO}/coins/markets?vs_currency=usd&order=market_cap_desc` +
      `&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
    const data = await fetchJson<GeckoMarket[]>(url, {
      timeoutMs: 10_000,
      retries: 1,
});
    const movers: Mover[] = data
      .filter(m => typeof m.price_change_percentage_24h === 'number')
      .map(m => ({
        ticker: resolveCoin(m.id)?.ticker ?? m.symbol.toUpperCase(),
        name: m.name,
        geckoId: m.id,
        priceUsd: m.current_price,
        change: parseFloat((m.price_change_percentage_24h ?? 0).toFixed(2)),
      }));

    const sorted = [...movers].sort((a, b) => b.change - a.change);
    const result = { gainers: sorted.slice(0, 5), losers: sorted.slice(-5).reverse() };
    setCache(key, result, TTL.prices);
    return result;
  },

  /** Price + volume series for a timeframe. Powers the advanced chart & DCA. */
  async getMarketChart(geckoId: string, days: Timeframe): Promise<ChartPoint[]> {
    const key = `chart:${geckoId}:${days}`;
    const cached = getCache<ChartPoint[]>(key);
    if (cached) return cached;

    // Omit `interval` so CoinGecko auto-granularizes per range (free-tier safe).
    const url = `${GECKO}/coins/${geckoId}/market_chart?vs_currency=usd&days=${days}`;
    const data = await fetchJson<{
      prices: [number, number][];
      total_volumes: [number, number][];
      }>(url, {timeoutMs: 10_000,retries: 1,});
    const volByTs = new Map<number, number>(data.total_volumes.map(([t, v]) => [t, v]));

    const label = (ts: number): string => {
      const d = new Date(ts);
      if (days === 1) return d.toLocaleTimeString('en-US', { hour: 'numeric' });
      if (days === 7 || days === 30) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    };

    // Thin dense intraday/hourly series to keep the chart smooth.
    const raw = data.prices;
    const step = Math.max(1, Math.ceil(raw.length / 120));
    const points: ChartPoint[] = raw
      .filter((_, i) => i % step === 0 || i === raw.length - 1)
      .map(([t, price]) => ({
        t,
        label: label(t),
        price: parseFloat(price.toFixed(price >= 1 ? 2 : 6)),
        volume: volByTs.get(t) ?? 0,
      }));

    setCache(key, points, TTL.prices);
    return points;
  },

  /** Raw daily [timestamp, price] pairs over the past N days (used by the DCA sim). */
  async getDailyPrices(geckoId: string, days: number): Promise<[number, number][]> {
    const key = `daily:${geckoId}:${days}`;
    const cached = getCache<[number, number][]>(key);
    if (cached) return cached;
    const url = `${GECKO}/coins/${geckoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    const data = await fetchJson<{ prices: [number, number][] }>(url,
       {timeoutMs: 10_000, retries: 1,});
    setCache(key, data.prices, TTL.prices);
    return data.prices;
  },

  async getCoinSentiment(query: string): Promise<CoinSentimentResult> {
    const info = resolveCoin(query);
    const ticker = info?.ticker ?? query.toUpperCase();
    const name = info?.name ?? query;

    let aiSentiment: AISentiment | undefined;
    try {
      const allNews = await fetchRSSNews();
      const coinNews = filterNewsByCoin(allNews, name, ticker);
      const articles = coinNews.slice(0, 5).map(n => ({
        title: n.title,
        source: n.source,
        url: n.url,
      }));
      const result = await fetchAISentiment(name, ticker, articles);
      if (result) aiSentiment = result;
    } catch (e) {
      logger.warn('api', 'AI sentiment failed', { error: String(e) });
    }
    return { name, ticker, sentiment: 'Neutral', confidence: 0, price: '', change: 0, keywords: [], aiSentiment };
  }
};
