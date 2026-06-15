import { useState } from 'react';
import { Search, Loader2, BarChart2 } from 'lucide-react';
import SentimentBadge from '../components/SentimentBadge';
import { api, type CoinSentimentResult } from '../lib/api';

function SentimentBar({ score }: { score: number }) {
  const color = score >= 60 ? '#00E676' : score >= 45 ? '#FFB020' : '#FF3355';
  return (
    <div className="w-full rounded-full h-1.5 mt-1" style={{ background: '#21213A' }}>
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

interface ColState {
  loading: boolean;
  data: CoinSentimentResult | null;
  error: string | null;
}

const EMPTY_COL: ColState = { loading: false, data: null, error: null };

export default function Compare() {
  const [inputs, setInputs] = useState(['Bitcoin', 'Ethereum']);
  const [cols, setCols]     = useState<[ColState, ColState]>([EMPTY_COL, EMPTY_COL]);

  const handleCompare = async () => {
    if (!inputs[0].trim() || !inputs[1].trim()) return;
    setCols([
      { loading: true, data: null, error: null },
      { loading: true, data: null, error: null },
    ]);
    const results = await Promise.allSettled([
      api.getCoinSentiment(inputs[0].trim()),
      api.getCoinSentiment(inputs[1].trim()),
    ]);
    setCols(
      results.map(r =>
        r.status === 'fulfilled'
          ? { loading: false, data: r.value, error: null }
          : { loading: false, data: null, error: 'Could not load data. Try a different coin name.' }
      ) as [ColState, ColState]
    );
  };

  const anyLoading  = cols.some(c => c.loading);
  const showResults = cols.some(c => c.data !== null || c.error !== null);

  const cardStyle = { background: '#16162A', border: '1px solid #21213A' };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-1">Compare Coins</h1>
      <p className="text-sm mb-8" style={{ color: '#5A5A7A' }}>
        Pit two cryptocurrencies side-by-side by live Reddit sentiment
      </p>

      {/* Inputs */}
      <div className="rounded-xl p-5 mb-8" style={cardStyle}>
        <div className="flex gap-4 flex-wrap items-center">
          {([0, 1] as const).map(i => (
            <div key={i} className="flex-1 min-w-[180px] relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5A5A7A' }} />
              <input
                value={inputs[i]}
                onChange={e => setInputs(prev => { const n = [...prev] as [string, string]; n[i] = e.target.value; return n; })}
                onKeyDown={e => e.key === 'Enter' && handleCompare()}
                placeholder={i === 0 ? 'First coin…' : 'Second coin…'}
                className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: '#0F0F1A',
                  border: '1px solid #21213A',
                  color: '#ffffff',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(247,147,26,0.5)')}
                onBlur={e  => (e.target.style.borderColor = '#21213A')}
              />
            </div>
          ))}
          <div className="text-sm font-bold px-2" style={{ color: '#5A5A7A' }}>VS</div>
          <button
            onClick={handleCompare}
            disabled={anyLoading}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center gap-2"
            style={{ background: '#F7931A' }}
          >
            {anyLoading && <Loader2 size={14} className="animate-spin" />}
            {anyLoading ? 'Analyzing…' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!showResults && !anyLoading && (
        <div className="text-center py-20" style={{ color: '#5A5A7A' }}>
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Enter two coins above and click Compare to see live sentiment analysis</p>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cols.map((col, i) => (
            <div key={i} className="rounded-xl p-5 md:p-6" style={cardStyle}>
              {col.loading && (
                <div className="flex items-center justify-center h-40">
                  <Loader2 size={28} className="animate-spin" style={{ color: '#F7931A' }} />
                </div>
              )}
              {col.error && (
                <div className="flex items-center justify-center h-40">
                  <p className="text-sm text-center" style={{ color: '#FF3355' }}>{col.error}</p>
                </div>
              )}
              {col.data && <CoinColumn data={col.data} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoinColumn({ data }: { data: CoinSentimentResult }) {
  const { name, ticker, price, change, sentiment, confidence, keywords, subredditBreakdown } = data;
  const up       = change >= 0;
  const sentColor = sentiment === 'Bullish' ? '#00E676' : sentiment === 'Bearish' ? '#FF3355' : '#FFB020';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-white">{name}</h2>
          <span className="text-sm" style={{ color: '#5A5A7A' }}>{ticker}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">{price}</span>
          <span className={`text-sm font-medium ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
            {up ? '+' : ''}{change}%
          </span>
        </div>
      </div>

      <div>
        <SentimentBadge sentiment={sentiment} confidence={confidence} size="md" />
        <div className="mt-3 w-full rounded-full h-2 overflow-hidden" style={{ background: '#21213A' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${confidence}%`, background: sentColor }} />
        </div>
        <p className="text-xs mt-1" style={{ color: '#5A5A7A' }}>{confidence}% confidence</p>
      </div>

      {keywords.bullish.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#5A5A7A' }}>Top Keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.bullish.slice(0, 4).map(kw => (
              <span key={kw} className="text-xs px-2.5 py-1 rounded-full" style={{ color: '#00E676', background: 'rgba(0,230,118,0.09)', border: '1px solid rgba(0,230,118,0.22)' }}>{kw}</span>
            ))}
            {keywords.bearish.slice(0, 3).map(kw => (
              <span key={kw} className="text-xs px-2.5 py-1 rounded-full" style={{ color: '#FF3355', background: 'rgba(255,51,85,0.09)', border: '1px solid rgba(255,51,85,0.22)' }}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      {subredditBreakdown.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#5A5A7A' }}>Subreddit Breakdown</p>
          <div className="flex flex-col gap-2.5">
            {subredditBreakdown.map(s => {
              const color = s.score >= 60 ? '#00E676' : s.score >= 45 ? '#FFB020' : '#FF3355';
              return (
                <div key={s.subreddit}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#5A5A7A' }}>{s.subreddit}</span>
                    <span style={{ color }} className="font-medium">{s.score}%</span>
                  </div>
                  <SentimentBar score={s.score} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
