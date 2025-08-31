
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Budget, Expense, FamilyMember, Product, Income } from '@/lib/types';
import { familyMembers as defaultFamilyMembers, products as defaultProducts, budget as defaultBudget, incomes as defaultIncomes, expenses as defaultExpenses } from '@/lib/data';
import { differenceInDays, differenceInWeeks, differenceInMonths, format, getYear } from 'date-fns';

interface DataContextType {
  budget: Budget | null;
  expenses: Expense[];
  familyMembers: FamilyMember[];
  products: Product[];
  incomes: Income[];
  savingGoal: number;
  setSavingGoal: (goal: number) => void;
  reminderDays: number;
  setReminderDays: (days: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'status'>, status?: Expense['status']) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (member: FamilyMember) => void;
  deleteFamilyMember: (memberId: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addIncome: (income: Omit<Income, 'id' | 'status'>, status?: Income['status']) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (incomeId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Attempt to migrate old data structure
      if (key === 'family-manager-products' && item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > 0 && ('dailyNeed' in parsed[0] || 'monthlyNeed' in parsed[0])) {
          const migrated = parsed.map((p: any) => {
             const newProduct: Partial<Product> = { ...p };
             if(p.dailyNeed) {
                newProduct.consumptionRate = p.dailyNeed;
                newProduct.consumptionPeriod = 'daily';
             } else if (p.halfMonthlyNeed) {
                newProduct.consumptionRate = p.halfMonthlyNeed;
                newProduct.consumptionPeriod = 'half-monthly';
             } else if (p.monthlyNeed) {
                newProduct.consumptionRate = p.monthlyNeed;
                newProduct.consumptionPeriod = 'monthly';
             }
             delete newProduct['dailyNeed' as keyof Product];
             delete newProduct['halfMonthlyNeed' as keyof Product];
             delete newProduct['monthlyNeed' as keyof Product];
             return newProduct;
          });
          return migrated as T;
        }
      }
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
  const [budget, setBudget] = useLocalStorage<Budget>('family-manager-budget', defaultBudget);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('family-manager-expenses', defaultExpenses);
  const [familyMembersData, setFamilyMembers] = useLocalStorage<FamilyMember[]>('family-manager-family', defaultFamilyMembers);
  const [productsData, setProducts] = useLocalStorage<Product[]>('family-manager-products', defaultProducts);
  const [incomesData, setIncomes] = useLocalStorage<Income[]>('family-manager-incomes', defaultIncomes);
  const [savingGoal, setSavingGoal] = useLocalStorage<number>('family-manager-saving-goal', 10000);
  const [reminderDays, setReminderDays] = useLocalStorage<number>('family-manager-reminder-days', 3);


  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      // Run stock calculation only once on mount
      const calculatedProducts = productsData.map(product => {
        const today = new Date();
        const lastUpdatedDate = new Date(product.lastUpdated);
        let stockUsed = 0;

        if (product.consumptionRate && product.consumptionPeriod) {
            const daysPassed = differenceInDays(today, lastUpdatedDate);
            switch(product.consumptionPeriod) {
                case 'daily':
                    stockUsed = daysPassed * product.consumptionRate;
                    break;
                case 'weekly':
                    const weeksPassed = differenceInWeeks(today, lastUpdatedDate);
                    stockUsed = weeksPassed * product.consumptionRate;
                    break;
                case 'half-monthly':
                    stockUsed = (differenceInWeeks(today, lastUpdatedDate) / 2) * product.consumptionRate;
                    break;
                case 'monthly':
                    const monthsPassed = differenceInMonths(today, lastUpdatedDate);
                    stockUsed = monthsPassed * product.consumptionRate;
                    break;
            }
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


  const addExpense = (expense: Omit<Expense, 'id' | 'status'>, status: Expense['status'] = 'planned') => {
    const newExpense: Expense = { ...expense, id: new Date().toISOString(), status };
    setExpenses([...expenses, newExpense].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const deleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
  };


  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember = { 
      ...member, 
      id: new Date().toISOString(),
      avatarUrl: member.avatarUrl || `https://picsum.photos/100/100?random=${Math.random()}`
    };
    setFamilyMembers([...familyMembersData, newMember]);
  };

  const updateFamilyMember = (updatedMember: FamilyMember) => {
    setFamilyMembers(familyMembersData.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const deleteFamilyMember = (memberId: string) => {
    setFamilyMembers(familyMembersData.filter(m => m.id !== memberId));
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

  const addIncome = (income: Omit<Income, 'id' | 'status'>, status: Income['status'] = 'planned') => {
      const newIncome: Income = { ...income, id: new Date().toISOString(), status };
      setIncomes([...incomesData, newIncome].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateIncome = (updatedIncome: Income) => {
    setIncomes(incomesData.map(i => i.id === updatedIncome.id ? updatedIncome : i).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteIncome = (incomeId: string) => {
    setIncomes(incomesData.filter(i => i.id !== incomeId));
  };

  // Recalculate spent amount whenever expenses change
  useEffect(() => {
    if(budget) {
      const totalSpent = expenses
        .filter(e => e.status === 'completed')
        .reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = incomesData
        .filter(i => i.status === 'completed')
        .reduce((sum, inc) => sum + inc.amount, 0);
      setBudget({ ...budget, spent: totalSpent, total: totalIncome });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, incomesData]);
  

  const value = { budget, expenses, familyMembers: familyMembersData, products: productsData, incomes: incomesData, savingGoal, setSavingGoal, reminderDays, setReminderDays, addExpense, updateExpense, deleteExpense, addFamilyMember, updateFamilyMember, deleteFamilyMember, addProduct, updateProduct, deleteProduct, addIncome, updateIncome, deleteIncome };

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
