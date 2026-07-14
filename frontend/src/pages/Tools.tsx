import { useState } from 'react';
import { Calculator, RefreshCw, ArrowLeftRight, Receipt } from 'lucide-react';
import { COINS, type CoinInfo } from '../lib/coinMapping';
import { api } from '../lib/api';

type Tab = 'dca' | 'converter' | 'tax';
type Frequency = 'weekly' | 'biweekly' | 'monthly';
type HoldingTerm = 'short' | 'long';

// US federal capital-gains rates used for the estimate.
const SHORT_TERM_RATE = 0.22; // taxed as ordinary income
const LONG_TERM_RATE  = 0.15;

interface TaxResult {
  gain: number;     // total capital gain (positive) or loss (negative)
  rate: number;     // rate applied to a gain
  taxOwed: number;  // 0 when there is a loss
}

// Explicit Crypton dark-theme palette for the Tax Estimator section.
const TAX_PANEL  = '#1A1D27';
const TAX_ACCENT = '#4B6BFB';
const GAIN_COLOR = '#00E676';
const LOSS_COLOR = '#FF3355';

const usd = (n: number) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface DcaRow {
  period: string;
  invested: number;
  cumulative: number;
}

const FIAT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
const CRYPTO_OPTIONS: string[] = COINS.map((c: CoinInfo) => c.ticker);

const FIAT_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 155.4, CAD: 1.36, AUD: 1.54, CHF: 0.90,
};

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0.625rem 0.875rem',
  fontSize: '0.9375rem',
  color: 'var(--text-strong)',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

