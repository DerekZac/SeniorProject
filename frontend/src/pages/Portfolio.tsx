import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, Download, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { api, type Coin } from '../lib/api';
import { COINS } from '../lib/coinMapping';
import { useApp } from '../context/AppContext';
import { usePortfolio, type Holding } from '../context/PortfolioContext';
import { formatUsdToDisplay } from '../lib/displayCurrency';
import { downloadCsv } from '../lib/csv';

const SLICE_COLORS = ['#F7931A', '#4B6BFB', '#00E676', '#FFB020', '#9B59B6', '#00D4FF', '#FF3355', '#7BD66A', '#E67E22', '#5A5A7A'];
const card = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' };
const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px',
  padding: '0.55rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-strong)',
  fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
};

interface Row extends Holding {
  name: string;
  priceUsd: number;
  valueUsd: number;
  plUsd: number;
  plPct: number;
}

export default function Portfolio() {
  const { displayCurrency, currencyRates } = useApp();
  const { transactions, holdings, addTransaction, removeTransaction, clearAll } = usePortfolio();
  const [prices, setPrices] = useState<Record<string, Coin>>({});

  const [ticker, setTicker] = useState('BTC');
  const [type, setType]     = useState<'buy' | 'sell'>('buy');
  const [qty, setQty]       = useState('');
  const [price, setPrice]   = useState('');
  const [date, setDate]     = useState(() => new Date().toISOString().slice(0, 10));

  const money = (usd: number, compact = false) => formatUsdToDisplay(usd, displayCurrency, currencyRates, compact);

  // Load live prices for held coins (plus the coin being added, to prefill price).
  useEffect(() => {
    const tickers = [...new Set([...holdings.map(h => h.ticker), ticker])];
    if (tickers.length === 0) return;
    api.getPricesByTickers(tickers).then(setPrices).catch(() => {});
  }, [holdings, ticker]);

  // Prefill the price field with the live price when the coin changes.
  useEffect(() => {
    const live = prices[ticker.toUpperCase()];
    if (live && !price) setPrice(String(live.priceUsd));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, prices]);

  const rows: Row[] = useMemo(() => holdings.map(h => {
    const priceUsd = prices[h.ticker.toUpperCase()]?.priceUsd ?? 0;
    const valueUsd = h.qty * priceUsd;
    const plUsd = valueUsd - h.costBasisUsd;
    const plPct = h.costBasisUsd > 0 ? (plUsd / h.costBasisUsd) * 100 : 0;
    const name = COINS.find(c => c.ticker === h.ticker)?.name ?? h.ticker;
    return { ...h, name, priceUsd, valueUsd, plUsd, plPct };
  }), [holdings, prices]);

  const totalValue = rows.reduce((s, r) => s + r.valueUsd, 0);
  const totalCost  = rows.reduce((s, r) => s + r.costBasisUsd, 0);
  const totalPl    = totalValue - totalCost;
  const totalPlPct = totalCost > 0 ? (totalPl / totalCost) * 100 : 0;

  const best  = rows.length ? rows.reduce((a, b) => (b.plPct > a.plPct ? b : a)) : null;
  const worst = rows.length ? rows.reduce((a, b) => (b.plPct < a.plPct ? b : a)) : null;

  const pieData = rows
    .filter(r => r.valueUsd > 0)
    .map(r => ({ name: r.ticker, value: r.valueUsd }));

  const submit = () => {
    const q = parseFloat(qty);
    const p = parseFloat(price);
    if (!q || q <= 0 || !p || p <= 0) return;
    addTransaction({ ticker: ticker.toUpperCase(), type, qty: q, priceUsd: p, date });
    setQty('');
    setPrice('');
  };

  const exportCsv = () => {
    downloadCsv('crypton-portfolio', rows.map(r => ({
      Ticker: r.ticker, Quantity: r.qty, AvgCostUSD: r.avgCostUsd.toFixed(2),
      PriceUSD: r.priceUsd.toFixed(2), ValueUSD: r.valueUsd.toFixed(2),
      PnLUSD: r.plUsd.toFixed(2), PnLPct: r.plPct.toFixed(2),
    })));
  };

  const plColor = (v: number) => (v >= 0 ? '#00E676' : '#FF3355');

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p className="section-label" style={{ marginBottom: '0.875rem' }}>Track your holdings</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-strong)', lineHeight: 1 }}>
            Portfolio
          </h1>
          {rows.length > 0 && (
            <button onClick={exportCsv} className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Download size={13} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Value', value: money(totalValue), color: 'var(--text-strong)' },
          { label: 'Total Cost', value: money(totalCost), color: 'var(--text-strong)' },
          { label: 'Total P/L', value: `${totalPl >= 0 ? '+' : ''}${money(totalPl)}`, color: plColor(totalPl) },
          { label: 'Return', value: `${totalPlPct >= 0 ? '+' : ''}${totalPlPct.toFixed(2)}%`, color: plColor(totalPl) },
        ].map(t => (
          <div key={t.label} style={{ ...card, padding: '1.1rem 1.25rem' }}>
            <div className="section-label" style={{ marginBottom: '0.5rem' }}>{t.label}</div>
            <div className="num" style={{ fontSize: '1.15rem', fontWeight: 700, color: t.color }}>{t.value}</div>
          </div>
        ))}
      </div>

      {/* Add transaction */}
      <div style={{ ...card, padding: '1.25rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '1rem' }}>Add transaction</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Coin</span>
            <select value={ticker} onChange={e => { setTicker(e.target.value); setPrice(''); }} style={{ ...inputStyle, cursor: 'pointer' }}>
              {COINS.map(c => <option key={c.ticker} value={c.ticker} style={{ background: 'var(--bg-surface)' }}>{c.ticker} — {c.name}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Type</span>
            <select value={type} onChange={e => setType(e.target.value as 'buy' | 'sell')} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="buy" style={{ background: 'var(--bg-surface)' }}>Buy</option>
              <option value="sell" style={{ background: 'var(--bg-surface)' }}>Sell</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Quantity</span>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0.00" min="0" style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Price (USD)</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="live" min="0" style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </label>
          <button onClick={submit} style={{ background: '#F7931A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'inherit' }}>
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ ...card, padding: '3rem', textAlign: 'center' }}>
          <Wallet size={30} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>No holdings yet — add a buy transaction above to start tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Holdings table */}
          <div className="lg:col-span-2" style={{ ...card, padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '0.75rem' }}>Holdings</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Coin', 'Qty', 'Avg cost', 'Price', 'Value', 'P/L', ''].map((h, i) => (
                      <th key={h} className="section-label" style={{ textAlign: i === 0 ? 'left' : 'right', padding: '0.5rem 0.6rem', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: 'var(--text-strong)' }}>{r.ticker}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text)' }}>{r.qty.toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-muted)' }}>{money(r.avgCostUsd)}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text)' }}>{money(r.priceUsd)}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-strong)', fontWeight: 600 }}>{money(r.valueUsd)}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: plColor(r.plUsd), fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {r.plUsd >= 0 ? '+' : ''}{money(r.plUsd)}<br />
                        <span style={{ fontSize: '0.7rem' }}>{r.plPct >= 0 ? '+' : ''}{r.plPct.toFixed(1)}%</span>
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'right' }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Allocation + analytics */}
          <div style={{ ...card, padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '0.5rem' }}>Allocation</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} stroke="var(--bg-surface)" />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  formatter={(v: number, n) => [money(v), n as string]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {pieData.map((d, i) => (
                <span key={d.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: SLICE_COLORS[i % SLICE_COLORS.length] }} />
                  {d.name} {totalValue > 0 ? `${((d.value / totalValue) * 100).toFixed(0)}%` : ''}
                </span>
              ))}
            </div>

            {best && worst && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <TrendingUp size={14} style={{ color: '#00E676' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Best</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text-strong)' }}>{best.ticker}</span>
                  <span style={{ color: plColor(best.plPct), fontWeight: 600 }}>{best.plPct >= 0 ? '+' : ''}{best.plPct.toFixed(1)}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <TrendingDown size={14} style={{ color: '#FF3355' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Worst</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text-strong)' }}>{worst.ticker}</span>
                  <span style={{ color: plColor(worst.plPct), fontWeight: 600 }}>{worst.plPct >= 0 ? '+' : ''}{worst.plPct.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction log */}
      {transactions.length > 0 && (
        <div style={{ ...card, padding: '1.25rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-strong)' }}>Transactions</h2>
            <button onClick={clearAll} className="section-label" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#FF3355' }}>Clear all</button>
          </div>
          {[...transactions].sort((a, b) => b.date.localeCompare(a.date)).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
              <span style={{ fontWeight: 700, color: t.type === 'buy' ? '#00E676' : '#FF3355', textTransform: 'uppercase', width: '2.5rem' }}>{t.type}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-strong)', width: '3rem' }}>{t.ticker}</span>
              <span className="num" style={{ color: 'var(--text)' }}>{t.qty} @ {money(t.priceUsd)}</span>
              <span className="num" style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{t.date}</span>
              <button onClick={() => removeTransaction(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} aria-label="Delete transaction">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.5 }}>
        Holdings are stored in your browser only. P/L uses live CoinGecko prices and average-cost basis. Not financial advice.
      </p>
    </div>
  );
}
