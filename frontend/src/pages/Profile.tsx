import { useEffect, useState } from "react";
import { User, Star, Clock, X, Shield, LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SentimentBadge from "../components/SentimentBadge";
import { api, type Coin } from "../lib/api";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getUserCreatedAt } from "../lib/auth";

export default function Profile() {
  const { watchlist, toggleWatchlist, searchHistory, clearSearchHistory } = useApp();
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [watchlistCoins, setWatchlistCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (watchlist.length === 0) { setWatchlistCoins([]); return; }
    setLoading(true);
    api.getWatchlistCoins(watchlist)
      .then(setWatchlistCoins)
      .catch(() => setWatchlistCoins([]))
      .finally(() => setLoading(false));
  }, [watchlist]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const username  = session?.username ?? 'Guest';
  const memberSince = session ? getUserCreatedAt(session.username) : '';

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Account info */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#4B6BFB] rounded-full flex items-center justify-center flex-shrink-0">
            <User size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{username}</h1>
            {memberSince && (
              <p className="text-[#8A8FA8] text-sm">Member since {memberSince}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              <Shield size={12} className="text-[#00C896]" />
              <span className="text-[#00C896] text-xs font-medium">2FA enabled</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Link
              to="/forgot-password"
              className="flex items-center gap-1.5 text-xs text-[#4B6BFB] hover:underline"
            >
              <Shield size={12} /> Change Password
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-[#8A8FA8] hover:text-[#FF4D4D] transition-colors"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Watchlist */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-[#FFB830]" fill="currentColor" />
            <h2 className="text-white font-semibold">My Watchlist</h2>
          </div>
          <Link to="/watchlist" className="text-[#4B6BFB] text-xs hover:underline">
            Manage →
          </Link>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-[#8A8FA8] text-sm py-2">
            <Loader2 size={14} className="animate-spin" /> Loading live data…
          </div>
        )}

        {!loading && watchlist.length === 0 && (
          <p className="text-[#8A8FA8] text-sm">No coins in your watchlist yet.</p>
        )}

        {!loading && watchlistCoins.length > 0 && (
          <div className="flex flex-col gap-1">
            {watchlistCoins.map(coin => (
              <div
                key={coin.ticker}
                className="flex items-center justify-between py-2.5 border-b border-[#2A2D3A] last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Link
                    to={`/coin/${coin.ticker.toLowerCase()}`}
                    className="font-semibold text-white hover:text-[#4B6BFB] transition-colors"
                  >
                    {coin.ticker}
                  </Link>
                  <span className="text-[#8A8FA8] text-sm truncate">{coin.name}</span>
                  <span className="text-white text-sm font-medium">{coin.price}</span>
                  <span className={`text-xs font-medium ${coin.change >= 0 ? "text-[#00C896]" : "text-[#FF4D4D]"}`}>
                    {coin.change >= 0 ? "+" : ""}{coin.change}%
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <SentimentBadge sentiment={coin.sentiment} confidence={coin.confidence} size="sm" />
                  <button
                    onClick={() => toggleWatchlist(coin.ticker)}
                    className="text-[#8A8FA8] hover:text-[#FF4D4D] transition-colors p-1 rounded"
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
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#8A8FA8]" />
            <h2 className="text-white font-semibold">Recent Searches</h2>
          </div>
          {searchHistory.length > 0 && (
            <button
              onClick={clearSearchHistory}
              className="text-[#8A8FA8] text-xs hover:text-[#FF4D4D] transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {searchHistory.length === 0 ? (
          <p className="text-[#8A8FA8] text-sm">No searches yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {searchHistory.map(coin => (
              <Link
                key={coin}
                to={`/results/${coin.toLowerCase()}`}
                className="bg-[#0D0F14] border border-[#2A2D3A] text-[#8A8FA8] hover:text-white hover:border-[#4B6BFB]/50 text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                {coin}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
