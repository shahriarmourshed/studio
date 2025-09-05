
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
import { PlusCircle, Lightbulb, Utensils, ChevronRight } from 'lucide-react';
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
import type { ExpenseCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

  const upcomingRecurrentBills = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return e.status === 'planned' && isFuture(expenseDate) && differenceInDays(expenseDate, today) <= reminderDays;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, reminderDays]);


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
             <Link href="/ai" className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors">
                <Lightbulb className="w-5 h-5 mr-3 text-primary"/>
                <div className="flex-1">
                    <p className="font-semibold">Get AI Suggestions</p>
                    <p className="text-sm text-muted-foreground">Optimize your planning.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground"/>
             </Link>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Bills</CardTitle>
            <CardDescription>Due within {reminderDays} day(s).</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingRecurrentBills.length > 0 ? upcomingRecurrentBills.slice(0, 3).map((bill) => (
                <li key={bill.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{bill.description}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(bill.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-lg">{getSymbol()}{bill.amount.toLocaleString()}</p>
                </li>
              )) : (
                <p className="text-sm text-muted-foreground text-center">No upcoming bills found.</p>
              )}
            </ul>
             {upcomingRecurrentBills.length > 3 && (
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
