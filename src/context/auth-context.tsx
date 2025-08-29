
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { familyMembers, products, expenses, budget } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to create initial data for a new user
const createInitialUserData = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    
    // Use a transaction or batched write to ensure atomicity
    const batch = writeBatch(db);

    // Set top-level user doc just to create it
    batch.set(userDocRef, { createdAt: new Date().toISOString(), userId: userId });

    // Set initial documents in subcollections
    familyMembers.forEach(member => {
        const memberRef = doc(db, 'users', userId, 'familyMembers', member.id);
        batch.set(memberRef, member);
    });
    products.forEach(product => {
        const productRef = doc(db, 'users', userId, 'products', product.id);
        batch.set(productRef, product);
    });
    expenses.forEach(expense => {
        const expenseRef = doc(db, 'users', userId, 'expenses', expense.id);
        batch.set(expenseRef, expense);
    });
    const budgetRef = doc(db, 'users', userId, 'budget', 'summary');
    batch.set(budgetRef, budget);

    await batch.commit();
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user data exists, if not, create it.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            try {
                await createInitialUserData(user.uid);
            } catch (error) {
                console.error("Failed to create initial user data:", error);
            }
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    
    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);


  if (loading) {
     return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if ((user && isAuthPage) || (!user && !isAuthPage)) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }


  return (
    <AuthContext.Provider value={{ user, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
