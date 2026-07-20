import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export const STARTING_CASH = 100_000;

export interface PaperPosition {
  ticker: string;
  qty: number;
  avgCostUsd: number;
}

export interface PaperTrade {
  id: string;
  ticker: string;
  side: 'buy' | 'sell';
  qty: number;
  priceUsd: number;
  date: string;
}

interface PaperState {
  cash: number;
  positions: Record<string, PaperPosition>;
  trades: PaperTrade[];
}

interface PaperContextValue extends PaperState {
  buy: (ticker: string, qty: number, priceUsd: number) => string | null;
  sell: (ticker: string, qty: number, priceUsd: number) => string | null;
  reset: () => void;
}

const PaperContext = createContext<PaperContextValue | null>(null);
const STORAGE_KEY = 'crypton_paper';

const INITIAL: PaperState = { cash: STARTING_CASH, positions: {}, trades: [] };

function load(): PaperState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PaperState) : INITIAL;
  } catch {
    return INITIAL;
  }
}

export function PaperTradingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PaperState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /** Returns an error message string, or null on success. */
  const buy = (ticker: string, qty: number, priceUsd: number): string | null => {
    if (qty <= 0 || priceUsd <= 0) return 'Enter a valid quantity.';
    const cost = qty * priceUsd;
    if (cost > state.cash) return 'Not enough cash for this trade.';

    setState(prev => {
      const pos = prev.positions[ticker];
      const newQty = (pos?.qty ?? 0) + qty;
      const newAvg = ((pos?.qty ?? 0) * (pos?.avgCostUsd ?? 0) + cost) / newQty;
      return {
        cash: prev.cash - cost,
        positions: { ...prev.positions, [ticker]: { ticker, qty: newQty, avgCostUsd: newAvg } },
        trades: [{ id: crypto.randomUUID(), ticker, side: 'buy', qty, priceUsd, date: new Date().toISOString() }, ...prev.trades],
      };
    });
    return null;
  };

  const sell = (ticker: string, qty: number, priceUsd: number): string | null => {
    const pos = state.positions[ticker];
    if (!pos || pos.qty <= 0) return 'You do not hold this coin.';
    if (qty <= 0) return 'Enter a valid quantity.';
    if (qty > pos.qty + 1e-12) return 'You cannot sell more than you hold.';

    setState(prev => {
      const p = prev.positions[ticker];
      const remaining = p.qty - qty;
      const positions = { ...prev.positions };
      if (remaining <= 1e-9) delete positions[ticker];
      else positions[ticker] = { ...p, qty: remaining };
      return {
        cash: prev.cash + qty * priceUsd,
        positions,
        trades: [{ id: crypto.randomUUID(), ticker, side: 'sell', qty, priceUsd, date: new Date().toISOString() }, ...prev.trades],
      };
    });
    return null;
  };

  const reset = () => setState(INITIAL);

  return (
    <PaperContext.Provider value={{ ...state, buy, sell, reset }}>
      {children}
    </PaperContext.Provider>
  );
}

export function usePaperTrading(): PaperContextValue {
  const ctx = useContext(PaperContext);
  if (!ctx) throw new Error('usePaperTrading must be used inside <PaperTradingProvider>');
  return ctx;
}
