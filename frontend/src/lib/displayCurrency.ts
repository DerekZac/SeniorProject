export const DISPLAY_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'BTC', 'ETH'] as const;

export type DisplayCurrency = typeof DISPLAY_CURRENCIES[number];

export interface CurrencyRates {
  fiat: Record<'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF', number>;
  btcUsd: number;
  ethUsd: number;
  loadedAt: number;
}

export const FALLBACK_RATES: CurrencyRates = {
  fiat: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 155.4,
    CAD: 1.36,
    AUD: 1.54,
    CHF: 0.90,
  },
  btcUsd: 0,
  ethUsd: 0,
  loadedAt: 0,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF',
};

let ratesPromise: Promise<CurrencyRates> | null = null;

async function fetchFiatRates(): Promise<CurrencyRates['fiat']> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
  const data = await res.json();
  const rates = data?.rates;
  if (!rates) throw new Error('FX response missing rates');

  return {
    USD: 1,
    EUR: Number(rates.EUR ?? FALLBACK_RATES.fiat.EUR),
    GBP: Number(rates.GBP ?? FALLBACK_RATES.fiat.GBP),
    JPY: Number(rates.JPY ?? FALLBACK_RATES.fiat.JPY),
    CAD: Number(rates.CAD ?? FALLBACK_RATES.fiat.CAD),
    AUD: Number(rates.AUD ?? FALLBACK_RATES.fiat.AUD),
    CHF: Number(rates.CHF ?? FALLBACK_RATES.fiat.CHF),
  };
}

async function fetchCryptoUsdPrices(): Promise<{ btcUsd: number; ethUsd: number }> {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
  if (!res.ok) throw new Error(`CoinGecko simple price HTTP ${res.status}`);
  const data = await res.json();
  const btcUsd = Number(data?.bitcoin?.usd);
  const ethUsd = Number(data?.ethereum?.usd);
  if (!Number.isFinite(btcUsd) || !Number.isFinite(ethUsd)) {
    throw new Error('CoinGecko simple price response missing BTC/ETH');
  }
  return { btcUsd, ethUsd };
}

export async function loadCurrencyRates(): Promise<CurrencyRates> {
  if (!ratesPromise) {
    ratesPromise = Promise.all([fetchFiatRates(), fetchCryptoUsdPrices()])
      .then(([fiat, crypto]) => ({
        fiat,
        btcUsd: crypto.btcUsd,
        ethUsd: crypto.ethUsd,
        loadedAt: Date.now(),
      }))
      .catch(() => ({ ...FALLBACK_RATES, loadedAt: Date.now() }));
  }

  return ratesPromise;
}

export function convertUsdToDisplay(usdAmount: number, currency: DisplayCurrency, rates: CurrencyRates = FALLBACK_RATES): number {
  if (!Number.isFinite(usdAmount)) return 0;
  if (currency === 'USD') return usdAmount;
  if (currency === 'BTC') return rates.btcUsd > 0 ? usdAmount / rates.btcUsd : usdAmount;
  if (currency === 'ETH') return rates.ethUsd > 0 ? usdAmount / rates.ethUsd : usdAmount;
  return usdAmount * (rates.fiat[currency] ?? FALLBACK_RATES.fiat[currency]);
}

function formatFiat(converted: number, currency: Exclude<DisplayCurrency, 'BTC' | 'ETH'>, compact: boolean): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const abs = Math.abs(converted);
  const decimals = currency === 'JPY' ? 0 : abs < 1 ? 4 : 2;

  if (!compact) {
    return `${symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  if (abs >= 1e12) return `${symbol}${(converted / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${symbol}${(converted / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `${symbol}${(converted / 1e6).toFixed(2)}M`;
  if (abs >= 1e3)  return `${symbol}${(converted / 1e3).toFixed(2)}K`;
  return `${symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function formatCrypto(converted: number, currency: 'BTC' | 'ETH', compact: boolean): string {
  const abs = Math.abs(converted);
  const decimals = abs >= 1 ? 6 : abs >= 0.01 ? 8 : 10;

  if (!compact) {
    return `${converted.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} ${currency}`;
  }

  if (abs >= 1e9)  return `${(converted / 1e9).toFixed(2)}B ${currency}`;
  if (abs >= 1e6)  return `${(converted / 1e6).toFixed(2)}M ${currency}`;
  if (abs >= 1e3)  return `${(converted / 1e3).toFixed(2)}K ${currency}`;
  return `${converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${currency}`;
}

export function formatUsdToDisplay(usdAmount: number, currency: DisplayCurrency, rates: CurrencyRates = FALLBACK_RATES, compact = false): string {
  const converted = convertUsdToDisplay(usdAmount, currency, rates);
  if (currency === 'BTC' || currency === 'ETH') {
    return formatCrypto(converted, currency, compact);
  }
  return formatFiat(converted, currency, compact);
}
