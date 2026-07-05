import type { Coin } from '../lib/api';

interface Props { coins: Coin[]; }

export default function TickerStrip({ coins }: Props) {
  if (!coins.length) return null;
  const doubled = [...coins, ...coins];

  return (
    <div className="overflow-hidden border-b py-2.5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'ticker 28s linear infinite', width: 'max-content' }}
      >
        {doubled.map((coin, i) => (
          <span key={i} className="inline-flex items-center gap-2.5 px-6 text-sm">
            <span className="font-bold text-[#F7931A]">{coin.ticker}</span>
            <span className="font-medium" style={{ color: 'var(--text-strong)' }}>{coin.price}</span>
            <span className={`text-xs font-semibold ${coin.change >= 0 ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
              {coin.change >= 0 ? '▲' : '▼'} {Math.abs(coin.change)}%
            </span>
            <span className="select-none" style={{ color: 'var(--border)' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
