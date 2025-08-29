'use client';

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
import { budget } from "@/lib/data";
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
import { useCurrency } from "@/context/currency-context";

export default function BudgetPage() {
  const { getSymbol, convert } = useCurrency();
  const spentPercentage = (budget.spent / budget.total) * 100;
  
  return (
    <div className="container mx-auto">
      <PageHeader title="Family Budget" subtitle="Keep track of your income and expenses.">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
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
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" placeholder="e.g., Weekly Groceries" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount ({getSymbol()})</Label>
                <Input id="amount" type="number" placeholder="e.g., 3500" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="bills">Bills</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" className="col-span-3" />
              </div>
              <Button type="submit" className="w-full">Save Expense</Button>
            </div>
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
            <ExpenseChart />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest logged expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
