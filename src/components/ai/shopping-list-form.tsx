
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateShoppingList, ShoppingListInput, ShoppingListOutput } from '@/ai/flows/shopping-list-generation';
import { useData } from '@/context/data-context';
import { Loader2,ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { useCurrency } from '@/context/currency-context';

export default function ShoppingListForm() {
  const [shoppingListPeriod, setShoppingListPeriod] = useState<'daily' | 'weekly' | 'half-monthly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShoppingListOutput | null>(null);
  const { toast } = useToast();
  const { products, familyMembers, incomes, expenses, savingGoal } = useData();
  const { getSymbol } = useCurrency();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const familyDietaryPreferences = familyMembers.map(m => {
        let preferences = [];
        if (m.dietaryRestrictions) preferences.push(m.dietaryRestrictions);
        if(m.healthConditions) preferences.push(`Health condition: ${m.healthConditions}`);
        return `${m.name}: ${preferences.join(', ')}`;
    }).join('; ');

    const plainIncomes = incomes.map(({ createdAt, ...rest }) => rest);
    const plainExpenses = expenses.map(({ createdAt, ...rest }) => rest);

    const input: ShoppingListInput = {
      familyMembers: familyMembers.map(m => ({
        name: m.name,
        age: m.age,
        height: m.height,
        weight: m.weight,
        healthConditions: m.healthConditions || 'none',
        dietaryRestrictions: m.dietaryRestrictions || 'none',
      })),
      familyDietaryPreferences: familyDietaryPreferences || 'none',
      products: products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        currentStock: p.currentStock,
        unit: p.unit,
        price: p.price,
        consumptionRate: p.consumptionRate,
        consumptionPeriod: p.consumptionPeriod,
      })),
      plannedIncomes: plainIncomes.filter(i => i.status === 'planned'),
      actualIncomes: plainIncomes.filter(i => i.status === 'completed'),
      plannedExpenses: plainExpenses.filter(e => e.status === 'planned'),
      actualExpenses: plainExpenses.filter(e => e.status === 'completed'),
      savingGoal: savingGoal || 0,
      shoppingListPeriod,
      currencySymbol: getSymbol(),
    };

    try {
      const response = await generateShoppingList(input);
      setResult(response);
    } catch (error) {
      console.error("Error generating shopping list:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate shopping list. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopping List Generator</CardTitle>
        <CardDescription>
          Create a smart shopping list based on your inventory, budget, and family needs.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
           <div className="flex flex-col space-y-1.5">
            <Label htmlFor="shopping-period">Shopping List Period</Label>
             <Select value={shoppingListPeriod} onValueChange={(v: any) => setShoppingListPeriod(v)}>
              <SelectTrigger id="shopping-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="half-monthly">Half-monthly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Note: The AI will use your family data, budget, and current product list to generate the shopping list.
          </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            Generate Shopping List
          </Button>
        </CardFooter>
      </form>
      {result && (
        <CardContent className="space-y-4">
            <Card className="mt-4">
                 <CardHeader>
                    <CardTitle>Your {shoppingListPeriod} Shopping List</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <pre className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-body text-sm">
                        {result.shoppingList}
                    </pre>
                 </CardContent>
            </Card>
        </CardContent>
      )}
    </Card>
  );
}
