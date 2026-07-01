import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import CoinCard from '../components/CoinCard';
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
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>

      {/* Page header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <p className="section-label" style={{ marginBottom: '0.875rem' }}>Portfolio Tracker</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
            My Watchlist
          </h1>
          <span className="section-label">
            {watchlist.length} coin{watchlist.length !== 1 ? 's' : ''} tracked
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-row" style={{ height: '52px', opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && watchlist.length === 0 && (
        <div style={{ padding: '5rem 0', borderTop: '1px solid #21213A', borderBottom: '1px solid #21213A' }}>
          <p style={{ fontSize: '0.9375rem', color: '#5A5A7A', lineHeight: 1.6 }}>
            Your watchlist is empty.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#3A3A5A', marginTop: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid #21213A' }}>
            Search for any coin and press the star icon to start tracking it here.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && coins.length > 0 && (
        <div>
          {/* Column headers */}
          <div
            className="hidden md:flex items-center gap-3 md:gap-4"
            style={{ padding: '0 0 0.625rem', borderBottom: '1px solid #21213A' }}
          >
            <span className="section-label" style={{ width: '3.5rem', flexShrink: 0 }}>Ticker</span>
            <span className="section-label flex-1">Name</span>
            <span className="section-label hidden sm:block">Price</span>
            <span className="section-label" style={{ width: '4rem', textAlign: 'right' }}>24h</span>
            <span style={{ width: '1.5rem', flexShrink: 0 }} />
          </div>

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