export default function Tools() {
  const [tab, setTab] = useState<Tab>('dca');

  // ── DCA Calculator state ──────────────────────────────────────────────────────
  const [dcaCoin,      setDcaCoin]      = useState('BTC');
  const [dcaAmount,    setDcaAmount]    = useState('100');
  const [dcaFreq,      setDcaFreq]      = useState<Frequency>('monthly');
  const [dcaMonths,    setDcaMonths]    = useState('12');
  const [dcaPrice,     setDcaPrice]     = useState<number | null>(null);
  const [dcaRows,      setDcaRows]      = useState<DcaRow[]>([]);
  const [dcaLoading,   setDcaLoading]   = useState(false);

  // ── Converter state ───────────────────────────────────────────────────────────
  const [convAmount,   setConvAmount]   = useState('1');
  const [convFrom,     setConvFrom]     = useState('BTC');
  const [convTo,       setConvTo]       = useState('USD');
  const [convResult,   setConvResult]   = useState<string | null>(null);
  const [convLoading,  setConvLoading]  = useState(false);
  const [convPrice,    setConvPrice]    = useState<number | null>(null);

  // ── Tax Estimator state ─────────────────────────────────────────────────────
  const [taxPurchase, setTaxPurchase] = useState('');
  const [taxSale,     setTaxSale]     = useState('');
  const [taxCoins,    setTaxCoins]    = useState('');
  const [taxTerm,     setTaxTerm]     = useState<HoldingTerm>('short');
  const [taxResult,   setTaxResult]   = useState<TaxResult | null>(null);

  const allOptions = [...CRYPTO_OPTIONS, ...FIAT_CURRENCIES];

  // ─── Tax Estimator Logic ─────────────────────────────────────────────────────

  const estimateTax = () => {
    const purchase = parseFloat(taxPurchase);
    const sale     = parseFloat(taxSale);
    const coins    = parseFloat(taxCoins);
    if ([purchase, sale, coins].some(v => isNaN(v)) || coins <= 0) {
      setTaxResult(null);
      return;
    }
    const gain    = (sale - purchase) * coins;
    const rate    = taxTerm === 'short' ? SHORT_TERM_RATE : LONG_TERM_RATE;
    const taxOwed = gain > 0 ? gain * rate : 0; // capital losses owe no tax
    setTaxResult({ gain, rate, taxOwed });
  };

  // ─── DCA Logic ───────────────────────────────────────────────────────────────

  const runDca = async () => {
    const amount  = parseFloat(dcaAmount);
    const months  = parseInt(dcaMonths, 10);
    if (!amount || !months || months < 1 || months > 120) return;

    setDcaLoading(true);
    try {
      const detail = await api.getCoinDetail(dcaCoin);
      const rawPrice = parseFloat(detail.price.replace(/[$,]/g, ''));
      setDcaPrice(rawPrice);

      const periodsPerMonth = dcaFreq === 'weekly' ? 4 : dcaFreq === 'biweekly' ? 2 : 1;
      const totalPeriods    = months * periodsPerMonth;
      const rows: DcaRow[]  = [];
      let cumulative = 0;

      for (let i = 1; i <= totalPeriods; i++) {
        cumulative += amount;
        const periodLabel = dcaFreq === 'monthly'
          ? `Month ${i}`
          : dcaFreq === 'biweekly'
          ? `Biweek ${i}`
          : `Week ${i}`;
        rows.push({ period: periodLabel, invested: amount, cumulative });
      }
      setDcaRows(rows);
    } catch {
      // silently fail
    } finally {
      setDcaLoading(false);
    }
  };

  const totalInvested  = dcaRows.reduce((s, r) => s + r.invested, 0);
  const coinsAccumulated = dcaPrice ? totalInvested / dcaPrice : 0;
  const currentValue   = dcaPrice ? coinsAccumulated * dcaPrice : 0;

  // ─── Converter Logic ─────────────────────────────────────────────────────────

  const isCrypto = (sym: string) => CRYPTO_OPTIONS.includes(sym);

  const convert = async () => {
    const amount = parseFloat(convAmount);
    if (!amount) return;
    setConvLoading(true);
    try {
      let cryptoTicker = '';
      let isBuying     = false;

      if (isCrypto(convFrom) && !isCrypto(convTo)) {
        cryptoTicker = convFrom; isBuying = false;
      } else if (!isCrypto(convFrom) && isCrypto(convTo)) {
        cryptoTicker = convTo; isBuying = true;
      } else if (isCrypto(convFrom) && isCrypto(convTo)) {
        const [d1, d2] = await Promise.all([
          api.getCoinDetail(convFrom),
          api.getCoinDetail(convTo),
        ]);
        const p1 = parseFloat(d1.price.replace(/[$,]/g, ''));
        const p2 = parseFloat(d2.price.replace(/[$,]/g, ''));
        const result = (amount * p1) / p2;
        setConvResult(`${result.toFixed(6)} ${convTo}`);
        setConvPrice(null);
        setConvLoading(false);
        return;
      } else {
        const rateFrom = FIAT_RATES[convFrom] ?? 1;
        const rateTo   = FIAT_RATES[convTo]   ?? 1;
        const result   = amount * (rateTo / rateFrom);
        setConvResult(`${result.toFixed(2)} ${convTo}`);
        setConvPrice(null);
        setConvLoading(false);
        return;
      }

      const detail     = await api.getCoinDetail(cryptoTicker);
      const priceInUsd = parseFloat(detail.price.replace(/[$,]/g, ''));
      setConvPrice(priceInUsd);

      const targetFiat  = isBuying ? convFrom : convTo;
      const fiatRate    = FIAT_RATES[targetFiat] ?? 1;
      const priceInFiat = priceInUsd * fiatRate;

      const result = isBuying
        ? amount / priceInFiat
        : amount * priceInFiat;

      const decimals = isBuying ? 8 : 2;
      setConvResult(`${result.toFixed(decimals)} ${convTo}`);
    } catch {
      setConvResult('Error — check the coin name and try again');
    } finally {
      setConvLoading(false);
    }
  };

  const swap = () => {
    setConvFrom(convTo);
    setConvTo(convFrom);
    setConvResult(null);
  };

  return (
    <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>

      {/* Page header */}
      <div style={{ marginBottom: '3rem' }}>
        <p className="section-label" style={{ marginBottom: '0.875rem' }}>Crypto Tools</p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-strong)', lineHeight: 1 }}>
          Tools & Calculators
        </h1>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '2rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.25rem' }}>
        {([
          { id: 'dca',       label: 'DCA Calculator',  Icon: Calculator },
          { id: 'converter', label: 'Crypto Converter', Icon: ArrowLeftRight },
          { id: 'tax',       label: 'Tax Estimator',   Icon: Receipt },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: '7px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              background: tab === id ? 'var(--bg)' : 'transparent',
              color:      tab === id ? 'var(--text-strong)' : 'var(--text-muted)',
              border:     `1px solid ${tab === id ? 'var(--border)' : 'transparent'}`,
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── DCA Calculator ─────────────────────────────────────── */}
      {tab === 'dca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '1.25rem' }}>
              Dollar-Cost Averaging Calculator
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              DCA means investing a fixed amount at regular intervals regardless of price. This calculator shows how much you would have invested over time.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <InputRow label="Cryptocurrency">
                <select
                  value={dcaCoin}
                  onChange={e => setDcaCoin(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {CRYPTO_OPTIONS.map(t => <option key={t} value={t} style={{ background: 'var(--bg-surface)' }}>{t}</option>)}
                </select>
              </InputRow>

              <InputRow label="Amount per period (USD)">
                <input
                  type="number"
                  value={dcaAmount}
                  onChange={e => setDcaAmount(e.target.value)}
                  min="1"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--signin-border)')}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
              </InputRow>

              <InputRow label="Frequency">
                <select
                  value={dcaFreq}
                  onChange={e => setDcaFreq(e.target.value as Frequency)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="weekly"   style={{ background: 'var(--bg-surface)' }}>Weekly</option>
                  <option value="biweekly" style={{ background: 'var(--bg-surface)' }}>Bi-weekly</option>
                  <option value="monthly"  style={{ background: 'var(--bg-surface)' }}>Monthly</option>
                </select>
              </InputRow>

              <InputRow label="Duration (months)">
                <input
                  type="number"
                  value={dcaMonths}
                  onChange={e => setDcaMonths(e.target.value)}
                  min="1"
                  max="120"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--signin-border)')}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
              </InputRow>
            </div>

            <button
              onClick={runDca}
              disabled={dcaLoading}
              style={{ background: '#F7931A', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: dcaLoading ? 0.7 : 1 }}
            >
              {dcaLoading && <RefreshCw size={14} className="animate-spin" />}
              {dcaLoading ? 'Fetching price…' : 'Calculate'}
            </button>
          </div>

          {dcaRows.length > 0 && dcaPrice && (
            <>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                {[
                  { label: 'Total Invested',     value: `$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  { label: `${dcaCoin} Accumulated`, value: coinsAccumulated.toFixed(6) },
                  { label: 'Current Value (est.)', value: `$${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg-surface)', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.375rem' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                * Based on current price of {dcaCoin}: ${dcaPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. This is a simplified estimate — actual returns depend on price at each purchase date. Not financial advice.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Converter ──────────────────────────────────────────── */}
      {tab === 'converter' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '0.5rem' }}>
            Crypto / Fiat Converter
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
            Convert between any cryptocurrency and fiat currency using live market prices.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <InputRow label="Amount">
              <input
                type="number"
                value={convAmount}
                onChange={e => { setConvAmount(e.target.value); setConvResult(null); }}
                min="0"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(247,147,26,0.5)')}
                onBlur={e  => (e.target.style.borderColor = '#21213A')}
              />
            </InputRow>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'flex-end' }}>
              <InputRow label="From">
                <select
                  value={convFrom}
                  onChange={e => { setConvFrom(e.target.value); setConvResult(null); }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <optgroup label="Crypto" style={{ background: 'var(--bg-surface)' }}>
                    {CRYPTO_OPTIONS.map(t => <option key={t} value={t} style={{ background: 'var(--bg-surface)' }}>{t}</option>)}
                  </optgroup>
                  <optgroup label="Fiat" style={{ background: 'var(--bg-surface)' }}>
                    {FIAT_CURRENCIES.map(c => <option key={c} value={c} style={{ background: 'var(--bg-surface)' }}>{c}</option>)}
                  </optgroup>
                </select>
              </InputRow>

              <button
                onClick={swap}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.625rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s ease, border-color 0.15s ease' }}
                title="Swap currencies"
                onMouseEnter={e => { (e.currentTarget.style.color = '#F7931A'); (e.currentTarget.style.borderColor = 'var(--signin-border)'); }}
                onMouseLeave={e => { (e.currentTarget.style.color = 'var(--text-muted)'); (e.currentTarget.style.borderColor = 'var(--border)'); }}
              >
                <ArrowLeftRight size={16} />
              </button>

              <InputRow label="To">
                <select
                  value={convTo}
                  onChange={e => { setConvTo(e.target.value); setConvResult(null); }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <optgroup label="Crypto" style={{ background: 'var(--bg-surface)' }}>
                    {CRYPTO_OPTIONS.map(t => <option key={t} value={t} style={{ background: 'var(--bg-surface)' }}>{t}</option>)}
                  </optgroup>
                  <optgroup label="Fiat" style={{ background: 'var(--bg-surface)' }}>
                    {FIAT_CURRENCIES.map(c => <option key={c} value={c} style={{ background: 'var(--bg-surface)' }}>{c}</option>)}
                  </optgroup>
                </select>
              </InputRow>
            </div>

            <button
              onClick={convert}
              disabled={convLoading}
              style={{ background: '#F7931A', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: convLoading ? 0.7 : 1 }}
            >
              {convLoading && <RefreshCw size={14} className="animate-spin" />}
              {convLoading ? 'Fetching price…' : 'Convert'}
            </button>

            {convResult && (
              <div style={{ padding: '1.25rem', background: 'rgba(247,147,26,0.07)', border: '1px solid rgba(247,147,26,0.25)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  {convAmount} {convFrom} =
                </div>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#F7931A', letterSpacing: '-0.02em' }}>
                  {convResult}
                </div>
                {convPrice && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Live price: ${convPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                )}
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem', lineHeight: 1.5 }}>
            * Fiat rates are approximate. Crypto prices are fetched live from CoinGecko. Not financial advice.
          </p>
        </div>
      )}

      {/* ── Tax Estimator ──────────────────────────────────────── */}
      {tab === 'tax' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: TAX_PANEL, border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '0.5rem' }}>
              Crypto Tax Estimator
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              Estimate US federal capital-gains tax on a crypto sale. Short-term (held under 1 year) is taxed as ordinary income at 22%; long-term (held over 1 year) at 15%.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <InputRow label="Purchase price (USD / coin)">
                <input
                  type="number"
                  value={taxPurchase}
                  onChange={e => { setTaxPurchase(e.target.value); setTaxResult(null); }}
                  min="0"
                  placeholder="0.00"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = TAX_ACCENT)}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
              </InputRow>

              <InputRow label="Sale price (USD / coin)">
                <input
                  type="number"
                  value={taxSale}
                  onChange={e => { setTaxSale(e.target.value); setTaxResult(null); }}
                  min="0"
                  placeholder="0.00"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = TAX_ACCENT)}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
              </InputRow>

              <InputRow label="Amount of coins sold">
                <input
                  type="number"
                  value={taxCoins}
                  onChange={e => { setTaxCoins(e.target.value); setTaxResult(null); }}
                  min="0"
                  placeholder="0.00"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = TAX_ACCENT)}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
              </InputRow>

              <InputRow label="Holding period">
                <select
                  value={taxTerm}
                  onChange={e => { setTaxTerm(e.target.value as HoldingTerm); setTaxResult(null); }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="short" style={{ background: TAX_PANEL }}>Short term (under 1 year)</option>
                  <option value="long"  style={{ background: TAX_PANEL }}>Long term (over 1 year)</option>
                </select>
              </InputRow>
            </div>

            <button
              onClick={estimateTax}
              style={{ background: TAX_ACCENT, color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Calculator size={14} />
              Estimate Tax
            </button>
          </div>

          {taxResult && (
            <>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: TAX_PANEL, padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: taxResult.gain >= 0 ? GAIN_COLOR : LOSS_COLOR, marginBottom: '0.375rem' }}>
                    {usd(taxResult.gain)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {taxResult.gain >= 0 ? 'Capital Gain' : 'Capital Loss'}
                  </div>
                </div>
                <div style={{ background: TAX_PANEL, padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.375rem' }}>
                    {(taxResult.rate * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Tax Rate Applied ({taxTerm === 'short' ? 'Short term' : 'Long term'})
                  </div>
                </div>
                <div style={{ background: TAX_PANEL, padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: TAX_ACCENT, marginBottom: '0.375rem' }}>
                    {usd(taxResult.taxOwed)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Tax Owed</div>
                </div>
              </div>

              {taxResult.gain <= 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  No tax is owed on a capital loss. A realized loss may be used to offset other capital gains.
                </p>
              )}
            </>
          )}

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.25rem' }}>
            This is an estimate based on federal tax rates only. State taxes and individual circumstances may vary. Consult a tax professional for accurate advice.
          </p>
        </div>
      )}
    </div>
  );
}
