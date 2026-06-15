import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  ticker: string;
  name: string;
  price: string;
  change: number;
  sentiment: 'Bullish' | 'Bearish' | 'Mixed';
  confidence: number;
  isWatchlisted?: boolean;
  onToggleWatchlist?: () => void;
}

const CFG = {
  Bullish: { color: '#00E676', bg: 'rgba(0,230,118,0.09)',  border: 'rgba(0,230,118,0.22)',  Icon: TrendingUp },
  Bearish: { color: '#FF3355', bg: 'rgba(255,51,85,0.09)',   border: 'rgba(255,51,85,0.22)',   Icon: TrendingDown },
  Mixed:   { color: '#FFB020', bg: 'rgba(255,176,32,0.09)',  border: 'rgba(255,176,32,0.22)',  Icon: Minus },
};

export default function CoinCard({ ticker, name, price, change, sentiment, confidence, isWatchlisted, onToggleWatchlist }: Props) {
  const navigate = useNavigate();
  const { color, bg, border, Icon } = CFG[sentiment];
  const up = change >= 0;

  return (
    <div
      className="relative rounded-xl p-4 cursor-pointer card-interactive group"
      style={{ background: '#16162A', border: '1px solid #21213A' }}
      onClick={() => navigate(`/results/${ticker.toLowerCase()}`)}
    >
      {/* orange top-line glow on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(247,147,26,0.7), transparent)' }}
      />

      <button
        onClick={e => { e.stopPropagation(); onToggleWatchlist?.(); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-all hover:bg-[#21213A]"
        style={{ color: isWatchlisted ? '#FFB020' : '#5A5A7A' }}
        aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Star size={14} fill={isWatchlisted ? 'currentColor' : 'none'} />
      </button>

      <div className="mb-3 pr-7">
        <div className="font-bold text-white text-sm leading-none">{ticker}</div>
        <div className="text-[#5A5A7A] text-xs mt-1 truncate">{name}</div>
      </div>

      <div className="mb-3">
        <div className="text-lg font-bold text-white leading-tight">{price}</div>
        <div className={`text-xs font-semibold mt-0.5 ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
          {up ? '▲' : '▼'} {Math.abs(change)}%
        </div>
      </div>

      <div
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ color, background: bg, border: `1px solid ${border}` }}
      >
        <Icon size={11} strokeWidth={2.5} />
        {sentiment}
        <span style={{ opacity: 0.7 }}>{confidence}%</span>
      </div>
    </div>
  );
}
