import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Star, ArrowUpRight, Globe, FileText, Search, Twitter } from 'lucide-react';
import { SkeletonResultPage } from '../components/Skeleton';
import { api, type CoinMarketDetail, type NewsItem, filterNewsByCoin } from '../lib/api';
import { getCoinDescription } from '../lib/coinDescriptions';
import { EXCHANGES } from '../lib/exchangeData';
import { useApp } from '../context/AppContext';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: '#5A5A7A' }}>{label}</div>
    </div>
  );
}

export default function Results() {
  const { coin } = useParams<{ coin: string }>();
  const [data, setData]           = useState<CoinMarketDetail | null>(null);
  const [news, setNews]           = useState<NewsItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const { isWatchlisted, toggleWatchlist } = useApp();

  useEffect(() => {
    setLoading(true);
    setData(null);
    setError(null);
    Promise.all([
      api.getCoinDetail(coin ?? 'bitcoin'),
      api.getNews(),
    ]).then(([detail, allNews]) => {
      setData(detail);
      setNews(filterNewsByCoin(allNews, detail.name, detail.ticker));
    }).catch(() => {
      setError('Could not load coin data. Make sure you entered a valid coin name or ticker.');
    }).finally(() => setLoading(false));
  }, [coin]);

  if (loading) return <SkeletonResultPage />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-20 text-center">
        <Search size={40} className="mx-auto mb-4 opacity-30" style={{ color: '#5A5A7A' }} />
        <p className="text-white font-semibold mb-2">Coin not found</p>
        <p className="text-sm mb-6" style={{ color: '#5A5A7A' }}>{error}</p>
        <Link to="/" className="text-sm hover:text-white transition-colors" style={{ color: '#F7931A' }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { geckoId, name, ticker, price, change, marketCap, volume24h, circulatingSupply, allTimeHigh, athDate, rank } = data;
  const up          = change >= 0;
  const watchlisted = isWatchlisted(ticker);
  const desc        = getCoinDescription(geckoId);
  const cardStyle   = { background: '#16162A', border: '1px solid #21213A' };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-4">

      {/* Header card */}
      <div className="rounded-2xl p-6 md:p-8 relative" style={cardStyle}>
        <button
          onClick={() => toggleWatchlist(ticker)}
          className="absolute top-5 right-5 p-2 rounded-lg transition-all"
          style={{
            background: watchlisted ? 'rgba(255,176,32,0.10)' : 'transparent',
            border:     `1px solid ${watchlisted ? 'rgba(255,176,32,0.35)' : '#21213A'}`,
            color:      watchlisted ? '#FFB020' : '#5A5A7A',
          }}
          aria-label={watchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={17} fill={watchlisted ? 'currentColor' : 'none'} />
        </button>

        <div className="flex items-start gap-4 flex-wrap pr-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              <span className="text-base font-medium" style={{ color: '#5A5A7A' }}>{ticker}</span>
              {rank > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(247,147,26,0.12)', color: '#F7931A', border: '1px solid rgba(247,147,26,0.25)' }}>
                  Rank #{rank}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white">{price}</span>
              <span className={`text-base font-medium ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
                {up ? '+' : ''}{change}% (24h)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Market metrics */}
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #21213A' }}>
          <h2 className="text-white font-semibold text-sm">Market Data</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ borderColor: '#21213A' }}>
          <MetricCard label="Market Cap"          value={marketCap} />
          <MetricCard label="24h Volume"          value={volume24h} />
          <MetricCard label="Circulating Supply"  value={circulatingSupply} />
          <MetricCard label={`All-Time High (${athDate})`} value={allTimeHigh} />
        </div>
      </div>

      {/* About */}
      {desc && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
          <p className="section-label mb-1" style={{ color: '#F7931A' }}>About {name}</p>
          <p className="text-white font-semibold mb-3">{desc.tagline}</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A0A0B8' }}>{desc.description}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: desc.category },
              { label: desc.consensus },
              { label: `Est. ${desc.launchYear}` },
            ].map(b => (
              <span key={b.label} className="text-xs px-2.5 py-1 rounded-full" style={{ color: '#5A5A7A', background: 'rgba(33,33,58,0.8)', border: '1px solid #21213A' }}>
                {b.label}
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
                <span className="text-sm group-hover:text-white transition-colors" style={{ color: '#A0A0B8' }}>{label}</span>
                <ArrowUpRight size={12} style={{ color: '#3A3A5A', marginLeft: 'auto', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Where to buy */}
      <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
        <h2 className="text-white font-semibold mb-4">Where to Buy {ticker}</h2>
        <div className="flex flex-col gap-0">
          {EXCHANGES.filter(e => e.tag !== 'defi').slice(0, 5).map(ex => (
            <a
              key={ex.id}
              href={ex.url}
              target="_blank"
              rel="noopener noreferrer"
              className="data-row group flex items-center gap-4"
              style={{ padding: '0.875rem 0', borderBottom: '1px solid #21213A', textDecoration: 'none' }}
            >
              <div style={{ width: '2rem', height: '2rem', background: 'rgba(247,147,26,0.10)', border: '1px solid rgba(247,147,26,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#F7931A', flexShrink: 0 }}>
                {ex.logo}
              </div>
              <span className="row-title font-medium text-sm text-white flex-1 transition-colors duration-150">{ex.name}</span>
              <span className="text-xs hidden sm:block" style={{ color: '#5A5A7A' }}>{ex.bestFor}</span>
              <span className="text-xs font-medium" style={{ color: '#E8E8F0' }}>{ex.fees.taker} taker</span>
              <ArrowUpRight size={13} style={{ color: '#3A3A5A', flexShrink: 0 }} className="group-hover:text-[#F7931A] transition-colors" />
            </a>
          ))}
          <div style={{ paddingTop: '1rem' }}>
            <Link to="/exchanges" className="text-sm hover:text-[#F7931A] transition-colors inline-flex items-center gap-1" style={{ color: '#5A5A7A' }}>
              Compare all exchanges <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Related news */}
      {news.length > 0 && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
          <h2 className="text-white font-semibold mb-4">In the News</h2>
          <div className="flex flex-col gap-0">
            {news.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="data-row group flex items-baseline gap-4"
                style={{ padding: '0.875rem 0', borderBottom: '1px solid #21213A', textDecoration: 'none' }}
              >
                <span className="section-label hidden sm:inline" style={{ width: '7rem', flexShrink: 0 }}>{item.source}</span>
                <span className="row-title flex-1 line-clamp-1 text-sm transition-colors duration-150" style={{ color: '#E8E8F0', minWidth: 0 }}>{item.title}</span>
                <span className="section-label hidden md:inline" style={{ flexShrink: 0 }}>{item.timeAgo}</span>
                <ArrowUpRight size={13} style={{ color: '#3A3A5A', flexShrink: 0 }} className="group-hover:text-[#F7931A] transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Link
        to={`/coin/${coin}`}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.01]"
        style={{ background: '#F7931A' }}
      >
        View Full {name} Detail <ArrowRight size={18} />
      </Link>
    </div>
  );
}
