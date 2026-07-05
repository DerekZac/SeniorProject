import { useState } from 'react';
import { ExternalLink, Scale } from 'lucide-react';
import { REGULATIONS, STATUS_LABELS, STATUS_COLORS, type RegionRegulation } from '../lib/regulationData';

function StatusBadge({ status }: { status: RegionRegulation['status'] }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function RegionDetail({ region }: { region: RegionRegulation }) {
  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{region.flag}</span>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-strong)', margin: 0 }}>{region.region}</h2>
        <StatusBadge status={region.status} />
        <span className="section-label" style={{ marginLeft: 'auto' }}>Updated {region.lastUpdated}</span>
      </div>

      <p style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        {region.summary}
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
          Key Points
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {region.keyPoints.map((point, i) => (
            <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.55 }}>
              <span style={{ color: '#F7931A', flexShrink: 0, marginTop: '0.1em' }}>→</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{ padding: '1rem 1.25rem', background: 'rgba(247,147,26,0.07)', border: '1px solid rgba(247,147,26,0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}
      >
        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F7931A', marginBottom: '0.5rem' }}>
          Tax Treatment
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
          {region.taxTreatment}
        </p>
      </div>

      {region.officialLinks.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
            Official Resources
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {region.officialLinks.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F7931A')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <ExternalLink size={13} style={{ flexShrink: 0 }} />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Regulations() {
  const [selectedId, setSelectedId] = useState<string>('us');
  const selected = REGULATIONS.find(r => r.id === selectedId) ?? REGULATIONS[0];

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>

      {/* Page header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <p className="section-label" style={{ marginBottom: '0.875rem' }}>Legal & Compliance</p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-strong)', lineHeight: 1, marginBottom: '1rem' }}>
          Crypto Laws & Regulations
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '52ch', lineHeight: 1.6 }}>
          How governments around the world regulate cryptocurrency — tax treatment, licensing requirements, and official resources.
        </p>
      </div>

      {/* Status legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Legal',    color: '#00E676' },
          { label: 'Partial',  color: '#FFB020' },
          { label: 'Banned',   color: '#FF3355' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}
        className="md:grid-cols-[16rem_1fr]"
      >
        {/* Region list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {REGULATIONS.map(region => (
            <button
              key={region.id}
              onClick={() => setSelectedId(region.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                background: selectedId === region.id ? 'rgba(247,147,26,0.08)' : 'transparent',
                border: `1px solid ${selectedId === region.id ? 'rgba(247,147,26,0.35)' : 'var(--border)'}`,
                borderLeft: selectedId === region.id ? '3px solid #F7931A' : '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{region.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: selectedId === region.id ? 600 : 400, color: selectedId === region.id ? 'var(--text-strong)' : 'var(--text)', marginBottom: '0.25rem' }}>
                  {region.region}
                </div>
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[region.status], flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {selected && <RegionDetail region={selected} />}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: '2.5rem', padding: '1rem 1.25rem', background: 'rgba(33,33,58,0.5)', border: '1px solid var(--border)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <Scale size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
            <strong style={{ color: 'var(--text-strong)' }}>Legal Disclaimer:</strong> This information is for educational purposes only and does not constitute legal or tax advice. Cryptocurrency regulations change frequently. Always consult a qualified legal or tax professional in your jurisdiction.
          </p>
        </div>
      </div>
    </div>
  );
}
