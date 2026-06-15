import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SUGGESTIONS = [
  'Bitcoin', 'Ethereum', 'Solana', 'BNB', 'XRP',
  'Cardano', 'Avalanche', 'Dogecoin', 'Polkadot', 'Chainlink',
  'Litecoin', 'Polygon', 'Shiba Inu', 'Uniswap', 'Cosmos',
];

interface Props {
  large?: boolean;
}

export default function SearchBar({ large = false }: Props) {
  const [query, setQuery]     = useState('');
  const [focused, setFocused] = useState(false);
  const navigate              = useNavigate();
  const { addToSearchHistory, searchHistory } = useApp();
  const inputRef              = useRef<HTMLInputElement>(null);
  const wrapRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, []);

  const filtered = query.trim()
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : [];

  const recentItems = searchHistory.slice(0, 5);
  const showDropdown = focused && (filtered.length > 0 || (!query.trim() && recentItems.length > 0));

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    addToSearchHistory(t);
    navigate(`/results/${t.toLowerCase()}`);
    setQuery('');
    setFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    go(query);
  };

  return (
    <div ref={wrapRef} className={`relative ${large ? 'w-full max-w-2xl mx-auto' : 'w-full'}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search
            size={large ? 20 : 16}
            className="absolute left-4 pointer-events-none"
            style={{ color: focused ? '#F7931A' : '#5A5A7A' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search any cryptocurrency…"
            className={`w-full rounded-xl outline-none transition-all ${large ? 'py-4 text-base pl-12 pr-12' : 'py-2.5 text-sm pl-10 pr-10'}`}
            style={{
              background: '#16162A',
              border: `1px solid ${focused ? 'rgba(247,147,26,0.5)' : '#21213A'}`,
              color: '#ffffff',
              boxShadow: focused ? '0 0 0 3px rgba(247,147,26,0.08)' : 'none',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-4 text-[#5A5A7A] hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-50 animate-fade-up"
          style={{ background: '#16162A', border: '1px solid #21213A', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
        >
          {!query.trim() && recentItems.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: '#5A5A7A' }}>
                Recent searches
              </div>
              {recentItems.map(term => (
                <button
                  key={term}
                  onMouseDown={() => go(term)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[#21213A] transition-colors"
                  style={{ color: '#ffffff' }}
                >
                  <Clock size={13} style={{ color: '#5A5A7A' }} />
                  {term}
                </button>
              ))}
              <div className="border-t border-[#21213A] mt-1 mb-1" />
              <div className="px-4 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: '#5A5A7A' }}>
                Popular coins
              </div>
              {SUGGESTIONS.slice(0, 5).map(s => (
                <button
                  key={s}
                  onMouseDown={() => go(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[#21213A] transition-colors"
                  style={{ color: '#ffffff' }}
                >
                  <TrendingUp size={13} style={{ color: '#F7931A' }} />
                  {s}
                </button>
              ))}
            </>
          )}

          {filtered.map(s => (
            <button
              key={s}
              onMouseDown={() => go(s)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[#21213A] transition-colors"
              style={{ color: '#ffffff' }}
            >
              <Search size={13} style={{ color: '#5A5A7A' }} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
