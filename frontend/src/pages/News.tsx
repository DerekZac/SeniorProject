import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, Bookmark, ArrowUpRight, Clock } from 'lucide-react';
import { api, type NewsItem } from '../lib/api';
import { useSavedNews } from '../context/SavedNewsContext';

function SectionRule({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
      <span className="section-label">{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
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

function ArticleRow({
  title, source, timeAgo, url, saved, onToggleSave,
}: {
  title: string; source: string; timeAgo: string; url: string; saved: boolean; onToggleSave: () => void;
}) {
  return (
    <div className="data-row group flex items-baseline gap-4 md:gap-6" style={{ padding: '1.0625rem 0', borderBottom: '1px solid var(--border)' }}>
      <span className="section-label hidden sm:inline" style={{ width: '7rem', flexShrink: 0, lineHeight: 1.5 }}>{source}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="row-title flex-1 line-clamp-1 transition-colors duration-150" style={{ minWidth: 0, color: 'var(--text-strong)', textDecoration: 'none', fontSize: '0.9375rem', lineHeight: 1.4 }}>
        {title}
      </a>
      <span className="section-label hidden md:flex items-center gap-1" style={{ flexShrink: 0, lineHeight: 1 }}>
        <Clock size={11} /> {timeAgo}
      </span>
      <button
        onClick={onToggleSave}
        aria-label={saved ? 'Remove bookmark' : 'Save article'}
        title={saved ? 'Remove bookmark' : 'Save for later'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved ? '#F7931A' : 'var(--text-muted)', display: 'flex', flexShrink: 0 }}
      >
        <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexShrink: 0 }}>
        <ArrowUpRight size={13} className="transition-colors duration-150 group-hover:text-[#F7931A]" style={{ color: 'var(--border-hover)' }} />
      </a>
    </div>
  );
}

export default function News() {
  const [news, setNews]            = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoad] = useState(true);
  const [newsError, setNewsErr]    = useState(false);
  const [tab, setTab]              = useState<'all' | 'saved'>('all');
  const [sourceFilter, setSource]  = useState('all');
  const [query, setQuery]          = useState('');

  const { saved, isSaved, toggleSave, remove } = useSavedNews();

  const loadNews = () => {
    setNewsLoad(true);
    setNewsErr(false);
    api.getNews().then(setNews).catch(() => setNewsErr(true)).finally(() => setNewsLoad(false));
  };
  useEffect(() => { loadNews(); }, []);

  const sources = useMemo(() => [...new Set(news.map(n => n.source))].sort(), [news]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return news.filter(n =>
      (sourceFilter === 'all' || n.source === sourceFilter) &&
      (q === '' || n.title.toLowerCase().includes(q)),
    );
  }, [news, sourceFilter, query]);

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px',
    padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: 'var(--text)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.875rem' }}>Crypto Coverage</p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-strong)', lineHeight: 1 }}>
            Latest News
          </h1>
        </div>
        <button onClick={loadNews} disabled={newsLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-muted)', display: 'flex' }} title="Refresh">
          <RefreshCw size={16} className={newsLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {([['all', 'All news'], ['saved', `Saved (${saved.length})`]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              background: tab === id ? 'rgba(247,147,26,0.12)' : 'transparent',
              color: tab === id ? '#F7931A' : 'var(--text-muted)',
              border: `1px solid ${tab === id ? 'rgba(247,147,26,0.35)' : 'var(--border)'}`,
            }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter by coin or keyword…"
                style={{ ...selectStyle, width: '100%', paddingLeft: '2rem', boxSizing: 'border-box', cursor: 'text' }} />
            </div>
            <select value={sourceFilter} onChange={e => setSource(e.target.value)} style={selectStyle}>
              <option value="all">All sources</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <SectionRule label={`${filtered.length} article${filtered.length === 1 ? '' : 's'}`} />

          {newsLoading && <SkeletonRows count={10} />}
          {newsError && !newsLoading && (
            <div style={{ padding: '3rem 0', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>Could not load news articles.</p>
              <button onClick={loadNews} style={{ marginTop: '1rem', background: 'none', border: '1px solid var(--border)', color: 'var(--text-strong)', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button>
            </div>
          )}
          {!newsLoading && !newsError && filtered.length === 0 && (
            <div style={{ padding: '3rem 0', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>No articles match your filters.</p>
            </div>
          )}
          {!newsLoading && !newsError && filtered.map(item => (
            <ArticleRow key={item.id} {...item} saved={isSaved(item.url)} onToggleSave={() => toggleSave(item)} />
          ))}
        </>
      )}

      {tab === 'saved' && (
        <>
          <SectionRule label={`${saved.length} saved article${saved.length === 1 ? '' : 's'}`} />
          {saved.length === 0 ? (
            <div style={{ padding: '3rem 0', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>No saved articles yet. Tap the bookmark icon on any headline to save it for later.</p>
            </div>
          ) : (
            saved.map(s => (
              <ArticleRow key={s.url} title={s.title} source={s.source} timeAgo={s.timeAgo} url={s.url} saved onToggleSave={() => remove(s.url)} />
            ))
          )}
        </>
      )}
    </div>
  );
}
