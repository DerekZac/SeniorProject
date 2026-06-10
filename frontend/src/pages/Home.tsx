import { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, ArrowRight } from "lucide-react";
import SearchBar from "../components/SearchBar";
import CoinCard from "../components/CoinCard";
import NewsCard from "../components/NewsCard";
import { mockCoins, mockNews } from "../lib/mockData";

export default function Home() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const toggleWatchlist = (ticker: string) => {
    setWatchlist((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#4B6BFB] to-[#9B59B6] px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          Reddit Crypto Sentiment,<br />Decoded in Real-Time
        </h1>
        <p className="text-white/80 text-lg mb-10">
          Analyze market sentiment from 10+ crypto subreddits
        </p>
        <SearchBar large />
      </div>

      {/* Trending Coins */}
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Trending Now</h2>
              <p className="text-[#8A8FA8] text-sm">Most discussed cryptocurrencies</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-12">
          {mockCoins.map((coin) => (
            <CoinCard
              key={coin.ticker}
              {...coin}
              isWatchlisted={watchlist.includes(coin.ticker)}
              onToggleWatchlist={() => toggleWatchlist(coin.ticker)}
            />
          ))}
        </div>

        {/* News Feed */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4B6BFB] rounded-full flex items-center justify-center">
              <ArrowRight size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Latest News</h2>
              <p className="text-[#8A8FA8] text-sm">Breaking crypto headlines</p>
            </div>
          </div>
          <Link to="/news" className="text-[#4B6BFB] text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {mockNews.slice(0, 3).map((item) => (
            <NewsCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
