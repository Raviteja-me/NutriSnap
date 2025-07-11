import type { FC } from 'react';
import type { DietPlan, UserProfile, YogaPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { CheckCircle2, Flame, Beef, Wheat, Salad, Dumbbell, BrainCircuit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';


interface PlanViewProps {
  plan: DietPlan;
  profile: UserProfile;
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

const YogaPlanView: FC<{plan: {yogaPlan: YogaPlan[]}}> = ({plan}) => (
    <Accordion type="single" collapsible defaultValue="Monday">
        {plan.yogaPlan.map((dayPlan) => (
            <AccordionItem value={dayPlan.day} key={dayPlan.day}>
            <AccordionTrigger>
                <div className='flex items-center gap-2'>
                    <span className="font-semibold">{dayPlan.day}:</span>
                    <span className="text-muted-foreground">{dayPlan.focus}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-primary" /> Asanas</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground pl-6 list-disc">
                            {dayPlan.asanas.map(asana => (
                                <li key={asana.name}><strong>{asana.name}:</strong> {asana.duration}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-primary" /> Meditation</h4>
                        <div className="text-sm text-muted-foreground pl-6">
                            <p><strong>{dayPlan.meditation.type}:</strong> {dayPlan.meditation.duration}</p>
                        </div>
                    </div>
                </div>
            </AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
);


const MealPlanView: FC<{plan: DietPlan}> = ({plan}) => (
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
);


export const PlanView: FC<PlanViewProps> = ({ plan, profile }) => {
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
          <CardTitle>Weekly Planner</CardTitle>
          <CardDescription>Your food and wellness schedule for the week.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="food">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="food"><Salad className="w-4 h-4 mr-2"/>Food Plan</TabsTrigger>
                    <TabsTrigger value="yoga"><Dumbbell className="w-4 h-4 mr-2"/>Yoga Plan</TabsTrigger>
                </TabsList>
                <TabsContent value="food">
                    <MealPlanView plan={plan} />
                </TabsContent>
                <TabsContent value="yoga">
                    {plan.yogaPlan && plan.yogaPlan.yogaPlan ? (
                        <YogaPlanView plan={plan.yogaPlan} />
                    ) : (
                        <div className="space-y-4">
                          <div className='flex items-center justify-between'>
                            <Skeleton className='h-8 w-1/3' />
                            <Skeleton className='h-4 w-4' />
                          </div>
                           <div className='flex items-center justify-between'>
                            <Skeleton className='h-8 w-1/3' />
                            <Skeleton className='h-4 w-4' />
                          </div>
                           <div className='flex items-center justify-between'>
                            <Skeleton className='h-8 w-1/3' />
                            <Skeleton className='h-4 w-4' />
                          </div>
                          <p className='text-center text-sm text-muted-foreground animate-pulse pt-4'>Your yoga plan is being generated...</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
