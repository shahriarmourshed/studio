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
import { PlusCircle } from "lucide-react";
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
import type { Expense } from '@/lib/types';
import { format } from 'date-fns';

export default function BudgetPage() {
  const { getSymbol, convert } = useCurrency();
  const { budget, expenses, addExpense } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for new expense
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<Expense['category']>('Other');
  const [newExpenseDate, setNewExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newExpenseRecurrent, setNewExpenseRecurrent] = useState(false);
  
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
        setIsDialogOpen(false);
    }
  };

  if (!budget) {
     return <div className="flex items-center justify-center h-screen">Loading budget...</div>;
  }

  const spentPercentage = budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
  
  return (
    <div className="container mx-auto">
      <PageHeader title="Family Budget" subtitle="Keep track of your income and expenses.">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
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
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
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
      </PageHeader>
      
      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
            <CardDescription>
              {getSymbol()}{convert(budget.spent).toLocaleString()} / {getSymbol()}{convert(budget.total).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={spentPercentage} className="w-full" />
             <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>Total Spent: {getSymbol()}{convert(budget.spent).toLocaleString()}</span>
                <span>Remaining: {getSymbol()}{convert(budget.total - budget.spent).toLocaleString()}</span>
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
