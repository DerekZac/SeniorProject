/** Maps user search queries (coin names and tickers) to CoinGecko IDs. */

export interface CoinInfo {
  geckoId: string;
  ticker: string;
  name: string;
}

export const COINS: CoinInfo[] = [
  { geckoId: 'bitcoin',        ticker: 'BTC',  name: 'Bitcoin'    },
  { geckoId: 'ethereum',       ticker: 'ETH',  name: 'Ethereum'   },
  { geckoId: 'solana',         ticker: 'SOL',  name: 'Solana'     },
  { geckoId: 'dogecoin',       ticker: 'DOGE', name: 'Dogecoin'   },
  { geckoId: 'cardano',        ticker: 'ADA',  name: 'Cardano'    },
  { geckoId: 'ripple',         ticker: 'XRP',  name: 'XRP'        },
  { geckoId: 'binancecoin',    ticker: 'BNB',  name: 'BNB'        },
  { geckoId: 'avalanche-2',    ticker: 'AVAX', name: 'Avalanche'  },
  { geckoId: 'matic-network',  ticker: 'MATIC',name: 'Polygon'    },
  { geckoId: 'chainlink',      ticker: 'LINK', name: 'Chainlink'  },
  { geckoId: 'litecoin',       ticker: 'LTC',  name: 'Litecoin'   },
  { geckoId: 'polkadot',       ticker: 'DOT',  name: 'Polkadot'   },
  { geckoId: 'shiba-inu',      ticker: 'SHIB', name: 'Shiba Inu'  },
  { geckoId: 'uniswap',        ticker: 'UNI',  name: 'Uniswap'    },
  { geckoId: 'tron',           ticker: 'TRX',  name: 'TRON'       },
  { geckoId: 'stellar',        ticker: 'XLM',  name: 'Stellar'    },
  { geckoId: 'monero',         ticker: 'XMR',  name: 'Monero'     },
  { geckoId: 'cosmos',         ticker: 'ATOM', name: 'Cosmos'     },
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
