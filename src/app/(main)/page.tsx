'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlusCircle, Lightbulb, Utensils } from 'lucide-react';
import BudgetOverviewChart from '@/components/dashboard/budget-overview-chart';
import { upcomingBills } from '@/lib/data';
import PageHeader from '@/components/common/page-header';
import { useCurrency } from '@/context/currency-context';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query } from 'firebase/firestore';
import type { Product, Budget, Expense } from '@/lib/types';


export default function DashboardPage() {
  const { getSymbol, convert } = useCurrency();
  const { user } = useAuth();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const budgetDocRef = doc(db, 'users', user.uid, 'budget', 'summary');
          const productsQuery = query(collection(db, 'users', user.uid, 'products'));
          const expensesQuery = query(collection(db, 'users', user.uid, 'expenses'));
          
          const [budgetSnap, productsSnap, expensesSnap] = await Promise.all([
              getDoc(budgetDocRef),
              getDocs(productsQuery),
              getDocs(expensesQuery)
          ]);
          
          // Process Products
          const productsData = productsSnap.docs.map(doc => doc.data() as Product);
          setProducts(productsData);

          // Process Expenses and Budget
          const expensesData = expensesSnap.docs.map(doc => doc.data() as Expense);
          const totalSpent = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
          
          if (budgetSnap.exists()) {
              const budgetData = budgetSnap.data() as Budget;
              setBudget({ ...budgetData, spent: totalSpent });
          }

        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  if (loading || !budget) {
    return <div className="flex items-center justify-center h-screen">Loading Dashboard...</div>;
  }

  const remainingBudget = budget.total - budget.spent;

  return (
    <div className="container mx-auto px-0 sm:px-4">
      <PageHeader title="Welcome to FamilyVerse!" subtitle="Your family's command center." />
      
      <div className="p-4 sm:p-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              You have spent {getSymbol()}{convert(budget.spent).toLocaleString()} of {getSymbol()}{convert(budget.total).toLocaleString()} this month.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <BudgetOverviewChart budget={budget}/>
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
              {upcomingBills.slice(0, 3).map((bill) => (
                <li key={bill.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-lg">{getSymbol()}{convert(bill.amount).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Shopping List</CardTitle>
             <Link href="/products" className="text-sm text-primary hover:underline flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
             <ul className="space-y-2">
              {products.slice(0, 4).map((product) => (
                <li key={product.id} className="flex justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="text-muted-foreground">{product.quantity}{product.unit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diet Summary</CardTitle>
            <CardDescription>A quick look at your family's health plan.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-2">Today's Focus</p>
            <p className="text-2xl font-bold text-primary">Balanced Meal Day</p>
            <p className="text-sm mt-2">Low-sodium for Alex, vegetarian for Jane.</p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/ai">View Full Diet Plan <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
