import type { FC } from 'react';
import type { DietPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { CheckCircle2,Flame, Beef, Wheat, Salad } from 'lucide-react';

interface PlanViewProps {
  plan: DietPlan;
}

const StatCard: FC<{icon: React.ReactNode, value: string, label: string, color: string}> = ({icon, value, label, color}) => (
    <div className={`p-4 bg-card border-l-4 ${color} rounded-lg flex items-center gap-4`}>
        <div className="text-foreground/80">{icon}</div>
        <div>
            <p className="font-bold text-lg text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
)

export const PlanView: FC<PlanViewProps> = ({ plan }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Goals</CardTitle>
          <CardDescription>Your personalized daily nutritional targets.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <StatCard icon={<Flame className="w-8 h-8"/>} value={`${plan.dailyCalorieGoal}`} label="Calories" color="border-chart-1" />
            <StatCard icon={<Beef className="w-8 h-8"/>} value={`${plan.dailyProteinGoal}g`} label="Protein" color="border-chart-3" />
            <StatCard icon={<Wheat className="w-8 h-8"/>} value={`${plan.dailyCarbsGoal}g`} label="Carbs" color="border-chart-2" />
            <StatCard icon={<Salad className="w-8 h-8"/>} value={`${plan.dailyFatGoal}g`} label="Fat" color="border-chart-4" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Meal Suggestions</CardTitle>
          <CardDescription>A sample plan with local foods to help you get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="Monday">
            {plan.weeklyPlan.map((dayPlan) => (
              <AccordionItem value={dayPlan.day} key={dayPlan.day}>
                <AccordionTrigger>{dayPlan.day}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 text-sm text-muted-foreground pl-1">
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" /><div><strong>Breakfast:</strong> {dayPlan.meals.breakfast}</div></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" /><div><strong>Lunch:</strong> {dayPlan.meals.lunch}</div></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" /><div><strong>Dinner:</strong> {dayPlan.meals.dinner}</div></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
