

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
import { Progress } from "@/components/ui/progress";
import ExpenseChart from "@/components/budget/expense-chart";
import { Button } from "@/components/ui/button";
import { PlusCircle, DollarSign, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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
import type { Expense, Income, IncomeCategory } from '@/lib/types';
import { format, getMonth, getYear, setMonth, setYear, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function BudgetPage() {
  const { getSymbol } = useCurrency();
  const { 
    expenses, 
    addExpense,
    updateExpense,
    deleteExpense,
    incomes, 
    addIncome,
    updateIncome,
    deleteIncome,
    savingGoal,
    setSavingGoal,
    expenseCategories,
  } = useData();

  const [selectedDate, setSelectedDate] = useState(new Date());

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
  const [newExpenseCategory, setNewExpenseCategory] = useState('Other');
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
  const [editExpenseCategory, setEditExpenseCategory] = useState('Other');
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
    setNewIncomeNotes('');
    setIsIncomeDialogOpen(false);
  };

  const handleEditExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditExpenseDesc(expense.description);
    setEditExpenseAmount(String(expense.amount));
    setEditExpenseCategory(expense.category);
    setEditExpenseDate(expense.date);
    setEditExpenseRecurrent(expense.recurrent);
    setEditExpenseNotes(expense.notes || '');
    setIsEditExpenseDialogOpen(true);
  };
  
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
              notes: editExpenseNotes,
          });
          setIsEditExpenseDialogOpen(false);
          setSelectedExpense(null);
      }
  };

  const handleEditIncomeClick = (income: Income) => {
    setSelectedIncome(income);
    setEditIncomeDesc(income.description);
    setEditIncomeAmount(String(income.amount));
    setEditIncomeCategory(income.category);
    setEditIncomeDate(income.date);
    setEditIncomeRecurrent(income.recurrent);
    setEditIncomeNotes(income.notes || '');
    setIsEditIncomeDialogOpen(true);
  };
  
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
            notes: editIncomeNotes,
        });
        setIsEditIncomeDialogOpen(false);
        setSelectedIncome(null);
    }
  };
  
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(parseFloat(newSavingGoal));
    setIsEditingGoal(false);
  };


  const { plannedIncomes, plannedExpenses, actionedPlanIds } = useMemo(() => {
    const month = getMonth(selectedDate);
    const year = getYear(selectedDate);

    const actionedIds = new Set(
        [...incomes, ...expenses]
            .filter(t => t.plannedId)
            .map(t => t.plannedId)
    );
    
    const getPlanned = <T extends Income | Expense>(items: T[]) => {
        return items.filter(item => {
            const itemDate = new Date(item.date);
            const isSameMonth = getMonth(itemDate) === month;
            const isSameYear = getYear(itemDate) === year;
            return item.status === 'planned' && isSameMonth && isSameYear;
        });
    }
    
    return { 
        plannedIncomes: getPlanned(incomes), 
        plannedExpenses: getPlanned(expenses),
        actionedPlanIds: actionedIds,
    };
  }, [selectedDate, incomes, expenses]);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(e.target.value, 10);
    if (!isNaN(newYear)) {
      setSelectedDate(setYear(selectedDate, newYear));
    }
  };

  const totalPlannedIncome = plannedIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalPlannedExpenses = plannedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const plannedSavings = totalPlannedIncome - totalPlannedExpenses;
  const spentPercentage = totalPlannedIncome > 0 ? (totalPlannedExpenses / totalPlannedIncome) * 100 : 0;
  
  const getPlanStatus = (plan: Income | Expense) => {
      const completed = expenses.find(t => t.plannedId === plan.id && t.status === 'completed') || incomes.find(t => t.plannedId === plan.id && t.status === 'completed');
      const cancelled = expenses.find(t => t.plannedId === plan.id && t.status === 'cancelled') || incomes.find(t => t.plannedId === plan.id && t.status === 'cancelled');

      if (completed) return <Badge variant="default">Completed</Badge>;
      if (cancelled) return <Badge variant="destructive">Cancelled</Badge>;
      if (plan.edited) return <Badge variant="secondary">Edited</Badge>;

      return null;
  }

  return (
    <div className="container mx-auto">
      <PageHeader title="Budget Planner" subtitle="Plan your income and expenses.">
        <div className="flex gap-2">
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsIncomeDialogOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Add Planned Income
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add Planned Income</DialogTitle>
                <DialogDescription>
                    Log a new income source to your budget plan.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddIncome}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-description" className="text-right">Description</Label>
                    <Input id="income-description" placeholder="e.g., Monthly Salary" className="col-span-3" value={newIncomeDesc} onChange={e=>setNewIncomeDesc(e.target.value)} required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="income-amount" className="text-right">Budget Amount ({getSymbol()})</Label>
                    <Input id="income-amount" type="number" placeholder="e.g., 50000" className="col-span-3" value={newIncomeAmount} onChange={e=>setNewIncomeAmount(e.target.value)} required/>
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
                    <Button type="submit" className="w-full">Save Planned Income</Button>
                </div>
                </form>
            </DialogContent>
            </Dialog>

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsExpenseDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Planned Expense
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add Planned Expense</DialogTitle>
                <DialogDescription>
                    Log a new transaction to your budget plan.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddExpense}>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" placeholder="e.g., Weekly Groceries" className="col-span-3" value={newExpenseDesc} onChange={e=>setNewExpenseDesc(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Budget Amount ({getSymbol()})</Label>
                    <Input id="amount" type="number" placeholder="e.g., 3500" className="col-span-3" value={newExpenseAmount} onChange={e=>setNewExpenseAmount(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Category</Label>
                    <ScrollArea className="h-32 w-full col-span-3 rounded-md border">
                        <RadioGroup value={newExpenseCategory} onValueChange={(v) => setNewExpenseCategory(v)} className="p-4">
                            {expenseCategories.map(category => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={category.name} id={`expense-${category.id}`} />
                                    <Label htmlFor={`expense-${category.id}`}>{category.name}</Label>
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
                <Button type="submit" className="w-full">Save Planned Expense</Button>
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

      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Planned Financial Overview for {format(selectedDate, 'MMMM yyyy')}</CardTitle>
             <CardDescription>
              {getSymbol()}{totalPlannedExpenses.toLocaleString()} planned expenses out of {getSymbol()}{totalPlannedIncome.toLocaleString()} planned income
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={spentPercentage} className="w-full mb-2" />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Planned Income</p>
                    <p className="text-2xl font-bold text-green-500">{getSymbol()}{totalPlannedIncome.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Planned Expenses</p>
                    <p className="text-2xl font-bold text-red-500">{getSymbol()}{totalPlannedExpenses.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Planned Savings</p>
                    <p className="text-2xl font-bold text-primary">{getSymbol()}{plannedSavings.toLocaleString()}</p>
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
                                {Math.max(0, (plannedSavings / savingGoal) * 100).toFixed(0)}% of your goal reached
                            </p>
                        )}
                         <p className="text-sm text-muted-foreground mt-1">
                            Planned Savings: {getSymbol()}{plannedSavings.toLocaleString()}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>

         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Planned Expense Breakdown</CardTitle>
            <CardDescription>How your money is planned to be spent.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ExpenseChart expenses={plannedExpenses} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Planned Incomes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Recurrent</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plannedIncomes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center">No income planned for this month.</TableCell>
                        </TableRow>
                    ) : plannedIncomes.map((income) => (
                        <TableRow key={income.id}>
                            <TableCell className="font-medium">{income.description}</TableCell>
                            <TableCell>{income.category}</TableCell>
                            <TableCell>{income.date}</TableCell>
                            <TableCell>{income.recurrent ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{income.notes}</TableCell>
                            <TableCell>{getPlanStatus(income)}</TableCell>
                            <TableCell className="text-right">{getSymbol()}{income.amount.toLocaleString()}</TableCell>
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
                                                This action cannot be undone. This will permanently delete this income plan.
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

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Planned Expenses</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Recurrent</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {plannedExpenses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center">No expenses planned for this month.</TableCell>
                        </TableRow>
                    ) : plannedExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell className="font-medium">{expense.description}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{expense.date}</TableCell>
                            <TableCell>{expense.recurrent ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{expense.notes}</TableCell>
                            <TableCell>{getPlanStatus(expense)}</TableCell>
                            <TableCell className="text-right">{getSymbol()}{expense.amount.toLocaleString()}</TableCell>
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
                                                This action cannot be undone. This will permanently delete this expense plan.
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
              <DialogTitle>Edit Planned Income</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateIncome}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-income-description" className="text-right">Description</Label>
                <Input id="edit-income-description" className="col-span-3" value={editIncomeDesc} onChange={e=>setEditIncomeDesc(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-income-amount" className="text-right">Budget Amount ({getSymbol()})</Label>
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

      {selectedExpense && (
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
                    <Label htmlFor="edit-exp-amount" className="text-right">Budget Amount ({getSymbol()})</Label>
                    <Input id="edit-exp-amount" type="number" className="col-span-3" value={editExpenseAmount} onChange={e=>setEditExpenseAmount(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Category</Label>
                    <ScrollArea className="h-32 w-full col-span-3 rounded-md border">
                        <RadioGroup value={editExpenseCategory} onValueChange={(v) => setEditExpenseCategory(v)} className="p-4">
                            {expenseCategories.map(category => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={category.name} id={`edit-expense-${category.id}`} />
                                    <Label htmlFor={`edit-expense-${category.id}`}>{category.name}</Label>
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
