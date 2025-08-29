'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  getSymbol: () => string;
  convert: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const getSymbol = () => '৳';

  const convert = (amount: number) => {
    if (typeof amount !== 'number') return 0;
    return amount;
  };

  return (
    <CurrencyContext.Provider value={{ getSymbol, convert }}>
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
