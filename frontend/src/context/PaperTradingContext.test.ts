import { describe, it, expect } from 'vitest';
import { applyBuy, applySell, STARTING_CASH, type PaperState } from './PaperTradingContext';

const fresh = (): PaperState => ({ cash: STARTING_CASH, positions: {}, trades: [] });

describe('applyBuy', () => {
  it('spends cash and opens a position', () => {
    const { state, error } = applyBuy(fresh(), 'BTC', 2, 1000);
    expect(error).toBeNull();
    expect(state.cash).toBe(STARTING_CASH - 2000);
    expect(state.positions.BTC.qty).toBe(2);
    expect(state.positions.BTC.avgCostUsd).toBe(1000);
    expect(state.trades).toHaveLength(1);
  });

  it('rejects a buy that exceeds available cash', () => {
    const start = { cash: 100, positions: {}, trades: [] };
    const { state, error } = applyBuy(start, 'BTC', 1, 1000);
    expect(error).toMatch(/cash/i);
    expect(state).toBe(start); // unchanged
  });

  it('rejects a non-positive quantity', () => {
    expect(applyBuy(fresh(), 'BTC', 0, 1000).error).toBeTruthy();
  });

  it('averages cost across two buys', () => {
    let s = fresh();
    s = applyBuy(s, 'BTC', 1, 1000).state;
    s = applyBuy(s, 'BTC', 1, 3000).state;
    expect(s.positions.BTC.qty).toBe(2);
    expect(s.positions.BTC.avgCostUsd).toBe(2000);
  });
});

describe('applySell', () => {
  it('returns cash and reduces the position', () => {
    let s = applyBuy(fresh(), 'BTC', 2, 1000).state;
    const { state, error } = applySell(s, 'BTC', 1, 1500);
    expect(error).toBeNull();
    expect(state.positions.BTC.qty).toBe(1);
    expect(state.cash).toBe(STARTING_CASH - 2000 + 1500);
  });

  it('removes the position when fully sold', () => {
    const s = applyBuy(fresh(), 'BTC', 1, 1000).state;
    const { state } = applySell(s, 'BTC', 1, 1200);
    expect(state.positions.BTC).toBeUndefined();
  });

  it('refuses to sell more than held', () => {
    const s = applyBuy(fresh(), 'BTC', 1, 1000).state;
    expect(applySell(s, 'BTC', 5, 1000).error).toMatch(/more than/i);
  });

  it('refuses to sell a coin not held', () => {
    expect(applySell(fresh(), 'DOGE', 1, 1).error).toBeTruthy();
  });
});
