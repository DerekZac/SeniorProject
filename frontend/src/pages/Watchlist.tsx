import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import CoinCard from "../components/CoinCard";
import { api, type Coin } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function Watchlist() {
  const { watchlist, toggleWatchlist, isWatchlisted } = useApp();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (watchlist.length === 0) { setCoins([]); return; }
    setLoading(true);
    api.getWatchlistCoins(watchlist)
      .then(setCoins)
      .catch(() => setCoins([]))
      .finally(() => setLoading(false));
  }, [watchlist]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Star size={22} className="text-[#FFB830]" fill="currentColor" />
        <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
      </div>
      <p className="text-[#8A8FA8] text-sm mb-8 ml-9">
        {watchlist.length} coin{watchlist.length !== 1 ? "s" : ""} tracked — live prices &amp; sentiment
      </p>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#4B6BFB]" />
        </div>
      )}

      {!loading && watchlist.length === 0 && (
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl py-20 text-center">
          <Star size={44} className="mx-auto mb-4 text-[#2A2D3A]" />
          <p className="text-white font-medium mb-1">Your watchlist is empty</p>
          <p className="text-[#8A8FA8] text-sm">Search for coins and star them to track them here</p>
        </div>
      )}

      {!loading && coins.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {coins.map(coin => (
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
