
'use client';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '@/context/currency-context';
import { useData } from '@/context/data-context';
import { getYear, getMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Expense, Income, ExpenseCategory, IncomeCategory } from '@/lib/types';
import PageHeader from '../common/page-header';

type AggregatedData = {
    planned: number;
    actual: number;
    difference: number;
};

export default function PlanVsActuals() {
  const { getSymbol } = useCurrency();
  const { expenses, incomes } = useData();
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(getMonth(new Date()));


  const yearsWithData = useMemo(() => {
    const years = new Set<number>();
    [...incomes, ...expenses].forEach(t => years.add(getYear(new Date(t.date))));
    
    const currentYear = getYear(new Date());
    if (!years.has(currentYear)) {
        years.add(currentYear);
    }
    
    for (let i = currentYear + 1; i <= 2050; i++) {
        years.add(i);
    }

    return Array.from(years).sort((a,b) => a - b);
  }, [incomes, expenses]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const {
    aggregatedIncomes,
    aggregatedExpenses,
    totalIncome,
    totalExpense
  } = useMemo(() => {
    const getFilteredItems = <T extends Income | Expense>(items: T[]) => {
        return items.filter(item => {
            const itemDate = new Date(item.date);
            const yearMatch = getYear(itemDate) === selectedYear;
            const monthMatch = selectedMonth === 'all' || getMonth(itemDate) === selectedMonth;
            return yearMatch && monthMatch;
        });
    }

    const yearlyIncomes = getFilteredItems(incomes);
    const yearlyExpenses = getFilteredItems(expenses);
    
    const aggregate = <T extends Expense | Income, C extends ExpenseCategory | IncomeCategory>(
        items: T[], 
        categories: C[]
    ): { data: Record<string, AggregatedData>, total: AggregatedData } => {
        const data = {} as Record<string, AggregatedData>;
        
        categories.forEach(cat => {
            data[cat] = { planned: 0, actual: 0, difference: 0 };
        });

        items.forEach(item => {
            const category = item.category as C;
            if (!data[category]) data[category] = { planned: 0, actual: 0, difference: 0 };
            
            if(item.status === 'completed') {
                data[category].actual += item.amount;
                // Use plannedAmount if it exists, otherwise it was an unplanned expense, count its own amount as planned.
                data[category].planned += item.plannedAmount ?? item.amount;
            } else if (item.status === 'planned') {
                data[category].planned += item.amount;
            }
        });

        let totalPlanned = 0;
        let totalActual = 0;

        Object.keys(data).forEach(cat => {
            data[cat].difference = data[cat].actual - data[cat].planned;
            totalPlanned += data[cat].planned;
            totalActual += data[cat].actual;
        });

        return {
            data,
            total: {
                planned: totalPlanned,
                actual: totalActual,
                difference: totalActual - totalPlanned
            }
        };
    };

    const incomeCategories: IncomeCategory[] = ['Salary', 'Business', 'Investment', 'Gift', 'Other'];
    const expenseCategories: ExpenseCategory[] = ['Groceries', 'Bills', 'Housing', 'Transport', 'Health', 'Education', 'Entertainment', 'Personal Care', 'Other'];

    const incomeResult = aggregate<Income, IncomeCategory>(yearlyIncomes, incomeCategories);
    const expenseResult = aggregate<Expense, ExpenseCategory>(yearlyExpenses, expenseCategories);

    return {
      aggregatedIncomes: incomeResult.data,
      totalIncome: incomeResult.total,
      aggregatedExpenses: expenseResult.data,
      totalExpense: expenseResult.total
    };
  }, [expenses, incomes, selectedYear, selectedMonth]);

  const renderDifference = (difference: number, type: 'income' | 'expense') => {
      const isPositive = difference > 0;
      const isNegative = difference < 0;
      let colorClass = 'text-muted-foreground';

      if (type === 'income') {
          if (isPositive) colorClass = 'text-green-500';
          if (isNegative) colorClass = 'text-red-500';
      } else { // expense
          if (isPositive) colorClass = 'text-red-500'; // Overspent
          if (isNegative) colorClass = 'text-green-500'; // Underspent
      }

      return (
          <span className={cn('font-semibold', colorClass)}>
              {isPositive ? '+' : ''}{getSymbol()}{difference.toLocaleString()}
          </span>
      )
  };
  
  const getSelectedPeriodText = () => {
    if (selectedMonth === 'all') {
        return `for ${selectedYear}`;
    }
    return `for ${monthNames[selectedMonth]}, ${selectedYear}`;
  }


  return (
    <>
    <PageHeader title="Plan vs. Actuals" subtitle={`Comparison ${getSelectedPeriodText()}`}>
        <div className='flex gap-2'>
        <Select
            value={String(selectedMonth)}
            onValueChange={(month) => setSelectedMonth(month === 'all' ? 'all' : Number(month))}
        >
            <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthNames.map((month, index) => (
                    <SelectItem key={`month-${index}`} value={String(index)}>{month}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Select
            value={String(selectedYear)}
            onValueChange={(year) => setSelectedYear(parseInt(year))}
        >
            <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
                {yearsWithData.map(year => (
                    <SelectItem key={`year-${year}`} value={String(year)}>{year}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        </div>
    </PageHeader>
    <div className="px-4 sm:px-0 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Income Card */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-500"/>
                    Income Comparison
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Planned</TableHead>
                            <TableHead className="text-right">Actual</TableHead>
                            <TableHead className="text-right">Difference</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(aggregatedIncomes).map(([category, data]) => (
                            (data.planned > 0 || data.actual > 0) &&
                            <TableRow key={category}>
                                <TableCell className="font-medium">{category}</TableCell>
                                <TableCell className="text-right">{getSymbol()}{data.planned.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{getSymbol()}{data.actual.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{renderDifference(data.difference, 'income')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-muted/50">
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">{getSymbol()}{totalIncome.planned.toLocaleString()}</TableHead>
                            <TableHead className="text-right">{getSymbol()}{totalIncome.actual.toLocaleString()}</TableHead>
                            <TableHead className="text-right">{renderDifference(totalIncome.difference, 'income')}</TableHead>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>

        {/* Expense Card */}
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-6 w-6 text-red-500"/>
                    Expense Comparison
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Planned</TableHead>
                            <TableHead className="text-right">Actual</TableHead>
                            <TableHead className="text-right">Difference</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(aggregatedExpenses).map(([category, data]) => (
                            (data.planned > 0 || data.actual > 0) &&
                            <TableRow key={category}>
                                <TableCell className="font-medium">{category}</TableCell>
                                <TableCell className="text-right">{getSymbol()}{data.planned.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{getSymbol()}{data.actual.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{renderDifference(data.difference, 'expense')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                        <TableFooter>
                        <TableRow className="bg-muted/50">
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">{getSymbol()}{totalExpense.planned.toLocaleString()}</TableHead>
                            <TableHead className="text-right">{getSymbol()}{totalExpense.actual.toLocaleString()}</TableHead>
                            <TableHead className="text-right">{renderDifference(totalExpense.difference, 'expense')}</TableHead>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>

        </div>
    </>
  );
}
