import type { UserProfile, DietPlan } from './types';

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

export const generateDietPlan = (profile: UserProfile): DietPlan => {
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

  const weeklyPlan = [
    { day: 'Monday', meals: { breakfast: 'Oatmeal with berries', lunch: 'Grilled chicken salad', dinner: 'Salmon with quinoa & asparagus' }},
    { day: 'Tuesday', meals: { breakfast: 'Greek yogurt with nuts', lunch: 'Lentil soup', dinner: 'Turkey meatballs with zucchini noodles' }},
    { day: 'Wednesday', meals: { breakfast: 'Scrambled eggs with spinach', lunch: 'Leftover turkey meatballs', dinner: 'Beef stir-fry with brown rice' }},
    { day: 'Thursday', meals: { breakfast: 'Protein smoothie', lunch: 'Tuna salad on whole wheat', dinner: 'Chicken & vegetable skewers' }},
    { day: 'Friday', meals: { breakfast: 'Oatmeal with berries', lunch: 'Leftover beef stir-fry', dinner: 'Lean topping pizza on whole wheat' }},
    { day: 'Saturday', meals: { breakfast: 'Whole grain pancakes', lunch: 'Quinoa bowl with black beans', dinner: 'Grilled steak with sweet potato' }},
    { day: 'Sunday', meals: { breakfast: 'Scrambled eggs with spinach', lunch: 'Leftover steak', dinner: 'Roast chicken with vegetables' }},
  ];


  return {
    dailyCalorieGoal,
    dailyProteinGoal,
    dailyCarbsGoal,
    dailyFatGoal,
    weeklyPlan,
  };
};
