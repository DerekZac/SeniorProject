import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { api, type NewsItem } from '../lib/api';

function SectionRule({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
      <span className="section-label">{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#21213A' }} />
    </div>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ height: '52px', opacity: 1 - i * 0.08 }} />
      ))}
    </div>
  );
}

export default function News() {
  const [news, setNews]            = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoad] = useState(true);
  const [newsError, setNewsErr]    = useState(false);

  const loadNews = () => {
    setNewsLoad(true);
    setNewsErr(false);
    api.getNews()
      .then(setNews)
      .catch(() => setNewsErr(true))
      .finally(() => setNewsLoad(false));
  };

  useEffect(() => { loadNews(); }, []);

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem' }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.875rem' }}>Crypto Coverage</p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
            Latest News
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#5A5A7A', marginTop: '0.75rem' }}>
            Headlines from CoinDesk, CoinTelegraph, Decrypt, Blockworks, and more.
          </p>
        </div>
        <button
          onClick={loadNews}
          disabled={newsLoading}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#5A5A7A', display: 'flex', alignItems: 'center' }}
          className="transition-colors duration-150 hover:text-[#E8E8F0]"
          title="Refresh"
        >
          <RefreshCw size={16} className={newsLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Trusted News ──────────────────────────────────────────── */}
      <div>
        <SectionRule label="Trusted News" />

        {/* Column labels */}
        {!newsLoading && !newsError && news.length > 0 && (
          <div
            className="hidden sm:flex items-center gap-4 md:gap-6"
            style={{ padding: '0 0 0.625rem', borderBottom: '1px solid #21213A' }}
          >
            <span className="section-label" style={{ width: '7rem', flexShrink: 0 }}>Source</span>
            <span className="section-label flex-1">Headline</span>
            <span className="section-label hidden md:block" style={{ flexShrink: 0 }}>Time</span>
            <span style={{ width: '0.8125rem', flexShrink: 0 }} />
          </div>
        )}

        {newsLoading && <SkeletonRows count={10} />}

        {newsError && !newsLoading && (
          <div style={{ padding: '3rem 0', borderTop: '1px solid #21213A' }}>
            <p style={{ fontSize: '0.9375rem', color: '#5A5A7A' }}>Could not load news articles.</p>
            <button
              onClick={loadNews}
              style={{ marginTop: '1rem', background: 'none', border: '1px solid #21213A', color: '#E8E8F0', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Try again
            </button>
          </div>
        )}

        {!newsLoading && !newsError && news.length === 0 && (
          <div style={{ padding: '3rem 0', borderTop: '1px solid #21213A' }}>
            <p style={{ fontSize: '0.9375rem', color: '#5A5A7A' }}>No articles available right now.</p>
          </div>
        )}

        {!newsLoading && !newsError && news.length > 0 && (
          <div>
            {news.map(item => <NewsCard key={item.id} {...item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
