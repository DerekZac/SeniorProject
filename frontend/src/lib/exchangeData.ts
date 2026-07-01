export type ExchangeTag = 'popular' | 'advanced' | 'low-fee' | 'defi';

export interface Exchange {
  id: string;
  name: string;
  logo: string;
  url: string;
  headquarters: string;
  founded: number;
  trustScore: number;
  fees: { maker: string; taker: string };
  features: string[];
  supported: string[];
  kycRequired: boolean;
  bestFor: string;
  tag?: ExchangeTag;
}

export const EXCHANGES: Exchange[] = [
  {
    id: 'coinbase',
    name: 'Coinbase',
    logo: 'CB',
    url: 'https://www.coinbase.com',
    headquarters: 'San Francisco, USA',
    founded: 2012,
    trustScore: 10,
    fees: { maker: '0.40%', taker: '0.60%' },
    features: [
      'NASDAQ-listed US regulated exchange',
      'Beginner-friendly mobile app',
      'Coinbase One subscription (zero-fee trades)',
      '98%+ of customer funds in cold storage',
      'ETH, SOL, ADA staking available',
      'Coinbase Advanced Trade for pro users',
    ],
    supported: ['United States', 'European Union', 'United Kingdom', 'Canada', 'Australia'],
    kycRequired: true,
    bestFor: 'Beginners in the US',
    tag: 'popular',
  },
  {
    id: 'binance',
    name: 'Binance',
    logo: 'BN',
    url: 'https://www.binance.com',
    headquarters: 'Global (Cayman Islands)',
    founded: 2017,
    trustScore: 10,
    fees: { maker: '0.10%', taker: '0.10%' },
    features: [
      'Largest exchange by trading volume globally',
      'BNB token holders get 25% fee discount',
      '350+ trading pairs including altcoins',
      'Futures, options, and margin trading',
      'Launchpad for new token offerings',
      'Earn products: staking, liquidity farming',
    ],
    supported: ['Global (US users: Binance.US only)'],
    kycRequired: true,
    bestFor: 'Experienced global traders',
    tag: 'advanced',
  },
  {
    id: 'kraken',
    name: 'Kraken',
    logo: 'KR',
    url: 'https://www.kraken.com',
    headquarters: 'San Francisco, USA',
    founded: 2011,
    trustScore: 10,
    fees: { maker: '0.16%', taker: '0.26%' },
    features: [
      'One of the oldest US-regulated exchanges',
      'No major security breach in 13+ years',
      'Kraken Pro for advanced charting and OTC',
      'Publishes Proof of Reserves regularly',
      'Staking available in most jurisdictions',
      'Supports fiat deposits in 20+ currencies',
    ],
    supported: ['United States', 'European Union', 'United Kingdom', 'Canada', 'Australia'],
    kycRequired: true,
    bestFor: 'Security-conscious US/EU traders',
    tag: 'popular',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    logo: 'BY',
    url: 'https://www.bybit.com',
    headquarters: 'Dubai, UAE',
    founded: 2018,
    trustScore: 9,
    fees: { maker: '0.10%', taker: '0.10%' },
    features: [
      'Leading platform for derivatives trading',
      'Spot, futures, and options in one place',
      'High liquidity on major pairs',
      'Copy trading — follow top performers',
      'Launchpad for early token access',
      'Web3 wallet with DeFi integration',
    ],
    supported: ['Global (not available in US, UK, or sanctioned countries)'],
    kycRequired: true,
    bestFor: 'Derivatives and futures traders',
    tag: 'advanced',
  },
  {
    id: 'kucoin',
    name: 'KuCoin',
    logo: 'KC',
    url: 'https://www.kucoin.com',
    headquarters: 'Seychelles',
    founded: 2017,
    trustScore: 8,
    fees: { maker: '0.10%', taker: '0.10%' },
    features: [
      '700+ trading pairs including small-cap gems',
      'KCS token holders earn fee discounts',
      'Built-in automated trading bot marketplace',
      'Lending, earn, and staking products',
      'Futures and margin trading available',
      'P2P trading for fiat on-ramp',
    ],
    supported: ['Global (limited US access — verify local laws)'],
    kycRequired: false,
    bestFor: 'Altcoin hunters and bot traders',
    tag: 'low-fee',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    logo: 'GM',
    url: 'https://www.gemini.com',
    headquarters: 'New York, USA',
    founded: 2014,
    trustScore: 9,
    fees: { maker: '0.20%', taker: '0.40%' },
    features: [
      'NY Department of Financial Services licensed',
      'SOC 2 Type 2 security certified',
      'FDIC-insured USD balances up to $250,000',
      'Gemini Credit Card with crypto rewards',
      'Institutional-grade custody services',
      'Regulated stablecoin: Gemini Dollar (GUSD)',
    ],
    supported: ['United States', 'European Union', 'United Kingdom', 'Canada', 'Australia', 'Singapore'],
    kycRequired: true,
    bestFor: 'Compliance-focused US users',
    tag: 'popular',
  },
  {
    id: 'uniswap',
    name: 'Uniswap (DEX)',
    logo: 'UNI',
    url: 'https://app.uniswap.org',
    headquarters: 'Decentralized Protocol',
    founded: 2018,
    trustScore: 9,
    fees: { maker: '0.05%–1%', taker: '0.05%–1%' },
    features: [
      'Largest DEX by volume on Ethereum',
      'No KYC — connect any wallet and trade',
      'Liquidity providers earn trading fees',
      'Available on Ethereum, Polygon, Arbitrum, Base',
      'Governed by UNI token holders via DAO',
      'Open-source and fully non-custodial',
    ],
    supported: ['Global (permissionless — no geographic restrictions)'],
    kycRequired: false,
    bestFor: 'DeFi users who control their own keys',
    tag: 'defi',
  },
];

export const TAG_LABELS: Record<ExchangeTag, string> = {
  popular:   'Popular',
  advanced:  'Advanced',
  'low-fee': 'Low Fee',
  defi:      'DeFi / DEX',
};
