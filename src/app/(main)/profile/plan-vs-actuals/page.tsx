
'use client';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '@/components/common/page-header';
import { useCurrency } from '@/context/currency-context';
import { useData } from '@/context/data-context';
import { getYear } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function PlanVsActualsPage() {
  const { getSymbol } = useCurrency();
  const { expenses, incomes } = useData();
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

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
  
  const {
    plannedIncomesList,
    actualIncomesList,
    plannedExpensesList,
    actualExpensesList
  } = useMemo(() => {
    const yearlyIncomes = incomes.filter(i => getYear(new Date(i.date)) === selectedYear);
    const yearlyExpenses = expenses.filter(e => getYear(new Date(e.date)) === selectedYear);

    // Items that were ever planned (i.e., have a plannedAmount) or are still planned.
    const plannedIncomesList = yearlyIncomes.filter(i => i.status === 'planned' || i.plannedAmount !== undefined);
    const plannedExpensesList = yearlyExpenses.filter(e => e.status === 'planned' || e.plannedAmount !== undefined);

    // Actuals are only completed transactions.
    const actualIncomesList = yearlyIncomes.filter(i => i.status === 'completed');
    const actualExpensesList = yearlyExpenses.filter(e => e.status === 'completed');

    return {
      plannedIncomesList,
      actualIncomesList,
      plannedExpensesList,
      actualExpensesList,
    };
  }, [expenses, incomes, selectedYear]);

  return (
    <div className="container mx-auto">
      <PageHeader title="Plan vs. Actuals" subtitle="Compare your budget against your actuals." />
      
      <div className="px-4 sm:px-0">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Comparison for {selectedYear}</CardTitle>
              <CardDescription>How your planning compares to reality.</CardDescription>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income Section */}
            <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/50">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Income</h3>
              </div>
              <Separator className="bg-green-300 dark:bg-green-700"/>
              <div className="grid grid-cols-2 gap-x-4 mt-2">
                <div>
                  <h4 className="text-md font-semibold mb-2">Planned</h4>
                  <ScrollArea className="h-60 pr-3">
                    <ul className="text-sm space-y-2">
                      {plannedIncomesList.map(i => (
                        <li key={i.id} className="flex justify-between">
                          <span className="truncate pr-1">{i.description}</span>
                          <span>{getSymbol()}{(i.plannedAmount ?? i.amount).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-2">Actual</h4>
                  <ScrollArea className="h-60">
                    <ul className="text-sm space-y-2">
                      {actualIncomesList.map(i => (
                        <li key={i.id} className="flex justify-between">
                          <span className="truncate pr-1">{i.description}</span>
                          <span>{getSymbol()}{i.amount.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/50">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <TrendingDown className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Expenses</h3>
              </div>
              <Separator className="bg-red-300 dark:bg-red-700" />
              <div className="grid grid-cols-2 gap-x-4 mt-2">
                <div>
                  <h4 className="text-md font-semibold mb-2">Planned</h4>
                  <ScrollArea className="h-60 pr-3">
                    <ul className="text-sm space-y-2">
                      {plannedExpensesList.map(e => (
                        <li key={e.id} className="flex justify-between">
                          <span className="truncate pr-1">{e.description}</span>
                          <span>{getSymbol()}{(e.plannedAmount ?? e.amount).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-2">Actual</h4>
                  <ScrollArea className="h-60">
                    <ul className="text-sm space-y-2">
                      {actualExpensesList.map(e => (
                        <li key={e.id} className="flex justify-between">
                          <span className="truncate pr-1">{e.description}</span>
                          <span>{getSymbol()}{e.amount.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
