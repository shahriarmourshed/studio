import BottomNav from '@/components/common/bottom-nav';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
