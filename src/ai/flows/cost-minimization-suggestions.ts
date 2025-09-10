
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
  input: {schema: CostMinimizationInputSchema},
  output: {schema: CostMinimizationOutputSchema},
  prompt: `You are an expert financial advisor for families. Your goal is to provide actionable and personalized suggestions to help a family save money and meet their financial goals.

Analyze the following comprehensive financial, product, and family data. All monetary values are in {{{currencySymbol}}}.

**Family Profile:**
{{#each familyMembers}}
- Name: {{{name}}}, Age: {{{age}}}, Health: {{{healthConditions}}}, Diet: {{{dietaryRestrictions}}}
{{/each}}

**Financial Goal:**
- Monthly Saving Goal: {{{currencySymbol}}}{{{savingGoal}}}

**Income Analysis:**
- Planned Income:
{{#each plannedIncomes}}
  - {{{description}}} ({{{category}}}): {{{currencySymbol}}}{{{amount}}} on {{{date}}}{{#if recurrent}} (recurrent){{/if}}
{{/each}}
- Actual Income:
{{#each actualIncomes}}
  - {{{description}}} ({{{category}}}): {{{currencySymbol}}}{{{amount}}} on {{{date}}} {{#if plannedAmount}}(planned: {{{currencySymbol}}}{{{plannedAmount}}}){{/if}}
{{/each}}

**Expense Analysis:**
- Planned Expenses:
{{#each plannedExpenses}}
  - {{{description}}} ({{{category}}}): {{{currencySymbol}}}{{{amount}}} on {{{date}}}{{#if recurrent}} (recurrent){{/if}}
{{/each}}
- Actual Expenses:
{{#each actualExpenses}}
  - {{{description}}} ({{{category}}}): {{{currencySymbol}}}{{{amount}}} on {{{date}}} {{#if plannedAmount}}(planned: {{{currencySymbol}}}{{{plannedAmount}}}){{/if}}
{{/each}}

**Product & Inventory Analysis:**
{{#each products}}
- Product: {{{name}}}, Last Bought: {{{quantity}}}{{{unit}}}, Stock: {{{currentStock}}}{{{unit}}}, Price: {{{currencySymbol}}}{{{price}}}, Consumption: {{#if consumptionRate}}{{{consumptionRate}}}{{{unit}}} per {{{consumptionPeriod}}}{{else}}N/A{{/if}}
{{/each}}

**Your Task:**

Based on all the data provided, generate a detailed list of cost-minimization suggestions. Your advice should be:
1.  **Insightful:** Identify where the actual spending deviates most from the planned budget.
2.  **Actionable:** Provide specific, concrete steps the family can take.
3.  **Personalized:** Tailor your advice to their specific income, expenses, saving goals, product consumption habits, and family composition (e.g., suggest cost-saving family activities, or budget-friendly meals that align with health needs). For example, if they overspend on 'Entertainment', suggest cheaper alternatives. If they buy a product frequently, suggest bulk buying. If their savings are falling short of their goal, highlight the areas with the most potential for reduction.
4.  **Holistic:** Consider the interplay between their shopping habits (from the product list), their expenses, and their family's health requirements.
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
