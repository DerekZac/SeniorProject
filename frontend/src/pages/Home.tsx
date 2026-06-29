import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SentimentBadge from '../components/SentimentBadge';
import TickerStrip from '../components/TickerStrip';
import { api, type Coin, type NewsItem } from '../lib/api';
import { useApp } from '../context/AppContext';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionRule({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.75rem' }}>
      <span className="section-label">{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#21213A' }} />
      {action}
    </div>
  );
}

function FeaturedCoin({
  coin, isWatchlisted, onToggle,
}: { coin: Coin; isWatchlisted: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const up       = coin.change >= 0;
  const sentColor = coin.sentiment === 'Bullish' ? '#00E676' : coin.sentiment === 'Bearish' ? '#FF3355' : '#FFB020';

  return (
    <div
      style={{ cursor: 'pointer', paddingRight: '0' }}
      onClick={() => navigate(`/results/${coin.ticker.toLowerCase()}`)}
    >
      <p className="section-label" style={{ color: '#F7931A', marginBottom: '1.75rem' }}>
        Most Discussed
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <div
          className="num"
          style={{
            fontSize: 'clamp(3.25rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 0.94,
            letterSpacing: '-0.045em',
            color: '#FFFFFF',
          }}
        >
          {coin.ticker}
        </div>
        <div style={{ fontSize: '0.9375rem', color: '#5A5A7A', marginTop: '0.625rem', letterSpacing: '0.01em' }}>
          {coin.name}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.125rem', marginBottom: '2rem' }}>
        <span
          className="num"
          style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em' }}
        >
          {coin.price}
        </span>
        <span
          className="num"
          style={{ fontSize: '0.9375rem', color: up ? '#00E676' : '#FF3355' }}
        >
          {up ? '+' : ''}{coin.change}% (24h)
        </span>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ height: '2px', background: '#21213A', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: '100%',
              background: sentColor,
              transformOrigin: 'left center',
              transform: `scaleX(${coin.confidence / 100})`,
              transition: 'transform 0.9s ease-out',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span className="section-label">Confidence score</span>
          <span className="section-label num">{coin.confidence}%</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <SentimentBadge sentiment={coin.sentiment} size="md" />
        <button
          onClick={e => { e.stopPropagation(); onToggle(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.25rem',
            color: isWatchlisted ? '#FFB020' : '#3A3A5A',
            transition: 'color 0.15s ease',
          }}
          aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={16} fill={isWatchlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}

const SENT_ICON = { Bullish: TrendingUp, Bearish: TrendingDown, Mixed: Minus };
const SENT_CLR  = { Bullish: '#00E676', Bearish: '#FF3355', Mixed: '#FFB020' };

function CoinRow({ coin }: { coin: Coin }) {
  const navigate = useNavigate();
  const up       = coin.change >= 0;
  const Icon     = SENT_ICON[coin.sentiment];
  const color    = SENT_CLR[coin.sentiment];

  return (
    <div
      className="data-row group flex items-center gap-3"
      style={{ padding: '0.875rem 0', borderBottom: '1px solid #21213A', cursor: 'pointer' }}
      onClick={() => navigate(`/results/${coin.ticker.toLowerCase()}`)}
    >
      <span
        className="row-title num transition-colors duration-150"
        style={{ width: '3.25rem', fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF', flexShrink: 0 }}
      >
        {coin.ticker}
      </span>
      <span className="flex-1 truncate" style={{ fontSize: '0.8125rem', color: '#5A5A7A' }}>
        {coin.name}
      </span>
      <span className="num" style={{ fontSize: '0.875rem', color: '#E8E8F0', flexShrink: 0 }}>
        {coin.price}
      </span>
      <span
        className="num"
        style={{ width: '3.75rem', textAlign: 'right', fontSize: '0.8125rem', color: up ? '#00E676' : '#FF3355', flexShrink: 0 }}
      >
        {up ? '+' : ''}{coin.change}%
      </span>
      <span
        className="hidden sm:inline-flex items-center gap-1"
        style={{ width: '5.25rem', fontSize: '0.75rem', fontWeight: 600, color, flexShrink: 0 }}
      >
        <Icon size={12} strokeWidth={2.5} />
        {coin.sentiment}
      </span>
    </div>
  );
}

function FeaturedArticle({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
      style={{ display: 'block', textDecoration: 'none', padding: '2rem 0', borderBottom: '1px solid #21213A' }}
    >
      <p className="section-label" style={{ marginBottom: '1rem' }}>
        {item.source} · {item.timeAgo}
      </p>
      <h3
        style={{
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          fontWeight: 700,
          lineHeight: 1.22,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          maxWidth: '54ch',
          transition: 'color 0.15s ease',
        }}
        className="group-hover:text-[#F7931A] transition-colors"
      >
        {item.title}
      </h3>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginTop: '1.25rem',
          color: '#5A5A7A',
          fontSize: '0.8125rem',
          fontWeight: 500,
          transition: 'color 0.15s ease',
        }}
        className="group-hover:text-[#F7931A] transition-colors"
      >
        Read the article <ArrowUpRight size={13} />
      </div>
    </a>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="data-row group flex items-baseline gap-4 md:gap-6"
      style={{ padding: '1.0625rem 0', borderBottom: '1px solid #21213A', textDecoration: 'none' }}
    >
      <span className="section-label hidden sm:inline" style={{ width: '7rem', flexShrink: 0 }}>
        {item.source}
      </span>
      <span
        className="row-title flex-1 line-clamp-1 transition-colors duration-150"
        style={{ fontSize: '0.9375rem', color: '#E8E8F0', lineHeight: 1.4, minWidth: 0 }}
      >
        {item.title}
      </span>
      <span className="section-label hidden md:block" style={{ flexShrink: 0 }}>
        {item.timeAgo}
      </span>
      <ArrowUpRight
        size={13}
        className="flex-shrink-0 transition-colors duration-150 group-hover:text-[#F7931A]"
        style={{ color: '#3A3A5A' }}
      />
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [coins, setCoins]           = useState<Coin[]>([]);
  const [news, setNews]             = useState<NewsItem[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [loadingNews, setLoadingNews]   = useState(true);
  const { isWatchlisted, toggleWatchlist } = useApp();

  useEffect(() => {
    api.getTrending().then(setCoins).finally(() => setLoadingCoins(false));
    api.getNews().then(setNews).finally(() => setLoadingNews(false));
  }, []);

  const featured = coins[0];
  const rest     = coins.slice(1, 8);

  return (
    <div>
      {!loadingCoins && coins.length > 0 && <TickerStrip coins={coins} />}

      {/* ── Hero ────────────────────────────────── */}
      <section style={{ padding: '7rem 0 5.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="hero-grid">

            {/* Left — headline */}
            <div>
              <p className="section-label" style={{ marginBottom: '1.875rem' }}>
                Live Community Sentiment
              </p>
              <h1 className="hero-display" style={{ marginBottom: '2.75rem' }}>
                Before Price,<br />There's Sentiment.
              </h1>
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.74,
                  color: '#6A6A82',
                  paddingLeft: '1.25rem',
                  borderLeft: '2px solid #21213A',
                  maxWidth: '40ch',
                }}
              >
                Sentiment from r/Bitcoin, r/CryptoCurrency, and eight other communities — distilled into a single verdict. Updated every five minutes.
              </p>
            </div>

            {/* Right — search */}
            <div>
              <p className="section-label" style={{ marginBottom: '1rem' }}>
                Search any coin to see the verdict
              </p>
              <SearchBar large />
              <div style={{ marginTop: '1.75rem' }}>
                <p className="section-label" style={{ marginBottom: '0.75rem' }}>
                  Popular right now
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {['Bitcoin', 'Ethereum', 'Solana', 'XRP'].map(c => (
                    <Link
                      key={c}
                      to={`/results/${c.toLowerCase()}`}
                      className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                      style={{ fontSize: '0.875rem', color: '#5A5A7A', textDecoration: 'none' }}
                    >
                      {c}
                      <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid #21213A' }} />

      {/* ── Sentiment tracker ────────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule label="Sentiment Tracker" />

          {loadingCoins ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton-row"
                  style={{ height: '52px', opacity: 1 - i * 0.11 }}
                />
              ))}
            </div>
          ) : (
            <div className="trending-grid">

              {/* Featured coin */}
              {featured && (
                <FeaturedCoin
                  coin={featured}
                  isWatchlisted={isWatchlisted(featured.ticker)}
                  onToggle={() => toggleWatchlist(featured.ticker)}
                />
              )}

              {/* Data list */}
              <div>
                {/* Column labels */}
                <div
                  className="hidden md:flex items-center gap-3"
                  style={{ padding: '0 0 0.625rem', borderBottom: '1px solid #21213A', marginBottom: '0' }}
                >
                  <span className="section-label" style={{ width: '3.25rem', flexShrink: 0 }}>Coin</span>
                  <span className="section-label flex-1">Name</span>
                  <span className="section-label">Price</span>
                  <span className="section-label" style={{ width: '3.75rem', textAlign: 'right' }}>24h</span>
                  <span className="section-label hidden sm:block" style={{ width: '5.25rem' }}>Signal</span>
                </div>

                {rest.map(coin => <CoinRow key={coin.ticker} coin={coin} />)}

                <div style={{ paddingTop: '1.375rem' }}>
                  <Link
                    to="/watchlist"
                    className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                    style={{ fontSize: '0.8125rem', color: '#5A5A7A', textDecoration: 'none' }}
                  >
                    Open watchlist
                    <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div style={{ borderTop: '1px solid #21213A' }} />

      {/* ── In the news ──────────────────────────── */}
      <section style={{ padding: '4.5rem 0 6.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="In the News"
            action={
              <Link
                to="/news"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: '#5A5A7A', textDecoration: 'none', flexShrink: 0 }}
              >
                All articles
                <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
              </Link>
            }
          />

          {loadingNews ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-row" style={{ height: '68px', opacity: 1 - i * 0.14 }} />
              ))}
            </div>
          ) : (
            <>
              {news[0]         && <FeaturedArticle item={news[0]} />}
              {news.slice(1, 7).map(item => <NewsRow key={item.id} item={item} />)}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
