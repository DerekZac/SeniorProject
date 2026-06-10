import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SentimentBadge from "./SentimentBadge";

interface Props {
  ticker: string;
  name: string;
  price: string;
  change: number;
  sentiment: "Bullish" | "Bearish" | "Mixed";
  confidence: number;
  isWatchlisted?: boolean;
  onToggleWatchlist?: () => void;
}

export default function CoinCard({
  ticker, name, price, change, sentiment, confidence, isWatchlisted, onToggleWatchlist
}: Props) {
  const navigate = useNavigate();
  const changePositive = change >= 0;

  return (
    <div
      className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-4 cursor-pointer hover:border-[#4B6BFB]/50 transition-all hover:shadow-lg hover:shadow-[#4B6BFB]/5"
      onClick={() => navigate(`/results/${ticker.toLowerCase()}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-bold text-white text-sm">{ticker}</span>
          <span className="text-[#8A8FA8] text-sm ml-2">{name}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWatchlist?.(); }}
          className={`p-1 rounded transition-colors ${isWatchlisted ? "text-[#FFB830]" : "text-[#8A8FA8] hover:text-white"}`}
        >
          <Star size={16} fill={isWatchlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mb-3">
        <div className="text-xl font-bold text-white">{price}</div>
        <div className={`text-sm font-medium ${changePositive ? "text-[#00C896]" : "text-[#FF4D4D]"}`}>
          {changePositive ? "+" : ""}{change}%
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SentimentBadge sentiment={sentiment} size="sm" />
        <span className="text-[#8A8FA8] text-sm">{confidence}%</span>
      </div>
    </div>
  );
}
