'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const storedCurrency = localStorage.getItem('familyverse-currency') as Currency;
    if (storedCurrency && (storedCurrency === 'USD' || storedCurrency === 'BDT')) {
      setCurrencyState(storedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    localStorage.setItem('familyverse-currency', newCurrency);
    setCurrencyState(newCurrency);
  };
  
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
    if (typeof amount !== 'number') return 0;
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
