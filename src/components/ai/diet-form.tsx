
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
import { useCurrency } from '@/context/currency-context';

export default function DietForm() {
  const [preferences, setPreferences] = useState('');
  const [dietType, setDietType] = useState<'cost-optimized' | 'standard' | 'as-per-products'>('standard');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DietChartOutput | null>(null);
  const { toast } = useToast();
  const { products, familyMembers, incomes, expenses, savingGoal } = useData();
  const { getSymbol } = useCurrency();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const plainIncomes = incomes.map(({ createdAt, ...rest }) => rest);
    const plainExpenses = expenses.map(({ createdAt, ...rest }) => rest);
    
    const selectedMember = familyMembers.find(m => m.id === selectedMemberId);

    const input: DietChartInput = {
      familyMembers: familyMembers.map(m => ({
        name: m.name,
        age: m.age,
        healthConditions: m.healthConditions || 'none',
        dietaryRestrictions: m.dietaryRestrictions || 'none',
      })),
      selectedMemberName: selectedMemberId === 'all' ? undefined : selectedMember?.name,
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
      preferences: preferences || 'none',
      dietType,
      currencySymbol: getSymbol(),
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
        <CardTitle>Diet Chart Generator</CardTitle>
        <CardDescription>
          Based on your family's health data, budget, and product list, we'll create a personalized weekly diet plan.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="member">Generate For</Label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger id="member">
                <SelectValue placeholder="Select a family member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {familyMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="preferences">General Family Dietary Preferences</Label>
            <Textarea
              id="preferences"
              placeholder="e.g., more vegetarian meals, low spice, kids love pasta..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="diet-type">Diet Type</Label>
             <Select value={dietType} onValueChange={(v: any) => setDietType(v)}>
              <SelectTrigger id="diet-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="cost-optimized">Cost Optimized</SelectItem>
                <SelectItem value="as-per-products">As Per Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Note: The AI will use your family member profiles, budget, and current product needs list for a holistic plan.
          </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Diet Chart
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
        </CardContent>
      )}
    </Card>
  );
}
