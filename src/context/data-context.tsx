

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Expense, FamilyMember, Product, Income } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import {
  calculateAutoReducedStock,
  generateRecurrentTransactions,
  getSettings,
  updateSettings,
  addExpenseOp,
  updateExpenseOp,
  deleteExpenseOp,
  addIncomeOp,
  updateIncomeOp,
  deleteIncomeOp,
  addProductOp,
  updateProductOp,
  deleteProductOp,
  clearProductsOp,
  addFamilyMemberOp,
  updateFamilyMemberOp,
  deleteFamilyMemberOp,
  clearFamilyMembersOp,
  completePlannedTransactionOp,
  cancelPlannedTransactionOp,
  clearAllUserDataOp,
  clearMonthDataOp,
} from '@/lib/data-operations';


interface DataContextType {
  expenses: Expense[];
  products: Product[];
  incomes: Income[];
  familyMembers: FamilyMember[];
  savingGoal: number;
  setSavingGoal: (goal: number) => void;
  reminderDays: number;
  setReminderDays: (days: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>, status?: Expense['status']) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  clearProducts: () => Promise<void>;
  addIncome: (income: Omit<Income, 'id'>, status?: Income['status']) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (incomeId: string) => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => Promise<void>;
  updateFamilyMember: (member: FamilyMember) => Promise<void>;
  deleteFamilyMember: (memberId: string) => Promise<void>;
  clearFamilyMembers: () => Promise<void>;
  completePlannedTransaction: (transaction: Income | Expense, type: 'income' | 'expense', actualAmount?: number) => Promise<void>;
  cancelPlannedTransaction: (transaction: Income | Expense, type: 'income' | 'expense') => Promise<void>;
  clearAllUserData: () => Promise<void>;
  clearMonthData: (year: number, month: number) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [savingGoal, setSavingGoalState] = useState<number>(0);
  const [reminderDays, setReminderDaysState] = useState<number>(3);
  
  const userId = user?.uid || null;

