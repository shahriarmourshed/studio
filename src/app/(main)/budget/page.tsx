
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import ExpenseChart from "@/components/budget/expense-chart";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "@/context/currency-context";
import { useData } from '@/context/data-context';
import type { Expense, Income, IncomeCategory, ExpenseCategory } from '@/lib/types';
import { format } from 'date-fns';

export default function BudgetPage() {
  const { getSymbol, convert } = useCurrency();
  const { 
    budget, 
    expenses, 
    addExpense,
    updateExpense,
    deleteExpense,
    incomes, 
    addIncome,
    updateIncome,
    deleteIncome
  } = useData();

  // Dialog states
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false);
  const [isEditIncomeDialogOpen, setIsEditIncomeDialogOpen] = useState(false);

  // Selected items for editing
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  // Add Expense form state
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<ExpenseCategory>('Other');
  const [newExpenseDate, setNewExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newExpenseRecurrent, setNewExpenseRecurrent] = useState(false);

  // Add Income form state
  const [newIncomeDesc, setNewIncomeDesc] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeCategory, setNewIncomeCategory] = useState<IncomeCategory>('Other');
  const [newIncomeDate, setNewIncomeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newIncomeRecurrent, setNewIncomeRecurrent] = useState(false);
  
  // Edit Expense form state
  const [editExpenseDesc, setEditExpenseDesc] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState<ExpenseCategory>('Other');
  const [editExpenseDate, setEditExpenseDate] = useState('');
  const [editExpenseRecurrent, setEditExpenseRecurrent] = useState(false);
  
  // Edit Income form state
  const [editIncomeDesc, setEditIncomeDesc] = useState('');
  const [editIncomeAmount, setEditIncomeAmount] = useState('');
  const [editIncomeCategory, setEditIncomeCategory] = useState<IncomeCategory>('Other');
  const [editIncomeDate, setEditIncomeDate] = useState('');
  const [editIncomeRecurrent, setEditIncomeRecurrent] = useState(false);


  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpenseDesc && newExpenseAmount && newExpenseCategory && newExpenseDate) {
        addExpense({
            description: newExpenseDesc,
            amount: parseFloat(newExpenseAmount),
            category: newExpenseCategory,
            date: newExpenseDate,
            recurrent: newExpenseRecurrent,
        });
        resetAddExpenseForm();
    }
  };

  const resetAddExpenseForm = () => {
    setNewExpenseDesc('');
    setNewExpenseAmount('');
    setNewExpenseCategory('Other');
    setNewExpenseDate(format(new Date(), 'yyyy-MM-dd'));
    setNewExpenseRecurrent(false);
    setIsExpenseDialogOpen(false);
  }

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIncomeDesc && newIncomeAmount && newIncomeDate) {
        addIncome({
            description: newIncomeDesc,
            amount: parseFloat(newIncomeAmount),
            category: newIncomeCategory,
            date: newIncomeDate,
            recurrent: newIncomeRecurrent,
        });
        resetAddIncomeForm();
    }
  };

  const resetAddIncomeForm = () => {
     setNewIncomeDesc('');
    setNewIncomeAmount('');
    setNewIncomeCategory('Other');
    setNewIncomeDate(format(new Date(), 'yyyy-MM-dd'));
    setNewIncomeRecurrent(false);
    setIsIncomeDialogOpen(false);
  }

  const handleEditExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditExpenseDesc(expense.description);
    setEditExpenseAmount(String(expense.amount));
    setEditExpenseCategory(expense.category);
    setEditExpenseDate(expense.date);
    setEditExpenseRecurrent(expense.recurrent);
    setIsEditExpenseDialogOpen(true);
  }
  
  const handleUpdateExpense = (e: React.FormEvent) => {
      e.preventDefault();
      if(selectedExpense) {
          updateExpense({
              ...selectedExpense,
              description: editExpenseDesc,
              amount: parseFloat(editExpenseAmount),
              category: editExpenseCategory,
              date: editExpenseDate,
              recurrent: editExpenseRecurrent,
          });
          setIsEditExpenseDialogOpen(false);
          setSelectedExpense(null);
      }
  }

  const handleEditIncomeClick = (income: Income) => {
    setSelectedIncome(income);
    setEditIncomeDesc(income.description);
    setEditIncomeAmount(String(income.amount));
    setEditIncomeCategory(income.category);
    setEditIncomeDate(income.date);
    setEditIncomeRecurrent(income.recurrent);
    setIsEditIncomeDialogOpen(true);
  }
  
  const handleUpdateIncome = (e: React.FormEvent) => {
      e.preventDefault();
      if(selectedIncome) {
          updateIncome({
              ...selectedIncome,
              description: editIncomeDesc,
              amount: parseFloat(editIncomeAmount),
              category: editIncomeCategory,
              date: editIncomeDate,
              recurrent: editIncomeRecurrent,
          });
          setIsEditIncomeDialogOpen(false);
          setSelectedIncome(null);
      }
  }


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
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Category</Label>
                        <ScrollArea className="h-24 w-full col-span-3 rounded-md border">
                            <RadioGroup value={newIncomeCategory} onValueChange={(v: IncomeCategory) => setNewIncomeCategory(v)} className="p-4">
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
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Category</Label>
                    <ScrollArea className="h-32 w-full col-span-3 rounded-md border">
                        <RadioGroup value={newExpenseCategory} onValueChange={(v: ExpenseCategory) => setNewExpenseCategory(v)} className="p-4">
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
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>How your money is being spent across categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ExpenseChart expenses={expenses} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Incomes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Recurrent</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {incomes.map((income) => (
                        <TableRow key={income.id}>
                            <TableCell className="font-medium">{income.description}</TableCell>
                            <TableCell>{income.category}</TableCell>
                            <TableCell>{income.date}</TableCell>
                            <TableCell>{income.recurrent ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="text-right">{getSymbol()}{convert(income.amount).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditIncomeClick(income)}>
                                        <Edit className="h-4 w-4"/>
                                        <span className="sr-only">Edit</span>
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete this income record.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteIncome(income.id)}>Delete</AlertDialogAction>
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

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Recurrent</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell className="font-medium">{expense.description}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{expense.date}</TableCell>
                            <TableCell>{expense.recurrent ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="text-right">{getSymbol()}{convert(expense.amount).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditExpenseClick(expense)}>
                                        <Edit className="h-4 w-4"/>
                                        <span className="sr-only">Edit</span>
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete this expense record.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteExpense(expense.id)}>Delete</AlertDialogAction>
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

       {selectedIncome && (
        <Dialog open={isEditIncomeDialogOpen} onOpenChange={setIsEditIncomeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Income</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateIncome}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-income-description" className="text-right">Description</Label>
                <Input id="edit-income-description" className="col-span-3" value={editIncomeDesc} onChange={e=>setEditIncomeDesc(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-income-amount" className="text-right">Amount ({getSymbol()})</Label>
                <Input id="edit-income-amount" type="number" className="col-span-3" value={editIncomeAmount} onChange={e=>setEditIncomeAmount(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Category</Label>
                    <ScrollArea className="h-24 w-full col-span-3 rounded-md border">
                        <RadioGroup value={editIncomeCategory} onValueChange={(v: IncomeCategory) => setEditIncomeCategory(v)} className="p-4">
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
                <Button type="submit" className="w-full">Save Changes</Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {selectedExpense && (
        <Dialog open={isEditExpenseDialogOpen} onOpenChange={setIsEditExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateExpense}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-exp-description" className="text-right">Description</Label>
                    <Input id="edit-exp-description" className="col-span-3" value={editExpenseDesc} onChange={e=>setEditExpenseDesc(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-exp-amount" className="text-right">Amount ({getSymbol()})</Label>
                    <Input id="edit-exp-amount" type="number" className="col-span-3" value={editExpenseAmount} onChange={e=>setEditExpenseAmount(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Category</Label>
                    <ScrollArea className="h-32 w-full col-span-3 rounded-md border">
                        <RadioGroup value={editExpenseCategory} onValueChange={(v: ExpenseCategory) => setEditExpenseCategory(v)} className="p-4">
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
                <Button type="submit" className="w-full">Save Changes</Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

    