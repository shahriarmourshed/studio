'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, setDoc, getDoc, collection, writeBatch } from 'firebase/firestore';
import { familyMembers, products, budget as defaultBudget } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function will run once when a new user signs up
const createInitialUserData = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    
    const userDoc = await getDoc(userDocRef);
    // Only create data if the user document doesn't exist
    if (!userDoc.exists()) {
        const batch = writeBatch(db);

        // 1. Set the main user document
        batch.set(userDocRef, {
            createdAt: new Date().toISOString(),
            userId: userId,
        });

        // 2. Set initial budget
        const budgetDocRef = doc(db, 'users', userId, 'budget', 'summary');
        batch.set(budgetDocRef, defaultBudget);

        // 3. Add initial family members
        familyMembers.forEach(member => {
            const memberDocRef = doc(collection(db, 'users', userId, 'familyMembers'));
            batch.set(memberDocRef, { ...member, id: memberDocRef.id, avatarUrl: `https://picsum.photos/100/100?random=${Math.random()}`});
        });

        // 4. Add initial products
        products.forEach(product => {
            const productDocRef = doc(collection(db, 'users', userId, 'products'));
            batch.set(productDocRef, { ...product, id: productDocRef.id });
        });
        
        // Commit the batch
        await batch.commit();
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // When a user logs in, we ensure their initial data structure exists
        await createInitialUserData(user.uid);
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
  
  // This logic prevents screen flicker during redirects
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
