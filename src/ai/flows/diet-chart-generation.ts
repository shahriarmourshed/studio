
'use server';

/**
 * @fileOverview Generates a personalized weekly diet chart and shopping list based on product needs.
 *
 * - generateDietChart - A function that generates the diet chart and shopping list.
 * - DietChartInput - The input type for the generateDietChart function.
 * - DietChartOutput - The return type for the generateDietChart function.
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


const DietChartInputSchema = z.object({
  familyMembers: z.array(FamilyMemberSchema).describe('A list of all family members and their health data.'),
  selectedMemberName: z.string().optional().describe('The name of the family member to generate the diet chart for. If not provided, generate for all members.'),
  products: z.array(ProductSchema).describe('List of available products, including stock levels, prices, and consumption patterns.'),
  plannedIncomes: z.array(IncomeSchema).describe('The list of all planned incomes for the period.'),
  actualIncomes: z.array(IncomeSchema).describe('The list of all actual (completed) incomes for the period.'),
  plannedExpenses: z.array(ExpenseSchema).describe('The list of all planned expenses for the period.'),
  actualExpenses: z.array(ExpenseSchema).describe('The list of all actual (completed) expenses for the period.'),
  savingGoal: z.number().describe('The monthly saving goal.'),
  preferences: z.string().describe('General dietary preferences for the family (e.g., more vegetarian meals, low spice).'),
  dietType: z
    .enum(['cost-optimized', 'standard', 'as-per-products', 'health-focused'])
    .describe('The type of diet plan to generate.'),
  currencySymbol: z.string().describe('The currency symbol used in the application.'),
});

export type DietChartInput = z.infer<typeof DietChartInputSchema>;

const DietChartOutputSchema = z.object({
  weeklyDietChart: z
    .string()
    .describe('A personalized weekly diet chart in markdown format.'),
});

export type DietChartOutput = z.infer<typeof DietChartOutputSchema>;

export async function generateDietChart(input: DietChartInput): Promise<DietChartOutput> {
  return generateDietChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dietChartPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: DietChartInputSchema},
  output: {schema: DietChartOutputSchema},
  prompt: `You are a nutritionist and financial planner creating a weekly diet chart.
  
  {{#if selectedMemberName}}
  This diet chart is specifically for: **{{{selectedMemberName}}}**.
  {{else}}
  This diet chart is for the entire family.
  {{/if}}
  
  All monetary values are in {{{currencySymbol}}}.

  **Full Family Data (for context):**
  {{#each familyMembers}}
  - Name: {{{name}}}, Age: {{{age}}}, Height: {{{height}}}cm, Weight: {{{weight}}}kg
    Health: {{{healthConditions}}}
    Restrictions: {{{dietaryRestrictions}}}
  {{/each}}

  **Available Products & Inventory:**
  {{#each products}}
  - Product: {{{name}}}, Stock: {{{currentStock}}}{{{unit}}}, Price: {{{currencySymbol}}}{{{price}}}, Consumption: {{#if consumptionRate}}{{{consumptionRate}}}{{{unit}}} per {{{consumptionPeriod}}}{{else}}N/A{{/if}}
  {{/each}}
  
  **Family Financial Overview:**
  - Monthly Saving Goal: {{{currencySymbol}}}{{{savingGoal}}}
  - Planned Income: {{#each plannedIncomes}} {{{description}}}: {{{currencySymbol}}}{{{amount}}}; {{/each}}
  - Actual Income: {{#each actualIncomes}} {{{description}}}: {{{currencySymbol}}}{{{amount}}}; {{/each}}
  - Planned Expenses: {{#each plannedExpenses}} {{{description}}}: {{{currencySymbol}}}{{{amount}}}; {{/each}}
  - Actual Expenses: {{#each actualExpenses}} {{{description}}}: {{{currencySymbol}}}{{{amount}}}; {{/each}}

  **Family Preferences:** {{{preferences}}}
  **Diet Type requested:** {{{dietType}}}

  **Your Task:**
  Generate a detailed and personalized weekly diet chart in markdown format. It should include breakfast, lunch, dinner, and snacks for each day of the week.
  
  - **CRITICAL**: The diet chart must be safe and healthy. 
  
  {{#if selectedMemberName}}
  - **FOCUS**: The diet plan must be strictly tailored for **{{{selectedMemberName}}}**. Pay close attention to their specific health conditions and dietary restrictions listed above. Prioritize these needs above all else. While keeping the meals compatible with the rest of the family is a plus, the primary focus is the selected member's health. Use the full family's data for context on budget and available food.
  {{else}}
  - **FOCUS**: The diet chart should be balanced to consider all family members' health conditions and dietary restrictions. Create a plan that works for everyone.
  {{/if}}

  - Based on the '{{{dietType}}}', adjust the meal suggestions:
    - 'cost-optimized' should prioritize cheaper meals, using the provided product prices and overall family budget to make decisions. Consider the family's saving goal and suggest meals that help them stay on track.
    - 'standard' should be a balanced approach to health and cost.
    - 'as-per-products' should strictly use only the products listed as available in stock. Do not suggest buying anything new.
    - 'health-focused' should prioritize meals that are particularly beneficial for the specified health conditions and dietary restrictions. This is the top priority for this diet type, even if it costs a bit more (but still be reasonable within the family's budget).
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateDietChartFlow = ai.defineFlow(
  {
    name: 'generateDietChartFlow',
    inputSchema: DietChartInputSchema,
    outputSchema: DietChartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
