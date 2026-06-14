import { Star } from "lucide-react";
import CoinCard from "../components/CoinCard";
import { mockCoins } from "../lib/mockData";
import { useApp } from "../context/AppContext";

export default function Watchlist() {
  const { watchlist, toggleWatchlist, isWatchlisted } = useApp();
  const watched = mockCoins.filter(c => watchlist.includes(c.ticker));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Star size={22} className="text-[#FFB830]" fill="currentColor" />
        <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
      </div>
      <p className="text-[#8A8FA8] text-sm mb-8 ml-9">
        {watched.length} coin{watched.length !== 1 ? "s" : ""} tracked
      </p>

      {watched.length === 0 ? (
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl py-20 text-center">
          <Star size={44} className="mx-auto mb-4 text-[#2A2D3A]" />
          <p className="text-white font-medium mb-1">Your watchlist is empty</p>
          <p className="text-[#8A8FA8] text-sm">Search for coins and star them to track them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {watched.map((coin) => (
            <CoinCard
              key={coin.ticker}
              {...coin}
              isWatchlisted={isWatchlisted(coin.ticker)}
              onToggleWatchlist={() => toggleWatchlist(coin.ticker)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
