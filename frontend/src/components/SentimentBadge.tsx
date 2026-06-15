import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Sentiment = 'Bullish' | 'Bearish' | 'Mixed';

interface Props {
  sentiment: Sentiment;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
}

const CFG = {
  Bullish: { color: '#00E676', bg: 'rgba(0,230,118,0.10)',  border: 'rgba(0,230,118,0.25)', Icon: TrendingUp },
  Bearish: { color: '#FF3355', bg: 'rgba(255,51,85,0.10)',   border: 'rgba(255,51,85,0.25)',  Icon: TrendingDown },
  Mixed:   { color: '#FFB020', bg: 'rgba(255,176,32,0.10)', border: 'rgba(255,176,32,0.25)', Icon: Minus },
};

export default function SentimentBadge({ sentiment, confidence, size = 'md' }: Props) {
  const { color, bg, border, Icon } = CFG[sentiment];
  const iconSize = size === 'lg' ? 18 : size === 'md' ? 14 : 12;
  const pad      = size === 'lg' ? 'px-4 py-2 text-base' : size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad}`}
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <Icon size={iconSize} strokeWidth={2.5} />
      {sentiment}
      {confidence !== undefined && <span style={{ opacity: 0.75 }}>{confidence}%</span>}
    </span>
  );
}
