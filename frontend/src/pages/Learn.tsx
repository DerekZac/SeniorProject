import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Coins, Link as LinkIcon, Wallet, Layers, Image, Shield, TrendingUp, Receipt } from 'lucide-react';
import { GUIDES, CATEGORIES, type GuideCategory, type GuideSection } from '../lib/learnData';

const ICON_MAP: Record<string, React.ElementType> = {
  Coins, Link: LinkIcon, Wallet, Layers, Image, Shield, TrendingUp, Receipt,
};

function GuideCard({ guide, isOpen, onToggle }: { guide: GuideSection; isOpen: boolean; onToggle: () => void }) {
  const Icon = ICON_MAP[guide.icon] ?? BookOpen;
  const paragraphs = guide.content.split('\n\n').filter(Boolean);

  return (
    <div
      id={guide.id}
      style={{ background: '#16162A', border: `1px solid ${isOpen ? 'rgba(247,147,26,0.3)' : '#21213A'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s ease' }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left"
        style={{ padding: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Icon size={16} style={{ color: '#F7931A', flexShrink: 0 }} />
            <span className="section-label" style={{ color: '#F7931A' }}>{guide.category.charAt(0).toUpperCase() + guide.category.slice(1)}</span>
            <span className="section-label" style={{ color: '#3A3A5A' }}>·</span>
            <span className="section-label">{guide.readTime}</span>
          </div>
          {isOpen
            ? <ChevronUp size={16} style={{ color: '#5A5A7A', flexShrink: 0, marginTop: '2px' }} />
            : <ChevronDown size={16} style={{ color: '#5A5A7A', flexShrink: 0, marginTop: '2px' }} />
          }
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.35, margin: 0 }}>
          {guide.title}
        </h3>
        {!isOpen && (
          <p style={{ fontSize: '0.8125rem', color: '#5A5A7A', lineHeight: 1.55, margin: 0 }}>
            {guide.summary}
          </p>
        )}
      </button>

      {isOpen && (
        <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #21213A' }}>
          <p style={{ fontSize: '0.875rem', color: '#5A5A7A', marginBottom: '1rem', marginTop: '1rem', lineHeight: 1.5 }}>
            {guide.summary}
          </p>
          {paragraphs.map((para, i) => (
            <p key={i} style={{ fontSize: '0.9375rem', color: '#A0A0B8', lineHeight: 1.75, marginBottom: i < paragraphs.length - 1 ? '1rem' : 0 }}>
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Learn() {
  const [activeCategory, setActiveCategory] = useState<'all' | GuideCategory>('all');
  const [openGuideId, setOpenGuideId]       = useState<string | null>(null);

  const filtered = activeCategory === 'all'
    ? GUIDES
    : GUIDES.filter(g => g.category === activeCategory);

  const toggle = (id: string) => setOpenGuideId(prev => prev === id ? null : id);

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>

      {/* Page header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <p className="section-label" style={{ marginBottom: '0.875rem' }}>Education Hub</p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1, marginBottom: '1rem' }}>
          Learn Crypto
        </h1>
        <p style={{ fontSize: '1rem', color: '#5A5A7A', maxWidth: '50ch', lineHeight: 1.6 }}>
          Plain-English guides to understanding cryptocurrency, blockchain, DeFi, and how to stay safe in the crypto world.
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              background: activeCategory === cat.id ? '#F7931A' : 'transparent',
              color:      activeCategory === cat.id ? '#FFFFFF' : '#5A5A7A',
              border:     `1px solid ${activeCategory === cat.id ? '#F7931A' : '#21213A'}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Guide grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 30rem), 1fr))', gap: '1rem' }}>
        {filtered.map(guide => (
          <GuideCard
            key={guide.id}
            guide={guide}
            isOpen={openGuideId === guide.id}
            onToggle={() => toggle(guide.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#5A5A7A' }}>
          <BookOpen size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>No guides in this category yet.</p>
        </div>
      )}
    </div>
  );
}
