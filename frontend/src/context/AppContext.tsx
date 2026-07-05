import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getSession } from '../lib/auth';
import { FALLBACK_RATES, type CurrencyRates, type DisplayCurrency, loadCurrencyRates } from '../lib/displayCurrency';

const API_URL = import.meta.env.VITE_API_URL || '';
const USE_BACKEND = API_URL !== '';

interface AppContextValue {
  watchlist: string[];
  toggleWatchlist: (ticker: string) => void;
  isWatchlisted: (ticker: string) => boolean;
  searchHistory: string[];
  addToSearchHistory: (coin: string) => void;
  clearSearchHistory: () => void;
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  currencyRates: CurrencyRates;
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

// Save watchlist to backend
async function saveWatchlistToBackend(username: string, coins: string[]) {
  if (!USE_BACKEND || !username) return;
  try {
    await fetch(`${API_URL}/api/auth/watchlist/${encodeURIComponent(username)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coins }),
    });
  } catch (e) {
    console.warn('Failed to save watchlist to backend', e);
  }
}

// Load watchlist from backend
async function loadWatchlistFromBackend(username: string): Promise<string[] | null> {
  if (!USE_BACKEND || !username) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/watchlist/${encodeURIComponent(username)}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.watchlist)) {
      return data.watchlist.filter((c: string) => c.trim() !== '');
    }
  } catch (e) {
    console.warn('Failed to load watchlist from backend', e);
  }
  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() =>
    readStorage<string[]>('crypton_watchlist', [])
  );
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    readStorage<string[]>('crypton_search_history', [])
  );
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>(
    () => (localStorage.getItem('crypton_display_currency') as DisplayCurrency) ?? 'USD'
  );
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates>(FALLBACK_RATES);

  // On mount, load watchlist from backend if logged in
  useEffect(() => {
    const session = getSession();
    if (session?.username) {
      loadWatchlistFromBackend(session.username).then(coins => {
        if (coins !== null) {
          setWatchlist(coins);
          localStorage.setItem('crypton_watchlist', JSON.stringify(coins));
        }
      });
    }
  }, []);

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem('crypton_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('crypton_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('crypton_display_currency', displayCurrency);
  }, [displayCurrency]);

  useEffect(() => {
    loadCurrencyRates().then(setCurrencyRates);
  }, []);

  const toggleWatchlist = (ticker: string) => {
    setWatchlist(prev => {
      const next = prev.includes(ticker)
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker];

      // Save to backend
      const session = getSession();
      if (session?.username) {
        saveWatchlistToBackend(session.username, next);
      }

      return next;
    });
  };

  const isWatchlisted = (ticker: string) => watchlist.includes(ticker);

  const addToSearchHistory = (coin: string) =>
    setSearchHistory(prev => {
      const deduped = prev.filter(c => c.toLowerCase() !== coin.toLowerCase());
      return [coin, ...deduped].slice(0, 10);
    });

  const clearSearchHistory = () => setSearchHistory([]);

  return (
    <AppContext.Provider
      value={{
        watchlist,
        toggleWatchlist,
        isWatchlisted,
        searchHistory,
        addToSearchHistory,
        clearSearchHistory,
        displayCurrency,
        setDisplayCurrency,
        currencyRates,
      }}
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
