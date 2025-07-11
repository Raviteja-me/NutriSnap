import type { UserProfile, DietPlan, YogaPlan } from './types';
import { generateWeeklyPlan } from '@/ai/flows/generate-weekly-plan';
import { generateYogaPlan } from '@/ai/flows/generate-yoga-plan';

// Basic Metabolic Rate (BMR) - Mifflin-St Jeor Equation
const calculateBMR = (profile: UserProfile): number => {
  // Using an average for gender as it's not collected.
  return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 78;
};

// Total Daily Energy Expenditure (TDEE)
const calculateTDEE = (bmr: number): number => {
  // Assuming a lightly active lifestyle for simplicity
  return bmr * 1.375;
};

// Translates a weight goal to a more general fitness goal for the yoga plan
const getYogaGoal = (goal: UserProfile['goal']): string => {
    switch(goal) {
        case 'lose': return 'weight loss and flexibility';
        case 'gain': return 'strength building and muscle toning';
        case 'maintain': return 'general wellness and stress relief';
        default: return 'general wellness';
    }
}

/**
 * Generates the initial diet plan containing nutritional goals and a weekly meal plan.
 * The yoga plan is intentionally omitted for faster initial load.
 */
export const generateInitialDietPlan = async (profile: UserProfile, apiKey: string | null): Promise<DietPlan> => {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr);

  let dailyCalorieGoal = Math.round(tdee);

  switch (profile.goal) {
    case 'lose':
      dailyCalorieGoal -= 500;
      break;
    case 'gain':
      dailyCalorieGoal += 300;
      break;
    case 'maintain':
    default:
      break;
  }
  
  const dailyCarbsGoal = Math.round((dailyCalorieGoal * 0.45) / 4);
  const dailyProteinGoal = Math.round((dailyCalorieGoal * 0.30) / 4);
  const dailyFatGoal = Math.round((dailyCalorieGoal * 0.25) / 9);

  const mealPlanResponse = await generateWeeklyPlan({
    goal: profile.goal,
    country: profile.country,
    state: profile.state,
    disorders: profile.disorders || 'None',
    dailyCalorieGoal,
    apiKey: apiKey ?? undefined,
  });

  return {
    dailyCalorieGoal,
    dailyProteinGoal,
    dailyCarbsGoal,
    dailyFatGoal,
    weeklyPlan: mealPlanResponse.weeklyPlan,
    yogaPlan: null, // Explicitly set to null initially
  };
};

/**
 * Generates a yoga plan and adds it to an existing diet plan.
 * This can be called in the background after the initial plan is displayed.
 */
export const addYogaPlanToDietPlan = async (profile: UserProfile, existingPlan: DietPlan, apiKey: string | null): Promise<DietPlan> => {
    const yogaPlanResponse = await generateYogaPlan({
      goal: getYogaGoal(profile.goal),
      experienceLevel: 'beginner', // Assuming beginner for now
      apiKey: apiKey ?? undefined,
    });

    return {
        ...existingPlan,
        yogaPlan: yogaPlanResponse.yogaPlan,
    };
};