  // Fetch initial data and set up listeners
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      // Reset states when user logs out
      setExpenses([]);
      setIncomes([]);
      setProducts([]);
      setFamilyMembers([]);
      setSavingGoalState(0);
      setReminderDaysState(3);
      return;
    }
    
    setLoading(true);
    const unsubscribes: (() => void)[] = [];

    const setupSubscription = (collectionName: string, setter: React.Dispatch<React.SetStateAction<any[]>>, processData?: (data: any[]) => any[]) => {
        const collectionRef = collection(db, `users/${userId}/${collectionName}`);
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

             if (collectionName === 'incomes' || collectionName === 'expenses') {
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 5);
                const recurrent = generateRecurrentTransactions(data, futureDate);
                data = [...data, ...recurrent];
            }

            if (processData) {
              data = processData(data);
            }
            setter(data);
            setLoading(false);
        }, (error) => {
            console.error(`Error fetching ${collectionRef.path}:`, error);
            setLoading(false);
        });
        unsubscribes.push(unsubscribe);
    };

    setupSubscription('expenses', setExpenses);
    setupSubscription('incomes', setIncomes);
    setupSubscription('products', setProducts, (data) => data.map(calculateAutoReducedStock));
    setupSubscription('familyMembers', setFamilyMembers);
    
    getSettings(userId).then(settings => {
      setSavingGoalState(settings.savingGoal);
      setReminderDaysState(settings.reminderDays);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [userId]);

  const setSavingGoal = async (goal: number) => {
    if (!userId) return;
    setSavingGoalState(goal); // Optimistic update
    await updateSettings(userId, { savingGoal: goal });
  }

  const setReminderDays = async (days: number) => {
    if (!userId) return;
    setReminderDaysState(days); // Optimistic update
    await updateSettings(userId, { reminderDays: days });
  }
  
  const addExpense = async (expense: Omit<Expense, 'id'>, status: Expense['status'] = 'planned') => {
    if (!userId) return;
    const newExpense = { ...expense, status };
    await addExpenseOp(userId, newExpense);
  };
  
  const updateExpense = async (updatedExpense: Expense) => {
      if (!userId) return;

      if ((updatedExpense as any).isRecurrentProjection) {
        const { id, isRecurrentProjection, createdAt, ...data } = updatedExpense as any;
        addExpense({ ...data, recurrent: false, edited: true }, 'planned');
        return;
      }
      
      await updateExpenseOp(userId, updatedExpense);
  };
  
  const deleteExpense = async (expenseId: string) => {
    if (!userId) return;
    const expenseToDelete = expenses.find(e => e.id === expenseId);
    if (!expenseToDelete) return;

    if (!expenseToDelete.recurrent) {
        await deleteDoc(doc(db, `users/${userId}/expenses`, expenseId));
        return;
    }
    await deleteExpenseOp(userId, expenseToDelete);
  };

  const addProduct = async (product: Omit<Product, 'id' | 'lastUpdated' | 'createdAt'>) => {
      if (!userId) return;
      await addProductOp(userId, product);
  };

  const updateProduct = async (updatedProduct: Product) => {
      if (!userId) return;
      await updateProductOp(userId, updatedProduct);
  };

  const deleteProduct = async (productId: string) => {
    if (!userId) return;
    await deleteProductOp(userId, productId);
  };
  
  const clearProducts = async () => {
    if (!userId) return;
    await clearProductsOp(userId);
  };

  const addIncome = async (income: Omit<Income, 'id'>, status: Income['status'] = 'planned') => {
      if (!userId) return;
      await addIncomeOp(userId, {...income, status});
  };

  const updateIncome = async (updatedIncome: Income) => {
    if (!userId) return;
    
    if ((updatedIncome as any).isRecurrentProjection) {
        const { id, isRecurrentProjection, createdAt, ...data } = updatedIncome as any;
        addIncome({ ...data, recurrent: false, edited: true }, 'planned');
        return;
    }

    await updateIncomeOp(userId, updatedIncome);
  };

  const deleteIncome = async (incomeId: string) => {
    if (!userId) return;
    const incomeToDelete = incomes.find(i => i.id === incomeId);
    if (!incomeToDelete) return;

    if (!incomeToDelete.recurrent) {
        await deleteDoc(doc(db, `users/${userId}/incomes`, incomeId));
        return;
    }
    
    await deleteIncomeOp(userId, incomeToDelete);
  };
  
  const addFamilyMember = async (member: Omit<FamilyMember, 'id' | 'createdAt'>) => {
    if (!userId) return;
    await addFamilyMemberOp(userId, member);
  };

  const updateFamilyMember = async (member: FamilyMember) => {
    if (!userId) return;
    await updateFamilyMemberOp(userId, member);
  };

  const deleteFamilyMember = async (memberId: string) => {
    if (!userId) return;
    await deleteFamilyMemberOp(userId, memberId);
  };

  const clearFamilyMembers = async () => {
    if (!userId) return;
    await clearFamilyMembersOp(userId);
  };

  const clearAllUserData = async () => {
    if (!userId) return;
    await clearAllUserDataOp(userId);
  };
  
  const clearMonthData = async (year: number, month: number) => {
    if (!userId) return;
    await clearMonthDataOp(userId, year, month);
  };

  const completePlannedTransaction = async (transaction: Income | Expense, type: 'income' | 'expense', actualAmount?: number) => {
    if (!userId) return;
    await completePlannedTransactionOp(userId, transaction, type, actualAmount);
  };
  
  const cancelPlannedTransaction = async (transaction: Income | Expense, type: 'income' | 'expense') => {
    if (!userId) return;
    await cancelPlannedTransactionOp(userId, transaction, type);
  }


  const value = { 
    expenses, 
    products, 
    incomes, 
    familyMembers,
    savingGoal, 
    setSavingGoal, 
    reminderDays, 
    setReminderDays, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    addProduct, 
    updateProduct,
    deleteProduct,
    clearProducts,
    addIncome, 
    updateIncome, 
    deleteIncome, 
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    clearFamilyMembers,
    clearAllUserData,
    clearMonthData,
    completePlannedTransaction, 
    cancelPlannedTransaction,
    loading
  };

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
