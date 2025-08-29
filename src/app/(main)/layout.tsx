import BottomNav from '@/components/common/bottom-nav';
import { CurrencyProvider } from '@/context/currency-context';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CurrencyProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow pb-20">{children}</main>
        <BottomNav />
      </div>
    </CurrencyProvider>
  );
}
