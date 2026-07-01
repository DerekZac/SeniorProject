import { resolveCoin, TRENDING_GECKO_IDS } from './coinMapping';
import { logger } from './logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Coin {
  ticker: string;
  name: string;
  price: string;
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
  change: number;
  marketCap: string;
  volume24h: string;
  circulatingSupply: string;
  allTimeHigh: string;
  athDate: string;
  rank: number;
}

export interface PricePoint {
  day: string;
  price: number;
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
  error:  30_000,
};

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
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  const data: GeckoMarket[] = await res.json();
  setCache(key, data, TTL.prices);
  return data;
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
    setCache(cacheKey, [], TTL.error);
  }

  return all;
}

// ─── Public utilities ─────────────────────────────────────────────────────────

export function filterNewsByCoin(news: NewsItem[], coinName: string, ticker: string): NewsItem[] {
  const lower = coinName.toLowerCase();
  const tick  = ticker.toLowerCase();
  const exact = news.filter(n =>
    n.title.toLowerCase().includes(lower) ||
    n.title.toLowerCase().includes(tick)
  );
  return exact.length > 0 ? exact.slice(0, 5) : news.slice(0, 5);
}

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
      change: parseFloat((m.price_change_percentage_24h ?? 0).toFixed(2)),
      marketCap: formatLargeNumber(m.market_cap),
      volume24h: formatLargeNumber(m.total_volume),
      circulatingSupply: supplyStr,
      allTimeHigh: formatPrice(m.ath),
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
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CoinGecko price history HTTP ${res.status}`);

    const data: { prices: [number, number][] } = await res.json();
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const points: PricePoint[] = data.prices.map(([ts, price]) => ({
      day: DAY_LABELS[new Date(ts).getDay()],
      price: parseFloat(price.toFixed(price >= 1 ? 2 : 6)),
    }));

    setCache(cacheKey, points, TTL.prices);
    return points;
  },
};
