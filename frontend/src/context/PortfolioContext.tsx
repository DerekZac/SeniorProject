import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';

/** A single buy/sell the user recorded (real holdings tracker). */
export interface Transaction {
  id: string;
  ticker: string;
  type: 'buy' | 'sell';
  qty: number;
  priceUsd: number;   // price per coin at the time, in USD
  date: string;       // ISO date
}

/** Net position for one coin, derived from its transactions. */
export interface Holding {
  ticker: string;
  qty: number;         // net quantity held
  costBasisUsd: number; // total remaining cost basis
  avgCostUsd: number;  // cost basis / qty
}

interface PortfolioContextValue {
  transactions: Transaction[];
  holdings: Holding[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  clearAll: () => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);
const STORAGE_KEY = 'crypton_portfolio';

function load(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

/**
 * Derive current holdings from the transaction log using a running
 * average-cost method: buys add qty and cost; sells reduce qty and cost
 * proportionally (so avg cost stays stable and realized P/L isn't double-counted).
 */
function deriveHoldings(txns: Transaction[]): Holding[] {
  const byTicker = new Map<string, { qty: number; cost: number }>();
  // Oldest first so average cost builds correctly.
  const ordered = [...txns].sort((a, b) => a.date.localeCompare(b.date));

  for (const t of ordered) {
    const cur = byTicker.get(t.ticker) ?? { qty: 0, cost: 0 };
    if (t.type === 'buy') {
      cur.qty += t.qty;
      cur.cost += t.qty * t.priceUsd;
    } else {
      const avg = cur.qty > 0 ? cur.cost / cur.qty : 0;
      const sellQty = Math.min(t.qty, cur.qty);
      cur.qty -= sellQty;
      cur.cost -= sellQty * avg;
    }
    byTicker.set(t.ticker, cur);
  }

  return [...byTicker.entries()]
    .filter(([, v]) => v.qty > 1e-12)
    .map(([ticker, v]) => ({
      ticker,
      qty: v.qty,
      costBasisUsd: v.cost,
      avgCostUsd: v.qty > 0 ? v.cost / v.qty : 0,
    }));
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (t: Omit<Transaction, 'id'>) =>
    setTransactions(prev => [...prev, { ...t, id: crypto.randomUUID() }]);

  const removeTransaction = (id: string) =>
    setTransactions(prev => prev.filter(t => t.id !== id));

  const clearAll = () => setTransactions([]);

  const holdings = useMemo(() => deriveHoldings(transactions), [transactions]);

  return (
    <PortfolioContext.Provider value={{ transactions, holdings, addTransaction, removeTransaction, clearAll }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used inside <PortfolioProvider>');
  return ctx;
}
