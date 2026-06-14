import { useState } from "react";
import { Search } from "lucide-react";
import SentimentBadge from "../components/SentimentBadge";
import { mockKeywords, mockSubredditBreakdown } from "../lib/mockData";
import type { Sentiment } from "../lib/api";

interface ColData {
  sentiment: Sentiment;
  confidence: number;
  price: string;
  change: number;
  keywords: string[];
  subreddits: typeof mockSubredditBreakdown;
}

const COIN_DATA: Array<{ id: string; defaultName: string; defaultData: ColData }> = [
  {
    id: "coin1",
    defaultName: "Bitcoin",
    defaultData: {
      sentiment: "Bullish",
      confidence: 87,
      price: "$67,234",
      change: 2.4,
      keywords: mockKeywords.bullish.slice(0, 5),
      subreddits: mockSubredditBreakdown,
    },
  },
  {
    id: "coin2",
    defaultName: "Ethereum",
    defaultData: {
      sentiment: "Mixed",
      confidence: 62,
      price: "$3,456",
      change: -1.2,
      keywords: ["upgrade", "staking", "layer2", "defi", "gas"],
      subreddits: mockSubredditBreakdown.map(s => ({ ...s, score: Math.max(20, s.score - 20) })),
    },
  },
];

function SentimentBar({ score }: { score: number }) {
  const color = score >= 60 ? "#00C896" : score >= 45 ? "#FFB830" : "#FF4D4D";
  return (
    <div className="w-full bg-[#2A2D3A] rounded-full h-1.5 mt-1">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

export default function Compare() {
  const [names, setNames] = useState(["Bitcoin", "Ethereum"]);
  const [compared, setCompared] = useState(false);

  const handleCompare = () => {
    if (names[0].trim() && names[1].trim()) setCompared(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Compare Coins</h1>
      <p className="text-[#8A8FA8] text-sm mb-8">Pit two cryptocurrencies side-by-side by Reddit sentiment</p>

      {/* Search inputs */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-8">
        <div className="flex gap-4 flex-wrap items-center">
          {[0, 1].map(i => (
            <div key={i} className="flex-1 min-w-[180px] relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FA8]" />
              <input
                value={names[i]}
                onChange={e => setNames(prev => { const n = [...prev]; n[i] = e.target.value; return n; })}
                placeholder={i === 0 ? "First coin..." : "Second coin..."}
                className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
              />
            </div>
          ))}
          <div className="text-[#8A8FA8] font-bold text-sm px-2">VS</div>
          <button
            onClick={handleCompare}
            className="bg-[#4B6BFB] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors"
          >
            Compare
          </button>
        </div>
      </div>

      {!compared && (
        <div className="text-center py-20 text-[#8A8FA8]">
          <BarChartIcon />
          <p className="mt-3">Enter two coins above and click Compare to see side-by-side sentiment analysis</p>
        </div>
      )}

      {compared && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COIN_DATA.map((col, i) => {
            const d = col.defaultData;
            const changePositive = d.change >= 0;
            return (
              <div key={col.id} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 flex flex-col gap-5">
                {/* Coin header */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{names[i] || col.defaultName}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">{d.price}</span>
                    <span className={`text-sm font-medium ${changePositive ? "text-[#00C896]" : "text-[#FF4D4D]"}`}>
                      {changePositive ? "+" : ""}{d.change}%
                    </span>
                  </div>
                </div>

                {/* Sentiment + confidence */}
                <div>
                  <SentimentBadge sentiment={d.sentiment} confidence={d.confidence} size="md" />
                  <div className="mt-3 w-full bg-[#2A2D3A] rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${d.confidence}%`,
                        background: d.sentiment === "Bullish" ? "#00C896" : d.sentiment === "Bearish" ? "#FF4D4D" : "#FFB830",
                      }}
                    />
                  </div>
                  <p className="text-[#8A8FA8] text-xs mt-1">{d.confidence}% confidence</p>
                </div>

                {/* Keywords */}
                <div>
                  <p className="text-[#8A8FA8] text-xs font-semibold mb-2 uppercase tracking-widest">Top Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {d.keywords.map((kw) => (
                      <span key={kw} className="bg-[#4B6BFB]/10 text-[#4B6BFB] border border-[#4B6BFB]/30 text-xs px-3 py-1 rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subreddit breakdown */}
                <div>
                  <p className="text-[#8A8FA8] text-xs font-semibold mb-3 uppercase tracking-widest">Subreddit Breakdown</p>
                  <div className="flex flex-col gap-2.5">
                    {d.subreddits.map(s => {
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BarChartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto opacity-30" stroke="#8A8FA8" strokeWidth="1.5">
      <rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="4" width="4" height="17" rx="1" />
    </svg>
  );
}
