import { User, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import SentimentBadge from "../components/SentimentBadge";

const watchlistCoins = [
  { ticker: "BTC", name: "Bitcoin", sentiment: "Bullish" as const, confidence: 87 },
  { ticker: "ETH", name: "Ethereum", sentiment: "Mixed" as const, confidence: 62 },
  { ticker: "SOL", name: "Solana", sentiment: "Bullish" as const, confidence: 91 },
];

const searchHistory = ["Bitcoin", "Ethereum", "Solana", "Dogecoin", "Cardano"];

export default function Profile() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 bg-[#4B6BFB] rounded-full flex items-center justify-center">
          <User size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">CryptoUser</h1>
          <p className="text-[#8A8FA8] text-sm">Member since June 2025</p>
        </div>
        <Link to="/login" className="ml-auto text-sm text-[#4B6BFB] hover:underline">
          Change Password
        </Link>
      </div>

      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-[#FFB830]" fill="currentColor" />
          <h2 className="text-white font-semibold">My Watchlist</h2>
        </div>
        <div className="flex flex-col gap-3">
          {watchlistCoins.map((coin) => (
            <div key={coin.ticker} className="flex items-center justify-between py-2 border-b border-[#2A2D3A] last:border-0">
              <div>
                <span className="text-white font-medium">{coin.ticker}</span>
                <span className="text-[#8A8FA8] text-sm ml-2">{coin.name}</span>
              </div>
              <SentimentBadge sentiment={coin.sentiment} confidence={coin.confidence} size="sm" />
            </div>
          ))}
        </div>
        <Link to="/watchlist" className="text-[#4B6BFB] text-sm hover:underline mt-4 block">
          Manage watchlist
        </Link>
      </div>

      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-[#8A8FA8]" />
          <h2 className="text-white font-semibold">Recent Searches</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {searchHistory.map((coin) => (
            <Link
              key={coin}
              to={`/results/${coin.toLowerCase()}`}
              className="bg-[#0D0F14] border border-[#2A2D3A] text-[#8A8FA8] hover:text-white hover:border-[#4B6BFB]/50 text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              {coin}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
