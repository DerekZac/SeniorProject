import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Newspaper, Activity, Users, Zap } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CoinCard from '../components/CoinCard';
import NewsCard from '../components/NewsCard';
import TickerStrip from '../components/TickerStrip';
import { SkeletonCard, SkeletonNewsCard } from '../components/Skeleton';
import { api, type Coin, type NewsItem } from '../lib/api';
import { useApp } from '../context/AppContext';

function FearGreedGauge({ value }: { value: number }) {
  const angle = -90 + (value / 100) * 180;
  const color = value >= 60 ? '#00E676' : value >= 40 ? '#FFB020' : '#FF3355';
  const label = value >= 75 ? 'Extreme Greed' : value >= 60 ? 'Greed' : value >= 40 ? 'Neutral' : value >= 25 ? 'Fear' : 'Extreme Fear';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-36">
        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#21213A" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * 157} 157`}
          style={{ transition: 'stroke-dasharray 1s ease-out, stroke 0.5s' }}
        />
        <line
          x1="60" y1="60"
          x2={60 + 40 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={60 + 40 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'all 1s ease-out' }}
        />
        <circle cx="60" cy="60" r="4" fill={color} />
        <text x="60" y="52" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{value}</text>
      </svg>
      <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
      <span className="text-xs mt-0.5" style={{ color: '#5A5A7A' }}>Fear &amp; Greed Index</span>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1" style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-base font-bold text-white">{value}</span>
      <span className="text-xs" style={{ color: '#5A5A7A' }}>{label}</span>
    </div>
  );
}

function MoodBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: '#5A5A7A' }}>{label}</span>
        <span className="font-semibold" style={{ color }}>{percent}%</span>
      </div>
      <div className="w-full rounded-full h-1.5" style={{ background: '#21213A' }}>
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${percent}%`, background: color, transition: 'width 1s ease-out' }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [coins, setCoins]     = useState<Coin[]>([]);
  const [news, setNews]       = useState<NewsItem[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [loadingNews, setLoadingNews]   = useState(true);
  const { isWatchlisted, toggleWatchlist } = useApp();

  const fearGreed = 62;

  useEffect(() => {
    api.getTrending()
      .then(setCoins)
      .finally(() => setLoadingCoins(false));
    api.getNews()
      .then(setNews)
      .finally(() => setLoadingNews(false));
  }, []);

  const bullishCount = coins.filter(c => c.sentiment === 'Bullish').length;
  const bearishCount = coins.filter(c => c.sentiment === 'Bearish').length;
  const mixedCount   = coins.filter(c => c.sentiment === 'Mixed').length;
  const total        = coins.length || 1;

  return (
    <div>
      {/* Ticker strip */}
      {!loadingCoins && <TickerStrip coins={coins} />}

      {/* Hero */}
      <div
        className="relative px-6 py-20 md:py-28 text-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(247,147,26,0.18) 0%, rgba(8,8,15,0) 65%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 40% 50% at 85% 40%, rgba(0,212,255,0.06) 0%, transparent 60%)' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{ background: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.25)', color: '#F7931A' }}
          >
            <Zap size={12} />
            Live Reddit Sentiment · Updated Every 5 Min
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
            Crypto Sentiment,{' '}
            <span className="text-gradient-orange">Decoded</span>
            <br className="hidden md:block" /> in Real-Time
          </h1>

          <p className="text-[#5A5A7A] text-base md:text-lg mb-10 max-w-xl mx-auto">
            Scan 10+ crypto subreddits instantly. Know if the crowd is bullish or bearish before you trade.
          </p>

          <SearchBar large />

          <div className="flex items-center justify-center gap-6 mt-6 text-sm" style={{ color: '#5A5A7A' }}>
            <span>Try:</span>
            {['Bitcoin', 'Ethereum', 'Solana'].map(c => (
              <Link
                key={c}
                to={`/results/${c.toLowerCase()}`}
                className="hover:text-[#F7931A] transition-colors font-medium"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!loadingCoins && coins.length > 0 && (
        <div
          className="border-y border-[#21213A] py-5"
          style={{ background: '#0F0F1A' }}
        >
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
            <StatBadge icon={Activity}   label="Coins Tracked"   value={`${coins.length}`}         color="#F7931A" />
            <StatBadge icon={Flame}      label="Bullish"          value={`${bullishCount}`}          color="#00E676" />
            <StatBadge icon={Users}      label="Bearish"          value={`${bearishCount}`}          color="#FF3355" />
            <StatBadge icon={Newspaper}  label="News Articles"    value={`${news.length}`}           color="#00D4FF" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-14">

        {/* Trending + Fear/Greed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Coins grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-glow-orange" style={{ background: '#F7931A' }}>
                <Flame size={15} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-none">Trending Now</h2>
                <p className="text-xs mt-0.5" style={{ color: '#5A5A7A' }}>Most discussed on Reddit</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3">
              {loadingCoins
                ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
                : coins.map(coin => (
                    <CoinCard
                      key={coin.ticker}
                      {...coin}
                      isWatchlisted={isWatchlisted(coin.ticker)}
                      onToggleWatchlist={() => toggleWatchlist(coin.ticker)}
                    />
                  ))
              }
            </div>
          </div>

          {/* Sidebar: Fear/Greed + Market Mood */}
          <div className="flex flex-col gap-5">
            <div
              className="rounded-xl p-5 text-center"
              style={{ background: '#16162A', border: '1px solid #21213A' }}
            >
              <FearGreedGauge value={fearGreed} />
            </div>

            {!loadingCoins && coins.length > 0 && (
              <div
                className="rounded-xl p-5 flex flex-col gap-4"
                style={{ background: '#16162A', border: '1px solid #21213A' }}
              >
                <h3 className="text-sm font-semibold text-white">Market Mood</h3>
                <MoodBar label="Bullish" percent={Math.round((bullishCount / total) * 100)} color="#00E676" />
                <MoodBar label="Mixed"   percent={Math.round((mixedCount   / total) * 100)} color="#FFB020" />
                <MoodBar label="Bearish" percent={Math.round((bearishCount / total) * 100)} color="#FF3355" />
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#21213A]" />

        {/* Latest News */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.12)' }}>
                <Newspaper size={15} style={{ color: '#00D4FF' }} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-none">Latest News</h2>
                <p className="text-xs mt-0.5" style={{ color: '#5A5A7A' }}>Breaking crypto headlines</p>
              </div>
            </div>
            <Link
              to="/news"
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#F7931A]"
              style={{ color: '#5A5A7A' }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loadingNews
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonNewsCard key={i} />)
              : news.slice(0, 6).map(item => <NewsCard key={item.id} {...item} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}
