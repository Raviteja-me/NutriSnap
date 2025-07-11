'use server';

/**
 * @fileOverview An AI agent that generates a weekly yoga and meditation plan.
 *
 * - generateYogaPlan - A function that creates a 7-day yoga and meditation plan.
 * - GenerateYogaPlanInput - The input type for the generateYogaPlan function.
 * - GenerateYogaPlanOutput - The return type for the generateYogaPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateYogaPlanInputSchema = z.object({
    goal: z.string().describe("The user's primary goal (e.g., lose weight, increase flexibility, reduce stress)."),
    experienceLevel: z.string().describe("The user's experience level with yoga (e.g., beginner, intermediate, advanced)."),
    apiKey: z.string().optional().describe('Optional Google AI API key.'),
});
export type GenerateYogaPlanInput = z.infer<typeof GenerateYogaPlanInputSchema>;

const YogaDayPlanSchema = z.object({
    day: z.string().describe("The day of the week (e.g., Monday)."),
    focus: z.string().describe("The focus for the day's practice (e.g., Core Strength, Flexibility)."),
    asanas: z.array(z.object({
        name: z.string().describe("The name of the yoga pose."),
        duration: z.string().describe("How long to hold the pose or how many reps."),
    })).describe("A list of yoga poses (asanas) for the day."),
    meditation: z.object({
        type: z.string().describe("The type of meditation to practice (e.g., Mindfulness, Breath Awareness)."),
        duration: z.string().describe("The duration of the meditation session (e.g., '10 minutes')."),
    }).describe("The meditation practice for the day."),
});

const GenerateYogaPlanOutputSchema = z.object({
  yogaPlan: z.array(YogaDayPlanSchema).length(7).describe('A 7-day yoga and meditation plan.'),
});
export type GenerateYogaPlanOutput = z.infer<typeof GenerateYogaPlanOutputSchema>;

export async function generateYogaPlan(input: GenerateYogaPlanInput): Promise<GenerateYogaPlanOutput> {
  return generateYogaPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateYogaPlanPrompt',
  input: { schema: GenerateYogaPlanInputSchema },
  output: { schema: GenerateYogaPlanOutputSchema },
  prompt: `You are an expert yoga and meditation instructor. Create a personalized 7-day plan for a user with the following profile.
The plan should be well-structured, with a clear daily focus, a sequence of asanas, and a short meditation practice.

User Profile:
- Goal: {{{goal}}}
- Experience Level: {{{experienceLevel}}}

Generate a diverse and balanced 7-day plan. Ensure the asana durations are appropriate for the experience level.
`,
});

const generateYogaPlanFlow = ai.defineFlow(
  {
    name: 'generateYogaPlanFlow',
    inputSchema: GenerateYogaPlanInputSchema,
    outputSchema: GenerateYogaPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input, {
        apiKey: input.apiKey,
      });
    return output!;
  }
);
