import { useState } from 'react';
import { Bell, BellRing, Plus, Trash2, Check } from 'lucide-react';
import { COINS } from '../lib/coinMapping';
import { useApp } from '../context/AppContext';
import { useAlerts } from '../context/AlertsContext';
import { formatUsdToDisplay } from '../lib/displayCurrency';

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' };
const inputStyle: React.CSSProperties = {
  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px',
  padding: '0.55rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-strong)',
  fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
};

export default function Alerts() {
  const { displayCurrency, currencyRates } = useApp();
  const { alerts, addAlert, removeAlert, clearTriggered, notificationsEnabled, enableNotifications } = useAlerts();

  const [ticker, setTicker]       = useState('BTC');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [target, setTarget]       = useState('');

  const money = (usd: number) => formatUsdToDisplay(usd, displayCurrency, currencyRates);

  const submit = () => {
    const t = parseFloat(target);
    if (!t || t <= 0) return;
    addAlert({ ticker: ticker.toUpperCase(), direction, targetUsd: t });
    setTarget('');
  };

  const active = alerts.filter(a => !a.triggeredAt);
  const triggered = alerts.filter(a => a.triggeredAt);

  return (
    <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p className="section-label" style={{ marginBottom: '0.875rem' }}>Never miss a move</p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-strong)', lineHeight: 1 }}>
          Price Alerts
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Get notified when a coin crosses your target price. Alerts check live prices every minute while Crypton is open.
        </p>
      </div>

      {/* Notifications toggle */}
      {!notificationsEnabled && (
        <button onClick={enableNotifications}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(247,147,26,0.1)', border: '1px solid rgba(247,147,26,0.35)', color: '#F7931A', borderRadius: '8px', padding: '0.55rem 1rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1.5rem' }}>
          <BellRing size={15} /> Enable browser notifications
        </button>
      )}

      {/* Create alert */}
      <div style={{ ...card, padding: '1.25rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '1rem' }}>Create an alert</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Coin</span>
            <select value={ticker} onChange={e => setTicker(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {COINS.map(c => <option key={c.ticker} value={c.ticker} style={{ background: 'var(--bg-surface)' }}>{c.ticker} — {c.name}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Condition</span>
            <select value={direction} onChange={e => setDirection(e.target.value as 'above' | 'below')} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="above" style={{ background: 'var(--bg-surface)' }}>Rises above</option>
              <option value="below" style={{ background: 'var(--bg-surface)' }}>Falls below</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span className="section-label">Target price (USD)</span>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="0.00" min="0" style={inputStyle} />
          </label>
          <button onClick={submit} style={{ background: '#F7931A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'inherit' }}>
            <Plus size={15} /> Add alert
          </button>
        </div>
      </div>

      {/* Active alerts */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Bell size={15} style={{ color: 'var(--text-muted)' }} />
          <span className="section-label">Active ({active.length})</span>
        </div>
        {active.length === 0 ? (
          <div style={{ ...card, padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>No active alerts. Create one above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {active.map(a => (
              <div key={a.id} style={{ ...card, padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-strong)', width: '3rem' }}>{a.ticker}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>
                  {a.direction === 'above' ? 'rises above' : 'falls below'}{' '}
                  <strong style={{ color: '#F7931A' }}>{money(a.targetUsd)}</strong>
                </span>
                {a.lastPriceUsd != null && (
                  <span className="num" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>now {money(a.lastPriceUsd)}</span>
                )}
                <button onClick={() => removeAlert(a.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} aria-label="Delete alert">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Triggered alerts */}
      {triggered.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Check size={15} style={{ color: '#00E676' }} />
            <span className="section-label">Triggered ({triggered.length})</span>
            <button onClick={clearTriggered} className="section-label" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#FF3355' }}>Clear</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {triggered.map(a => (
              <div key={a.id} style={{ ...card, padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.75 }}>
                <BellRing size={15} style={{ color: '#00E676' }} />
                <span style={{ fontWeight: 700, color: 'var(--text-strong)', width: '3rem' }}>{a.ticker}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>
                  went {a.direction} <strong style={{ color: '#F7931A' }}>{money(a.targetUsd)}</strong>
                </span>
                <span className="num" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {a.triggeredAt ? new Date(a.triggeredAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                </span>
                <button onClick={() => removeAlert(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} aria-label="Delete alert">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
