import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-food-image.ts';
import '@/ai/flows/suggest-meal-adjustment.ts';
import '@/ai/flows/generate-weekly-plan.ts';
import '@/ai/flows/generate-yoga-plan.ts';
