import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SentimentBadge from '../components/SentimentBadge';
import { SkeletonResultPage } from '../components/Skeleton';
import { api, type CoinSentimentResult } from '../lib/api';
import { useApp } from '../context/AppContext';

const PLAIN_LANGUAGE: Record<string, string> = {
  Bullish: 'Reddit is mostly positive about this coin right now. More posts express optimism, buying intent, or price targets than pessimism.',
  Bearish: 'Reddit sentiment leans negative. More posts express concern, selling intent, or price fears than optimism.',
  Mixed:   'Reddit is split on this coin. Bullish and bearish signals are roughly balanced — the market may be uncertain.',
};

const COLORS = {
  bullish: '#00E676',
  bearish: '#FF3355',
  mixed:   '#FFB020',
};

function aiColor(classification: string) {
  if (classification === 'Bullish') return '#00E676';
  if (classification === 'Bearish') return '#FF3355';
  return '#FFB020';
}

export default function Results() {
  const { coin } = useParams<{ coin: string }>();
  const [data, setData]       = useState<CoinSentimentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { isWatchlisted, toggleWatchlist } = useApp();

  useEffect(() => {
    setLoading(true);
    setData(null);
    api.getCoinSentiment(coin ?? 'bitcoin').then(d => {
      setData(d);
      setLoading(false);
    });
  }, [coin]);

  if (loading) return <SkeletonResultPage />;
  if (!data)   return null;

  const { name, ticker, sentiment, confidence, price, change, keywords, subredditBreakdown, aiSentiment } = data;
  const up             = change >= 0;
  const sentimentColor = sentiment === 'Bullish' ? COLORS.bullish : sentiment === 'Bearish' ? COLORS.bearish : COLORS.mixed;
  const watchlisted    = isWatchlisted(ticker);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-4">

      {/* Verdict card */}
      <div
        className="rounded-2xl p-6 md:p-8 text-center relative"
        style={{ background: '#16162A', border: '1px solid #21213A' }}
      >
        <button
          onClick={() => toggleWatchlist(ticker)}
          className="absolute top-5 right-5 p-2 rounded-lg transition-all"
          style={{
            background: watchlisted ? 'rgba(255,176,32,0.10)' : 'transparent',
            border:     `1px solid ${watchlisted ? 'rgba(255,176,32,0.35)' : '#21213A'}`,
            color:      watchlisted ? '#FFB020' : '#5A5A7A',
          }}
        >
          <Star size={17} fill={watchlisted ? 'currentColor' : 'none'} />
        </button>

        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#5A5A7A' }}>
          Sentiment Verdict — {name} ({ticker})
        </p>

        <div className="mb-5">
          <SentimentBadge sentiment={sentiment} size="lg" />
        </div>

        <div className="flex items-center justify-center gap-10 mb-6">
          <div>
            <div className="text-3xl font-bold text-white">{price}</div>
            <div className={`text-sm font-medium mt-0.5 ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
              {up ? '+' : ''}{change}% (24h)
            </div>
          </div>
          <div className="w-px h-12 bg-[#21213A]" />
          <div>
            <div className="text-3xl font-bold" style={{ color: sentimentColor }}>{confidence}%</div>
            <div className="text-sm mt-0.5" style={{ color: '#5A5A7A' }}>Confidence</div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="max-w-sm mx-auto mb-5">
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: '#21213A' }}>
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${confidence}%`, background: sentimentColor }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1.5" style={{ color: '#5A5A7A' }}>
            <span>Bearish</span>
            <span className="font-medium" style={{ color: sentimentColor }}>Confidence</span>
            <span>Bullish</span>
          </div>
        </div>

        <p
          className="text-sm max-w-md mx-auto rounded-xl px-4 py-3"
          style={{ color: '#5A5A7A', background: 'rgba(33,33,58,0.5)' }}
        >
          {PLAIN_LANGUAGE[sentiment]}
        </p>
      </div>

      {/* AI Sentiment Card */}
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

      {/* Keywords */}
      <div
        className="rounded-xl p-5 md:p-6"
        style={{ background: '#16162A', border: '1px solid #21213A' }}
      >
        <h2 className="text-white font-semibold mb-5">Top Keywords in Reddit Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#00E676' }}>
              Bullish Signals
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.bullish.map(kw => (
                <span
                  key={kw}
                  className="text-sm px-3.5 py-1.5 rounded-full font-medium"
                  style={{ color: '#00E676', background: 'rgba(0,230,118,0.09)', border: '1px solid rgba(0,230,118,0.22)' }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF3355' }}>
              Bearish Signals
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.bearish.map(kw => (
                <span
                  key={kw}
                  className="text-sm px-3.5 py-1.5 rounded-full font-medium"
                  style={{ color: '#FF3355', background: 'rgba(255,51,85,0.09)', border: '1px solid rgba(255,51,85,0.22)' }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subreddit breakdown */}
      <div
        className="rounded-xl p-5 md:p-6"
        style={{ background: '#16162A', border: '1px solid #21213A' }}
      >
        <h2 className="text-white font-semibold mb-5">Subreddit Breakdown</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={subredditBreakdown} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" domain={[0, 100]} stroke="#5A5A7A" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis type="category" dataKey="subreddit" stroke="#5A5A7A" tick={{ fontSize: 11 }} width={140} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0F0F1A', border: '1px solid #21213A', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              formatter={(v: number) => [`${v}%`, 'Score']}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {subredditBreakdown.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.score >= 60 ? '#00E676' : entry.score >= 45 ? '#FFB020' : '#FF3355'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

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