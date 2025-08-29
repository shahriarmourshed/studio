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
import { costMinimizationSuggestions, CostMinimizationInput, CostMinimizationOutput } from '@/ai/flows/cost-minimization-suggestions';
import { products } from '@/lib/data';
import { Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CostMinimizationForm() {
  const [spendingHabits, setSpendingHabits] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CostMinimizationOutput | null>(null);
  const { toast } = useToast();

  const productNeedsText = products.map(p => `${p.name} ${p.quantity}${p.unit}`).join(', ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const input: CostMinimizationInput = {
      spendingHabits,
      productNeeds: productNeedsText,
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
          Describe your family's spending, and our AI will find ways to save.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="spending">Describe your spending habits</Label>
            <Textarea
              id="spending"
              placeholder="e.g., We spend a lot on eating out on weekends. Kids' clothes are a major expense..."
              value={spendingHabits}
              onChange={(e) => setSpendingHabits(e.target.value)}
            />
          </div>
           <p className="text-sm text-muted-foreground">
              Note: We are using your pre-filled product needs list for this demo.
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
                    <p className="text-sm">{result.suggestions}</p>
                 </CardContent>
            </Card>
        </CardContent>
      )}
    </Card>
  );
}
