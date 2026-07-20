import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Download, TrendingUp, Wallet } from 'lucide-react';
import { api, type Coin } from '../lib/api';
import { COINS } from '../lib/coinMapping';
import { useApp } from '../context/AppContext';
import { usePaperTrading, STARTING_CASH } from '../context/PaperTradingContext';
import { formatUsdToDisplay } from '../lib/displayCurrency';
import { downloadCsv } from '../lib/csv';

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' };
const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px',
  padding: '0.55rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-strong)',
  fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
};

export default function PaperTrading() {
  const { displayCurrency, currencyRates } = useApp();
  const { cash, positions, trades, buy, sell, reset } = usePaperTrading();
  const [prices, setPrices] = useState<Record<string, Coin>>({});

  const [ticker, setTicker] = useState('BTC');
  const [qty, setQty]       = useState('');
  const [msg, setMsg]       = useState<{ text: string; ok: boolean } | null>(null);

  const money = (usd: number, compact = false) => formatUsdToDisplay(usd, displayCurrency, currencyRates, compact);
  const positionList = Object.values(positions);

  useEffect(() => {
    const tickers = [...new Set([...positionList.map(p => p.ticker), ticker])];
    const fetchPrices = () => api.getPricesByTickers(tickers).then(setPrices).catch(() => {});
    fetchPrices();
    const id = setInterval(fetchPrices, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionList.length, ticker]);

  const livePrice = prices[ticker.toUpperCase()]?.priceUsd ?? 0;

  const positionsValue = useMemo(
    () => positionList.reduce((s, p) => s + p.qty * (prices[p.ticker.toUpperCase()]?.priceUsd ?? 0), 0),
    [positionList, prices],
  );
  const equity = cash + positionsValue;
  const totalReturn = equity - STARTING_CASH;
  const totalReturnPct = (totalReturn / STARTING_CASH) * 100;
  const plColor = (v: number) => (v >= 0 ? '#00E676' : '#FF3355');

  const doTrade = (side: 'buy' | 'sell') => {
    const q = parseFloat(qty);
    if (!q || q <= 0) { setMsg({ text: 'Enter a valid quantity.', ok: false }); return; }
    if (!livePrice) { setMsg({ text: 'Live price unavailable — try again in a moment.', ok: false }); return; }
    const err = side === 'buy' ? buy(ticker.toUpperCase(), q, livePrice) : sell(ticker.toUpperCase(), q, livePrice);
    if (err) setMsg({ text: err, ok: false });
    else { setMsg({ text: `${side === 'buy' ? 'Bought' : 'Sold'} ${q} ${ticker} @ ${money(livePrice)}`, ok: true }); setQty(''); }
  };

  const exportCsv = () => downloadCsv('crypton-paper-trades', trades.map(t => ({
    Date: t.date, Side: t.side, Ticker: t.ticker, Qty: t.qty, PriceUSD: t.priceUsd.toFixed(2), TotalUSD: (t.qty * t.priceUsd).toFixed(2),
  })));

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.875rem' }}>Practice with virtual cash</p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-strong)', lineHeight: 1 }}>
            Paper Trading
          </h1>
        </div>
        <button onClick={() => { if (confirm('Reset your paper portfolio to $100,000?')) { reset(); setMsg(null); } }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', padding: '0.5rem 0.9rem', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Equity tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Equity', value: money(equity), color: 'var(--text-strong)' },
          { label: 'Cash', value: money(cash), color: 'var(--text-strong)' },
          { label: 'Positions Value', value: money(positionsValue), color: 'var(--text-strong)' },
          { label: 'Total Return', value: `${totalReturn >= 0 ? '+' : ''}${money(totalReturn)} (${totalReturnPct >= 0 ? '+' : ''}${totalReturnPct.toFixed(2)}%)`, color: plColor(totalReturn) },
        ].map(t => (
          <div key={t.label} style={{ ...card, padding: '1.1rem 1.25rem' }}>
            <div className="section-label" style={{ marginBottom: '0.5rem' }}>{t.label}</div>
            <div className="num" style={{ fontSize: '1.05rem', fontWeight: 700, color: t.color }}>{t.value}</div>
          </div>
        ))}
      </div>

      {/* Trade panel */}
      <div style={{ ...card, padding: '1.25rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '1rem' }}>Place an order</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Coin</span>
            <select value={ticker} onChange={e => setTicker(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {COINS.map(c => <option key={c.ticker} value={c.ticker} style={{ background: 'var(--bg-surface)' }}>{c.ticker} — {c.name}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Quantity</span>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0.00" min="0" style={inputStyle} />
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Live price</span>
            <div className="num" style={{ padding: '0.55rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-strong)' }}>{livePrice ? money(livePrice) : '…'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Order cost</span>
            <div className="num" style={{ padding: '0.55rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-strong)' }}>{qty && livePrice ? money(parseFloat(qty) * livePrice) : '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => doTrade('buy')} style={{ flex: 1, background: '#00A862', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Buy</button>
            <button onClick={() => doTrade('sell')} style={{ flex: 1, background: '#E0344F', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Sell</button>
          </div>
        </div>
        {msg && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: msg.ok ? '#00E676' : '#FF3355' }}>{msg.text}</p>
        )}
      </div>

      {/* Positions */}
      {positionList.length === 0 ? (
        <div style={{ ...card, padding: '3rem', textAlign: 'center' }}>
          <Wallet size={30} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>No open positions. Buy a coin above to get started — you have {money(STARTING_CASH)} in virtual cash.</p>
        </div>
      ) : (
        <div style={{ ...card, padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '0.75rem' }}>Open positions</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Coin', 'Qty', 'Avg cost', 'Price', 'Value', 'P/L'].map((h, i) => (
                    <th key={h} className="section-label" style={{ textAlign: i === 0 ? 'left' : 'right', padding: '0.5rem 0.6rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positionList.map(p => {
                  const price = prices[p.ticker.toUpperCase()]?.priceUsd ?? 0;
                  const value = p.qty * price;
                  const pl = value - p.qty * p.avgCostUsd;
                  const plPct = p.avgCostUsd > 0 ? (pl / (p.qty * p.avgCostUsd)) * 100 : 0;
                  return (
                    <tr key={p.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: 'var(--text-strong)' }}>{p.ticker}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text)' }}>{p.qty.toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-muted)' }}>{money(p.avgCostUsd)}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text)' }}>{money(price)}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-strong)', fontWeight: 600 }}>{money(value)}</td>
                      <td className="num" style={{ padding: '0.6rem', textAlign: 'right', color: plColor(pl), fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {pl >= 0 ? '+' : ''}{money(pl)} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trade history */}
      {trades.length > 0 && (
        <div style={{ ...card, padding: '1.25rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-strong)' }}>Trade history</h2>
            <button onClick={exportCsv} className="section-label" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Download size={13} /> Export CSV
            </button>
          </div>
          {trades.slice(0, 30).map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
              <span style={{ fontWeight: 700, color: t.side === 'buy' ? '#00E676' : '#FF3355', textTransform: 'uppercase', width: '2.5rem' }}>{t.side}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-strong)', width: '3rem' }}>{t.ticker}</span>
              <span className="num" style={{ color: 'var(--text)' }}>{t.qty} @ {money(t.priceUsd)}</span>
              <span className="num" style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(t.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <TrendingUp size={13} /> Virtual money only — no real funds are ever used. Trades fill at the live CoinGecko price.
      </p>
    </div>
  );
}
