
'use server';

/**
 * @fileOverview Generates a shopping list based on family preferences and product needs.
 *
 * - generateShoppingList - A function that generates the shopping list.
 * - ShoppingListInput - The input type for the generateShoppingList function.
 * - ShoppingListOutput - The return type for the generateShoppingList function.
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

const FamilyMemberSchema = z.object({
  name: z.string(),
  age: z.number(),
  height: z.number().describe('Height in centimeters.'),
  weight: z.number().describe('Weight in kilograms.'),
  healthConditions: z.string(),
  dietaryRestrictions: z.string(),
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

const ShoppingListInputSchema = z.object({
  familyMembers: z.array(FamilyMemberSchema).describe('A list of all family members and their health data.'),
  products: z.array(ProductSchema).describe('List of available products, including stock levels, prices, and consumption patterns.'),
  plannedIncomes: z.array(IncomeSchema).describe('The list of all planned incomes for the period.'),
  actualIncomes: z.array(IncomeSchema).describe('The list of all actual (completed) incomes for the period.'),
  plannedExpenses: z.array(ExpenseSchema).describe('The list of all planned expenses for the period.'),
  actualExpenses: z.array(ExpenseSchema).describe('The list of all actual (completed) expenses for the period.'),
  savingGoal: z.number().describe('The monthly saving goal.'),
  familyDietaryPreferences: z.string().describe('A summary of dietary preferences and restrictions for all family members.'),
  shoppingListPeriod: z
    .enum(['daily', 'weekly', 'half-monthly', 'monthly'])
    .describe('The desired period for the shopping list.'),
  currencySymbol: z.string().describe('The currency symbol used in the application.'),
});

export type ShoppingListInput = z.infer<typeof ShoppingListInputSchema>;

const ShoppingListOutputSchema = z.object({
  shoppingList: z
    .string()
    .describe(
      'A shopping list in markdown format for the specified period, based on preferences and product needs.'
    ),
});

export type ShoppingListOutput = z.infer<typeof ShoppingListOutputSchema>;

export async function generateShoppingList(input: ShoppingListInput): Promise<ShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shoppingListPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: ShoppingListInputSchema},
  output: {schema: ShoppingListOutputSchema},
  prompt: `You are a financial planner and nutritionist creating a shopping list for a family. All monetary values are in {{{currencySymbol}}}.

  **Family Health & Preferences:**
  {{#each familyMembers}}
  - Name: {{{name}}}, Age: {{{age}}}, Height: {{{height}}}cm, Weight: {{{weight}}}kg
    Health: {{{healthConditions}}}, Diet: {{{dietaryRestrictions}}}
  {{/each}}
  Additional Preferences: {{{familyDietaryPreferences}}}

  **Product Inventory & Consumption:**
  {{#each products}}
  - Product: {{{name}}}, Stock: {{{currentStock}}}{{{unit}}}, Price: {{{currencySymbol}}}{{{price}}}, Consumption: {{#if consumptionRate}}{{{consumptionRate}}}{{{unit}}} per {{{consumptionPeriod}}}{{else}}N/A{{/if}}
  {{/each}}

  **Full Financial Picture:**
  - Monthly Saving Goal: {{{currencySymbol}}}{{{savingGoal}}}
  - Planned Income: {{#each plannedIncomes}} {{{description}}}: {{{currencySymbol}}}{{{amount}}}; {{/each}}
  - Actual Income: {{#each actualIncomes}} {{{description}}}: {{{currencySymbol}}}{{{amount}}}; {{/each}}
  - Planned Expenses: {{#each plannedExpenses}} {{{description}}}: {{{currencySymbol}}}{{{amount}}}; {{/each}}
  - Actual Expenses: {{#each actualExpenses}} {{{description}}}: {{{currencySymbol}}}{{{amount}}}; {{/each}}

  **Your Task:**

  Generate a smart shopping list in markdown format for the '{{{shoppingListPeriod}}}' period.
  - **Calculate Needs:** Based on the product consumption rates, determine what needs to be replenished for the period, factoring in the current stock.
  - **Consider Health:** The list must align with the family's health conditions and dietary restrictions.
  - **Be Budget-Conscious:** Analyze the family's full financial situation. Make cost-effective suggestions. If their spending is high compared to their income and savings goals, suggest cheaper alternatives or brands.
  - **Prioritize:** The list should prioritize essential items based on health needs and critically low stock levels.
  `,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: ShoppingListInputSchema,
    outputSchema: ShoppingListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
