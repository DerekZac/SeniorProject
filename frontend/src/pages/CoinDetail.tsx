import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Globe, FileText, Search, Twitter, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SkeletonResultPage } from '../components/Skeleton';
import { api, type CoinMarketDetail, type PricePoint } from '../lib/api';
import { getCoinDescription } from '../lib/coinDescriptions';
import { useApp } from '../context/AppContext';

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #21213A' }}>
      <span className="text-sm" style={{ color: '#5A5A7A' }}>{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export default function CoinDetail() {
  const { coin } = useParams<{ coin: string }>();
  const [data, setData]             = useState<CoinMarketDetail | null>(null);
  const [history, setHistory]       = useState<PricePoint[]>([]);
  const [loading, setLoading]       = useState(true);
  const { isWatchlisted, toggleWatchlist } = useApp();

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

  const { geckoId, name, ticker, price, change, marketCap, volume24h, circulatingSupply, allTimeHigh, athDate, rank } = data;
  const up          = change >= 0;
  const watchlisted = isWatchlisted(ticker);
  const desc        = getCoinDescription(geckoId);
  const cardStyle   = { background: '#16162A', border: '1px solid #21213A' };

  const priceFormatter = (v: number) =>
    v >= 1000 ? `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}` :
    v >= 1    ? `$${v.toFixed(2)}` :
    `$${v.toFixed(6)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-4">

      {/* Header */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">{name}</h1>
              <span className="text-lg font-medium" style={{ color: '#5A5A7A' }}>{ticker}</span>
              {rank > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(247,147,26,0.12)', color: '#F7931A', border: '1px solid rgba(247,147,26,0.25)' }}>
                  #{rank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{price}</span>
              <span className={`font-medium ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
                {up ? '+' : ''}{change}% (24h)
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleWatchlist(ticker)}
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: watchlisted ? 'rgba(255,176,32,0.10)' : 'transparent',
              border:     `1px solid ${watchlisted ? 'rgba(255,176,32,0.35)' : '#21213A'}`,
              color:      watchlisted ? '#FFB020' : '#5A5A7A',
            }}
            title={watchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star size={18} fill={watchlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* 7-Day Price Chart */}
      {history.length > 0 && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
          <h2 className="text-white font-semibold mb-1">Price History — Last 7 Days</h2>
          <p className="text-xs mb-4" style={{ color: '#5A5A7A' }}>Daily closing price in USD</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={history} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21213A" />
              <XAxis dataKey="day" stroke="#5A5A7A" tick={{ fontSize: 12 }} />
              <YAxis stroke="#5A5A7A" tick={{ fontSize: 12 }} tickFormatter={priceFormatter} />
              <Tooltip
                contentStyle={{ background: '#16162A', border: '1px solid #21213A', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#fff' }}
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
      <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
        <h2 className="text-white font-semibold mb-3">Market Data</h2>
        <MetricRow label="Market Cap"                     value={marketCap} />
        <MetricRow label="24h Trading Volume"             value={volume24h} />
        <MetricRow label="Circulating Supply"             value={circulatingSupply} />
        <MetricRow label={`All-Time High (${athDate})`}  value={allTimeHigh} />
        {rank > 0 && <MetricRow label="CoinGecko Rank"   value={`#${rank}`} />}
      </div>

      {/* About */}
      {desc && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
          <p className="section-label mb-1" style={{ color: '#F7931A' }}>About {name}</p>
          <p className="text-white font-semibold mb-3">{desc.tagline}</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A0A0B8' }}>{desc.description}</p>
          <div className="flex flex-wrap gap-2">
            {[desc.category, desc.consensus, `Est. ${desc.launchYear}`].map(b => (
              <span key={b} className="text-xs px-2.5 py-1 rounded-full" style={{ color: '#5A5A7A', background: 'rgba(33,33,58,0.8)', border: '1px solid #21213A' }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Official links */}
      {desc && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
          <h2 className="text-white font-semibold mb-4">Official Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Website',    href: desc.website,    Icon: Globe },
              { label: 'Whitepaper', href: desc.whitepaper, Icon: FileText },
              { label: 'Explorer',   href: desc.explorer,   Icon: Search },
              { label: 'Twitter',    href: desc.twitter,    Icon: Twitter },
            ].map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all group"
                style={{ background: '#0F0F1A', border: '1px solid #21213A', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(247,147,26,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#21213A')}
              >
                <Icon size={14} style={{ color: '#5A5A7A', flexShrink: 0 }} className="group-hover:text-[#F7931A] transition-colors" />
                <span className="text-sm" style={{ color: '#A0A0B8' }}>{label}</span>
                <ArrowUpRight size={12} style={{ color: '#3A3A5A', marginLeft: 'auto', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      <Link
        to={`/results/${coin}`}
        className="inline-block text-sm transition-colors hover:text-white"
        style={{ color: '#5A5A7A' }}
      >
        ← Back to {name} Overview
      </Link>
    </div>
  );
}
