
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateDietChart, DietChartInput, DietChartOutput } from '@/ai/flows/diet-chart-generation';
import { useData } from '@/context/data-context';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DietForm() {
  const [preferences, setPreferences] = useState('');
  const [shoppingListPeriod, setShoppingListPeriod] = useState<'daily' | 'weekly' | 'half-monthly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DietChartOutput | null>(null);
  const { toast } = useToast();
  const { familyMembers, products } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const input: DietChartInput = {
      familyHealthData: familyMembers.map(m => ({
        memberId: m.id,
        name: m.name,
        age: m.age,
        healthConditions: m.healthConditions,
        dietaryRestrictions: m.dietaryRestrictions
      })),
      monthlyProductNeeds: products.map(p => ({
        productName: p.name,
        quantity: p.quantity,
        unit: p.unit,
        dailyNeed: p.dailyNeed,
        halfMonthlyNeed: p.halfMonthlyNeed,
        monthlyNeed: p.monthlyNeed,
      })),
      preferences,
      shoppingListPeriod,
    };

    try {
      const response = await generateDietChart(input);
      setResult(response);
    } catch (error) {
      console.error("Error generating diet chart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate diet chart. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diet & Shopping List Generator</CardTitle>
        <CardDescription>
          Based on your family's health data and product list, we'll create a personalized weekly diet plan and a shopping list.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="preferences">Dietary Preferences</Label>
            <Textarea
              id="preferences"
              placeholder="e.g., more vegetarian meals, low spice, kids love pasta..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>
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
            Note: The AI will use your current family health data and product needs list, including consumption patterns.
          </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </CardFooter>
      </form>
      {result && (
        <CardContent className="space-y-4">
            <Card className="mt-4">
                 <CardHeader>
                    <CardTitle>Your Weekly Diet Chart</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <pre className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-body text-sm">
                        {result.weeklyDietChart}
                    </pre>
                 </CardContent>
            </Card>
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
