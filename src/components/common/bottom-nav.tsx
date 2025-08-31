'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ShoppingBasket,
  Wallet,
  Sparkles,
  Users,
  User,
  ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/products', label: 'Products', icon: ShoppingBasket },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: ListChecks },
  { href: '/ai', label: 'AI', icon: Sparkles },
  { href: '/family', label: 'Family', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-t-lg z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary',
                // Adjust for more items
                'px-1'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
