
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import BottomNav from '@/components/common/bottom-nav';
import { CurrencyProvider } from '@/context/currency-context';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While loading, you can show a loader or nothing
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <CurrencyProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow pb-20">{children}</main>
        <BottomNav />
      </div>
    </CurrencyProvider>
  );
}
