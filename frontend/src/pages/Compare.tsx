import { useState } from "react";
import { Search } from "lucide-react";
import SentimentBadge from "../components/SentimentBadge";
import { mockKeywords, mockSubredditBreakdown } from "../lib/mockData";

export default function Compare() {
  const [coin1, setCoin1] = useState("Bitcoin");
  const [coin2, setCoin2] = useState("Ethereum");
  const [compared, setCompared] = useState(false);

  const handleCompare = () => {
    if (coin1 && coin2) setCompared(true);
  };

  const data = [
    {
      name: coin1, sentiment: "Bullish" as const, confidence: 87,
      price: "$67,234", change: 2.4,
      keywords: mockKeywords.bullish.slice(0, 5),
    },
    {
      name: coin2, sentiment: "Mixed" as const, confidence: 62,
      price: "$3,456", change: -1.2,
      keywords: ["upgrade", "staking", "layer2", "defi", "gas"],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Compare Coins</h1>

      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-8">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FA8]" />
            <input
              value={coin1}
              onChange={(e) => setCoin1(e.target.value)}
              placeholder="First coin..."
              className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
            />
          </div>
          <div className="flex items-center text-[#8A8FA8] font-bold">VS</div>
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8FA8]" />
            <input
              value={coin2}
              onChange={(e) => setCoin2(e.target.value)}
              placeholder="Second coin..."
              className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
            />
          </div>
          <button
            onClick={handleCompare}
            className="bg-[#4B6BFB] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors"
          >
            Compare
          </button>
        </div>
      </div>

      {compared && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((coin) => (
            <div key={coin.name} className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-1">{coin.name}</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-white">{coin.price}</span>
                <span className={`font-medium ${coin.change >= 0 ? "text-[#00C896]" : "text-[#FF4D4D]"}`}>
                  {coin.change >= 0 ? "+" : ""}{coin.change}%
                </span>
              </div>

              <div className="mb-4">
                <SentimentBadge sentiment={coin.sentiment} confidence={coin.confidence} size="md" />
              </div>

              <div className="mb-4">
                <div className="w-full bg-[#2A2D3A] rounded-full h-2">
                  <div
                    className="bg-[#4B6BFB] h-2 rounded-full"
                    style={{ width: `${coin.confidence}%` }}
                  />
                </div>
                <p className="text-[#8A8FA8] text-xs mt-1">{coin.confidence}% confidence</p>
              </div>

              <div>
                <p className="text-[#8A8FA8] text-xs mb-2">TOP KEYWORDS</p>
                <div className="flex flex-wrap gap-2">
                  {coin.keywords.map((kw) => (
                    <span key={kw} className="bg-[#4B6BFB]/10 text-[#4B6BFB] border border-[#4B6BFB]/30 text-xs px-3 py-1 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!compared && (
        <div className="text-center py-16 text-[#8A8FA8]">
          <p>Enter two coins above and click Compare to see side-by-side sentiment</p>
        </div>
      )}
    </div>
  );
}
