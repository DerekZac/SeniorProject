import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Store } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import TickerStrip from '../components/TickerStrip';
import { api, type Coin, type NewsItem } from '../lib/api';
import { GUIDES } from '../lib/learnData';
import { EXCHANGES } from '../lib/exchangeData';

function SectionRule({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.75rem' }}>
      <span className="section-label">{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--bg-surface)' }} />
      {action}
    </div>
  );
}

function CoinRow({ coin }: { coin: Coin }) {
  const navigate = useNavigate();
  const up       = coin.change >= 0;

  return (
    <div
      className="data-row group flex items-center gap-3"
      style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
      onClick={() => navigate(`/results/${coin.ticker.toLowerCase()}`)}
    >
      <span
        className="row-title num transition-colors duration-150"
        style={{ width: '3.25rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-strong)', flexShrink: 0 }}
      >
        {coin.ticker}
      </span>
      <span className="flex-1 truncate" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        {coin.name}
      </span>
      <span className="num" style={{ fontSize: '0.875rem', color: 'var(--text-strong)', flexShrink: 0 }}>
        {coin.price}
      </span>
      <span
        className="num"
        style={{ width: '3.75rem', textAlign: 'right', fontSize: '0.8125rem', color: up ? '#00E676' : '#FF3355', flexShrink: 0 }}
      >
        {up ? '+' : ''}{coin.change}%
      </span>
      <ArrowUpRight size={12} style={{ color: 'var(--border-hover)', flexShrink: 0 }} className="group-hover:text-[#F7931A] transition-colors duration-150" />
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
      style={{ display: 'block', textDecoration: 'none', padding: '2rem 0', borderBottom: '1px solid var(--border)' }}
    >
      <p className="section-label" style={{ marginBottom: '1rem' }}>
        {item.source} · {item.timeAgo}
      </p>
      <h3
        style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, lineHeight: 1.22, letterSpacing: '-0.02em', color: 'var(--text-strong)', maxWidth: '54ch', transition: 'color 0.15s ease' }}
        className="group-hover:text-[#F7931A] transition-colors"
      >
        {item.title}
      </h3>
      <div
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 500, transition: 'color 0.15s ease' }}
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
      style={{ padding: '1.0625rem 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
    >
      <span className="section-label hidden sm:inline" style={{ width: '7rem', flexShrink: 0 }}>{item.source}</span>
      <span
        className="row-title flex-1 line-clamp-1 transition-colors duration-150"
        style={{ fontSize: '0.9375rem', color: 'var(--text-strong)', lineHeight: 1.4, minWidth: 0 }}
      >
        {item.title}
      </span>
      <span className="section-label hidden md:block" style={{ flexShrink: 0 }}>{item.timeAgo}</span>
      <ArrowUpRight size={13} className="flex-shrink-0 transition-colors duration-150 group-hover:text-[#F7931A]" style={{ color: 'var(--border-hover)' }} />
    </a>
  );
}

const FEATURED_GUIDES = GUIDES.slice(0, 3);
const FEATURED_EXCHANGES = EXCHANGES.filter(e => e.tag === 'popular').slice(0, 3);

