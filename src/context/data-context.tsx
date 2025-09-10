
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Expense, FamilyMember, Product, Income } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp, setDoc, writeBatch, getDocs } from "firebase/firestore";

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

    const setupSubscription = (collectionName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        const collectionRef = getCollectionRef(collectionName);
        if (!collectionRef) return;
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setter(data);
        }, (error) => {
            console.error(`Error fetching ${collectionRef.path}:`, error);
        });
        unsubscribes.push(unsubscribe);
    };

    // Set up listeners for all collections
    setupSubscription('expenses', setExpenses);
    setupSubscription('incomes', setIncomes);
    setupSubscription('products', setProducts);
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
      const { id, ...dataToUpdate } = updatedExpense;
      const docRef = doc(db, `users/${user.uid}/expenses`, id);
      await updateDoc(docRef, {...dataToUpdate, edited: true});
  };
  
  const deleteExpense = async (expenseId: string) => {
      if (!user) return;
      const docRef = doc(db, `users/${user.uid}/expenses`, expenseId);
      await deleteDoc(docRef);
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
    const { id, ...dataToUpdate } = updatedIncome;
    const docRef = doc(db, `users/${user.uid}/incomes`, id);
    await updateDoc(docRef, {...dataToUpdate, edited: true});
  };

  const deleteIncome = async (incomeId: string) => {
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/incomes`, incomeId);
    await deleteDoc(docRef);
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
    
    const { id, ...originalData } = transaction;
    // Remove createdAt from originalData if it exists to avoid Firestore errors
    const { createdAt, ...restData } = originalData as any;

    const newActualTransaction = {
      ...restData,
      status: 'completed' as const,
      plannedId: id, 
      plannedAmount: originalData.amount,
      amount: actualAmount ?? originalData.amount,
      date: new Date().toISOString().split('T')[0],
      createdAt: Timestamp.now(),
    };

    await addDoc(collectionRef, newActualTransaction);
  };
  
  const cancelPlannedTransaction = async (transaction: Income | Expense, type: 'income' | 'expense') => {
    const collectionRef = type === 'income' ? getCollectionRef('incomes') : getCollectionRef('expenses');
    if (!collectionRef) return;

    const { id, ...originalData } = transaction;
    const { createdAt, ...restData } = originalData as any;


    const newCancelledTransaction = {
        ...restData,
        status: 'cancelled' as const,
        plannedId: id,
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
