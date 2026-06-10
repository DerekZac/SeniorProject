export const mockCoins = [
  { ticker: "BTC", name: "Bitcoin", price: "$67,234", change: 2.4, sentiment: "Bullish" as const, confidence: 87 },
  { ticker: "ETH", name: "Ethereum", price: "$3,456", change: -1.2, sentiment: "Mixed" as const, confidence: 72 },
  { ticker: "SOL", name: "Solana", price: "$142", change: 5.8, sentiment: "Bullish" as const, confidence: 91 },
  { ticker: "DOGE", name: "Dogecoin", price: "$0.18", change: -3.4, sentiment: "Bearish" as const, confidence: 65 },
  { ticker: "ADA", name: "Cardano", price: "$0.52", change: 1.1, sentiment: "Mixed" as const, confidence: 58 },
  { ticker: "XRP", name: "Ripple", price: "$0.61", change: 4.2, sentiment: "Bullish" as const, confidence: 79 },
];

export const mockNews = [
  {
    id: 1,
    title: "Bitcoin ETF Sees Record Inflows as Institutional Interest Surges",
    source: "CoinDesk",
    timeAgo: "2h ago",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Ethereum Layer 2 Solutions Hit New Transaction Volume Records",
    source: "CryptoSlate",
    timeAgo: "4h ago",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop",
  },
  {
    id: 3,
    title: "Major DeFi Protocol Announces Cross-Chain Expansion",
    source: "The Block",
    timeAgo: "6h ago",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=200&h=200&fit=crop",
  },
  {
    id: 4,
    title: "Solana Network Upgrade Improves Transaction Speeds by 40%",
    source: "Decrypt",
    timeAgo: "8h ago",
    url: "#",
    imageUrl: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=200&h=200&fit=crop",
  },
];

export const mockSentimentHistory = [
  { day: "Mon", score: 45 },
  { day: "Tue", score: 52 },
  { day: "Wed", score: 48 },
  { day: "Thu", score: 61 },
  { day: "Fri", score: 74 },
  { day: "Sat", score: 69 },
  { day: "Sun", score: 87 },
];

export const mockSubredditBreakdown = [
  { subreddit: "r/Bitcoin", sentiment: "Bullish", score: 82 },
  { subreddit: "r/CryptoCurrency", sentiment: "Bullish", score: 74 },
  { subreddit: "r/wallstreetbets", sentiment: "Mixed", score: 55 },
  { subreddit: "r/investing", sentiment: "Mixed", score: 48 },
  { subreddit: "r/CryptoMoonShots", sentiment: "Bullish", score: 91 },
  { subreddit: "r/ethtrader", sentiment: "Bearish", score: 38 },
];

export const mockPosts = [
  {
    id: 1,
    title: "Bitcoin is looking incredibly strong right now, whales are accumulating",
    upvotes: 4521,
    subreddit: "r/Bitcoin",
    timeAgo: "3h ago",
    sentiment: "Bullish" as const,
  },
  {
    id: 2,
    title: "Not sure about this rally, macro conditions still look rough",
    upvotes: 1203,
    subreddit: "r/investing",
    timeAgo: "5h ago",
    sentiment: "Bearish" as const,
  },
  {
    id: 3,
    title: "ETF inflows are insane this week, institutions are NOT selling",
    upvotes: 3847,
    subreddit: "r/CryptoCurrency",
    timeAgo: "7h ago",
    sentiment: "Bullish" as const,
  },
];

export const mockKeywords = {
  bullish: ["moon", "bullish", "accumulate", "ETF", "rally", "breakout", "pump"],
  bearish: ["dump", "crash", "bearish", "sell", "correction", "overbought"],
};
