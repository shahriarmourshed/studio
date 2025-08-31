
'use client';

import { useState, useMemo } from 'react';
import PageHeader from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Edit, ChevronLeft, ChevronRight, Ban, PlusCircle, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/context/currency-context";
import { useData } from '@/context/data-context';
import type { Expense, Income, IncomeCategory, ExpenseCategory } from '@/lib/types';
import { format, getMonth, getYear, setMonth, setYear, addMonths, subMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import ExpenseChart from '@/components/budget/expense-chart';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const { getSymbol } = useCurrency();
  const { 
    expenses,
    addExpense, 
    incomes, 
    addIncome,
    updateExpense,
    updateIncome,
  } = useData();

  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<(Expense | Income) & { type: 'income' | 'expense' } | null>(null);
  const [isExpense, setIsExpense] = useState(true);

  // Add Expense form state
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<ExpenseCategory>('Other');
  const [newExpenseDate, setNewExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newExpenseRecurrent, setNewExpenseRecurrent] = useState(false);
  const [newExpenseNotes, setNewExpenseNotes] = useState('');

  // Add Income form state
  const [newIncomeDesc, setNewIncomeDesc] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeCategory, setNewIncomeCategory] = useState<IncomeCategory>('Other');
  const [newIncomeDate, setNewIncomeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newIncomeRecurrent, setNewIncomeRecurrent] = useState(false);
  const [newIncomeNotes, setNewIncomeNotes] = useState('');

  // Edit form state
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseCategory | IncomeCategory>('Other');
  const [editDate, setEditDate] = useState('');
  const [editRecurrent, setEditRecurrent] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  const { filteredIncomes, filteredExpenses } = useMemo(() => {
    const month = getMonth(selectedDate);
    const year = getYear(selectedDate);
    
    const filteredIncomes = incomes.filter(i => {
        const incomeDate = new Date(i.date);
        return getMonth(incomeDate) === month && getYear(incomeDate) === year;
    });
    
    const filteredExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return getMonth(expenseDate) === month && getYear(expenseDate) === year;
    });

    return { filteredIncomes, filteredExpenses };
  }, [selectedDate, incomes, expenses]);
  
  const yearsWithData = useMemo(() => {
    const years = new Set<number>();
    [...incomes, ...expenses].forEach(t => years.add(getYear(new Date(t.date))));
    if (!years.has(getYear(new Date()))) {
        years.add(getYear(new Date()));
    }
    return Array.from(years).sort((a,b) => b - a);
  }, [incomes, expenses]);

  const handleStatusChange = (id: string, type: 'income' | 'expense', status: 'completed' | 'cancelled') => {
    if (type === 'income') {
      const income = incomes.find(i => i.id === id);
      if (income) updateIncome({ ...income, status });
    } else {
      const expense = expenses.find(e => e.id === id);
      if (expense) updateExpense({ ...expense, status });
    }
  };

  const handleEditClick = (transaction: (Income | Expense), type: 'income' | 'expense') => {
    setEditingTransaction({ ...transaction, type });
    setIsExpense(type === 'expense');
    setEditDesc(transaction.description);
    setEditAmount(String(transaction.amount));
    setEditCategory(transaction.category);
    setEditDate(transaction.date);
    setEditRecurrent(transaction.recurrent);
    setEditNotes(transaction.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      if (isExpense) {
        updateExpense({
          ...(editingTransaction as Expense),
          description: editDesc,
          amount: parseFloat(editAmount),
          category: editCategory as ExpenseCategory,
          date: editDate,
          recurrent: editRecurrent,
          notes: editNotes,
          status: 'completed',
        });
      } else {
        updateIncome({
          ...(editingTransaction as Income),
          description: editDesc,
          amount: parseFloat(editAmount),
          category: editCategory as IncomeCategory,
          date: editDate,
          recurrent: editRecurrent,
          notes: editNotes,
          status: 'completed',
        });
      }
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpenseDesc && newExpenseAmount && newExpenseCategory && newExpenseDate) {
        addExpense({
            description: newExpenseDesc,
            amount: parseFloat(newExpenseAmount),
            category: newExpenseCategory,
            date: newExpenseDate,
            recurrent: newExpenseRecurrent,
            notes: newExpenseNotes,
        }, 'completed');
        resetAddExpenseForm();
    }
  };

  const resetAddExpenseForm = () => {
    setNewExpenseDesc('');
    setNewExpenseAmount('');
    setNewExpenseCategory('Other');
    setNewExpenseDate(format(new Date(), 'yyyy-MM-dd'));
    setNewExpenseRecurrent(false);
    setNewExpenseNotes('');
    setIsExpenseDialogOpen(false);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIncomeDesc && newIncomeAmount && newIncomeDate) {
        addIncome({
            description: newIncomeDesc,
            amount: parseFloat(newIncomeAmount),
            category: newIncomeCategory,
            date: newIncomeDate,
            recurrent: newIncomeRecurrent,
            notes: newIncomeNotes,
        }, 'completed');
        resetAddIncomeForm();
    }
  };

  const resetAddIncomeForm = () => {
     setNewIncomeDesc('');
    setNewIncomeAmount('');
    setNewIncomeCategory('Other');
    setNewIncomeDate(format(new Date(), 'yyyy-MM-dd'));
    setNewIncomeRecurrent(false);
    setNewIncomeNotes('');
    setIsIncomeDialogOpen(false);
  };


  const completedIncome = filteredIncomes.filter(i => i.status === 'completed').reduce((sum, i) => sum + i.amount, 0);
  const completedExpenses = filteredExpenses.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.amount, 0);
  const actualSavings = completedIncome - completedExpenses;
  
  const allTransactions = useMemo(() => {
    const combined = [
        ...filteredIncomes.map(i => ({...i, type: 'income' as const})),
        ...filteredExpenses.map(e => ({...e, type: 'expense' as const}))
    ];
    return combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },[filteredIncomes, filteredExpenses]);

  return (
    <div className="container mx-auto">
      <PageHeader title="Transactions" subtitle="Log your actual income and expenses.">
         <div className="flex gap-2">
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsIncomeDialogOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Add Real Income
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add Real Income</DialogTitle>
                <DialogDescription>
                    Log a new completed income transaction.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddIncome}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-description" className="text-right">Description</Label>
                    <Input id="income-description" placeholder="e.g., Freelance Project" className="col-span-3" value={newIncomeDesc} onChange={e=>setNewIncomeDesc(e.target.value)} required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-amount" className="text-right">Amount ({getSymbol()})</Label>
                    <Input id="income-amount" type="number" placeholder="e.g., 5000" className="col-span-3" value={newIncomeAmount} onChange={e=>setNewIncomeAmount(e.target.value)} required/>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Category</Label>
                        <ScrollArea className="h-24 w-full col-span-3 rounded-md border">
                            <RadioGroup value={newIncomeCategory} onValueChange={(v) => setNewIncomeCategory(v as IncomeCategory)} className="p-4">
                                {(['Salary', 'Business', 'Investment', 'Gift', 'Other'] as IncomeCategory[]).map(category => (
                                    <div key={category} className="flex items-center space-x-2">
                                        <RadioGroupItem value={category} id={`income-${category}`} />
                                        <Label htmlFor={`income-${category}`}>{category}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </ScrollArea>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-date" className="text-right">Date</Label>
                    <Input id="income-date" type="date" className="col-span-3" value={newIncomeDate} onChange={e=>setNewIncomeDate(e.target.value)} required/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="income-recurrent" className="text-right">Recurrent</Label>
                        <div className="col-span-3">
                            <Switch id="income-recurrent" checked={newIncomeRecurrent} onCheckedChange={setNewIncomeRecurrent} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="income-notes" className="text-right pt-2">Short Note</Label>
                        <Textarea id="income-notes" placeholder="Any details to remember..." className="col-span-3" value={newIncomeNotes} onChange={e => setNewIncomeNotes(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full">Add Income</Button>
                </div>
                </form>
            </DialogContent>
            </Dialog>

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsExpenseDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Real Expense
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add Real Expense</DialogTitle>
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
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recurrent" className="text-right">Recurrent</Label>
                    <div className="col-span-3">
                        <Switch id="recurrent" checked={newExpenseRecurrent} onCheckedChange={setNewExpenseRecurrent} />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="expense-notes" className="text-right pt-2">Short Note</Label>
                    <Textarea id="expense-notes" placeholder="Any details to remember..." className="col-span-3" value={newExpenseNotes} onChange={e => setNewExpenseNotes(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Add Expense</Button>
                </div>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </PageHeader>
      
      <div className="px-4 sm:px-0">
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setSelectedDate(subMonths(selectedDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold text-center w-48">{format(selectedDate, 'MMMM yyyy')}</h3>
                     <Button variant="outline" size="icon" onClick={() => setSelectedDate(addMonths(selectedDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                     <Select
                        value={String(getYear(selectedDate))}
                        onValueChange={(year) => setSelectedDate(setYear(selectedDate, parseInt(year)))}
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
                </div>
            </CardHeader>
        </Card>
      </div>
      
      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Actual Financial Overview for {format(selectedDate, 'MMMM yyyy')}</CardTitle>
             <CardDescription>
              Based on completed transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Actual Income</p>
                    <p className="text-2xl font-bold text-green-500">{getSymbol()}{completedIncome.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Actual Expenses</p>
                    <p className="text-2xl font-bold text-red-500">{getSymbol()}{completedExpenses.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Actual Savings</p>
                    <p className="text-2xl font-bold text-primary">{getSymbol()}{actualSavings.toLocaleString()}</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Actual Expense Breakdown</CardTitle>
            <CardDescription>How your money was actually spent.</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ExpenseChart expenses={filteredExpenses.filter(e => e.status === 'completed')} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Manage Pre-planned Transactions</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allTransactions.filter(t => t.status === 'planned').length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No planned transactions for this month.</TableCell>
                            </TableRow>
                        )}
                        {allTransactions.filter(t => t.status === 'planned').map(t => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium p-2">
                                    <span className="truncate">{t.description}</span>
                                    <Badge variant={t.type === 'income' ? 'default': 'destructive'} className="ml-2 text-xs capitalize">{t.type}</Badge>
                                </TableCell>
                                <TableCell className="p-2">{format(new Date(t.date), 'dd/MM/yy')}</TableCell>
                                <TableCell className={cn(
                                    "text-right font-semibold p-2",
                                     t.type === 'expense' ? 'text-red-500' : 'text-green-500'
                                    )}
                                >
                                    {t.type === 'expense' ? '-' : '+'}
                                    {getSymbol()}
                                    {t.amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center p-1">
                                    <div className="flex gap-0.5 justify-center">
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleStatusChange(t.id, t.type, 'completed')}><Check className="w-4 h-4 text-green-500" /></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditClick(t, t.type)}><Edit className="w-4 h-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleStatusChange(t.id, t.type, 'cancelled')}><Ban className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      {editingTransaction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modify and Complete Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateTransaction}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-desc" className="text-right">Description</Label>
                <Input id="edit-desc" className="col-span-3" value={editDesc} onChange={e=>setEditDesc(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-amount" className="text-right">Amount ({getSymbol()})</Label>
                <Input id="edit-amount" type="number" className="col-span-3" value={editAmount} onChange={e=>setEditAmount(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Category</Label>
                    <ScrollArea className="h-24 w-full col-span-3 rounded-md border">
                        <RadioGroup value={editCategory} onValueChange={(v) => setEditCategory(v as any)} className="p-4">
                            {isExpense 
                                ? (['Groceries', 'Bills', 'Housing', 'Transport', 'Health', 'Education', 'Entertainment', 'Personal Care', 'Other'] as ExpenseCategory[]).map(category => (
                                    <div key={category} className="flex items-center space-x-2">
                                        <RadioGroupItem value={category} id={`edit-exp-${category}`} />
                                        <Label htmlFor={`edit-exp-${category}`}>{category}</Label>
                                    </div>
                                ))
                                : (['Salary', 'Business', 'Investment', 'Gift', 'Other'] as IncomeCategory[]).map(category => (
                                  <div key={category} className="flex items-center space-x-2">
                                      <RadioGroupItem value={category} id={`edit-inc-${category}`} />
                                      <Label htmlFor={`edit-inc-${category}`}>{category}</Label>
                                  </div>
                              ))
                            }
                        </RadioGroup>
                    </ScrollArea>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">Date</Label>
                <Input id="edit-date" type="date" className="col-span-3" value={editDate} onChange={e=>setEditDate(e.target.value)} required/>
                </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-recurrent" className="text-right">Recurrent</Label>
                    <div className="col-span-3">
                        <Switch id="edit-recurrent" checked={editRecurrent} onCheckedChange={setEditRecurrent} />
                    </div>
                </div>
                 <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-notes" className="text-right pt-2">Short Note</Label>
                    <Textarea id="edit-notes" placeholder="Any details to remember..." className="col-span-3" value={editNotes} onChange={e => setEditNotes(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Update and Mark as Done</Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
