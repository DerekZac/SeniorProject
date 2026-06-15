import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUp, ExternalLink, Flame, Star } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import SentimentBadge from '../components/SentimentBadge';
import { SkeletonResultPage } from '../components/Skeleton';
import { api, type CoinSentimentResult } from '../lib/api';
import { useApp } from '../context/AppContext';

type SortMode = 'hot' | 'new';

export default function CoinDetail() {
  const { coin } = useParams<{ coin: string }>();
  const [data, setData]       = useState<CoinSentimentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort]       = useState<SortMode>('hot');
  const { isWatchlisted, toggleWatchlist } = useApp();

  useEffect(() => {
    setLoading(true);
    api.getCoinSentiment(coin ?? 'bitcoin').then(d => {
      setData(d);
      setLoading(false);
    });
  }, [coin]);

  if (loading) return <SkeletonResultPage />;
  if (!data)   return null;

  const { name, ticker, sentiment, confidence, price, change, sentimentHistory, posts, topPost } = data;
  const up          = change >= 0;
  const watchlisted = isWatchlisted(ticker);

  const sortedPosts = sort === 'hot'
    ? [...posts].sort((a, b) => b.upvotes - a.upvotes)
    : [...posts].sort((a, b) => a.id - b.id);

  const cardStyle = { background: '#16162A', border: '1px solid #21213A' };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-4">

      {/* Header */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">{name}</h1>
              <span className="text-lg font-medium" style={{ color: '#5A5A7A' }}>{ticker}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{price}</span>
              <span className={`font-medium ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
                {up ? '+' : ''}{change}% (24h)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SentimentBadge sentiment={sentiment} confidence={confidence} size="lg" />
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
      </div>

      {/* 7-Day Sentiment History */}
      <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
        <h2 className="text-white font-semibold mb-1">Sentiment History — Last 7 Days</h2>
        <p className="text-xs mb-4" style={{ color: '#5A5A7A' }}>Score 0–100 where 100 = maximum bullish</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={sentimentHistory} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21213A" />
            <XAxis dataKey="day" stroke="#5A5A7A" tick={{ fontSize: 12 }} />
            <YAxis stroke="#5A5A7A" tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#16162A', border: '1px solid #21213A', borderRadius: '8px', color: '#fff' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#F7931A' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#F7931A"
              strokeWidth={2.5}
              dot={{ fill: '#F7931A', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#F7931A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Post */}
      {topPost && (
        <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} style={{ color: '#F7931A' }} />
            <h2 className="text-white font-semibold">Most Upvoted Reddit Post</h2>
          </div>
          <div
            className="rounded-lg p-4 transition-colors"
            style={{ border: '1px solid #21213A' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(247,147,26,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#21213A')}
          >
            <p className="text-white font-medium mb-3 leading-relaxed">{topPost.title}</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-sm" style={{ color: '#5A5A7A' }}>
                <span className="flex items-center gap-1.5 font-medium" style={{ color: '#00E676' }}>
                  <ArrowUp size={14} />
                  {topPost.upvotes.toLocaleString()} upvotes
                </span>
                <span style={{ color: '#F7931A' }}>{topPost.subreddit}</span>
                <span>{topPost.timeAgo}</span>
              </div>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: '#F7931A' }}
              >
                View on Reddit <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Post Feed */}
      <div className="rounded-xl p-5 md:p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Reddit Posts</h2>
          <div className="flex gap-2">
            {(['hot', 'new'] as SortMode[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize"
                style={{
                  background: sort === s ? '#F7931A' : 'transparent',
                  color:      sort === s ? '#fff' : '#5A5A7A',
                  border:     `1px solid ${sort === s ? '#F7931A' : '#21213A'}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {sortedPosts.map(post => (
            <div
              key={post.id}
              className="rounded-lg p-4 transition-colors"
              style={{ border: '1px solid #21213A' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(247,147,26,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#21213A')}
            >
              <p className="text-white text-sm mb-3 leading-relaxed">{post.title}</p>
              <div className="flex items-center gap-4 text-xs" style={{ color: '#5A5A7A' }}>
                <span className="flex items-center gap-1"><ArrowUp size={12} />{post.upvotes.toLocaleString()}</span>
                <span style={{ color: '#F7931A' }}>{post.subreddit}</span>
                <span>{post.timeAgo}</span>
                <span className="ml-auto">
                  <SentimentBadge sentiment={post.sentiment} size="sm" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        to={`/results/${coin}`}
        className="inline-block text-sm transition-colors hover:text-white"
        style={{ color: '#5A5A7A' }}
      >
        ← Back to Search Results
      </Link>
    </div>
  );
}
