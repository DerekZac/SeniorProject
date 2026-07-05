import { useState } from 'react';
import { Search, Loader2, BarChart2 } from 'lucide-react';
import { api, type CoinMarketDetail } from '../lib/api';

interface ColState {
  loading: boolean;
  data: CoinMarketDetail | null;
  error: string | null;
}

const EMPTY_COL: ColState = { loading: false, data: null, error: null };

export default function Compare() {
  const [inputs, setInputs] = useState(['Bitcoin', 'Ethereum']);
  const [cols, setCols]     = useState<[ColState, ColState]>([EMPTY_COL, EMPTY_COL]);

  const handleCompare = async () => {
    if (!inputs[0].trim() || !inputs[1].trim()) return;
    setCols([
      { loading: true, data: null, error: null },
      { loading: true, data: null, error: null },
    ]);
    const results = await Promise.allSettled([
      api.getCoinDetail(inputs[0].trim()),
      api.getCoinDetail(inputs[1].trim()),
    ]);
    setCols(
      results.map(r =>
        r.status === 'fulfilled'
          ? { loading: false, data: r.value, error: null }
          : { loading: false, data: null, error: 'Could not load data. Try a different coin name.' }
      ) as [ColState, ColState]
    );
  };

  const anyLoading  = cols.some(c => c.loading);
  const showResults = cols.some(c => c.data !== null || c.error !== null);

  const cardStyle = undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-2xl font-bold text-strong mb-1">Compare Coins</h1>
      <p className="text-sm mb-8 text-muted">Compare live market data for any two cryptocurrencies side-by-side.</p>

      {/* Inputs */}
      <div className="rounded-xl p-5 mb-8 card-surface">
        <div className="flex gap-4 flex-wrap items-center">
          {([0, 1] as const).map(i => (
            <div key={i} className="flex-1 min-w-[180px] relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 muted-icon" />
              <input
                value={inputs[i]}
                onChange={e => setInputs(prev => { const n = [...prev] as [string, string]; n[i] = e.target.value; return n; })}
                onKeyDown={e => e.key === 'Enter' && handleCompare()}
                placeholder={i === 0 ? 'First coin…' : 'Second coin…'}
                className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none transition-colors input-inline"
              />
            </div>
          ))}
          <div className="text-sm font-bold px-2 text-muted">VS</div>
          <button
            onClick={handleCompare}
            disabled={anyLoading}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center gap-2 btn-primary"
          >
            {anyLoading && <Loader2 size={14} className="animate-spin" />}
            {anyLoading ? 'Loading…' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!showResults && !anyLoading && (
        <div className="text-center py-20 text-muted">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Enter two coins above and click Compare to see market data</p>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cols.map((col, i) => (
            <div key={i} className="rounded-xl p-5 md:p-6 card-surface">
              {col.loading && (
                <div className="flex items-center justify-center h-40">
                  <Loader2 size={28} className="animate-spin muted-icon" />
                </div>
              )}
              {col.error && (
                <div className="flex items-center justify-center h-40">
                  <p className="text-sm text-center text-down">{col.error}</p>
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

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-sm font-medium text-strong">{value}</span>
    </div>
  );
}

function CoinColumn({ data }: { data: CoinMarketDetail }) {
  const { name, ticker, price, change, marketCap, volume24h, circulatingSupply, allTimeHigh, athDate, rank } = data;
  const up = change >= 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-strong">{name}</h2>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{ticker}</span>
          {rank > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(247,147,26,0.12)', color: '#F7931A', border: '1px solid rgba(247,147,26,0.25)' }}>
              #{rank}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold text-strong">{price}</span>
          <span className={`text-sm font-medium ${up ? 'text-[#00E676]' : 'text-[#FF3355]'}`}>
            {up ? '+' : ''}{change}% (24h)
          </span>
        </div>
      </div>

      <div>
        <MetricRow label="Market Cap"         value={marketCap} />
        <MetricRow label="24h Volume"         value={volume24h} />
        <MetricRow label="Circulating Supply" value={circulatingSupply} />
        <MetricRow label={`All-Time High (${athDate})`} value={allTimeHigh} />
      </div>
    </div>
  );
}
