
'use server';

/**
 * @fileOverview Generates a personalized weekly diet chart and shopping list based on family health data and product needs.
 *
 * - generateDietChart - A function that generates the diet chart and shopping list.
 * - DietChartInput - The input type for the generateDietChart function.
 * - DietChartOutput - The return type for the generateDietChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthDataSchema = z.object({
  memberId: z.string().describe('Unique identifier for the family member.'),
  name: z.string().describe("Name of the family member."),
  age: z.number().describe('Age of the family member.'),
  healthConditions: z
    .string()
    .describe('Any specific health conditions of the member.'),
  dietaryRestrictions: z
    .string()
    .describe('Any dietary restrictions of the member (e.g., allergies).'),
});

const ProductSchema = z.object({
  name: z.string().describe('Name of the product.'),
  quantity: z.number().describe('Last purchased quantity of the product.'),
  currentStock: z.number().describe('Current available stock of the product.'),
  unit: z.string().describe('Unit of measurement (e.g., kg, l, piece).'),
  price: z.number().describe('Price of the product.'),
  consumptionRate: z.number().optional().describe('The consumption rate of the product.'),
  consumptionPeriod: z.enum(['daily', 'weekly', 'half-monthly', 'monthly']).optional().describe('The consumption period of the product.'),
});

const DietChartInputSchema = z.object({
  familyHealthData: z
    .array(HealthDataSchema)
    .describe('Health data for each family member.'),
  products: z
    .array(ProductSchema)
    .describe('List of available products, including stock levels, prices, and consumption patterns.'),
  preferences: z.string().describe('Dietary Preferences'),
  dietType: z
    .enum(['cost-optimized', 'standard', 'as-per-products'])
    .describe('The type of diet plan to generate.'),
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
  input: {schema: DietChartInputSchema},
  output: {schema: DietChartOutputSchema},
  prompt: `You are a nutritionist creating a weekly diet chart for a family.

  Consider the following health data for each family member:
  {{#each familyHealthData}}
  - Name: {{{name}}}, Age: {{{age}}}, Health Conditions: {{{healthConditions}}}, Dietary Restrictions: {{{dietaryRestrictions}}}
  {{/each}}

  Here is the list of available products, their stock, and prices:
  {{#each products}}
  - Product: {{{name}}}, Stock: {{{currentStock}}}{{{unit}}}, Price: {{{price}}}, Consumption: {{#if consumptionRate}}{{{consumptionRate}}}{{{unit}}} per {{{consumptionPeriod}}}{{else}}N/A{{/if}}
  {{/each}}

  Dietary Preferences: {{{preferences}}}
  Diet Type: {{{dietType}}}

  Generate a detailed and personalized weekly diet chart in markdown format. It should include breakfast, lunch, dinner, and snacks for each day of the week.
  - The diet chart must take into account each family member's dietary restrictions and name.
  - The diet chart should utilize the available products and align with the specified product needs.
  - Optimize the diet to be as healthy as possible.
  - Based on the '{{{dietType}}}', adjust the meal suggestions.
    - 'cost-optimized' should prioritize cheaper meals, using the provided product prices to make decisions.
    - 'standard' should be a balanced approach to health and cost.
    - 'as-per-products' should strictly use only the products listed as available in stock.
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
