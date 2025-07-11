'use server';

/**
 * @fileOverview An AI agent that generates a weekly meal plan based on user profile and goals.
 *
 * - generateWeeklyPlan - A function that creates a 7-day meal plan.
 * - GenerateWeeklyPlanInput - The input type for the generateWeeklyPlan function.
 * - GenerateWeeklyPlanOutput - The return type for the generateWeeklyPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateWeeklyPlanInputSchema = z.object({
    goal: z.string().describe("The user's primary goal (e.g., lose, maintain, gain)."),
    country: z.string().describe("The user's country for localizing meal suggestions."),
    state: z.string().describe("The user's state or region for localizing meal suggestions."),
    disorders: z.string().optional().describe("Any health conditions or dietary restrictions."),
    dailyCalorieGoal: z.number().describe("The user's target daily calorie intake."),
    apiKey: z.string().optional().describe('Optional Google AI API key.'),
});
export type GenerateWeeklyPlanInput = z.infer<typeof GenerateWeeklyPlanInputSchema>;

const MealPlanSchema = z.object({
    breakfast: z.string().describe('Suggestion for the breakfast meal.'),
    lunch: z.string().describe('Suggestion for the lunch meal.'),
    dinner: z.string().describe('Suggestion for the dinner meal.'),
});

const GenerateWeeklyPlanOutputSchema = z.object({
  weeklyPlan: z.array(z.object({
    day: z.string().describe('The day of the week (e.g., Monday).'),
    meals: MealPlanSchema,
  })).length(7).describe('A 7-day meal plan.'),
});
export type GenerateWeeklyPlanOutput = z.infer<typeof GenerateWeeklyPlanOutputSchema>;


export async function generateWeeklyPlan(input: GenerateWeeklyPlanInput): Promise<GenerateWeeklyPlanOutput> {
  return generateWeeklyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyPlanPrompt',
  input: { schema: GenerateWeeklyPlanInputSchema },
  output: { schema: GenerateWeeklyPlanOutputSchema },
  prompt: `You are a world-class nutritionist. Generate a 7-day meal plan for a user with the following profile.
The meal plan should be tailored to their location and consist of common, locally available foods.
The meals should be simple, healthy, and help the user achieve their daily calorie target.
Ensure the response is a valid JSON object.

User Profile:
- Goal: {{{goal}}}
- Location: {{{state}}}, {{{country}}}
- Health Conditions: {{{disorders}}}
- Daily Calorie Target: ~{{{dailyCalorieGoal}}} kcal

Generate a diverse and balanced 7-day meal plan.
`,
});

const generateWeeklyPlanFlow = ai.defineFlow(
  {
    name: 'generateWeeklyPlanFlow',
    inputSchema: GenerateWeeklyPlanInputSchema,
    outputSchema: GenerateWeeklyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input, {
        apiKey: input.apiKey,
      });
    return output!;
  }
);
