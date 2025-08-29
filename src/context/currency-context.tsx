'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Currency = 'USD' | 'BDT';

export const exchangeRates: Record<Currency, number> = {
  USD: 1,
  BDT: 117.5,
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getSymbol: () => string;
  convert: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');

  const getSymbol = () => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'BDT':
        return '৳';
      default:
        return '$';
    }
  };

  const convert = (amount: number) => {
    return amount * exchangeRates[currency];
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getSymbol, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
