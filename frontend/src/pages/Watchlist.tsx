import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import CoinCard from '../components/CoinCard';
import { SkeletonCard } from '../components/Skeleton';
import { api, type Coin } from '../lib/api';
import { useApp } from '../context/AppContext';

export default function Watchlist() {
  const { watchlist, toggleWatchlist, isWatchlisted } = useApp();
  const [coins, setCoins]     = useState<Coin[]>([]);
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
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <div className="flex items-center gap-3 mb-1">
        <Star size={22} fill="currentColor" style={{ color: '#FFB020' }} />
        <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
      </div>
      <p className="text-sm mb-8 ml-9" style={{ color: '#5A5A7A' }}>
        {watchlist.length} coin{watchlist.length !== 1 ? 's' : ''} tracked — live prices &amp; sentiment
      </p>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && watchlist.length === 0 && (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: '#16162A', border: '1px solid #21213A' }}
        >
          <Star size={44} className="mx-auto mb-4 opacity-20" style={{ color: '#FFB020' }} />
          <p className="text-white font-medium mb-1">Your watchlist is empty</p>
          <p className="text-sm" style={{ color: '#5A5A7A' }}>Search for coins and star them to track them here</p>
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
