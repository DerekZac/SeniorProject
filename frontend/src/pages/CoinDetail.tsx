import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Globe, FileText, Search, Twitter, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SkeletonResultPage } from '../components/Skeleton';
import { api, type CoinMarketDetail, type PricePoint } from '../lib/api';
import { getCoinDescription } from '../lib/coinDescriptions';
import { useApp } from '../context/AppContext';
import { formatUsdToDisplay } from '../lib/displayCurrency';

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 metric-row">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-strong">{value}</span>
    </div>
  );
}

export default function CoinDetail() {
  const { coin } = useParams<{ coin: string }>();
  const [data, setData]             = useState<CoinMarketDetail | null>(null);
  const [history, setHistory]       = useState<PricePoint[]>([]);
  const [loading, setLoading]       = useState(true);
  const { isWatchlisted, toggleWatchlist, displayCurrency, currencyRates } = useApp();

  useEffect(() => {
    setLoading(true);
    api.getCoinDetail(coin ?? 'bitcoin').then(detail => {
      setData(detail);
      return api.getCoinPriceHistory(detail.geckoId);
    }).then(pts => {
      setHistory(pts);
    }).catch(() => {
      // price history failure is non-fatal
    }).finally(() => setLoading(false));
  }, [coin]);

  if (loading) return <SkeletonResultPage />;
  if (!data)   return null;

  const { geckoId, name, ticker, change, circulatingSupply, athDate, rank } = data;
  const up          = change >= 0;
  const watchlisted = isWatchlisted(ticker);
  const desc        = getCoinDescription(geckoId);
  const cardStyle   = undefined; // replaced by .card-surface
  const displayPrice = formatUsdToDisplay(data.priceUsd, displayCurrency, currencyRates);
  const displayMarketCap = formatUsdToDisplay(data.marketCapUsd, displayCurrency, currencyRates, true);
  const displayVolume24h = formatUsdToDisplay(data.volume24hUsd, displayCurrency, currencyRates, true);
  const displayAllTimeHigh = formatUsdToDisplay(data.allTimeHighUsd, displayCurrency, currencyRates);

  const priceFormatter = (v: number) =>
    formatUsdToDisplay(v, displayCurrency, currencyRates);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-4">

      {/* Header */}
      <div className="rounded-2xl p-6 card-surface">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-strong">{name}</h1>
              <span className="text-lg font-medium text-muted">{ticker}</span>
              {rank > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full rank-pill">
                  #{rank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-strong">{displayPrice}</span>
              <span className={`font-medium ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
                {up ? '+' : ''}{change}% (24h)
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleWatchlist(ticker)}
            className={`watchlist-btn ${watchlisted ? 'watchlisted' : 'not-watched'}`}
            title={watchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star size={18} fill={watchlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* 7-Day Price Chart */}
      {history.length > 0 && (
        <div className="rounded-xl p-5 md:p-6 card-surface">
          <h2 className="text-strong font-semibold mb-1">Price History — Last 7 Days</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Daily closing price in {displayCurrency}</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={history} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} tickFormatter={priceFormatter} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-strong)' }}
                labelStyle={{ color: 'var(--text-strong)' }}
                itemStyle={{ color: '#F7931A' }}
                formatter={(v: number) => [priceFormatter(v), 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#F7931A"
                strokeWidth={2.5}
                dot={{ fill: '#F7931A', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#F7931A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Market metrics */}
      <div className="rounded-xl p-5 md:p-6 card-surface">
        <h2 className="text-strong font-semibold mb-3">Market Data</h2>
        <MetricRow label="Market Cap"                     value={displayMarketCap} />
        <MetricRow label="24h Trading Volume"             value={displayVolume24h} />
        <MetricRow label="Circulating Supply"             value={circulatingSupply} />
        <MetricRow label={`All-Time High (${athDate})`}  value={displayAllTimeHigh} />
        {rank > 0 && <MetricRow label="CoinGecko Rank"   value={`#${rank}`} />}
      </div>

      {/* About */}
      {desc && (
        <div className="rounded-xl p-5 md:p-6 card-surface">
          <p className="section-label mb-1" style={{ color: 'var(--signin-color)' }}>About {name}</p>
          <p className="text-strong font-semibold mb-3">{desc.tagline}</p>
          <p className="text-sm leading-relaxed mb-4 muted-alt">{desc.description}</p>
          <div className="flex flex-wrap gap-2">
            {[desc.category, desc.consensus, `Est. ${desc.launchYear}`].map(b => (
              <span key={b} className="text-xs px-2.5 py-1 rounded-full chip">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Official links */}
      {desc && (
        <div className="rounded-xl p-5 md:p-6 card-surface">
          <h2 className="text-strong font-semibold mb-4">Official Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Website',    href: desc.website,    Icon: Globe },
              { label: 'Whitepaper', href: desc.whitepaper, Icon: FileText },
              { label: 'Explorer',   href: desc.explorer,   Icon: Search },
              { label: 'Twitter',    href: desc.twitter,    Icon: Twitter },
            ].map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all group link-card">
                <Icon size={14} className="group-hover:text-[#F7931A] transition-colors" />
                <span className="text-sm muted-alt">{label}</span>
                <ArrowUpRight size={12} className="muted-icon" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      <Link to={`/results/${coin}`} className="inline-block text-sm transition-colors hover:text-[#F7931A] text-muted">← Back to {name} Overview</Link>
    </div>
  );
}
