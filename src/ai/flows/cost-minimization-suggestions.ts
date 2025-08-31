
'use server';

/**
 * @fileOverview A cost minimization suggestion AI agent.
 *
 * - costMinimizationSuggestions - A function that suggests cost minimization strategies based on family spending habits and product needs.
 * - CostMinimizationInput - The input type for the costMinimizationSuggestions function.
 * - CostMinimizationOutput - The return type for the costMinimizationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductSchema = z.object({
  name: z.string().describe('Name of the product.'),
  quantity: z.number().describe('Current quantity of the product.'),
  unit: z.string().describe('Unit of measurement (e.g., kg, l, piece).'),
  price: z.number().describe('Price of the product.'),
  consumptionRate: z.number().optional().describe('The consumption rate of the product.'),
  consumptionPeriod: z.enum(['daily', 'weekly', 'half-monthly', 'monthly']).optional().describe('The consumption period of the product.'),
});

const CostMinimizationInputSchema = z.object({
  spendingHabits: z
    .string()
    .describe(
      'A detailed description of the family’s spending habits, including categories and amounts.'
    ),
  productNeeds: z
    .array(ProductSchema)
    .describe(
      'A list of product needs, including names, quantities, units, prices, and consumption needs.'
    ),
});
export type CostMinimizationInput = z.infer<typeof CostMinimizationInputSchema>;

const CostMinimizationOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of cost-minimization strategies tailored to the family’s spending habits and product needs.'
    ),
});
export type CostMinimizationOutput = z.infer<typeof CostMinimizationOutputSchema>;

export async function costMinimizationSuggestions(
  input: CostMinimizationInput
): Promise<CostMinimizationOutput> {
  return costMinimizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'costMinimizationPrompt',
  input: {schema: CostMinimizationInputSchema},
  output: {schema: CostMinimizationOutputSchema},
  prompt: `You are a financial advisor specializing in family budgeting. Analyze the family's spending habits and product needs to suggest cost-minimization strategies.

Spending Habits: {{{spendingHabits}}}

Product Needs:
{{#each productNeeds}}
- Product: {{{name}}}, Quantity: {{{quantity}}}{{{unit}}}, Price: {{{price}}}, Consumption: {{#if consumptionRate}}{{{consumptionRate}}}{{{unit}}} per {{{consumptionPeriod}}}{{else}}N/A{{/if}}
{{/each}}

Based on the detailed product needs and spending habits, suggest specific, actionable strategies to reduce expenses and save money for the family. Consider bulk buying, alternative products, and timing of purchases based on the provided needs.`,
});

const costMinimizationFlow = ai.defineFlow(
  {
    name: 'costMinimizationFlow',
    inputSchema: CostMinimizationInputSchema,
    outputSchema: CostMinimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