export default function Home() {
  const [coins, setCoins]               = useState<Coin[]>([]);
  const [news, setNews]                 = useState<NewsItem[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [loadingNews, setLoadingNews]   = useState(true);

  useEffect(() => {
    api.getTrending().then(setCoins).finally(() => setLoadingCoins(false));
    api.getNews().then(setNews).finally(() => setLoadingNews(false));
  }, []);

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
                Your Crypto Intelligence Hub
              </p>
              <h1 className="hero-display" style={{ marginBottom: '2.75rem' }}>
                Everything Crypto,<br />One Place.
              </h1>
              <p
                style={{ fontSize: '1.0625rem', lineHeight: 1.74, color: 'var(--text)', paddingLeft: '1.25rem', borderLeft: '2px solid var(--border)', maxWidth: '40ch' }}
              >
                Live prices, trusted news, exchange reviews, regulatory guides, and educational resources — built for everyone from beginners to experienced traders.
              </p>
            </div>

            {/* Right — search */}
            <div>
              <p className="section-label" style={{ marginBottom: '1rem' }}>
                Search any coin for live market data
              </p>
              <SearchBar large />
              <div style={{ marginTop: '1.75rem' }}>
                <p className="section-label" style={{ marginBottom: '0.75rem' }}>
                  Popular coins
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {['Bitcoin', 'Ethereum', 'Solana', 'XRP'].map(c => (
                    <Link
                      key={c}
                      to={`/results/${c.toLowerCase()}`}
                      className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                      style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}
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

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── Market Overview ────────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="Market Overview"
            action={
              <Link
                to="/compare"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none', flexShrink: 0 }}
              >
                Compare coins
                <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
              </Link>
            }
          />

          {loadingCoins ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-row" style={{ height: '52px', opacity: 1 - i * 0.11 }} />
              ))}
            </div>
          ) : (
            <>
              <div
                className="hidden md:flex items-center gap-3"
                style={{ padding: '0 0 0.625rem', borderBottom: '1px solid #21213A' }}
              >
                <span className="section-label" style={{ width: '3.25rem', flexShrink: 0 }}>Coin</span>
                <span className="section-label flex-1">Name</span>
                <span className="section-label">Price</span>
                <span className="section-label" style={{ width: '3.75rem', textAlign: 'right' }}>24h</span>
                <span style={{ width: '0.75rem', flexShrink: 0 }} />
              </div>
              {coins.map(coin => <CoinRow key={coin.ticker} coin={coin} />)}
            </>
          )}
        </div>
      </section>

      <div style={{ borderTop: '1px solid #21213A' }} />

      {/* ── Start Learning ─────────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="Start Learning"
            action={
              <Link
                to="/learn"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: '#5A5A7A', textDecoration: 'none', flexShrink: 0 }}
              >
                All guides
                <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_GUIDES.map(guide => (
              <Link
                key={guide.id}
                to={`/learn#${guide.id}`}
                style={{ textDecoration: 'none', display: 'block', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}
                className="group transition-all hover:border-[rgba(247,147,26,0.3)]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <BookOpen size={15} style={{ color: '#F7931A', flexShrink: 0 }} />
                  <span className="section-label" style={{ color: 'var(--signin-color)' }}>{guide.readTime}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '0.5rem', lineHeight: 1.3 }}
                  className="group-hover:text-[#F7931A] transition-colors"
                >
                  {guide.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}
                  className="line-clamp-2"
                >
                  {guide.summary}
                </p>
                <div className="flex items-center gap-1 mt-3" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Read guide <ArrowUpRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── Where to Buy ────────────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="Where to Buy"
            action={
              <Link
                to="/exchanges"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none', flexShrink: 0 }}
              >
                Compare all exchanges
                <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_EXCHANGES.map(ex => (
              <a
                key={ex.id}
                href={ex.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}
                className="group transition-all hover:border-[rgba(247,147,26,0.3)]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '2rem', height: '2rem', background: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.25)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#F7931A', flexShrink: 0 }}>
                    {ex.logo}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-strong)' }} className="group-hover:text-[#F7931A] transition-colors">{ex.name}</span>
                  <Store size={12} style={{ color: 'var(--border-hover)', marginLeft: 'auto' }} className="group-hover:text-[#F7931A] transition-colors" />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{ex.bestFor}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maker <span style={{ color: 'var(--text-strong)' }}>{ex.fees.maker}</span></span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Taker <span style={{ color: 'var(--text-strong)' }}>{ex.fees.taker}</span></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── In the News ──────────────────────────── */}
      <section style={{ padding: '4.5rem 0 6.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="In the News"
            action={
              <Link
                to="/news"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none', flexShrink: 0 }}
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
