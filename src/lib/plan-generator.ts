import type { UserProfile, DietPlan } from './types';
import { generateWeeklyPlan } from '@/ai/flows/generate-weekly-plan';

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

export const generateDietPlan = async (profile: UserProfile): Promise<DietPlan> => {
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

  // Call the AI flow to generate a location-aware weekly plan
  const planResponse = await generateWeeklyPlan({
    goal: profile.goal,
    country: profile.country,
    state: profile.state,
    disorders: profile.disorders || 'None',
    dailyCalorieGoal,
  });

  return {
    dailyCalorieGoal,
    dailyProteinGoal,
    dailyCarbsGoal,
    dailyFatGoal,
    weeklyPlan: planResponse.weeklyPlan,
  };
};
