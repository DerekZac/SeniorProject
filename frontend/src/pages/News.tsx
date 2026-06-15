import { useEffect, useState } from 'react';
import { Newspaper, RefreshCw } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { SkeletonNewsCard } from '../components/Skeleton';
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
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.12)' }}
          >
            <Newspaper size={18} style={{ color: '#00D4FF' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Latest Crypto News</h1>
            <p className="text-xs" style={{ color: '#5A5A7A' }}>Live headlines from around the crypto web</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg transition-all hover:bg-[#16162A] disabled:opacity-50"
          style={{ color: '#5A5A7A' }}
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonNewsCard key={i} />)}
        </div>
      )}

      {error && !loading && (
        <div
          className="rounded-xl py-20 text-center"
          style={{ background: '#16162A', border: '1px solid #21213A' }}
        >
          <Newspaper size={40} className="mx-auto mb-3 opacity-20" style={{ color: '#5A5A7A' }} />
          <p className="text-white font-medium mb-2">Could not load news</p>
          <button
            onClick={load}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style={{ background: '#F7931A', color: '#fff' }}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {news.map(item => <NewsCard key={item.id} {...item} />)}
        </div>
      )}
    </div>
  );
}
