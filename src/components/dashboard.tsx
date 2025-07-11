'use client';
import type { FC } from 'react';
import { User, Target, BookOpen, LogOut } from 'lucide-react';
import type { UserProfile, DietPlan, DailyLog, LoggedItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FoodLogCard } from './food-log-card';
import { PlanView } from './plan-view';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

interface DashboardProps {
  profile: UserProfile;
  plan: DietPlan;
  log: DailyLog;
  onLogItem: (mealType: 'breakfast' | 'lunch' | 'dinner', item: LoggedItem) => void;
  onLogout: () => void;
}

export const Dashboard: FC<DashboardProps> = ({ profile, plan, log, onLogItem, onLogout }) => {
  return (
    <div className="w-full h-full flex flex-col bg-card animate-fade-in">
      <header className="p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold font-headline">Hello, {profile.name}!</h1>
            <p className="text-sm text-muted-foreground capitalize">Goal: {profile.goal} Weight</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2 rounded-full bg-primary/10 text-primary h-auto">
                <User className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <Tabs defaultValue="today" className="flex-grow flex flex-col min-h-0">
        <TabsList className="m-4 flex-shrink-0">
          <TabsTrigger value="today" className="gap-2"><Target className="w-4 h-4" />Today's Log</TabsTrigger>
          <TabsTrigger value="plan" className="gap-2"><BookOpen className="w-4 h-4" />My Plan</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="flex-grow mt-0 overflow-y-auto">
            <div className='space-y-4 p-4 pt-0'>
              <FoodLogCard mealType="breakfast" title="Breakfast" meal={log.meals.breakfast} onLogItem={onLogItem} plan={plan} />
              <FoodLogCard mealType="lunch" title="Lunch" meal={log.meals.lunch} onLogItem={onLogItem} plan={plan} />
              <FoodLogCard mealType="dinner" title="Dinner" meal={log.meals.dinner} onLogItem={onLogItem} plan={plan} />
            </div>
        </TabsContent>
        <TabsContent value="plan" className="flex-grow mt-0 overflow-y-auto">
            <div className="p-4 pt-0">
              <PlanView plan={plan} />
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
