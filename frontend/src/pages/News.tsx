import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { api, type NewsItem } from '../lib/api';

export default function News() {
  const [news, setNews]       = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.getNews()
      .then(setNews)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3.5rem' }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.875rem' }}>Crypto Coverage</p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
            Latest News
          </h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#5A5A7A', transition: 'color 0.15s ease', display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#E8E8F0')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5A5A7A')}
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Column labels */}
      {!loading && !error && (
        <div
          className="hidden sm:flex items-center gap-4 md:gap-6"
          style={{ padding: '0 0 0.625rem', borderBottom: '1px solid #21213A' }}
        >
          <span className="section-label hidden sm:block" style={{ width: '7rem', flexShrink: 0 }}>Source</span>
          <span className="section-label flex-1">Headline</span>
          <span className="section-label hidden md:block" style={{ flexShrink: 0 }}>Time</span>
          <span style={{ width: '0.8125rem', flexShrink: 0 }} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-row" style={{ height: '56px', opacity: 1 - i * 0.09 }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ padding: '5rem 0', borderTop: '1px solid #21213A' }}>
          <p style={{ fontSize: '0.9375rem', color: '#5A5A7A' }}>
            Could not load articles.
          </p>
          <button
            onClick={load}
            style={{
              marginTop: '1.25rem',
              background: 'none',
              border: '1px solid #21213A',
              color: '#E8E8F0',
              borderRadius: '6px',
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Articles */}
      {!loading && !error && (
        <div>
          {news.map(item => <NewsCard key={item.id} {...item} />)}
        </div>
      )}
    </div>
  );
}
