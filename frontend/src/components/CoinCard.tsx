import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  ticker: string;
  name: string;
  price: string;
  change: number;
  isWatchlisted?: boolean;
  onToggleWatchlist?: () => void;
}

export default function CoinCard({ ticker, name, price, change, isWatchlisted, onToggleWatchlist }: Props) {
  const navigate = useNavigate();
  const up       = change >= 0;

  return (
    <div
      className="data-row group flex items-center gap-3 md:gap-4 row-padding row-border clickable"
      onClick={() => navigate(`/results/${ticker.toLowerCase()}`)}
    >
      <span className="row-title num">
        {ticker}
      </span>
      <span className="flex-1 truncate text-sm text-muted" style={{ minWidth: 0 }}>
        {name}
      </span>
      <span className="num hidden sm:inline text-sm text-strong" style={{ flexShrink: 0 }}>
        {price}
      </span>

      <span className="num text-right text-sm" style={{ width: '4rem', flexShrink: 0 }}>
        <span className={up ? 'text-up' : 'text-down'}>{up ? '+' : ''}{change}%</span>
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
