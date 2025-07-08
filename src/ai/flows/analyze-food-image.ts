'use server';

/**
 * @fileOverview An AI agent that analyzes a food image and identifies the ingredients and nutritional information.
 *
 * - analyzeFoodImage - A function that handles the food image analysis process.
 * - AnalyzeFoodImageInput - The input type for the analyzeFoodImage function.
 * - AnalyzeFoodImageOutput - The return type for the analyzeFoodImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeFoodImageInput = z.infer<typeof AnalyzeFoodImageInputSchema>;

const AnalyzeFoodImageOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of identified ingredients in the meal.'),
  nutritionalInformation: z
    .string()
    .describe('Estimated nutritional information including calories, carbs, proteins, and fats.'),
});
export type AnalyzeFoodImageOutput = z.infer<typeof AnalyzeFoodImageOutputSchema>;

export async function analyzeFoodImage(input: AnalyzeFoodImageInput): Promise<AnalyzeFoodImageOutput> {
  return analyzeFoodImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt',
  input: {schema: AnalyzeFoodImageInputSchema},
  output: {schema: AnalyzeFoodImageOutputSchema},
  prompt: `You are a nutritional expert. Analyze the food in the image and identify the ingredients and estimate the nutritional information.

Use the following as the primary source of information about the food.

Photo: {{media url=photoDataUri}}

Respond using JSON format.
`,
});

const analyzeFoodImageFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: AnalyzeFoodImageInputSchema,
    outputSchema: AnalyzeFoodImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
