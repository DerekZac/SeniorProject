import { describe, it, expect } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('renders a header row and data rows', () => {
    expect(toCsv([{ a: 1, b: 2 }, { a: 3, b: 4 }])).toBe('a,b\n1,2\n3,4');
  });

  it('returns an empty string for no rows', () => {
    expect(toCsv([])).toBe('');
  });

  it('respects an explicit column order', () => {
    expect(toCsv([{ a: 1, b: 2 }], ['b', 'a'])).toBe('b,a\n2,1');
  });

  it('quotes and escapes values containing commas, quotes or newlines', () => {
    const csv = toCsv([{ name: 'Doe, John', note: 'he said "hi"' }]);
    expect(csv).toBe('name,note\n"Doe, John","he said ""hi"""');
  });

  it('renders null/undefined as empty cells', () => {
    expect(toCsv([{ a: null, b: undefined, c: 0 }])).toBe('a,b,c\n,,0');
  });
});
