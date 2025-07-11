export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  country: string;
  state: string;
  disorders?: string;
  goal: 'lose' | 'maintain' | 'gain';
}

export interface FoodAnalysis {
  dishName: string;
  ingredients: string[];
  nutritionalInformation: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface LoggedItem {
  id: string; // a unique id, e.g. timestamp
  name: string;
  image?: string;
  analysis?: FoodAnalysis;
  loggedAt: string;
}

export interface Meal {
  items: LoggedItem[];
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
}

export interface YogaPlan {
    day: string;
    focus: string;
    asanas: {
        name: string;
        duration: string;
    }[];
    meditation: {
        type: string;
        duration: string;
    }
}

export interface DietPlan {
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
  weeklyPlan: {
    day: string;
    meals: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
  }[];
  yogaPlan: YogaPlan[] | null;
}
