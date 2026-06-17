import { useEffect, useState } from 'react';
import { RefreshCw, ArrowUpRight, Clock, MessageSquare } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import SentimentBadge from '../components/SentimentBadge';
import { api, type NewsItem, type RedditDiscussion } from '../lib/api';

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

function DiscussionRow({ title, subreddit, numComments, timeAgo, permalink, sentiment }: RedditDiscussion) {
  return (
    <a
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="data-row group flex items-center gap-4 md:gap-6"
      style={{ padding: '1rem 0', borderBottom: '1px solid #21213A', textDecoration: 'none' }}
    >
      {/* Community */}
      <span
        className="section-label hidden sm:inline"
        style={{ width: '8rem', flexShrink: 0 }}
      >
        {subreddit}
      </span>

      {/* Title */}
      <span
        className="row-title flex-1 line-clamp-1"
        style={{ fontSize: '0.9375rem', color: '#E8E8F0', minWidth: 0, transition: 'color 0.15s ease' }}
      >
        {title}
      </span>

      {/* Sentiment */}
      <div className="hidden sm:block" style={{ flexShrink: 0 }}>
        <SentimentBadge sentiment={sentiment} size="sm" />
      </div>

      {/* Stats */}
      <span
        className="section-label hidden md:flex items-center gap-2.5"
        style={{ flexShrink: 0 }}
      >
        <span className="flex items-center gap-1">
          <MessageSquare size={11} />
          {numComments > 999 ? `${(numComments / 1000).toFixed(1)}k` : numComments}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {timeAgo}
        </span>
      </span>

      {/* Arrow */}
      <ArrowUpRight
        size={13}
        className="flex-shrink-0 group-hover:text-[#F7931A] transition-colors duration-150"
        style={{ color: '#3A3A5A' }}
      />
    </a>
  );
}

export default function News() {
  const [news, setNews]             = useState<NewsItem[]>([]);
  const [discussions, setDiscuss]   = useState<RedditDiscussion[]>([]);
  const [newsLoading, setNewsLoad]  = useState(true);
  const [discLoading, setDiscLoad]  = useState(true);
  const [newsError, setNewsErr]     = useState(false);
  const [discError, setDiscErr]     = useState(false);

  const loadNews = () => {
    setNewsLoad(true);
    setNewsErr(false);
    api.getNews()
      .then(setNews)
      .catch(() => setNewsErr(true))
      .finally(() => setNewsLoad(false));
  };

  const loadDiscussions = () => {
    setDiscLoad(true);
    setDiscErr(false);
    api.getRedditDiscussions()
      .then(setDiscuss)
      .catch(() => setDiscErr(true))
      .finally(() => setDiscLoad(false));
  };

  const loadAll = () => { loadNews(); loadDiscussions(); };

  useEffect(() => { loadAll(); }, []);

  const loading = newsLoading && discLoading;

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem' }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.875rem' }}>Crypto Coverage</p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
            News & Discussions
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#5A5A7A', marginTop: '0.75rem' }}>
            Press from trusted outlets · Reddit community sentiment
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#5A5A7A', display: 'flex', alignItems: 'center' }}
          className="transition-colors duration-150 hover:text-[#E8E8F0]"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Trusted News ──────────────────────────────────────────── */}
      <div style={{ marginBottom: '5rem' }}>
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

        {newsLoading && <SkeletonRows count={8} />}

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
            <p style={{ fontSize: '0.9375rem', color: '#5A5A7A' }}>No trusted articles available right now.</p>
          </div>
        )}

        {!newsLoading && !newsError && news.length > 0 && (
          <div>
            {news.map(item => <NewsCard key={item.id} {...item} />)}
          </div>
        )}
      </div>

      {/* ── Reddit Discussions ────────────────────────────────────── */}
      <div>
        <SectionRule label="Reddit Discussions" />

        {/* Column labels */}
        {!discLoading && !discError && discussions.length > 0 && (
          <div
            className="hidden sm:flex items-center gap-4 md:gap-6"
            style={{ padding: '0 0 0.625rem', borderBottom: '1px solid #21213A' }}
          >
            <span className="section-label hidden sm:block" style={{ width: '8rem', flexShrink: 0 }}>Community</span>
            <span className="section-label flex-1">Discussion</span>
            <span className="section-label hidden sm:block" style={{ flexShrink: 0 }}>Signal</span>
            <span className="section-label hidden md:block" style={{ flexShrink: 0 }}>Activity</span>
            <span style={{ width: '0.8125rem', flexShrink: 0 }} />
          </div>
        )}

        {discLoading && <SkeletonRows count={8} />}

        {discError && !discLoading && (
          <div style={{ padding: '3rem 0', borderTop: '1px solid #21213A' }}>
            <p style={{ fontSize: '0.9375rem', color: '#5A5A7A' }}>Could not load Reddit discussions.</p>
            <button
              onClick={loadDiscussions}
              style={{ marginTop: '1rem', background: 'none', border: '1px solid #21213A', color: '#E8E8F0', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Try again
            </button>
          </div>
        )}

        {!discLoading && !discError && discussions.length === 0 && (
          <div style={{ padding: '3rem 0', borderTop: '1px solid #21213A' }}>
            <p style={{ fontSize: '0.9375rem', color: '#5A5A7A' }}>No discussions available right now.</p>
          </div>
        )}

        {!discLoading && !discError && discussions.length > 0 && (
          <div>
            {discussions.map(d => <DiscussionRow key={d.id} {...d} />)}
          </div>
        )}
      </div>

    </div>
  );
}
