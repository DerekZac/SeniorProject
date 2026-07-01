import { useState } from 'react';
import { ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';
import { EXCHANGES, TAG_LABELS, type ExchangeTag } from '../lib/exchangeData';

const FILTER_TABS: { id: 'all' | ExchangeTag; label: string }[] = [
  { id: 'all',      label: 'All Exchanges' },
  { id: 'popular',  label: 'Popular' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'low-fee',  label: 'Low Fee' },
  { id: 'defi',     label: 'DeFi / DEX' },
];

export default function Exchanges() {
  const [activeFilter, setActiveFilter] = useState<'all' | ExchangeTag>('all');

  const filtered = activeFilter === 'all'
    ? EXCHANGES
    : EXCHANGES.filter(e => e.tag === activeFilter);

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>

      {/* Page header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <p className="section-label" style={{ marginBottom: '0.875rem' }}>Where to Buy Crypto</p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1, marginBottom: '1rem' }}>
          Exchange Platforms
        </h1>
        <p style={{ fontSize: '1rem', color: '#5A5A7A', maxWidth: '52ch', lineHeight: 1.6 }}>
          Compare the most trusted platforms to buy, sell, and trade cryptocurrency — from beginner-friendly apps to professional trading platforms.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              background: activeFilter === tab.id ? '#F7931A' : 'transparent',
              color:      activeFilter === tab.id ? '#FFFFFF' : '#5A5A7A',
              border:     `1px solid ${activeFilter === tab.id ? '#F7931A' : '#21213A'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exchange grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 32rem), 1fr))', gap: '1rem' }}>
        {filtered.map(ex => (
          <div
            key={ex.id}
            style={{ background: '#16162A', border: '1px solid #21213A', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Card header */}
            <div style={{ padding: '1.25rem 1.25rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', background: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#F7931A', flexShrink: 0, letterSpacing: '0.02em' }}>
                  {ex.logo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>{ex.name}</span>
                    {ex.tag && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: '#F7931A', background: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.2)' }}>
                        {TAG_LABELS[ex.tag]}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-[#F7931A]"
                  style={{ color: '#5A5A7A', textDecoration: 'none', flexShrink: 0 }}
                >
                  Visit <ArrowUpRight size={11} />
                </a>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#5A5A7A', marginBottom: '1rem', fontStyle: 'italic' }}>
                Best for: {ex.bestFor}
              </p>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #21213A', borderBottom: '1px solid #21213A' }}>
              {[
                { label: 'Founded',    value: String(ex.founded) },
                { label: 'Trust Score', value: `${ex.trustScore}/10` },
                { label: 'Maker Fee',  value: ex.fees.maker },
                { label: 'Taker Fee',  value: ex.fees.taker },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRight: i % 2 === 0 ? '1px solid #21213A' : 'none',
                    borderBottom: i < 2 ? '1px solid #21213A' : 'none',
                  }}
                >
                  <div className="text-xs" style={{ color: '#5A5A7A', marginBottom: '0.25rem' }}>{stat.label}</div>
                  <div className="text-sm font-semibold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{ padding: '1rem 1.25rem', flex: 1 }}>
              <p className="section-label" style={{ marginBottom: '0.625rem' }}>Key Features</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {ex.features.slice(0, 4).map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: '#A0A0B8', lineHeight: 1.45 }}>
                    <span style={{ color: '#00E676', flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #21213A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {ex.kycRequired
                  ? <CheckCircle size={13} style={{ color: '#FFB020' }} />
                  : <XCircle size={13} style={{ color: '#00E676' }} />
                }
                <span className="text-xs" style={{ color: '#5A5A7A' }}>
                  {ex.kycRequired ? 'KYC required' : 'No KYC required'}
                </span>
              </div>
              <span className="text-xs line-clamp-1" style={{ color: '#5A5A7A', textAlign: 'right', minWidth: 0 }}>
                {ex.supported[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#5A5A7A' }}>
          <p>No exchanges match this filter.</p>
        </div>
      )}

      <div style={{ marginTop: '2.5rem', padding: '1rem 1.25rem', background: 'rgba(33,33,58,0.5)', border: '1px solid #21213A', borderRadius: '8px' }}>
        <p style={{ fontSize: '0.8125rem', color: '#5A5A7A', lineHeight: 1.55, margin: 0 }}>
          <strong style={{ color: '#A0A0B8' }}>Disclaimer:</strong> Exchange listings are for informational purposes only. Fee structures change frequently — verify current rates on each platform. Crypton is not affiliated with any exchange. Always research thoroughly before depositing funds.
        </p>
      </div>
    </div>
  );
}
