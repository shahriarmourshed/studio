
'use client';
import {
  Utensils,
  Receipt,
  Car,
  Ticket,
  MoreHorizontal,
  Home,
  HeartPulse,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useCurrency } from '@/context/currency-context';
import type { Expense } from '@/lib/types';
import { Badge } from '../ui/badge';

const categoryIcons: Record<Expense['category'], React.ReactElement> = {
  Groceries: <Utensils className="h-5 w-5 text-muted-foreground" />,
  Bills: <Receipt className="h-5 w-5 text-muted-foreground" />,
  Housing: <Home className="h-5 w-5 text-muted-foreground" />,
  Transport: <Car className="h-5 w-5 text-muted-foreground" />,
  Health: <HeartPulse className="h-5 w-5 text-muted-foreground" />,
  Education: <BookOpen className="h-5 w-5 text-muted-foreground" />,
  Entertainment: <Ticket className="h-5 w-5 text-muted-foreground" />,
  'Personal Care': <Sparkles className="h-5 w-5 text-muted-foreground" />,
  Other: <MoreHorizontal className="h-5 w-5 text-muted-foreground" />,
};

export default function TransactionsList({ expenses }: { expenses: Expense[] }) {
  const { getSymbol, convert } = useCurrency();

  if(expenses.length === 0) {
    return <p className="text-sm text-muted-foreground text-center">No expenses logged yet.</p>
  }

  return (
    <ul className="space-y-4">
      {expenses.slice(0, 5).map((expense) => (
        <li key={expense.id} className="flex items-center space-x-4">
          <div className="p-2 bg-muted rounded-full">
            {categoryIcons[expense.category] ?? categoryIcons.Other}
          </div>
          <div className="flex-1">
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-muted-foreground">{expense.date}</p>
          </div>
          <div className="text-right">
             <p className="font-semibold">-{getSymbol()}{convert(expense.amount).toLocaleString()}</p>
             {expense.recurrent && <Badge variant="outline" className="mt-1">Recurrent</Badge>}
          </div>
        </li>
      ))}
    </ul>
  );
}

    
