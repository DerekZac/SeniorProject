/**
 * Minimal CSV export helper. Powers the "Data Export" feature across the
 * Watchlist, Portfolio, and Paper Trading pages. Client-side only — builds a
 * Blob and triggers a download, no backend involved.
 */

function escapeCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  // Quote when the value contains a comma, quote, or newline; double inner quotes.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Turn an array of flat objects into CSV text using the given column order. */
export function toCsv<T extends Record<string, unknown>>(rows: T[], columns?: (keyof T)[]): string {
  if (rows.length === 0) return '';
  const cols = (columns ?? (Object.keys(rows[0]) as (keyof T)[]));
  const header = cols.map(c => escapeCell(c as string)).join(',');
  const body = rows
    .map(row => cols.map(c => escapeCell(row[c])).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

/** Build a CSV and prompt the browser to download it. */
export function downloadCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns?: (keyof T)[],
): void {
  const csv = toCsv(rows, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
