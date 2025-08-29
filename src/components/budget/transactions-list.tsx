'use client';
import { expenses } from '@/lib/data';
import {
  Utensils,
  Receipt,
  Car,
  Ticket,
  MoreHorizontal,
} from 'lucide-react';
import { useCurrency } from '@/context/currency-context';

const categoryIcons = {
  Groceries: <Utensils className="h-5 w-5 text-muted-foreground" />,
  Bills: <Receipt className="h-5 w-5 text-muted-foreground" />,
  Transport: <Car className="h-5 w-5 text-muted-foreground" />,
  Entertainment: <Ticket className="h-5 w-5 text-muted-foreground" />,
  Other: <MoreHorizontal className="h-5 w-5 text-muted-foreground" />,
};

export default function TransactionsList() {
  const { getSymbol, convert } = useCurrency();

  return (
    <ul className="space-y-4">
      {expenses.map((expense) => (
        <li key={expense.id} className="flex items-center space-x-4">
          <div className="p-2 bg-muted rounded-full">
            {categoryIcons[expense.category]}
          </div>
          <div className="flex-1">
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-muted-foreground">{expense.date}</p>
          </div>
          <p className="font-semibold text-right">-{getSymbol()}{convert(expense.amount).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}
