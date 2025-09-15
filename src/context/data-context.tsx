

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Expense, FamilyMember, Product, Income } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp, setDoc, writeBatch, getDocs, getDoc } from "firebase/firestore";
import { differenceInDays, differenceInWeeks, differenceInMonths, isFuture, getMonth, getYear, set, addMonths, format } from 'date-fns';

interface DataContextType {
  expenses: Expense[];
  products: Product[];
  incomes: Income[];
  familyMembers: FamilyMember[];
  savingGoal: number;
  setSavingGoal: (goal: number) => void;
  reminderDays: number;
  setReminderDays: (days: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'status' | 'plannedAmount' | 'plannedId' | 'edited' | 'createdAt'>, status?: Expense['status']) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  clearProducts: () => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'status' | 'plannedAmount' | 'plannedId' | 'edited' | 'createdAt'>, status?: Income['status']) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (incomeId: string) => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => Promise<void>;
  updateFamilyMember: (member: FamilyMember) => Promise<void>;
  deleteFamilyMember: (memberId: string) => Promise<void>;
  clearFamilyMembers: () => Promise<void>;
  completePlannedTransaction: (transaction: Income | Expense, type: 'income' | 'expense', actualAmount?: number) => Promise<void>;
  cancelPlannedTransaction: (transaction: Income | Expense, type: 'income' | 'expense') => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateRecurrentTransactions = <T extends Income | Expense>(
  transactions: T[],
  endDate: Date
): T[] => {
  const futureTransactions: T[] = [];
  const existingIds = new Set(transactions.map(t => t.id));
  const baseTransactionIds = new Set(transactions.map(t => t.id));

  // Filter for original planned transactions that are marked as recurrent.
  const recurrentPlanned = transactions.filter(
    t => t.recurrent && t.status === 'planned' && !t.plannedId
  );
  
  recurrentPlanned.forEach(t => {
      // Ensure the base transaction still exists in the main list before projecting
      if (!baseTransactionIds.has(t.id)) {
        return;
      }
      
      let nextDate = addMonths(new Date(t.date), 1);
      
      while (nextDate <= endDate) {
          const year = getYear(nextDate);
          const month = getMonth(nextDate);

          const transactionForMonthExists = transactions.some(existingTx => 
              existingTx.plannedId === t.id && 
              getYear(new Date(existingTx.date)) === year &&
              getMonth(new Date(existingTx.date)) === month
          );

          if (!transactionForMonthExists) {
              const newId = `${t.id}-rec-${format(nextDate, 'yyyy-MM')}`;
              if (!existingIds.has(newId)) {
                  futureTransactions.push({
                      ...t,
                      id: newId,
                      date: format(nextDate, 'yyyy-MM-dd'),
                      plannedId: t.id,
                      isRecurrentProjection: true,
                  } as T & { isRecurrentProjection: boolean });
                  existingIds.add(newId);
              }
          }
          nextDate = addMonths(nextDate, 1);
      }
  });

  return futureTransactions;
};


