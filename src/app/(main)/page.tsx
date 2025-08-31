
'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle, Lightbulb, Utensils } from 'lucide-react';
import SavingsPieChart from '@/components/dashboard/savings-pie-chart';
import PageHeader from '@/components/common/page-header';
import { useCurrency } from '@/context/currency-context';
import { useData } from '@/context/data-context';
import { getMonth, getYear } from 'date-fns';

export default function DashboardPage() {
  const { getSymbol } = useCurrency();
  const { budget, products, expenses, incomes } = useData();
  
  const { totalIncome, totalSpent } = useMemo(() => {
    const currentMonth = getMonth(new Date());
    const currentYear = getYear(new Date());

    const monthlyIncomes = incomes.filter(i => {
        const incomeDate = new Date(i.date);
        return getMonth(incomeDate) === currentMonth && getYear(incomeDate) === currentYear;
    });

    const monthlyExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return getMonth(expenseDate) === currentMonth && getYear(expenseDate) === currentYear;
    });

    return {
        totalIncome: monthlyIncomes.reduce((sum, income) => sum + income.amount, 0),
        totalSpent: monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    };
  }, [incomes, expenses]);

  const upcomingRecurrentBills = useMemo(() => {
    const today = new Date();
    return expenses
      .filter(e => e.recurrent && new Date(e.date) > today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses]);


  if (!budget) {
    return <div className="flex items-center justify-center h-screen">Loading Dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <PageHeader title="Welcome to Family Manager!" subtitle="Your family's command center." />
      
      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This Month's Financial Summary</CardTitle>
             <CardDescription>
              A visual breakdown of your income and expenses.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <SavingsPieChart income={totalIncome} expenses={totalSpent} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center space-y-3">
            <Button asChild variant="outline">
              <Link href="/budget"><PlusCircle className="mr-2 h-4 w-4" /> Add Expense</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products"><Utensils className="mr-2 h-4 w-4" /> Update Products</Link>
            </Button>
            <Button asChild>
              <Link href="/ai"><Lightbulb className="mr-2 h-4 w-4" /> Get AI Suggestions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bills & Reminders</CardTitle>
            <CardDescription>Don't miss these payments.</CardDescription>
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
                <p className="text-sm text-muted-foreground text-center">No upcoming recurrent bills found.</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Product Inventory</CardTitle>
             <Link href="/products" className="text-sm text-primary hover:underline flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
             <ul className="space-y-2">
              {products.slice(0, 4).map((product) => (
                <li key={product.id} className="flex justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="text-muted-foreground">{product.currentStock}{product.unit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
