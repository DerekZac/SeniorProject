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

const SENT_COLOR = { Bullish: '#00E676', Bearish: '#FF3355', Mixed: '#FFB020' } as const;
const SENT_ICON  = { Bullish: TrendingUp, Bearish: TrendingDown, Mixed: Minus } as const;

export default function CoinCard({ ticker, name, price, change, sentiment, confidence, isWatchlisted, onToggleWatchlist }: Props) {
  const navigate = useNavigate();
  const up       = change >= 0;
  const color    = SENT_COLOR[sentiment];
  const Icon     = SENT_ICON[sentiment];

  return (
    <div
      className="data-row group flex items-center gap-3 md:gap-4"
      style={{ padding: '0.9375rem 0', borderBottom: '1px solid #21213A', cursor: 'pointer' }}
      onClick={() => navigate(`/results/${ticker.toLowerCase()}`)}
    >
      <span className="row-title num" style={{ width: '3.5rem', fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF', flexShrink: 0, transition: 'color 0.15s ease' }}>
        {ticker}
      </span>

      <span className="flex-1 truncate" style={{ fontSize: '0.8125rem', color: '#5A5A7A', minWidth: 0 }}>
        {name}
      </span>

      <span className="num hidden sm:inline" style={{ fontSize: '0.875rem', color: '#E8E8F0', flexShrink: 0 }}>
        {price}
      </span>

      <span className="num" style={{ width: '4rem', textAlign: 'right', fontSize: '0.8125rem', color: up ? '#00E676' : '#FF3355', flexShrink: 0 }}>
        {up ? '+' : ''}{change}%
      </span>

      <span className="hidden md:inline-flex items-center gap-1" style={{ width: '5.5rem', fontSize: '0.75rem', fontWeight: 600, color, flexShrink: 0 }}>
        <Icon size={12} strokeWidth={2.5} />
        {sentiment}
      </span>

      <span className="num hidden lg:inline section-label" style={{ width: '2.5rem', textAlign: 'right', flexShrink: 0 }}>
        {confidence}%
      </span>

      <button
        className={`star-btn${isWatchlisted ? ' is-starred' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleWatchlist?.(); }}
        aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Star size={14} fill={isWatchlisted ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
