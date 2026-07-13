import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Star, ArrowUpRight, Globe, FileText, Search, Twitter, Sparkles, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SkeletonResultPage } from '../components/Skeleton';
import { logger } from '../lib/logger';
import { api, type CoinMarketDetail, type PricePoint, type AISentiment } from '../lib/api';
import { getCoinDescription } from '../lib/coinDescriptions';
import { EXCHANGES } from '../lib/exchangeData';
import { useApp } from '../context/AppContext';
import { formatUsdToDisplay } from '../lib/displayCurrency';

const COLORS = {
  bullish: '#00E676',
  bearish: '#FF3355',
  mixed:   '#FFB020',
};

function aiColor(classification: string) {
  if (classification === 'Bullish') return COLORS.bullish;
  if (classification === 'Bearish') return COLORS.bearish;
  return COLORS.mixed;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 metric-row">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-strong">{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <div className="text-strong font-bold text-lg">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

export default function CoinPage() {
  const { coin } = useParams<{ coin: string }>();
  const [data, setData]           = useState<CoinMarketDetail | null>(null);
  const [history, setHistory]     = useState<PricePoint[]>([]);
  const [aiSentiment, setAiSentiment]   = useState<AISentiment | undefined>();
  const [aiLoading, setAiLoading]       = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const { isWatchlisted, toggleWatchlist, displayCurrency, currencyRates } = useApp();

  useEffect(() => {
    // Fetch market data first (sets loading=false immediately)
    const fetchData = async () => {
      try {
        const detail = await api.getCoinDetail(coin ?? 'bitcoin');
        setData(detail);

        const [pts] = await Promise.all([api.getCoinPriceHistory(detail.geckoId)]);
        setHistory(pts);
      } catch (e) {
        setError('Could not load coin data. Make sure you entered a valid coin name or ticker.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Fetch AI sentiment separately (doesn't block page load)
    const fetchAISentiment = async () => {
      try {
        const result = await api.getCoinSentiment(coin ?? 'bitcoin');
        if (result.aiSentiment) {
          setAiSentiment(result.aiSentiment);
        }
      } catch (e) {
        logger.warn('app', 'AI sentiment failed on load', { error: String(e) });
      }
    };

    fetchAISentiment();
  }, [coin]);

  if (loading) return <SkeletonResultPage />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-20 text-center">
        <Search size={40} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
        <p className="text-strong font-semibold mb-2">Coin not found</p>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
        <Link to="/" className="text-sm transition-colors" style={{ color: 'var(--signin-color)' }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { geckoId, name, ticker, change, circulatingSupply, athDate, rank } = data;
  const up          = change >= 0;
  const watchlisted = isWatchlisted(ticker);
  const desc        = getCoinDescription(geckoId);
  const cardStyle   = { background: 'var(--bg-surface)', border: '1px solid var(--border)' };
  const displayPrice = formatUsdToDisplay(data.priceUsd, displayCurrency, currencyRates);
  const displayMarketCap = formatUsdToDisplay(data.marketCapUsd, displayCurrency, currencyRates, true);
  const displayVolume24h = formatUsdToDisplay(data.volume24hUsd, displayCurrency, currencyRates, true);
  const displayAllTimeHigh = formatUsdToDisplay(data.allTimeHighUsd, displayCurrency, currencyRates);

  const priceFormatter = (v: number) =>
    formatUsdToDisplay(v, displayCurrency, currencyRates);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-4">

      {/* Header card */}
      <div className="rounded-2xl p-6 md:p-8 relative" style={cardStyle}>
        <button
          onClick={() => toggleWatchlist(ticker)}
          className="absolute top-5 right-5 p-2 rounded-lg transition-all"
          style={{
            background: watchlisted ? 'rgba(255,176,32,0.10)' : 'transparent',
            border:     `1px solid ${watchlisted ? 'rgba(255,176,32,0.35)' : 'var(--border)'}`,
            color:      watchlisted ? '#FFB020' : 'var(--text-muted)',
          }}
          aria-label={watchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={17} fill={watchlisted ? 'currentColor' : 'none'} />
        </button>

        <div className="flex items-start gap-4 flex-wrap pr-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-strong">{name}</h1>
              <span className="text-base font-medium" style={{ color: 'var(--text-muted)' }}>{ticker}</span>
              {rank > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(247,147,26,0.12)', color: '#F7931A', border: '1px solid rgba(247,147,26,0.25)' }}>
                  Rank #{rank}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-strong">{displayPrice}</span>
              <span className={`text-base font-medium ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
                {up ? '+' : ''}{change}% (24h)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Price Chart */}
      {history.length > 0 && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
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
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-strong font-semibold text-sm">Market Data</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ borderColor: 'var(--border)' }}>
          <MetricCard label="Market Cap"          value={displayMarketCap} />
          <MetricCard label="24h Volume"          value={displayVolume24h} />
          <MetricCard label="Circulating Supply"  value={circulatingSupply} />
          <MetricCard label={`All-Time High (${athDate})`} value={displayAllTimeHigh} />
        </div>
      </div>

      {/* About */}
      {desc && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
          <p className="section-label mb-1" style={{ color: '#F7931A' }}>About {name}</p>
          <p className="text-strong font-semibold mb-3">{desc.tagline}</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{desc.description}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: desc.category },
              { label: desc.consensus },
              { label: `Est. ${desc.launchYear}` },
            ].map(b => (
              <span key={b.label} className="text-xs px-2.5 py-1 rounded-full" style={{ color: 'var(--text-muted)', background: 'rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Official links */}
      {desc && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
          <h2 className="text-strong font-semibold mb-4">Official Links</h2>
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
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--signin-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <Icon size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} className="group-hover:text-[#F7931A] transition-colors" />
                <span className="text-sm group-hover:text-strong transition-colors" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <ArrowUpRight size={12} style={{ color: 'var(--border-hover)', marginLeft: 'auto', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Where to buy */}
      <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
        <h2 className="text-strong font-semibold mb-4">Where to Buy {ticker}</h2>
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
              <span className="row-title font-medium text-sm text-strong flex-1 transition-colors duration-150">{ex.name}</span>
              <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>{ex.bestFor}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-strong)' }}>{ex.fees.taker} taker</span>
              <ArrowUpRight size={13} style={{ color: 'var(--border-hover)', flexShrink: 0 }} className="group-hover:text-[#F7931A] transition-colors" />
            </a>
          ))}
          <div style={{ paddingTop: '1rem' }}>
            <Link to="/exchanges" className="text-sm hover:text-[#F7931A] transition-colors inline-flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              Compare all exchanges <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Sentiment Section */}
      {/* {!aiSentiment && !aiLoading && (
        <button
          onClick={async () => {
            setAiLoading(true);
            try {
              const result = await api.getCoinSentiment(coin ?? 'bitcoin');
              if (result.aiSentiment) {
                setAiSentiment(result.aiSentiment);
              }
            } catch (e) {
              logger.warn('app', 'AI sentiment failed on button click', { error: String(e) });
            } finally {
              setAiLoading(false);
            }
          }}
          className="w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          style={{ background: '#16162A', border: '1px solid #21213A', color: '#F7931A' }}
        >
          <Sparkles size={16} />
          Analyze with AI
        </button>
      )} */}

      {!aiSentiment && !aiLoading && (
        <div
          className="rounded-xl p-5 md:p-6 flex items-center gap-3"
          style={{ background: '#16162A', border: '1px solid #21213A' }}
        >
          <Loader2 size={16} className="animate-spin" style={{ color: '#F7931A' }} />
          <span style={{ color: '#5A5A7A' }}>Analyzing news with Gemini AI...</span>
        </div>
      )}

      {aiSentiment && (
        <div
          className="rounded-xl p-5 md:p-6"
          style={{ background: '#16162A', border: `1px solid ${aiColor(aiSentiment.classification)}40` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: '#F7931A' }} />
            <h2 className="text-white font-semibold">AI News Analysis</h2>
            <span
              className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                color: aiColor(aiSentiment.classification),
                background: `${aiColor(aiSentiment.classification)}18`,
                border: `1px solid ${aiColor(aiSentiment.classification)}30`,
              }}
            >
              {aiSentiment.classification}
            </span>
          </div>

          <p className="text-sm mb-4" style={{ color: '#A0A0B8', lineHeight: 1.6 }}>
            {aiSentiment.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {aiSentiment.bullish_points.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={13} style={{ color: '#00E676' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#00E676' }}>
                    Bullish Catalysts
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {aiSentiment.bullish_points.slice(0, 3).map((p, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: '#A0A0B8' }}>
                      <span style={{ color: '#00E676' }}>+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiSentiment.bearish_points.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingDown size={13} style={{ color: '#FF3355' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#FF3355' }}>
                    Bearish Risks
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {aiSentiment.bearish_points.slice(0, 3).map((p, i) => (
                    <li key={i} className="text-xs flex gap-2" style={{ color: '#A0A0B8' }}>
                      <span style={{ color: '#FF3355' }}>−</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-6 pt-3" style={{ borderTop: '1px solid #21213A' }}>
            <div>
              <span className="text-xs" style={{ color: '#5A5A7A' }}>Short Term</span>
              <div className="text-sm font-semibold mt-0.5" style={{ color: aiColor(aiSentiment.short_term) }}>
                {aiSentiment.short_term}
              </div>
            </div>
            <div>
              <span className="text-xs" style={{ color: '#5A5A7A' }}>Long Term</span>
              <div className="text-sm font-semibold mt-0.5" style={{ color: aiColor(aiSentiment.long_term) }}>
                {aiSentiment.long_term}
              </div>
            </div>
            <div>
              <span className="text-xs" style={{ color: '#5A5A7A' }}>Market Score</span>
              <div className="text-sm font-semibold mt-0.5" style={{ color: aiColor(aiSentiment.classification) }}>
                {aiSentiment.market_score > 0 ? '+' : ''}{aiSentiment.market_score}
              </div>
            </div>
          </div>
        </div>
      )}

      <Link to="/" className="inline-block text-sm transition-colors hover:text-[#F7931A] text-muted">← Back to Home</Link>
    </div>
  );
}
