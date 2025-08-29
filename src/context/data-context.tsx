'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Budget, Expense, FamilyMember, Product, Income } from '@/lib/types';
import { familyMembers, products as defaultProducts, budget as defaultBudget, incomes as defaultIncomes } from '@/lib/data';
import { differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';

interface DataContextType {
  budget: Budget | null;
  expenses: Expense[];
  familyMembers: FamilyMember[];
  products: Product[];
  incomes: Income[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'avatarUrl'>) => void;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [budget, setBudget] = useLocalStorage<Budget>('familyverse-budget', defaultBudget);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('familyverse-expenses', []);
  const [familyMembersData, setFamilyMembers] = useLocalStorage<FamilyMember[]>('familyverse-family', familyMembers);
  const [productsData, setProducts] = useLocalStorage<Product[]>('familyverse-products', defaultProducts);
  const [incomesData, setIncomes] = useLocalStorage<Income[]>('familyverse-incomes', defaultIncomes);


  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      // Run stock calculation only once on mount
      const calculatedProducts = productsData.map(product => {
        const today = new Date();
        const lastUpdatedDate = new Date(product.lastUpdated);
        let stockUsed = 0;

        if (product.dailyNeed) {
          const daysPassed = differenceInDays(today, lastUpdatedDate);
          stockUsed += daysPassed * product.dailyNeed;
        }
        if (product.halfMonthlyNeed) {
           const weeksPassed = differenceInWeeks(today, lastUpdatedDate);
           stockUsed += (weeksPassed / 2) * product.halfMonthlyNeed;
        }
        if (product.monthlyNeed) {
          const monthsPassed = differenceInMonths(today, lastUpdatedDate);
          stockUsed += monthsPassed * product.monthlyNeed;
        }

        const newStock = Math.max(0, product.currentStock - stockUsed);

        // Only update if stock has changed to avoid unnecessary re-renders
        if (newStock !== product.currentStock) {
          return { ...product, currentStock: newStock, lastUpdated: today.toISOString() };
        }
        return product;
      });
      setProducts(calculatedProducts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);


  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: new Date().toISOString() };
    setExpenses([...expenses, newExpense]);
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id' | 'avatarUrl'>) => {
    const newMember = { 
      ...member, 
      id: new Date().toISOString(),
      avatarUrl: `https://picsum.photos/100/100?random=${Math.random()}`
    };
    setFamilyMembers([...familyMembersData, newMember]);
  };
  
  const addProduct = (product: Omit<Product, 'id' | 'lastUpdated'>) => {
      const newProduct: Product = { 
        ...product, 
        id: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      setProducts([...productsData, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(productsData.map(p => p.id === updatedProduct.id ? {...updatedProduct, lastUpdated: new Date().toISOString()} : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(productsData.filter(p => p.id !== productId));
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
      const newIncome = { ...income, id: new Date().toISOString() };
      setIncomes([...incomesData, newIncome]);
  };

  // Recalculate spent amount whenever expenses change
  useEffect(() => {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    setBudget({ ...budget, spent: totalSpent });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);
  

  const value = { budget, expenses, familyMembers: familyMembersData, products: productsData, incomes: incomesData, addExpense, addFamilyMember, addProduct, updateProduct, deleteProduct, addIncome };

  if (!isMounted) {
     return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
