
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

const ProductNeedSchema = z.object({
  productName: z.string().describe('Name of the product (e.g., rice).'),
  quantity: z.number().describe('Quantity of the product available (e.g., 25).'),
  unit: z.string().describe('Unit of measurement (e.g., kg).'),
  consumptionRate: z.number().optional().describe('The consumption rate of the product.'),
  consumptionPeriod: z.enum(['daily', 'weekly', 'half-monthly', 'monthly']).optional().describe('The consumption period of the product.'),
});

const ShoppingListInputSchema = z.object({
  familyDietaryPreferences: z
    .string()
    .describe('A summary of dietary preferences and restrictions for all family members.'),
  productNeeds: z
    .array(ProductNeedSchema)
    .describe('List of product needs, including consumption patterns.'),
  shoppingListPeriod: z
    .enum(['daily', 'weekly', 'half-monthly', 'monthly'])
    .describe('The desired period for the shopping list.'),
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
  input: {schema: ShoppingListInputSchema},
  output: {schema: ShoppingListOutputSchema},
  prompt: `You are a financial planner creating a shopping list for a family.

  Consider the family's dietary preferences: {{{familyDietaryPreferences}}}

  Also, consider the following product needs and consumption patterns:
  {{#each productNeeds}}
  - Product: {{{productName}}}, Available: {{{quantity}}}{{{unit}}}, Consumption: {{#if consumptionRate}}{{{consumptionRate}}}{{{unit}}} per {{{consumptionPeriod}}}{{else}}N/A{{/if}}
  {{/each}}

  Generate a shopping list in markdown format for the '{{{shoppingListPeriod}}}' period.
  - The list should be based on the family's preferences and the product consumption needs provided.
  - Calculate the items and quantities needed for the specified period to supplement the available products.
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
