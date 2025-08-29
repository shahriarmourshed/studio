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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createInitialUserData = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return; // Data already exists, do nothing.
    }
    
    try {
        const batch = writeBatch(db);

        batch.set(userDocRef, {
            createdAt: new Date().toISOString(),
            userId: userId,
        });

        const budgetDocRef = doc(db, 'users', userId, 'budget', 'summary');
        batch.set(budgetDocRef, defaultBudget);

        familyMembers.forEach(member => {
            const memberDocRef = doc(collection(db, 'users', userId, 'familyMembers'));
            batch.set(memberDocRef, { ...member, id: memberDocRef.id, avatarUrl: `https://picsum.photos/100/100?random=${Math.random()}`});
        });

        products.forEach(product => {
            const productDocRef = doc(collection(db, 'users', userId, 'products'));
            batch.set(productDocRef, { ...product, id: productDocRef.id });
        });
        
        await batch.commit();
    } catch (error) {
        console.error("Failed to create initial user data:", error);
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
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
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if ((user && isAuthPage) || (!user && !isAuthPage)) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user }}>
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
