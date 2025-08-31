
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
import { Check, X, Edit, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

export default function TransactionsPage() {
  const { getSymbol } = useCurrency();
  const { 
    expenses, 
    incomes, 
    updateExpense,
    updateIncome,
  } = useData();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Expense | Income | null>(null);
  const [isExpense, setIsExpense] = useState(true);

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

  const handleEditClick = (transaction: Income | Expense, type: 'income' | 'expense') => {
    setEditingTransaction(transaction);
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

  const completedIncome = filteredIncomes.filter(i => i.status === 'completed').reduce((sum, i) => sum + i.amount, 0);
  const completedExpenses = filteredExpenses.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.amount, 0);
  const actualSavings = completedIncome - completedExpenses;

  return (
    <div className="container mx-auto">
      <PageHeader title="Transactions" subtitle="Log your actual income and expenses against your plan." />
      
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
            <CardHeader><CardTitle>Manage Transactions</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...filteredIncomes, ...filteredExpenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                            const isExpenseItem = 'category' in t && t.category !== undefined && 'amount' in t;
                            const type = isExpenseItem && expenses.some(e => e.id === t.id) ? 'expense' : 'income';

                            return (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell>{t.category}</TableCell>
                                    <TableCell>{t.date}</TableCell>
                                    <TableCell>
                                      <Badge variant={type === 'income' ? 'default': 'destructive'}>{type}</Badge>
                                    </TableCell>
                                    <TableCell><Badge variant={t.status === 'planned' ? 'secondary' : t.status === 'completed' ? 'default' : 'destructive'}>{t.status}</Badge></TableCell>
                                    <TableCell className="text-right">{getSymbol()}{t.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                    {t.status === 'planned' && (
                                        <div className="flex gap-1 justify-center">
                                            <Button size="icon" variant="ghost" onClick={() => handleStatusChange(t.id, type, 'completed')}><Check className="w-4 h-4 text-green-500" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleEditClick(t, type)}><Edit className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleStatusChange(t.id, type, 'cancelled')}><Ban className="w-4 h-4 text-red-500" /></Button>
                                        </div>
                                    )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
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
