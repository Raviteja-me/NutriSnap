import type { FC } from 'react';
import type { DietPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface PlanViewProps {
  plan: DietPlan;
}

export const PlanView: FC<PlanViewProps> = ({ plan }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Daily Goals</CardTitle>
          <CardDescription>Your personalized daily nutritional targets.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-2 bg-primary/10 rounded-lg">
            <p className="font-bold text-lg text-primary">{plan.dailyCalorieGoal}</p>
            <p className="text-xs text-muted-foreground">Calories</p>
          </div>
          <div className="p-2 bg-secondary rounded-lg">
            <p className="font-bold text-lg">{plan.dailyCarbsGoal}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="p-2 bg-secondary rounded-lg">
            <p className="font-bold text-lg">{plan.dailyProteinGoal}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="p-2 bg-secondary rounded-lg">
            <p className="font-bold text-lg">{plan.dailyFatGoal}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Meal Suggestions</CardTitle>
          <CardDescription>A sample plan to help you get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="Monday">
            {plan.weeklyPlan.map((dayPlan) => (
              <AccordionItem value={dayPlan.day} key={dayPlan.day}>
                <AccordionTrigger>{dayPlan.day}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    <li><strong>Breakfast:</strong> {dayPlan.meals.breakfast}</li>
                    <li><strong>Lunch:</strong> {dayPlan.meals.lunch}</li>
                    <li><strong>Dinner:</strong> {dayPlan.meals.dinner}</li>
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
