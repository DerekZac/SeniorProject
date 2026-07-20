import type { ReactNode } from 'react';
import { PortfolioProvider } from './PortfolioContext';
import { PaperTradingProvider } from './PaperTradingContext';
import { AlertsProvider } from './AlertsContext';
import { SavedNewsProvider } from './SavedNewsContext';

/** Single wrapper for the feature contexts added on top of the core app. */
export function FeatureProviders({ children }: { children: ReactNode }) {
  return (
    <PortfolioProvider>
      <PaperTradingProvider>
        <AlertsProvider>
          <SavedNewsProvider>
            {children}
          </SavedNewsProvider>
        </AlertsProvider>
      </PaperTradingProvider>
    </PortfolioProvider>
  );
}
