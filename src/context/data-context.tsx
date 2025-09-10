

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Expense, FamilyMember, Product, Income } from '@/lib/types';
import { familyMembers as defaultFamilyMembers, products as defaultProducts, expenses as defaultExpenses, incomes as defaultIncomes } from '@/lib/data';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp, writeBatch, getDocs, limit } from "firebase/firestore";

interface DataContextType {
  expenses: Expense[];
  familyMembers: FamilyMember[];
  products: Product[];
  incomes: Income[];
  savingGoal: number;
  setSavingGoal: (goal: number) => void;
  reminderDays: number;
  setReminderDays: (days: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'status' | 'plannedAmount' | 'plannedId' | 'edited' | 'createdAt'>, status?: Expense['status']) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => Promise<void>;
  updateFamilyMember: (member: FamilyMember) => Promise<void>;
  deleteFamilyMember: (memberId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'status' | 'plannedAmount' | 'plannedId' | 'edited' | 'createdAt'>, status?: Income['status']) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (incomeId: string) => Promise<void>;
  completePlannedTransaction: (transaction: Income | Expense, type: 'income' | 'expense', actualAmount?: number) => Promise<void>;
  cancelPlannedTransaction: (transaction: Income | Expense, type: 'income' | 'expense') => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [savingGoal, setSavingGoalState] = useState<number>(10000);
  const [reminderDays, setReminderDaysState] = useState<number>(3);
  
  const getCollectionRef = (collectionName: string) => {
    return user ? collection(db, `users/${user.uid}/${collectionName}`) : null;
  }
  
  // Fetch initial data and set up listeners
  useEffect(() => {
    if (!user) {
      setLoading(false);
      // Reset states when user logs out
      setExpenses([]);
      setIncomes([]);
      setProducts([]);
      setFamilyMembers([]);
      setSavingGoalState(10000);
      setReminderDaysState(3);
      return;
    }
    
    setLoading(true);
    const unsubscribes: (() => void)[] = [];
    const userDocRef = doc(db, 'users', user.uid);
    const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'main');


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

    // Settings listener
    if (settingsDocRef) {
        const unsubscribeSettings = onSnapshot(settingsDocRef, (doc) => {
            if (doc.exists()) {
                const settings = doc.data();
                setSavingGoalState(settings.savingGoal ?? 10000);
                setReminderDaysState(settings.reminderDays ?? 3);
            }
        });
        unsubscribes.push(unsubscribeSettings);
    }
    
    // Data listeners
    setupSubscription('expenses', setExpenses);
    setupSubscription('incomes', setIncomes);
    setupSubscription('products', setProducts);
    setupSubscription('familyMembers', setFamilyMembers);
    
    // Check if user has any data, if not, populate with defaults
    const initializeData = async () => {
        if(userDocRef && settingsDocRef) {
             const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists() || !userDocSnap.data()?.hasBeenInitialized) {
                const batch = writeBatch(db);

                // Helper to check if a collection is empty before writing
                const writeDefaults = async (collectionName: string, defaultData: any[]) => {
                    const collectionRef = collection(db, `users/${user.uid}/${collectionName}`);
                    const snapshot = await getDocs(query(collectionRef, limit(1)));
                    if (snapshot.empty) {
                        defaultData.forEach(item => {
                            const docRef = doc(collectionRef);
                            const { id, ...rest } = item;
                            batch.set(docRef, { ...rest, createdAt: Timestamp.now() });
                        });
                    }
                };

                await writeDefaults('expenses', defaultExpenses);
                await writeDefaults('incomes', defaultIncomes);
                await writeDefaults('products', defaultProducts);
                await writeDefaults('familyMembers', defaultFamilyMembers);

                // Set settings
                batch.set(settingsDocRef, { savingGoal: 10000, reminderDays: 3 });

                // Mark user as initialized
                batch.set(userDocRef, { hasBeenInitialized: true, email: user.email }, { merge: true });

                await batch.commit();
            }
        }
        setLoading(false);
    }
    
    initializeData();

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const setSavingGoal = async (goal: number) => {
    const settingsDocRef = user ? doc(db, 'users', user.uid, 'settings', 'main') : null;
    if (settingsDocRef) {
        setSavingGoalState(goal); // Optimistic update
        await setDoc(settingsDocRef, { savingGoal: goal }, { merge: true });
    }
  }

  const setReminderDays = async (days: number) => {
      const settingsDocRef = user ? doc(db, 'users', user.uid, 'settings', 'main') : null;
      if (settingsDocRef) {
          setReminderDaysState(days); // Optimistic update
          await setDoc(settingsDocRef, { reminderDays: days }, { merge: true });
      }
  }

  const addExpense = async (expense: Omit<Expense, 'id' | 'status' | 'plannedAmount' | 'plannedId' | 'edited' | 'createdAt'>, status: Expense['status'] = 'planned') => {
    const collectionRef = getCollectionRef('expenses');
    if (!collectionRef) return;
    const newExpense = { ...expense, status, createdAt: Timestamp.now() };
    await addDoc(collectionRef, newExpense);
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


  const addFamilyMember = async (member: Omit<FamilyMember, 'id' | 'createdAt'>) => {
    const collectionRef = getCollectionRef('familyMembers');
    if (!collectionRef) return;
    const newMember = { 
      ...member, 
      avatarUrl: member.avatarUrl || `https://picsum.photos/100/100?random=${Math.random()}`,
      createdAt: Timestamp.now()
    };
    await addDoc(collectionRef, newMember);
  };

  const updateFamilyMember = async (updatedMember: FamilyMember) => {
      if (!user) return;
      const { id, ...dataToUpdate } = updatedMember;
      const docRef = doc(db, `users/${user.uid}/familyMembers`, id);
      await updateDoc(docRef, dataToUpdate);
  };

  const deleteFamilyMember = async (memberId: string) => {
      if (!user) return;
      const docRef = doc(db, `users/${user.uid}/familyMembers`, memberId);
      await deleteDoc(docRef);
  };
  
  const addProduct = async (product: Omit<Product, 'id' | 'lastUpdated' | 'createdAt'>) => {
      const collectionRef = getCollectionRef('products');
      if (!collectionRef) return;
      const newProduct = { 
        ...product, 
        lastUpdated: new Date().toISOString(),
        createdAt: Timestamp.now()
      };
      await addDoc(collectionRef, newProduct);
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

  const addIncome = async (income: Omit<Income, 'id' | 'status' | 'plannedAmount' | 'plannedId' | 'edited' | 'createdAt'>, status: Income['status'] = 'planned') => {
      const collectionRef = getCollectionRef('incomes');
      if (!collectionRef) return;
      const newIncome = { ...income, status, createdAt: Timestamp.now() };
      await addDoc(collectionRef, newIncome);
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
    familyMembers, 
    products, 
    incomes, 
    savingGoal, 
    setSavingGoal, 
    reminderDays, 
    setReminderDays, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    addFamilyMember, 
    updateFamilyMember, 
    deleteFamilyMember, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addIncome, 
    updateIncome, 
    deleteIncome, 
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
