import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { api, type GlobalMarket, type Mover } from '../lib/api';
import { useApp } from '../context/AppContext';
import { formatUsdToDisplay } from '../lib/displayCurrency';

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' };

function MoverList({ title, movers, positive }: { title: string; movers: Mover[]; positive: boolean }) {
  const navigate = useNavigate();
  const { displayCurrency, currencyRates } = useApp();
  const color = positive ? '#00E676' : '#FF3355';
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <div style={{ ...card, padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Icon size={15} style={{ color }} />
        <span className="section-label" style={{ color }}>{title}</span>
      </div>
      {movers.map(m => (
        <div key={m.geckoId}
          onClick={() => navigate(`/results/${m.ticker.toLowerCase()}`)}
          className="data-row"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0', cursor: 'pointer', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-strong)', width: '3rem' }}>{m.ticker}</span>
          <span className="num" style={{ color: 'var(--text-muted)' }}>{formatUsdToDisplay(m.priceUsd, displayCurrency, currencyRates)}</span>
          <span className="num" style={{ marginLeft: 'auto', fontWeight: 600, color }}>{m.change >= 0 ? '+' : ''}{m.change}%</span>
        </div>
      ))}
    </div>
  );
}

export default function MarketOverview() {
  const { displayCurrency, currencyRates } = useApp();
  const [global, setGlobal] = useState<GlobalMarket | null>(null);
  const [movers, setMovers] = useState<{ gainers: Mover[]; losers: Mover[] } | null>(null);

  useEffect(() => {
    api.getGlobalMarket().then(setGlobal).catch(() => {});
    api.getTopMovers().then(setMovers).catch(() => {});
  }, []);

  if (!global && !movers) return null;
  const money = (usd: number) => formatUsdToDisplay(usd, displayCurrency, currencyRates, true);

  return (
    <section style={{ padding: '3.5rem 0' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <span className="section-label">Market Snapshot</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Global stats */}
        {global && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Market Cap', value: money(global.totalMarketCapUsd), sub: `${global.marketCapChange24h >= 0 ? '+' : ''}${global.marketCapChange24h}% (24h)`, subColor: global.marketCapChange24h >= 0 ? '#00E676' : '#FF3355' },
              { label: '24h Volume', value: money(global.totalVolumeUsd) },
              { label: 'BTC Dominance', value: `${global.btcDominance}%` },
              { label: 'ETH Dominance', value: `${global.ethDominance}%` },
            ].map(t => (
              <div key={t.label} style={{ ...card, padding: '1rem 1.15rem' }}>
                <div className="section-label" style={{ marginBottom: '0.5rem' }}>{t.label}</div>
                <div className="num" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-strong)' }}>{t.value}</div>
                {t.sub && <div className="num" style={{ fontSize: '0.7rem', marginTop: '0.2rem', color: t.subColor }}>{t.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Top movers */}
        {movers && (movers.gainers.length > 0 || movers.losers.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MoverList title="Top Gainers (24h)" movers={movers.gainers} positive />
            <MoverList title="Top Losers (24h)" movers={movers.losers} positive={false} />
          </div>
        )}
      </div>
    </section>
  );
}
