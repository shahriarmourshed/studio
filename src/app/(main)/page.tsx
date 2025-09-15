
'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils, ChevronRight } from 'lucide-react';
import ExpenseChart from '@/components/budget/expense-chart';
import PageHeader from '@/components/common/page-header';
import { useCurrency } from '@/context/currency-context';
import { useData } from '@/context/data-context';
import { getYear, isFuture, differenceInDays, format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ExpenseCategory, Income, Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { getSymbol } = useCurrency();
  const { products, expenses, incomes, reminderDays, addExpense, loading } = useData();
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

  // Dialog states
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // Add Expense form state
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<ExpenseCategory>('Other');
  const [newExpenseDate, setNewExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpenseDesc && newExpenseAmount && newExpenseCategory && newExpenseDate) {
        addExpense({
            description: newExpenseDesc,
            amount: parseFloat(newExpenseAmount),
            category: newExpenseCategory,
            date: newExpenseDate,
            recurrent: false, 
        }, 'completed');
        resetAddExpenseForm();
    }
  };

  const resetAddExpenseForm = () => {
    setNewExpenseDesc('');
    setNewExpenseAmount('');
    setNewExpenseCategory('Other');
    setNewExpenseDate(format(new Date(), 'yyyy-MM-dd'));
    setIsExpenseDialogOpen(false);
  };


  const yearsWithData = useMemo(() => {
    const years = new Set<number>();
    [...incomes, ...expenses].forEach(t => years.add(getYear(new Date(t.date))));
    
    const currentYear = getYear(new Date());
    if (!years.has(currentYear)) {
        years.add(currentYear);
    }
    
    // Add years up to 2050
    for (let i = currentYear + 1; i <= 2050; i++) {
        years.add(i);
    }

    return Array.from(years).sort((a,b) => a - b);
  }, [incomes, expenses]);
  
  const { 
    filteredYearlyExpenses,
    totalYearlyIncome,
    totalYearlyExpenses
  } = useMemo(() => {
    const yearlyExpenses = expenses.filter(e => getYear(new Date(e.date)) === selectedYear && e.status === 'completed');
    const yearlyIncomes = incomes.filter(i => getYear(new Date(i.date)) === selectedYear && i.status === 'completed');

    const totalIncome = yearlyIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = yearlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    return { 
      filteredYearlyExpenses: yearlyExpenses,
      totalYearlyIncome: totalIncome,
      totalYearlyExpenses: totalExpenses,
    };
  }, [expenses, incomes, selectedYear]);

  const upcomingTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const upcoming = (t: Income | Expense) => {
        const transactionDate = new Date(t.date);
        return t.status === 'planned' && isFuture(transactionDate) && differenceInDays(transactionDate, today) <= reminderDays;
    }

    const combined = [
        ...expenses.filter(upcoming).map(t => ({...t, type: 'expense' as const})),
        ...incomes.filter(upcoming).map(t => ({...t, type: 'income' as const}))
    ];

    return combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, incomes, reminderDays]);


  if (loading) {
      return (
          <div className="container mx-auto px-0 sm:px-4">
              <PageHeader title="Welcome to Family Manager!" subtitle="Your family's command center." />
              <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Skeleton className="lg:col-span-2 h-96" />
                  <Skeleton className="lg:col-span-1 h-96" />
                  <Skeleton className="lg:col-span-1 h-96" />
              </div>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <PageHeader title="Welcome to Family Manager!" subtitle="Your family's command center." />
      
      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                You had {getSymbol()}{totalYearlyIncome.toLocaleString()} in income vs. {getSymbol()}{totalYearlyExpenses.toLocaleString()} in expenses for {selectedYear}.
              </CardDescription>
            </div>
            <Select
                value={String(selectedYear)}
                onValueChange={(year) => setSelectedYear(parseInt(year))}
            >
                <SelectTrigger className="w-32">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {yearsWithData.map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-80">
             <ExpenseChart expenses={filteredYearlyExpenses} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center space-y-2">
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                    <button className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors w-full text-left">
                        <PlusCircle className="w-5 h-5 mr-3 text-primary"/>
                        <div className="flex-1">
                            <p className="font-semibold">Add Unplanned Expense</p>
                            <p className="text-sm text-muted-foreground">Log a real-time expense.</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground"/>
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Add Unplanned Expense</DialogTitle>
                    <DialogDescription>
                        Log a new completed expense transaction.
                    </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddExpense}>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input id="description" placeholder="e.g., Dinner Out" className="col-span-3" value={newExpenseDesc} onChange={e=>setNewExpenseDesc(e.target.value)} required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount ({getSymbol()})</Label>
                        <Input id="amount" type="number" placeholder="e.g., 1200" className="col-span-3" value={newExpenseAmount} onChange={e=>setNewExpenseAmount(e.target.value)} required/>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Category</Label>
                        <ScrollArea className="h-32 w-full col-span-3 rounded-md border">
                            <RadioGroup value={newExpenseCategory} onValueChange={(v) => setNewExpenseCategory(v as ExpenseCategory)} className="p-4">
                                {(['Groceries', 'Bills', 'Housing', 'Transport', 'Health', 'Education', 'Entertainment', 'Personal Care', 'Other'] as ExpenseCategory[]).map(category => (
                                    <div key={category} className="flex items-center space-x-2">
                                        <RadioGroupItem value={category} id={`expense-${category}`} />
                                        <Label htmlFor={`expense-${category}`}>{category}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </ScrollArea>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Date</Label>
                        <Input id="date" type="date" className="col-span-3" value={newExpenseDate} onChange={e=>setNewExpenseDate(e.target.value)} required/>
                    </div>
                    <Button type="submit" className="w-full">Add Expense</Button>
                    </div>
                    </form>
                </DialogContent>
            </Dialog>

             <Link href="/products" className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors">
                <Utensils className="w-5 h-5 mr-3 text-primary"/>
                <div className="flex-1">
                    <p className="font-semibold">Update Products</p>
                    <p className="text-sm text-muted-foreground">Manage your inventory.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground"/>
             </Link>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Transactions</CardTitle>
            <CardDescription>Due within {reminderDays} day(s).</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingTransactions.length > 0 ? upcomingTransactions.slice(0, 3).map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <p className={cn(
                      "font-semibold text-lg",
                      item.type === 'income' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {item.type === 'income' ? '+' : '-'}{getSymbol()}{item.amount.toLocaleString()}
                  </p>
                </li>
              )) : (
                <p className="text-sm text-muted-foreground text-center">No upcoming transactions found.</p>
              )}
            </ul>
             {upcomingTransactions.length > 3 && (
                <div className="mt-4 text-center">
                    <Button variant="link" asChild>
                        <Link href="/budget">View all</Link>
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
