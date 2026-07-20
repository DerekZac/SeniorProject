import { describe, it, expect } from 'vitest';
import { deriveHoldings, type Transaction } from './PortfolioContext';

let seq = 0;
const tx = (t: Partial<Transaction> & Pick<Transaction, 'ticker' | 'type' | 'qty' | 'priceUsd'>): Transaction => ({
  id: String(++seq),
  date: t.date ?? `2024-01-${String(seq).padStart(2, '0')}`,
  ...t,
});

describe('deriveHoldings', () => {
  it('accumulates a single buy', () => {
    const [h] = deriveHoldings([tx({ ticker: 'BTC', type: 'buy', qty: 2, priceUsd: 100 })]);
    expect(h.qty).toBe(2);
    expect(h.avgCostUsd).toBe(100);
    expect(h.costBasisUsd).toBe(200);
  });

  it('computes a weighted average cost across two buys', () => {
    const h = deriveHoldings([
      tx({ ticker: 'BTC', type: 'buy', qty: 1, priceUsd: 100, date: '2024-01-01' }),
      tx({ ticker: 'BTC', type: 'buy', qty: 1, priceUsd: 200, date: '2024-01-02' }),
    ])[0];
    expect(h.qty).toBe(2);
    expect(h.avgCostUsd).toBe(150);
  });

  it('reduces quantity on a partial sell but keeps average cost', () => {
    const h = deriveHoldings([
      tx({ ticker: 'BTC', type: 'buy', qty: 2, priceUsd: 100, date: '2024-01-01' }),
      tx({ ticker: 'BTC', type: 'sell', qty: 1, priceUsd: 500, date: '2024-01-02' }),
    ])[0];
    expect(h.qty).toBe(1);
    expect(h.avgCostUsd).toBe(100);
    expect(h.costBasisUsd).toBe(100);
  });

  it('drops a coin that is fully sold', () => {
    const holdings = deriveHoldings([
      tx({ ticker: 'ETH', type: 'buy', qty: 3, priceUsd: 50, date: '2024-01-01' }),
      tx({ ticker: 'ETH', type: 'sell', qty: 3, priceUsd: 80, date: '2024-01-02' }),
    ]);
    expect(holdings.find(h => h.ticker === 'ETH')).toBeUndefined();
  });

  it('never goes negative when selling more than held', () => {
    const holdings = deriveHoldings([
      tx({ ticker: 'SOL', type: 'buy', qty: 1, priceUsd: 20, date: '2024-01-01' }),
      tx({ ticker: 'SOL', type: 'sell', qty: 5, priceUsd: 30, date: '2024-01-02' }),
    ]);
    expect(holdings.find(h => h.ticker === 'SOL')).toBeUndefined();
  });

  it('tracks multiple coins independently', () => {
    const holdings = deriveHoldings([
      tx({ ticker: 'BTC', type: 'buy', qty: 1, priceUsd: 100 }),
      tx({ ticker: 'ETH', type: 'buy', qty: 2, priceUsd: 50 }),
    ]);
    expect(holdings).toHaveLength(2);
  });
});
