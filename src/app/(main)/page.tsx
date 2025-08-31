
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
import { ArrowRight, PlusCircle, Lightbulb, Utensils } from 'lucide-react';
import ExpenseChart from '@/components/budget/expense-chart';
import PageHeader from '@/components/common/page-header';
import { useCurrency } from '@/context/currency-context';
import { useData } from '@/context/data-context';
import { getYear, isFuture, differenceInDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPage() {
  const { getSymbol } = useCurrency();
  const { products, expenses, incomes, reminderDays } = useData();
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

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
  } = useMemo(() => {
    const yearlyExpenses = expenses.filter(e => getYear(new Date(e.date)) === selectedYear);
    return { 
      filteredYearlyExpenses: yearlyExpenses,
    };
  }, [expenses, selectedYear]);

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


  return (
    <div className="container mx-auto px-0 sm:px-4">
      <PageHeader title="Welcome to Family Manager!" subtitle="Your family's command center." />
      
      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                An overview of your finances for {selectedYear}.
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

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button asChild variant="outline" className="h-full">
              <Link href="/budget"><PlusCircle className="mr-2 h-4 w-4" /> Add Expense Plan</Link>
            </Button>
            <Button asChild variant="outline" className="h-full">
              <Link href="/products"><Utensils className="mr-2 h-4 w-4" /> Update Products</Link>
            </Button>
            <Button asChild className="h-full">
              <Link href="/ai"><Lightbulb className="mr-2 h-4 w-4" /> Get AI Suggestions</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
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
