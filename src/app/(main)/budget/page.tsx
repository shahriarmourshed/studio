'use client';

import { useState } from 'react';
import PageHeader from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ExpenseChart from "@/components/budget/expense-chart";
import TransactionsList from "@/components/budget/transactions-list";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "@/context/currency-context";
import { useData } from '@/context/data-context';
import type { Expense, Income, IncomeCategory } from '@/lib/types';
import { format } from 'date-fns';

export default function BudgetPage() {
  const { getSymbol, convert } = useCurrency();
  const { budget, expenses, addExpense, incomes, addIncome } = useData();
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);

  // Form state for new expense
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<Expense['category']>('Other');
  const [newExpenseDate, setNewExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newExpenseRecurrent, setNewExpenseRecurrent] = useState(false);

  // Form state for new income
  const [newIncomeDesc, setNewIncomeDesc] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeCategory, setNewIncomeCategory] = useState<IncomeCategory>('Other');
  const [newIncomeDate, setNewIncomeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newIncomeRecurrent, setNewIncomeRecurrent] = useState(false);
  
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpenseDesc && newExpenseAmount && newExpenseCategory && newExpenseDate) {
        const newExpense: Omit<Expense, 'id'> = {
            description: newExpenseDesc,
            amount: parseFloat(newExpenseAmount),
            category: newExpenseCategory,
            date: newExpenseDate,
            recurrent: newExpenseRecurrent,
        };
        addExpense(newExpense);
        
        // Reset form and close dialog
        setNewExpenseDesc('');
        setNewExpenseAmount('');
        setNewExpenseCategory('Other');
        setNewExpenseDate(format(new Date(), 'yyyy-MM-dd'));
        setNewExpenseRecurrent(false);
        setIsExpenseDialogOpen(false);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newIncomeDesc && newIncomeAmount && newIncomeDate) {
        const newIncome: Omit<Income, 'id'> = {
            description: newIncomeDesc,
            amount: parseFloat(newIncomeAmount),
            category: newIncomeCategory,
            date: newIncomeDate,
            recurrent: newIncomeRecurrent,
        };
        addIncome(newIncome);
        
        // Reset form and close dialog
        setNewIncomeDesc('');
        setNewIncomeAmount('');
        setNewIncomeCategory('Other');
        setNewIncomeDate(format(new Date(), 'yyyy-MM-dd'));
        setNewIncomeRecurrent(false);
        setIsIncomeDialogOpen(false);
    }
  };

  if (!budget) {
     return <div className="flex items-center justify-center h-screen">Loading budget...</div>;
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const savings = totalIncome - totalSpent;
  const spentPercentage = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
  
  return (
    <div className="container mx-auto">
      <PageHeader title="Family Budget" subtitle="Keep track of your income and expenses.">
        <div className="flex gap-2">
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsIncomeDialogOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Add Income
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
                <DialogDescription>
                    Log a new income source to keep your budget up to date.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddIncome}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-description" className="text-right">Description</Label>
                    <Input id="income-description" placeholder="e.g., Monthly Salary" className="col-span-3" value={newIncomeDesc} onChange={e=>setNewIncomeDesc(e.target.value)} required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-amount" className="text-right">Amount ({getSymbol()})</Label>
                    <Input id="income-amount" type="number" placeholder="e.g., 50000" className="col-span-3" value={newIncomeAmount} onChange={e=>setNewIncomeAmount(e.target.value)} required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="income-category" className="text-right">Category</Label>
                      <Select value={newIncomeCategory} onValueChange={(v: IncomeCategory) => setNewIncomeCategory(v)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Salary">Salary</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Investment">Investment</SelectItem>
                          <SelectItem value="Gift">Gift</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <Button type="submit" className="w-full">Save Income</Button>
                </div>
                </form>
            </DialogContent>
            </Dialog>

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsExpenseDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                    Log a new transaction to keep your budget up to date.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddExpense}>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" placeholder="e.g., Weekly Groceries" className="col-span-3" value={newExpenseDesc} onChange={e=>setNewExpenseDesc(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Amount ({getSymbol()})</Label>
                    <Input id="amount" type="number" placeholder="e.g., 3500" className="col-span-3" value={newExpenseAmount} onChange={e=>setNewExpenseAmount(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select value={newExpenseCategory} onValueChange={(v: Expense['category']) => setNewExpenseCategory(v)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Groceries">Groceries</SelectItem>
                        <SelectItem value="Bills">Bills</SelectItem>
                        <SelectItem value="Housing">Housing</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Personal Care">Personal Care</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                    </Select>
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
                <Button type="submit" className="w-full">Save Expense</Button>
                </div>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </PageHeader>
      
      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
             <CardDescription>
              {getSymbol()}{convert(totalSpent).toLocaleString()} spent out of {getSymbol()}{convert(totalIncome).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={spentPercentage} className="w-full mb-2" />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="text-2xl font-bold text-green-500">{getSymbol()}{convert(totalIncome).toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-red-500">{getSymbol()}{convert(totalSpent).toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Savings</p>
                    <p className="text-2xl font-bold text-primary">{getSymbol()}{convert(savings).toLocaleString()}</p>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>How your money is being spent across categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ExpenseChart expenses={expenses} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest logged expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsList expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
