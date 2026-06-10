import { useState } from "react";
import { Star } from "lucide-react";
import CoinCard from "../components/CoinCard";
import { mockCoins } from "../lib/mockData";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState(["BTC", "ETH", "SOL"]);

  const toggle = (ticker: string) => {
    setWatchlist((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  const watched = mockCoins.filter((c) => watchlist.includes(c.ticker));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Star size={20} className="text-[#FFB830]" fill="currentColor" />
        <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
      </div>

      {watched.length === 0 ? (
        <div className="text-center py-20 text-[#8A8FA8]">
          <Star size={40} className="mx-auto mb-4 opacity-30" />
          <p>Your watchlist is empty. Search for coins and star them to add here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {watched.map((coin) => (
            <CoinCard
              key={coin.ticker}
              {...coin}
              isWatchlisted={true}
              onToggleWatchlist={() => toggle(coin.ticker)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
