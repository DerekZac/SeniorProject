import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { api } from '../lib/api';
import { logger } from '../lib/logger';

export interface PriceAlert {
  id: string;
  ticker: string;
  direction: 'above' | 'below';
  targetUsd: number;
  createdAt: string;
  triggeredAt: string | null;
  lastPriceUsd?: number;
}

interface AlertsContextValue {
  alerts: PriceAlert[];
  addAlert: (a: Pick<PriceAlert, 'ticker' | 'direction' | 'targetUsd'>) => void;
  removeAlert: (id: string) => void;
  clearTriggered: () => void;
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<void>;
  activeCount: number;
  triggeredCount: number;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);
const STORAGE_KEY = 'crypton_alerts';
const POLL_MS = 60_000;

function load(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PriceAlert[]) : [];
  } catch {
    return [];
  }
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(load);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => typeof Notification !== 'undefined' && Notification.permission === 'granted',
  );
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const notify = (alert: PriceAlert, price: number) => {
    const msg = `${alert.ticker} is ${alert.direction} $${alert.targetUsd.toLocaleString()} (now $${price.toLocaleString()})`;
    logger.info('app', 'Price alert triggered', { ticker: alert.ticker });
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification('Crypton price alert', { body: msg }); } catch { /* ignore */ }
    }
  };

  // Poll live prices and trip any alert whose target has been crossed.
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const active = alertsRef.current.filter(a => !a.triggeredAt);
      const tickers = [...new Set(active.map(a => a.ticker))];
      if (tickers.length === 0) return;

      try {
        const prices = await api.getPricesByTickers(tickers);
        if (cancelled) return;
        setAlerts(prev => prev.map(a => {
          if (a.triggeredAt) return a;
          const coin = prices[a.ticker.toUpperCase()];
          if (!coin) return a;
          const price = coin.priceUsd;
          const hit = a.direction === 'above' ? price >= a.targetUsd : price <= a.targetUsd;
          if (hit) { notify(a, price); return { ...a, triggeredAt: new Date().toISOString(), lastPriceUsd: price }; }
          return { ...a, lastPriceUsd: price };
        }));
      } catch (e) {
        logger.warn('app', 'Alert poll failed', { error: String(e) });
      }
    };

    check();
    const id = setInterval(check, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const addAlert: AlertsContextValue['addAlert'] = a =>
    setAlerts(prev => [
      { ...a, ticker: a.ticker.toUpperCase(), id: crypto.randomUUID(), createdAt: new Date().toISOString(), triggeredAt: null },
      ...prev,
    ]);

  const removeAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const clearTriggered = () => setAlerts(prev => prev.filter(a => !a.triggeredAt));

  const enableNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setNotificationsEnabled(perm === 'granted');
  };

  const activeCount = alerts.filter(a => !a.triggeredAt).length;
  const triggeredCount = alerts.filter(a => a.triggeredAt).length;

  return (
    <AlertsContext.Provider value={{
      alerts, addAlert, removeAlert, clearTriggered,
      notificationsEnabled, enableNotifications, activeCount, triggeredCount,
    }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts(): AlertsContextValue {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used inside <AlertsProvider>');
  return ctx;
}
