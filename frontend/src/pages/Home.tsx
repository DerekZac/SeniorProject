import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, ArrowRight } from "lucide-react";
import SearchBar from "../components/SearchBar";
import CoinCard from "../components/CoinCard";
import NewsCard from "../components/NewsCard";
import { api, type Coin, type NewsItem } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const { isWatchlisted, toggleWatchlist } = useApp();

  useEffect(() => {
    api.getTrending().then(setCoins);
    api.getNews().then(setNews);
  }, []);

  return (
    <div>
      {/* Hero — full-width gradient */}
      <div className="bg-hero px-6 py-28 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
          Reddit Crypto Sentiment,<br />Decoded in Real-Time
        </h1>
        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
          Analyze market sentiment from 10+ crypto subreddits
        </p>
        <SearchBar large />
      </div>

      {/* Below hero — dark navy background */}
      <div className="px-6 py-12 max-w-7xl mx-auto">

        {/* Trending Now */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Flame size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Trending Now</h2>
              <p className="text-[#8A8FA8] text-sm">Most discussed cryptocurrencies on Reddit</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-14">
          {coins.map((coin) => (
            <CoinCard
              key={coin.ticker}
              {...coin}
              isWatchlisted={isWatchlisted(coin.ticker)}
              onToggleWatchlist={() => toggleWatchlist(coin.ticker)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#1A1D27] mb-14" />

        {/* Latest News */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4B6BFB] rounded-full flex items-center justify-center">
              <ArrowRight size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Latest News</h2>
              <p className="text-[#8A8FA8] text-sm">Breaking crypto headlines</p>
            </div>
          </div>
          <Link
            to="/news"
            className="flex items-center gap-1 text-[#4B6BFB] text-sm font-medium hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {news.slice(0, 3).map((item) => (
            <NewsCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
