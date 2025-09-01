
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
import { Check, Edit, ChevronLeft, ChevronRight, Ban, PlusCircle, DollarSign, ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/context/currency-context";
import { useData } from '@/context/data-context';
import type { Expense, Income, IncomeCategory, ExpenseCategory } from '@/lib/types';
import { format, getMonth, getYear, setMonth, setYear, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import ExpenseChart from '@/components/budget/expense-chart';
import { cn } from '@/lib/utils';

type Transaction = (Expense | Income) & { type: 'income' | 'expense' };

export default function TransactionsPage() {
  const { getSymbol } = useCurrency();
  const { 
    expenses,
    addExpense, 
    updateExpense,
    incomes, 
    addIncome,
    updateIncome,
    deleteExpense,
    deleteIncome,
    savingGoal,
    setSavingGoal,
    completePlannedExpense,
    completePlannedIncome,
    cancelPlannedTransaction,
  } = useData();

  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Dialog states
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false);
  const [isEditIncomeDialogOpen, setIsEditIncomeDialogOpen] = useState(false);

  // Selected items for editing
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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

  // Edit Expense form state
  const [editExpenseDesc, setEditExpenseDesc] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState<ExpenseCategory>('Other');
  const [editExpenseDate, setEditExpenseDate] = useState('');
  const [editExpenseRecurrent, setEditExpenseRecurrent] = useState(false);
  const [editExpenseNotes, setEditExpenseNotes] = useState('');
  
  // Edit Income form state
  const [editIncomeDesc, setEditIncomeDesc] = useState('');
  const [editIncomeAmount, setEditIncomeAmount] = useState('');
  const [editIncomeCategory, setEditIncomeCategory] = useState<IncomeCategory>('Other');
  const [editIncomeDate, setEditIncomeDate] = useState('');
  const [editIncomeRecurrent, setEditIncomeRecurrent] = useState(false);
  const [editIncomeNotes, setEditIncomeNotes] = useState('');
  
  // Savings Goal state
  const [newSavingGoal, setNewSavingGoal] = useState(savingGoal ? String(savingGoal) : '');
  const [isEditingGoal, setIsEditingGoal] = useState(false);


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
  
  const plannedTransactionsForMonth = useMemo(() => {
    return [
      ...filteredIncomes.map(i => ({...i, type: 'income' as const})),
      ...filteredExpenses.map(e => ({...e, type: 'expense' as const}))
    ].filter(t => t.status === 'planned');
  }, [filteredIncomes, filteredExpenses]);

  const allTransactionsForMonth: Transaction[] = useMemo(() => {
    return [
      ...filteredIncomes.map(i => ({...i, type: 'income' as const})),
      ...filteredExpenses.map(e => ({...e, type: 'expense' as const}))
    ].filter(t => t.status !== 'planned')
     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredIncomes, filteredExpenses]);


  const handleDeleteClick = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      deleteIncome(transaction.id);
    } else {
      deleteExpense(transaction.id);
    }
  }
  
  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    if (transaction.type === 'expense') {
        setEditExpenseDesc(transaction.description);
        setEditExpenseAmount(String(transaction.amount));
        setEditExpenseCategory(transaction.category);
        setEditExpenseDate(transaction.date);
        setEditExpenseRecurrent(transaction.recurrent);
        setEditExpenseNotes(transaction.notes || '');
        setIsEditExpenseDialogOpen(true);
    } else {
        setEditIncomeDesc(transaction.description);
        setEditIncomeAmount(String(transaction.amount));
        setEditIncomeCategory(transaction.category);
        setEditIncomeDate(transaction.date);
        setEditIncomeRecurrent(transaction.recurrent);
        setEditIncomeNotes(transaction.notes || '');
        setIsEditIncomeDialogOpen(true);
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
  
  const handleUpdateExpense = (e: React.FormEvent) => {
      e.preventDefault();
      if(selectedTransaction && selectedTransaction.type === 'expense') {
          updateExpense({
              ...selectedTransaction,
              description: editExpenseDesc,
              amount: parseFloat(editExpenseAmount),
              category: editExpenseCategory,
              date: editExpenseDate,
              recurrent: editExpenseRecurrent,
              notes: editExpenseNotes,
          });
          setIsEditExpenseDialogOpen(false);
          setSelectedTransaction(null);
      }
  };
  
  const handleUpdateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedTransaction && selectedTransaction.type === 'income') {
        updateIncome({
            ...selectedTransaction,
            description: editIncomeDesc,
            amount: parseFloat(editIncomeAmount),
            category: editIncomeCategory,
            date: editIncomeDate,
            recurrent: editIncomeRecurrent,
            notes: editIncomeNotes,
        });
        setIsEditIncomeDialogOpen(false);
        setSelectedTransaction(null);
    }
  };
  
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(parseFloat(newSavingGoal));
    setIsEditingGoal(false);
  };


  const completedIncome = filteredIncomes.filter(i => i.status === 'completed').reduce((sum, i) => sum + i.amount, 0);
  const completedExpenses = filteredExpenses.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.amount, 0);
  const actualSavings = completedIncome - completedExpenses;
  
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(e.target.value, 10);
    if (!isNaN(newYear)) {
      setSelectedDate(setYear(selectedDate, newYear));
    }
  };

  const getStatusVariant = (status: 'planned' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'planned': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
    }
  };

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
                    <Textarea id="expense-notes" placeholder="Any details to remember..." className="col-span-3" value={newExpenseNotes} onChange={e => setEditExpenseNotes(e.target.value)} />
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
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setSelectedDate(subMonths(selectedDate, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold text-center w-36">{format(selectedDate, 'MMMM')}</h3>
                     <Button variant="outline" size="icon" onClick={() => setSelectedDate(addMonths(selectedDate, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="icon" onClick={() => setSelectedDate(subYears(selectedDate, 1))}>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Input 
                        type="number"
                        className="w-24 text-center"
                        value={getYear(selectedDate)}
                        onChange={handleYearChange}
                        aria-label="Year"
                    />
                     <Button variant="outline" size="icon" onClick={() => setSelectedDate(addYears(selectedDate, 1))}>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
        </Card>
      </div>
      
      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <Card className="lg:col-span-2">
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

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Savings Goal</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingGoal(!isEditingGoal)}>
                        <Edit className="h-4 w-4"/>
                        <span className="sr-only">Edit Goal</span>
                    </Button>
                </CardTitle>
                <CardDescription>Your savings target for {format(selectedDate, 'MMMM')}.</CardDescription>
            </CardHeader>
            <CardContent>
                {isEditingGoal ? (
                    <form onSubmit={handleGoalSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="saving-goal">New Goal ({getSymbol()})</Label>
                            <Input 
                                id="saving-goal"
                                type="number" 
                                value={newSavingGoal}
                                onChange={(e) => setNewSavingGoal(e.target.value)}
                                placeholder="e.g., 15000"
                            />
                            <Button type="submit" size="sm" className="w-full">Set Goal</Button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{getSymbol()}{savingGoal.toLocaleString()}</p>
                        {savingGoal > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {Math.max(0, (actualSavings / savingGoal) * 100).toFixed(0)}% of your goal reached
                            </p>
                        )}
                         <p className="text-sm text-muted-foreground mt-1">
                            Actual Savings: {getSymbol()}{actualSavings.toLocaleString()}
                        </p>
                    </div>
                )}
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
                        {plannedTransactionsForMonth.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No planned transactions for this month.</TableCell>
                            </TableRow>
                        ) : plannedTransactionsForMonth.map(t => (
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
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditClick(t)}><Edit className="w-4 h-4" /></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => t.type === 'expense' ? completePlannedExpense(t.id) : completePlannedIncome(t.id)}><Check className="w-4 h-4 text-green-500" /></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => cancelPlannedTransaction(t.id, t.type)}><Ban className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>All Transactions for {format(selectedDate, 'MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allTransactionsForMonth.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">No transactions for this month.</TableCell>
                        </TableRow>
                    ) : allTransactionsForMonth.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.description}</TableCell>
                            <TableCell>{t.category}</TableCell>
                            <TableCell>{t.date}</TableCell>
                            <TableCell><Badge variant={getStatusVariant(t.status)}>{t.status}</Badge></TableCell>
                            <TableCell className={cn("text-right", t.type === 'expense' ? 'text-red-500' : 'text-green-500')}>
                                {t.type === 'expense' ? '-' : '+'}
                                {getSymbol()}{t.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={t.status === 'cancelled'}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete this transaction.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteClick(t)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       {selectedTransaction && selectedTransaction.type === 'income' && (
        <Dialog open={isEditIncomeDialogOpen} onOpenChange={setIsEditIncomeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Planned Income</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateIncome}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-income-description" className="text-right">Description</Label>
                <Input id="edit-income-description" className="col-span-3" value={editIncomeDesc} onChange={e=>setEditIncomeDesc(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-income-amount" className="text-right">Actual Amount ({getSymbol()})</Label>
                <Input id="edit-income-amount" type="number" className="col-span-3" value={editIncomeAmount} onChange={e=>setEditIncomeAmount(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Category</Label>
                    <ScrollArea className="h-24 w-full col-span-3 rounded-md border">
                        <RadioGroup value={editIncomeCategory} onValueChange={(v) => setEditIncomeCategory(v as IncomeCategory)} className="p-4">
                            {(['Salary', 'Business', 'Investment', 'Gift', 'Other'] as IncomeCategory[]).map(category => (
                                <div key={category} className="flex items-center space-x-2">
                                    <RadioGroupItem value={category} id={`edit-income-${category}`} />
                                    <Label htmlFor={`edit-income-${category}`}>{category}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </ScrollArea>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-income-date" className="text-right">Date</Label>
                <Input id="edit-income-date" type="date" className="col-span-3" value={editIncomeDate} onChange={e=>setEditIncomeDate(e.target.value)} required/>
                </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-income-recurrent" className="text-right">Recurrent</Label>
                    <div className="col-span-3">
                        <Switch id="edit-income-recurrent" checked={editIncomeRecurrent} onCheckedChange={setEditIncomeRecurrent} />
                    </div>
                </div>
                 <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-income-notes" className="text-right pt-2">Short Note</Label>
                    <Textarea id="edit-income-notes" placeholder="Any details to remember..." className="col-span-3" value={editIncomeNotes} onChange={e => setEditIncomeNotes(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {selectedTransaction && selectedTransaction.type === 'expense' && (
        <Dialog open={isEditExpenseDialogOpen} onOpenChange={setIsEditExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Planned Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateExpense}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-exp-description" className="text-right">Description</Label>
                    <Input id="edit-exp-description" className="col-span-3" value={editExpenseDesc} onChange={e=>setEditExpenseDesc(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-exp-amount" className="text-right">Actual Amount ({getSymbol()})</Label>
                    <Input id="edit-exp-amount" type="number" className="col-span-3" value={editExpenseAmount} onChange={e=>setEditExpenseAmount(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Category</Label>
                    <ScrollArea className="h-32 w-full col-span-3 rounded-md border">
                        <RadioGroup value={editExpenseCategory} onValueChange={(v) => setEditExpenseCategory(v as ExpenseCategory)} className="p-4">
                            {(['Groceries', 'Bills', 'Housing', 'Transport', 'Health', 'Education', 'Entertainment', 'Personal Care', 'Other'] as ExpenseCategory[]).map(category => (
                                <div key={category} className="flex items-center space-x-2">
                                    <RadioGroupItem value={category} id={`edit-expense-${category}`} />
                                    <Label htmlFor={`edit-expense-${category}`}>{category}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </ScrollArea>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-exp-date" className="text-right">Date</Label>
                    <Input id="edit-exp-date" type="date" className="col-span-3" value={editExpenseDate} onChange={e=>setEditExpenseDate(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-exp-recurrent" className="text-right">Recurrent</Label>
                    <div className="col-span-3">
                        <Switch id="edit-exp-recurrent" checked={editExpenseRecurrent} onCheckedChange={setEditExpenseRecurrent} />
                    </div>
                </div>
                 <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-expense-notes" className="text-right pt-2">Short Note</Label>
                    <Textarea id="edit-expense-notes" placeholder="Any details to remember..." className="col-span-3" value={editExpenseNotes} onChange={e => setEditExpenseNotes(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
