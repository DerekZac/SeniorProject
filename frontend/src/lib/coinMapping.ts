/**
 * Maps user search queries (coin names and tickers) to
 * CoinGecko IDs and the best Reddit subreddits to search.
 */

export interface CoinInfo {
  geckoId: string;
  ticker: string;
  name: string;
  subreddits: string[];
}

const COINS: CoinInfo[] = [
  { geckoId: 'bitcoin',        ticker: 'BTC',  name: 'Bitcoin',       subreddits: ['Bitcoin', 'CryptoCurrency', 'wallstreetbets', 'investing', 'CryptoMoonShots', 'ethtrader'] },
  { geckoId: 'ethereum',       ticker: 'ETH',  name: 'Ethereum',      subreddits: ['ethereum', 'ethtrader', 'CryptoCurrency', 'wallstreetbets', 'investing', 'CryptoMoonShots'] },
  { geckoId: 'solana',         ticker: 'SOL',  name: 'Solana',        subreddits: ['solana', 'CryptoCurrency', 'CryptoMoonShots', 'wallstreetbets'] },
  { geckoId: 'dogecoin',       ticker: 'DOGE', name: 'Dogecoin',      subreddits: ['dogecoin', 'CryptoCurrency', 'wallstreetbets', 'CryptoMoonShots'] },
  { geckoId: 'cardano',        ticker: 'ADA',  name: 'Cardano',       subreddits: ['cardano', 'CryptoCurrency', 'CryptoMoonShots', 'investing'] },
  { geckoId: 'ripple',         ticker: 'XRP',  name: 'XRP',           subreddits: ['Ripple', 'XRP', 'CryptoCurrency', 'wallstreetbets'] },
  { geckoId: 'binancecoin',    ticker: 'BNB',  name: 'BNB',           subreddits: ['binance', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'avalanche-2',    ticker: 'AVAX', name: 'Avalanche',     subreddits: ['Avax', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'matic-network',  ticker: 'MATIC',name: 'Polygon',       subreddits: ['0xPolygon', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'chainlink',      ticker: 'LINK', name: 'Chainlink',     subreddits: ['Chainlink', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'litecoin',       ticker: 'LTC',  name: 'Litecoin',      subreddits: ['litecoin', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'polkadot',       ticker: 'DOT',  name: 'Polkadot',      subreddits: ['dot', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'shiba-inu',      ticker: 'SHIB', name: 'Shiba Inu',     subreddits: ['SHIBArmy', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'uniswap',        ticker: 'UNI',  name: 'Uniswap',       subreddits: ['UniSwap', 'CryptoCurrency', 'defi'] },
  { geckoId: 'tron',           ticker: 'TRX',  name: 'TRON',          subreddits: ['Tronix', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'stellar',        ticker: 'XLM',  name: 'Stellar',       subreddits: ['Stellar', 'CryptoCurrency', 'CryptoMoonShots'] },
  { geckoId: 'monero',         ticker: 'XMR',  name: 'Monero',        subreddits: ['Monero', 'CryptoCurrency', 'investing'] },
  { geckoId: 'cosmos',         ticker: 'ATOM', name: 'Cosmos',        subreddits: ['cosmosnetwork', 'CryptoCurrency', 'CryptoMoonShots'] },
];

// Build lookup by geckoId, ticker (lower), and name (lower)
const LOOKUP = new Map<string, CoinInfo>();
for (const coin of COINS) {
  LOOKUP.set(coin.geckoId, coin);
  LOOKUP.set(coin.ticker.toLowerCase(), coin);
  LOOKUP.set(coin.name.toLowerCase(), coin);
}

export function resolveCoin(query: string): CoinInfo | null {
  return LOOKUP.get(query.toLowerCase().trim()) ?? null;
}

/** The 6 coins shown in the Trending section on the home page */
export const TRENDING_GECKO_IDS = [
  'bitcoin', 'ethereum', 'solana', 'dogecoin', 'cardano', 'ripple',
];
