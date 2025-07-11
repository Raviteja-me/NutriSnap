'use client';
import { useMemo, type FC } from 'react';
import type { DailyLog, DietPlan, LoggedItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FoodLogCard } from './food-log-card';
import { Flame, Beef, Wheat, Salad } from 'lucide-react';
import { Progress } from './ui/progress';

interface TodayViewProps {
  log: DailyLog;
  plan: DietPlan;
  onLogItem: (mealType: 'breakfast' | 'lunch' | 'dinner', item: LoggedItem) => void;
}

const DailyProgressCard: FC<{log: DailyLog, plan: DietPlan}> = ({ log, plan }) => {
    const totals = useMemo(() => {
        const allItems = [
            ...(log.meals.breakfast?.items || []),
            ...(log.meals.lunch?.items || []),
            ...(log.meals.dinner?.items || []),
        ];
        return allItems.reduce((acc, item) => {
            acc.calories += item.analysis?.calories || 0;
            acc.protein += item.analysis?.protein || 0;
            acc.carbs += item.analysis?.carbs || 0;
            acc.fat += item.analysis?.fat || 0;
            return acc;
        }, {calories: 0, protein: 0, carbs: 0, fat: 0});
    }, [log]);

    const ProgressItem: FC<{icon: React.ReactNode, label: string, current: number, goal: number, unit: string, colorClass: string}> = ({icon, label, current, goal, unit, colorClass}) => (
      <div className='space-y-1'>
        <div className='flex items-center gap-2 text-sm font-medium'>
            <div className={`text-sm ${colorClass.replace('bg-', 'text-')}`}>{icon}</div>
            <span>{label}</span>
        </div>
        <Progress value={(current/goal)*100} className={'h-2 ' + colorClass} />
        <p className='text-right text-xs text-muted-foreground'>{current} / {goal} {unit}</p>
      </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
                <CardDescription>Your tracked nutrition vs. your daily goals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ProgressItem icon={<Flame />} label="Calories" current={totals.calories} goal={plan.dailyCalorieGoal} unit="kcal" colorClass="[&>*]:bg-chart-1" />
                <ProgressItem icon={<Wheat />} label="Carbs" current={totals.carbs} goal={plan.dailyCarbsGoal} unit="g" colorClass="[&>*]:bg-chart-2" />
                <ProgressItem icon={<Beef />} label="Protein" current={totals.protein} goal={plan.dailyProteinGoal} unit="g" colorClass="[&>*]:bg-chart-3" />
                <ProgressItem icon={<Salad />} label="Fat" current={totals.fat} goal={plan.dailyFatGoal} unit="g" colorClass="[&>*]:bg-chart-4" />
            </CardContent>
        </Card>
    );
}

export const TodayView: FC<TodayViewProps> = ({ log, plan, onLogItem }) => {
    return (
        <div className="space-y-4">
            <DailyProgressCard log={log} plan={plan} />
            <FoodLogCard mealType="breakfast" title="Breakfast" meal={log.meals.breakfast} onLogItem={onLogItem} plan={plan} />
            <FoodLogCard mealType="lunch" title="Lunch" meal={log.meals.lunch} onLogItem={onLogItem} plan={plan} />
            <FoodLogCard mealType="dinner" title="Dinner" meal={log.meals.dinner} onLogItem={onLogItem} plan={plan} />
        </div>
    )
}
