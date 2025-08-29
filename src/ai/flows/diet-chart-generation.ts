'use server';

/**
 * @fileOverview Generates a personalized weekly diet chart based on family health data and product needs.
 *
 * - generateDietChart - A function that generates the diet chart.
 * - DietChartInput - The input type for the generateDietChart function.
 * - DietChartOutput - The return type for the generateDietChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthDataSchema = z.object({
  memberId: z.string().describe('Unique identifier for the family member.'),
  age: z.number().describe('Age of the family member.'),
  healthConditions: z
    .string()
    .describe('Any specific health conditions of the member.'),
  dietaryRestrictions: z
    .string()
    .describe('Any dietary restrictions of the member (e.g., allergies).'),
});

const ProductNeedSchema = z.object({
  productName: z.string().describe('Name of the product (e.g., rice).'),
  quantity: z.number().describe('Quantity of the product needed (e.g., 25).'),
  unit: z.string().describe('Unit of measurement (e.g., kg).'),
});

const DietChartInputSchema = z.object({
  familyHealthData: z
    .array(HealthDataSchema)
    .describe('Health data for each family member.'),
  monthlyProductNeeds: z
    .array(ProductNeedSchema)
    .describe('List of monthly product needs.'),
  preferences: z.string().describe('Dietary Preferences'),
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
  - Member ID: {{{memberId}}}, Age: {{{age}}}, Health Conditions: {{{healthConditions}}}, Dietary Restrictions: {{{dietaryRestrictions}}}
  {{/each}}

  Also, consider the following monthly product needs:
  {{#each monthlyProductNeeds}}
  - Product: {{{productName}}}, Quantity: {{{quantity}}}, Unit: {{{unit}}}
  {{/each}}

  Dietary Preferences: {{{preferences}}}

  Generate a detailed and personalized weekly diet chart in markdown format, suggesting healthy food items.
  The diet chart should include breakfast, lunch, dinner and snacks for each day of the week.
  Each family member has different dietary restrictions which you must take into account.
  The diet chart should use only the monthly products available, as specified above. Therefore, it should align with the product needs.
  Optimize the diet to be as healthy as possible given the products available and family preferences.
  `,config: {
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
