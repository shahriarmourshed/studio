
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
import { googleAI } from '@genkit-ai/googleai';

const ProductSchema = z.object({
  name: z.string().describe('Name of the product.'),
  quantity: z.number().describe('Last purchased quantity of the product.'),
  currentStock: z.number().describe('Current available stock of the product.'),
  unit: z.string().describe('Unit of measurement (e.g., kg, l, piece).'),
  price: z.number().describe('Price of the product.'),
  consumptionRate: z.number().optional().describe('The consumption rate of the product.'),
  consumptionPeriod: z.enum(['daily', 'weekly', 'half-monthly', 'monthly']).optional().describe('The consumption period of the product.'),
});

const ExpenseSchema = z.object({
    description: z.string(),
    amount: z.number(),
    category: z.string(),
    date: z.string(),
    recurrent: z.boolean(),
    notes: z.string().optional(),
    plannedAmount: z.number().optional().describe('The originally planned amount, if it was a planned expense.'),
});

const IncomeSchema = z.object({
    description: z.string(),
    amount: z.number(),
    category: z.string(),
    date: z.string(),
    recurrent: z.boolean(),
    notes: z.string().optional(),
    plannedAmount: z.number().optional().describe('The originally planned amount, if it was a planned income.'),
});

const FamilyMemberSchema = z.object({
  name: z.string(),
  age: z.number(),
  height: z.number().describe('Height in centimeters.'),
  weight: z.number().describe('Weight in kilograms.'),
  healthConditions: z.string(),
  dietaryRestrictions: z.string(),
});


const CostMinimizationInputSchema = z.object({
  familyMembers: z.array(FamilyMemberSchema).describe('A list of all family members and their health data.'),
  plannedIncomes: z.array(IncomeSchema).describe('The list of all planned incomes for the period.'),
  actualIncomes: z.array(IncomeSchema).describe('The list of all actual (completed) incomes for the period.'),
  plannedExpenses: z.array(ExpenseSchema).describe('The list of all planned expenses for the period.'),
  actualExpenses: z.array(ExpenseSchema).describe('The list of all actual (completed) expenses for the period.'),
  products: z.array(ProductSchema).describe('A list of all available products and their details.'),
  savingGoal: z.number().describe('The monthly saving goal.'),
  currencySymbol: z.string().describe('The currency symbol used in the application.'),
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
  model: 'googleai/gemini-1.5-flash',
  input: {schema: CostMinimizationInputSchema},
  output: {schema: CostMinimizationOutputSchema},
  prompt: `You are an expert financial advisor for families. Your goal is to provide actionable and personalized suggestions to help a family save money and meet their financial goals.

Analyze the following comprehensive financial, product, and family data. All monetary values are in {{{currencySymbol}}}.

**Family Profile:**
{{#each familyMembers}}
- Name: {{{name}}}, Age: {{{age}}}, Height: {{{height}}}cm, Weight: {{{weight}}}kg
  Health: {{{healthConditions}}}
  Diet: {{{dietaryRestrictions}}}
{{/each}}

**Financial Goal:**
- Monthly Saving Goal: {{{currencySymbol}}}{{{savingGoal}}}

**Income Analysis:**
- Planned Income: {{#each plannedIncomes}}{{{description}}} ({{{category}}}): {{{currencySymbol}}}{{{amount}}}; {{/each}}
- Actual Income: {{#each actualIncomes}}{{{description}}} ({{{category}}}): {{{currencySymbol}}}{{{amount}}}; {{/each}}

**Expense Analysis:**
- Planned Expenses: {{#each plannedExpenses}}{{{description}}} ({{{category}}}): {{{currencySymbol}}}{{{amount}}}; {{/each}}
- Actual Expenses: {{#each actualExpenses}}{{{description}}} ({{{category}}}): {{{currencySymbol}}}{{{amount}}}; {{/each}}

**Product & Inventory Analysis:**
{{#each products}}
- Product: {{{name}}}, Last Bought: {{{quantity}}}{{{unit}}}, Stock: {{{currentStock}}}{{{unit}}}, Price: {{{currencySymbol}}}{{{price}}}, Consumption: {{#if consumptionRate}}{{{consumptionRate}}}{{{unit}}} per {{{consumptionPeriod}}}{{else}}N/A{{/if}}
{{/each}}

**Your Task:**

Based on a deep analysis of all the data provided, generate a detailed list of cost-minimization suggestions. Your advice must be:
1.  **Holistic:** Synthesize information from all sections. For example, connect high spending in the 'Groceries' category with the product inventory to suggest specific cheaper alternatives or bulk buying opportunities.
2.  **Insightful:** Identify where actual spending deviates most from the planned budget. Point out specific categories or products where spending is highest.
3.  **Actionable:** Provide specific, concrete steps the family can take. Instead of "spend less on entertainment," suggest "try a free park day or a movie night at home instead of going to the cinema, which could save you {{{currencySymbol}}}50."
4.  **Personalized:** Tailor your advice to the family's specific income, expenses, saving goals, product consumption habits, and health needs. If their savings are falling short, highlight the areas with the most potential for reduction.
`,
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
