import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AppContextValue {
  watchlist: string[];
  toggleWatchlist: (ticker: string) => void;
  isWatchlisted: (ticker: string) => boolean;
  searchHistory: string[];
  addToSearchHistory: (coin: string) => void;
  clearSearchHistory: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() =>
    readStorage<string[]>('crypton_watchlist', [])
  );
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    readStorage<string[]>('crypton_search_history', [])
  );

  useEffect(() => {
    localStorage.setItem('crypton_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('crypton_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const toggleWatchlist = (ticker: string) =>
    setWatchlist(prev =>
      prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]
    );

  const isWatchlisted = (ticker: string) => watchlist.includes(ticker);

  const addToSearchHistory = (coin: string) =>
    setSearchHistory(prev => {
      const deduped = prev.filter(c => c.toLowerCase() !== coin.toLowerCase());
      return [coin, ...deduped].slice(0, 10);
    });

  const clearSearchHistory = () => setSearchHistory([]);

  return (
    <AppContext.Provider
      value={{ watchlist, toggleWatchlist, isWatchlisted, searchHistory, addToSearchHistory, clearSearchHistory }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
