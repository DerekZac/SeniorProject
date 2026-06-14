import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import SentimentBadge from "../components/SentimentBadge";
import { api, type CoinSentimentResult } from "../lib/api";

function SentimentBar({ score }: { score: number }) {
  const color = score >= 60 ? "#00C896" : score >= 45 ? "#FFB830" : "#FF4D4D";
  return (
    <div className="w-full bg-[#2A2D3A] rounded-full h-1.5 mt-1">
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
  const [inputs, setInputs] = useState(["Bitcoin", "Ethereum"]);
  const [cols, setCols] = useState<[ColState, ColState]>([EMPTY_COL, EMPTY_COL]);

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
        r.status === "fulfilled"
          ? { loading: false, data: r.value, error: null }
          : { loading: false, data: null, error: "Could not load data. Try a different coin name." }
      ) as [ColState, ColState]
    );
  };

  const anyLoading = cols.some(c => c.loading);
  const showResults = cols.some(c => c.data !== null || c.error !== null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Compare Coins</h1>
      <p className="text-[#8A8FA8] text-sm mb-8">Pit two cryptocurrencies side-by-side by live Reddit sentiment</p>

      {/* Inputs */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-8">
        <div className="flex gap-4 flex-wrap items-center">
          {[0, 1].map(i => (
            <div key={i} className="flex-1 min-w-[180px] relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FA8]" />
              <input
                value={inputs[i]}
                onChange={e => setInputs(prev => { const n = [...prev] as [string, string]; n[i] = e.target.value; return n; })}
                onKeyDown={e => e.key === "Enter" && handleCompare()}
                placeholder={i === 0 ? "First coin…" : "Second coin…"}
                className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
              />
            </div>
          ))}
          <div className="text-[#8A8FA8] font-bold text-sm px-2">VS</div>
          <button
            onClick={handleCompare}
            disabled={anyLoading}
            className="bg-[#4B6BFB] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {anyLoading && <Loader2 size={14} className="animate-spin" />}
            {anyLoading ? "Analyzing…" : "Compare"}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!showResults && !anyLoading && (
        <div className="text-center py-20 text-[#8A8FA8]">
          <BarChartIcon />
          <p className="mt-3">Enter two coins above and click Compare to see live sentiment analysis</p>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cols.map((col, i) => (
            <div key={i} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
              {col.loading && (
                <div className="flex items-center justify-center h-40">
                  <Loader2 size={28} className="animate-spin text-[#4B6BFB]" />
                </div>
              )}
              {col.error && (
                <div className="flex items-center justify-center h-40">
                  <p className="text-[#FF4D4D] text-sm text-center">{col.error}</p>
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
  const changePositive = change >= 0;
  const sentColor = sentiment === "Bullish" ? "#00C896" : sentiment === "Bearish" ? "#FF4D4D" : "#FFB830";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-white">{name}</h2>
          <span className="text-[#8A8FA8] text-sm">{ticker}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">{price}</span>
          <span className={`text-sm font-medium ${changePositive ? "text-[#00C896]" : "text-[#FF4D4D]"}`}>
            {changePositive ? "+" : ""}{change}%
          </span>
        </div>
      </div>

      {/* Sentiment + confidence bar */}
      <div>
        <SentimentBadge sentiment={sentiment} confidence={confidence} size="md" />
        <div className="mt-3 w-full bg-[#2A2D3A] rounded-full h-2">
          <div className="h-2 rounded-full transition-all" style={{ width: `${confidence}%`, background: sentColor }} />
        </div>
        <p className="text-[#8A8FA8] text-xs mt-1">{confidence}% confidence</p>
      </div>

      {/* Keywords */}
      {keywords.bullish.length > 0 && (
        <div>
          <p className="text-[#8A8FA8] text-xs font-semibold mb-2 uppercase tracking-widest">Top Keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.bullish.slice(0, 4).map(kw => (
              <span key={kw} className="bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/30 text-xs px-2.5 py-1 rounded-full">{kw}</span>
            ))}
            {keywords.bearish.slice(0, 3).map(kw => (
              <span key={kw} className="bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30 text-xs px-2.5 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Subreddit breakdown */}
      {subredditBreakdown.length > 0 && (
        <div>
          <p className="text-[#8A8FA8] text-xs font-semibold mb-3 uppercase tracking-widest">Subreddit Breakdown</p>
          <div className="flex flex-col gap-2.5">
            {subredditBreakdown.map(s => {
              const color = s.score >= 60 ? "#00C896" : s.score >= 45 ? "#FFB830" : "#FF4D4D";
              return (
                <div key={s.subreddit}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8A8FA8]">{s.subreddit}</span>
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

function BarChartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto opacity-30" stroke="#8A8FA8" strokeWidth="1.5">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="4" width="4" height="17" rx="1" />
    </svg>
  );
}
