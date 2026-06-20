import { useEffect, useState } from 'react';
import { User, Star, Clock, X, Shield, LogOut, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SentimentBadge from '../components/SentimentBadge';
import { api, type Coin } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getUserCreatedAt } from '../lib/auth';
import { Settings, Sun, Moon, DollarSign } from 'lucide-react';
import { useTheme } from '../lib/useTheme';

export default function Profile() {
  const { watchlist, toggleWatchlist, searchHistory, clearSearchHistory } = useApp();
  const { session, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [watchlistCoins, setWatchlistCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const darkMode = theme === 'dark';

  useEffect(() => {
    if (watchlist.length === 0) { setWatchlistCoins([]); return; }
    setLoading(true);
    api.getWatchlistCoins(watchlist)
      .then(setWatchlistCoins)
      .catch(() => setWatchlistCoins([]))
      .finally(() => setLoading(false));
  }, [watchlist]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const username    = session?.username ?? 'Guest';
  const memberSince = session ? getUserCreatedAt(session.username) : '';

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 space-y-4">

      {/* Account info */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(247,147,26,0.15)', border: '2px solid rgba(247,147,26,0.3)' }}
          >
            <User size={24} style={{ color: '#F7931A' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-strong)' }}>{username}</h1>
            {memberSince && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Member since {memberSince}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <Shield size={12} style={{ color: '#00E676' }} />
              <span className="text-xs font-medium" style={{ color: '#00E676' }}>2FA enabled</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 flex-shrink-0 items-end">
            <Link
              to="/forgot-password"
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-[#F7931A]"
              style={{ color: 'var(--text-muted)' }}
            >
              <Shield size={12} /> Change Password
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-[#FF3355]"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Watchlist */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={15} fill="currentColor" style={{ color: '#FFB020' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text-strong)' }}>My Watchlist</h2>
          </div>
          <Link to="/watchlist" className="text-xs transition-colors hover:text-[#F7931A]" style={{ color: 'var(--text-muted)' }}>
            Manage →
          </Link>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm py-2" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={14} className="animate-spin" style={{ color: '#F7931A' }} /> Loading live data…
          </div>
        )}

        {!loading && watchlist.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No coins in your watchlist yet.</p>
        )}

        {!loading && watchlistCoins.length > 0 && (
          <div className="flex flex-col gap-0">
            {watchlistCoins.map(coin => (
              <div
                key={coin.ticker}
                className="flex items-center justify-between py-3 border-b last:border-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Link
                    to={`/coin/${coin.ticker.toLowerCase()}`}
                    className="font-semibold transition-colors hover:text-[#F7931A]"
                    style={{ color: 'var(--text-strong)' }}
                  >
                    {coin.ticker}
                  </Link>
                  <span className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{coin.name}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{coin.price}</span>
                  <span className={`text-xs font-medium ${coin.change >= 0 ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
                    {coin.change >= 0 ? '+' : ''}{coin.change}%
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <SentimentBadge sentiment={coin.sentiment} confidence={coin.confidence} size="sm" />
                  <button
                    onClick={() => toggleWatchlist(coin.ticker)}
                    className="p-1 rounded transition-colors hover:text-[#FF3355]"
                    style={{ color: 'var(--text-muted)' }}
                    title="Remove from watchlist"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search history */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={15} style={{ color: 'var(--text-muted)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text-strong)' }}>Recent Searches</h2>
          </div>
          {searchHistory.length > 0 && (
            <button
              onClick={clearSearchHistory}
              className="text-xs transition-colors hover:text-[#FF3355]"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear all
            </button>
          )}
        </div>

        {searchHistory.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No searches yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {searchHistory.map(coin => (
              <Link
                key={coin}
                to={`/results/${coin.toLowerCase()}`}
                className="text-sm px-3 py-1.5 rounded-lg transition-all hover:text-[#F7931A]"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                {coin}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Settings size={15} style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-semibold" style={{ color: 'var(--text-strong)' }}>Settings</h2>
        </div>

        <div className="flex flex-col gap-0">
          {/* Dark / Light mode */}
          <div
            className="flex items-center justify-between py-3 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              {darkMode
                ? <Moon size={14} style={{ color: 'var(--text-muted)' }} />
                : <Sun size={14} style={{ color: 'var(--text-muted)' }} />
              }
              <span className="text-sm" style={{ color: 'var(--text)' }}>Theme</span>
            </div>
            <button
              onClick={toggle}
              className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
              style={{ background: darkMode ? 'rgba(247,147,26,0.4)' : 'var(--border)' }}
              aria-label="Toggle theme"
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{
                  background: darkMode ? '#F7931A' : 'var(--text-muted)',
                  left: darkMode ? '1.25rem' : '0.125rem',
                }}
              />
            </button>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <DollarSign size={14} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text)' }}>Display Currency</span>
            </div>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'BTC', 'ETH'].map(c => (
                <option key={c} value={c} style={{ background: 'var(--bg-surface)' }}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
