'use client';
import type { FC } from 'react';
import { User, Target, BookOpen } from 'lucide-react';
import type { UserProfile, DietPlan, DailyLog, Meal } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FoodLogCard } from './food-log-card';
import { PlanView } from './plan-view';

interface DashboardProps {
  profile: UserProfile;
  plan: DietPlan;
  log: DailyLog;
  onLogMeal: (meal: Meal) => void;
}

export const Dashboard: FC<DashboardProps> = ({ profile, plan, log, onLogMeal }) => {
  return (
    <div className="w-full h-full flex flex-col bg-card animate-fade-in">
      <header className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold font-headline">Hello, {profile.name}!</h1>
            <p className="text-sm text-muted-foreground capitalize">Goal: {profile.goal} Weight</p>
          </div>
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <User className="w-6 h-6" />
          </div>
        </div>
      </header>
      
      <Tabs defaultValue="today" className="flex-grow flex flex-col">
        <TabsList className="m-4">
          <TabsTrigger value="today" className="gap-2"><Target className="w-4 h-4" />Today's Log</TabsTrigger>
          <TabsTrigger value="plan" className="gap-2"><BookOpen className="w-4 h-4" />My Plan</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-grow">
          <TabsContent value="today" className="mt-0 p-4 space-y-4">
              <FoodLogCard mealType="breakfast" title="Breakfast" loggedMeal={log.meals.breakfast} onLogMeal={onLogMeal} />
              <FoodLogCard mealType="lunch" title="Lunch" loggedMeal={log.meals.lunch} onLogMeal={onLogMeal} />
              <FoodLogCard mealType="dinner" title="Dinner" loggedMeal={log.meals.dinner} onLogMeal={onLogMeal} />
          </TabsContent>
          <TabsContent value="plan" className="mt-0 p-4">
            <PlanView plan={plan} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