export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [savingGoal, setSavingGoalState] = useState<number>(0);
  const [reminderDays, setReminderDaysState] = useState<number>(3);
  
  const getCollectionRef = useCallback((collectionName: string) => {
    if (!user) return null;
    return collection(db, `users/${user.uid}/${collectionName}`);
  }, [user]);

  const calculateAutoReducedStock = (product: Product): Product => {
    if (!product.consumptionRate || !product.consumptionPeriod || !product.lastUpdated) {
        return product;
    }

    const now = new Date();
    const lastUpdatedDate = new Date(product.lastUpdated);
    let periodsPassed = 0;

    switch (product.consumptionPeriod) {
        case 'daily':
            periodsPassed = differenceInDays(now, lastUpdatedDate);
            break;
        case 'weekly':
            periodsPassed = differenceInWeeks(now, lastUpdatedDate);
            break;
        case 'half-monthly':
            // Approximate as 2 weeks
            periodsPassed = Math.floor(differenceInDays(now, lastUpdatedDate) / 14);
            break;
        case 'monthly':
            periodsPassed = differenceInMonths(now, lastUpdatedDate);
            break;
    }

    if (periodsPassed > 0) {
        const consumedAmount = periodsPassed * product.consumptionRate;
        const newStock = Math.max(0, product.currentStock - consumedAmount);
        return { ...product, currentStock: newStock };
    }

    return product;
  };


  // Fetch initial data and set up listeners
  useEffect(() => {
    if (!user) {
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
        const collectionRef = getCollectionRef(collectionName);
        if (!collectionRef) return;
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Generate recurrent transactions for the next 5 years
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
        }, (error) => {
            console.error(`Error fetching ${collectionRef.path}:`, error);
        });
        unsubscribes.push(unsubscribe);
    };

    // Set up listeners for all collections
    setupSubscription('expenses', setExpenses);
    setupSubscription('incomes', setIncomes);
    setupSubscription('products', setProducts, (data) => data.map(calculateAutoReducedStock));
    setupSubscription('familyMembers', setFamilyMembers);
    
    // Listener for settings changes
    const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'main');
    const unsubscribeSettings = onSnapshot(settingsDocRef, (doc) => {
        if (doc.exists()) {
            const settings = doc.data();
            setSavingGoalState(settings.savingGoal ?? 0);
            setReminderDaysState(settings.reminderDays ?? 3);
        } else {
            // If settings don't exist, create them
            setDoc(settingsDocRef, { savingGoal: 0, reminderDays: 3 });
        }
    });
    unsubscribes.push(unsubscribeSettings);

    setLoading(false);


    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user, getCollectionRef]);

  const setSavingGoal = async (goal: number) => {
    const settingsDocRef = user ? doc(db, 'users', user.uid, 'settings', 'main') : null;
    if (settingsDocRef) {
        setSavingGoalState(goal); // Optimistic update
        await updateDoc(settingsDocRef, { savingGoal: goal });
    }
  }

  const setReminderDays = async (days: number) => {
      const settingsDocRef = user ? doc(db, 'users', user.uid, 'settings', 'main') : null;
      if (settingsDocRef) {
          setReminderDaysState(days); // Optimistic update
          await updateDoc(settingsDocRef, { reminderDays: days });
      }
  }
  
  const addExpense = async (expense: Omit<Expense, 'id' | 'status' | 'plannedAmount' | 'plannedId' | 'edited' | 'createdAt'>, status: Expense['status'] = 'planned') => {
    const collectionRef = getCollectionRef('expenses');
    if (!collectionRef) return;
    const docRef = doc(collectionRef);
    const newExpense = { ...expense, id: docRef.id, status, createdAt: Timestamp.now() };
    await setDoc(docRef, newExpense);
  };
  
  const updateExpense = async (updatedExpense: Expense) => {
      if (!user) return;

      if ((updatedExpense as any).isRecurrentProjection) {
        // If user is editing a future projection, create a new, one-time planned transaction
        const { id, isRecurrentProjection, ...data } = updatedExpense as any;
        addExpense({ ...data }, 'planned');
        return;
      }

      // If user is editing the original recurrent transaction
      const { id, createdAt, ...dataToUpdate } = updatedExpense as any;
      const docRef = doc(db, `users/${user.uid}/expenses`, id);
      await updateDoc(docRef, {...dataToUpdate, edited: true});
  };
  
  const deleteExpense = async (expenseId: string) => {
    if (!user) return;
    const expenseToDelete = expenses.find(e => e.id === expenseId);
    if (!expenseToDelete) return;
  
    if ((expenseToDelete as any).isRecurrentProjection) {
      await cancelPlannedTransaction(expenseToDelete, 'expense');
    } else {
      const docRef = doc(db, `users/${user.uid}/expenses`, expenseId);
      await deleteDoc(docRef);
    }
  };
  
  const addProduct = async (product: Omit<Product, 'id' | 'lastUpdated' | 'createdAt'>) => {
      const collectionRef = getCollectionRef('products');
      if (!collectionRef) return;
      const docRef = doc(collectionRef);
      const newProduct = { 
        ...product,
        id: docRef.id, 
        lastUpdated: new Date().toISOString(),
        createdAt: Timestamp.now()
      };
      await setDoc(docRef, newProduct);
  };

  const updateProduct = async (updatedProduct: Product) => {
      if (!user) return;
      const { id, ...dataToUpdate } = updatedProduct;
      const docRef = doc(db, `users/${user.uid}/products`, id);
      await updateDoc(docRef, {...dataToUpdate, lastUpdated: new Date().toISOString()});
  };

  const deleteProduct = async (productId: string) => {
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/products`, productId);
    await deleteDoc(docRef);
  };
  
  const clearProducts = async () => {
    const collectionRef = getCollectionRef('products');
    if (!collectionRef) return;

    const snapshot = await getDocs(collectionRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
  };

  const addIncome = async (income: Omit<Income, 'id' | 'status' | 'plannedAmount' | 'plannedId' | 'edited' | 'createdAt'>, status: Income['status'] = 'planned') => {
      const collectionRef = getCollectionRef('incomes');
      if (!collectionRef) return;
      const docRef = doc(collectionRef);
      const newIncome = { ...income, id: docRef.id, status, createdAt: Timestamp.now() };
      await setDoc(docRef, newIncome);
  };

  const updateIncome = async (updatedIncome: Income) => {
    if (!user) return;
    
    if ((updatedIncome as any).isRecurrentProjection) {
        // If user is editing a future projection, create a new, one-time planned transaction
        const { id, isRecurrentProjection, ...data } = updatedIncome as any;
        addIncome({ ...data }, 'planned');
        return;
    }

    // If user is editing the original recurrent transaction
    const { id, createdAt, ...dataToUpdate } = updatedIncome as any;
    const docRef = doc(db, `users/${user.uid}/incomes`, id);
    await updateDoc(docRef, {...dataToUpdate, edited: true});
  };

  const deleteIncome = async (incomeId: string) => {
    if (!user) return;
    const incomeToDelete = incomes.find(i => i.id === incomeId);
    if (!incomeToDelete) return;
  
    if ((incomeToDelete as any).isRecurrentProjection) {
      await cancelPlannedTransaction(incomeToDelete, 'income');
    } else {
      const docRef = doc(db, `users/${user.uid}/incomes`, incomeId);
      await deleteDoc(docRef);
    }
  };
  
  const addFamilyMember = async (member: Omit<FamilyMember, 'id' | 'createdAt'>) => {
    const collectionRef = getCollectionRef('familyMembers');
    if (!collectionRef) return;
    const newDocRef = doc(collectionRef); // Generate a new doc ref with a unique ID
    const newMember = { ...member, id: newDocRef.id, createdAt: Timestamp.now() };
    await setDoc(newDocRef, newMember); // Use the new ref to set the document
  };

  const updateFamilyMember = async (member: FamilyMember) => {
    if (!user) return;
    const { id, ...dataToUpdate } = member;
    const docRef = doc(db, `users/${user.uid}/familyMembers`, id);
    await updateDoc(docRef, dataToUpdate);
  };

  const deleteFamilyMember = async (memberId: string) => {
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/familyMembers`, memberId);
    await deleteDoc(docRef);
  };

  const clearFamilyMembers = async () => {
    const collectionRef = getCollectionRef('familyMembers');
    if (!collectionRef) return;

    const snapshot = await getDocs(collectionRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
  };

  const completePlannedTransaction = async (transaction: Income | Expense, type: 'income' | 'expense', actualAmount?: number) => {
    const collectionRef = type === 'income' ? getCollectionRef('incomes') : getCollectionRef('expenses');
    if (!collectionRef) return;
    
    // If it's a projection, the ID to link is in plannedId. If it's an original, it's in id.
    const originalPlannedId = (transaction as any).isRecurrentProjection ? transaction.plannedId : transaction.id;

    const { id, ...originalData } = transaction;
    // Remove createdAt from originalData if it exists to avoid Firestore errors
    const { createdAt, isRecurrentProjection, ...restData } = originalData as any;

    const newActualTransaction = {
      ...restData,
      status: 'completed' as const,
      plannedId: originalPlannedId, 
      plannedAmount: originalData.amount,
      amount: actualAmount ?? originalData.amount,
      date: new Date().toISOString().split('T')[0], // For recurrent, use the projected date
      createdAt: Timestamp.now(),
    };

    await addDoc(collectionRef, newActualTransaction);
  };
  
  const cancelPlannedTransaction = async (transaction: Income | Expense, type: 'income' | 'expense') => {
    const collectionRef = type === 'income' ? getCollectionRef('incomes') : getCollectionRef('expenses');
    if (!collectionRef) return;
    
    const originalPlannedId = (transaction as any).isRecurrentProjection ? transaction.plannedId : transaction.id;

    const { id, ...originalData } = transaction;
    const { createdAt, isRecurrentProjection, ...restData } = originalData as any;


    const newCancelledTransaction = {
        ...restData,
        status: 'cancelled' as const,
        plannedId: originalPlannedId,
        plannedAmount: originalData.amount,
        date: new Date().toISOString().split('T')[0],
        createdAt: Timestamp.now(),
    };
    await addDoc(collectionRef, newCancelledTransaction);
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
