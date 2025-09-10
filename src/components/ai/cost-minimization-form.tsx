
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { costMinimizationSuggestions, CostMinimizationInput, CostMinimizationOutput } from '@/ai/flows/cost-minimization-suggestions';
import { useData } from '@/context/data-context';
import { Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/currency-context';

export default function CostMinimizationForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CostMinimizationOutput | null>(null);
  const { toast } = useToast();
  const { products, expenses, incomes, savingGoal, familyMembers } = useData();
  const { getSymbol } = useCurrency();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const plainIncomes = incomes.map(({ createdAt, ...rest }) => rest);
    const plainExpenses = expenses.map(({ createdAt, ...rest }) => rest);

    const input: CostMinimizationInput = {
      familyMembers: familyMembers.map(m => ({
        name: m.name,
        age: m.age,
        height: m.height,
        weight: m.weight,
        healthConditions: m.healthConditions || 'none',
        dietaryRestrictions: m.dietaryRestrictions || 'none',
      })),
      plannedIncomes: plainIncomes.filter(i => i.status === 'planned'),
      actualIncomes: plainIncomes.filter(i => i.status === 'completed'),
      plannedExpenses: plainExpenses.filter(e => e.status === 'planned'),
      actualExpenses: plainExpenses.filter(e => e.status === 'completed'),
      products: products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        currentStock: p.currentStock,
        unit: p.unit,
        price: p.price,
        consumptionRate: p.consumptionRate,
        consumptionPeriod: p.consumptionPeriod,
      })),
      savingGoal: savingGoal || 0,
      currencySymbol: getSymbol(),
    };

    try {
      const response = await costMinimizationSuggestions(input);
      setResult(response);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get suggestions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Minimization Suggestions</CardTitle>
        <CardDescription>
          Our AI will analyze your complete financial and product data to find the best ways for you to save money.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
           <p className="text-sm text-muted-foreground">
              Click the button below to get personalized suggestions. The AI will use all your data, including family profiles, planned and actual transactions, product inventory, and your savings goal.
            </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Get Suggestions
          </Button>
        </CardFooter>
      </form>
      {result && (
         <CardContent>
            <Card className="mt-4">
                 <CardHeader>
                    <CardTitle>Here are some suggestions to save money:</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <pre className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-body text-sm">{result.suggestions}</pre>
                 </CardContent>
            </Card>
        </CardContent>
      )}
    </Card>
  );
}
