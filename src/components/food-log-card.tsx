'use client';
import { useState, useRef, type FC, useMemo } from 'react';
import { Camera, Sunrise, Sun, Moon, PlusCircle } from 'lucide-react';
import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Meal, LoggedItem, DietPlan, FoodAnalysis } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Progress } from './ui/progress';

interface FoodLogCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  meal: Meal;
  onLogItem: (mealType: 'breakfast' | 'lunch' | 'dinner', item: LoggedItem) => void;
  plan: DietPlan;
}

const mealIcons = {
  breakfast: <Sunrise className="w-6 h-6" />,
  lunch: <Sun className="w-6 h-6" />,
  dinner: <Moon className="w-6 h-6" />,
};

const parseNutritionalInfo = (info: string): Omit<FoodAnalysis, 'ingredients' | 'nutritionalInformation' | 'dishName'> => {
  const calories = info.match(/(\d+)\s*calories/i);
  const protein = info.match(/(\d+)\s*g protein/i);
  const carbs = info.match(/(\d+)\s*g carbs/i);
  const fat = info.match(/(\d+)\s*g fat/i);
  return {
    calories: calories ? parseInt(calories[1], 10) : undefined,
    protein: protein ? parseInt(protein[1], 10) : undefined,
    carbs: carbs ? parseInt(carbs[1], 10) : undefined,
    fat: fat ? parseInt(fat[1], 10) : undefined,
  };
};

const NutritionBar: FC<{value?: number, goal: number, label: string, unit: string, colorClass: string}> = ({value = 0, goal, label, unit, colorClass}) => (
  <div>
    <div className='flex justify-between items-baseline mb-1'>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{value}{unit} / {goal}{unit}</p>
    </div>
    <Progress value={(value / goal) * 100} className={colorClass} />
  </div>
);

export const FoodLogCard: FC<FoodLogCardProps> = ({ mealType, title, meal, onLogItem, plan }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const mealItems = meal?.items || [];

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const photoDataUri = reader.result as string;
        const result = await analyzeFoodImage({ photoDataUri });
        const parsedNutrition = parseNutritionalInfo(result.nutritionalInformation);
        
        const newItem: LoggedItem = {
          id: Date.now().toString(),
          name: result.dishName,
          image: photoDataUri,
          analysis: { ...result, ...parsedNutrition },
          loggedAt: new Date().toISOString(),
        };
        onLogItem(mealType, newItem);

      } catch (error) {
        console.error('Error analyzing food image:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not analyze the food image. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setIsLoading(false);
        toast({
            variant: 'destructive',
            title: 'File Error',
            description: 'Could not read the selected file.',
        });
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const mealTotals = useMemo(() => {
    return mealItems.reduce((acc, item) => {
        acc.calories += item.analysis?.calories || 0;
        acc.protein += item.analysis?.protein || 0;
        acc.carbs += item.analysis?.carbs || 0;
        acc.fat += item.analysis?.fat || 0;
        return acc;
    }, {calories: 0, protein: 0, carbs: 0, fat: 0});
  }, [mealItems]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className='flex items-center gap-3'>
                <div className="p-2 rounded-full bg-primary/10 text-primary">{mealIcons[mealType]}</div>
                <div>
                  <CardTitle>{title}</CardTitle>
                  {mealItems.length > 0 && <CardDescription>{mealTotals.calories} kcal total</CardDescription>}
                </div>
            </div>
            {!isLoading && (
              <Button variant="ghost" size="sm" onClick={triggerFileInput}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Food
              </Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        )}
        {!isLoading && mealItems.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            {mealItems.map((item) => (
              <AccordionItem value={item.id} key={item.id}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4">
                    <span className='truncate pr-2'>{item.name}</span>
                    <span className="text-sm text-muted-foreground flex-shrink-0">{item.analysis?.calories || 0} kcal</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid md:grid-cols-2 gap-6 items-start pt-2">
                    {item.image && <img data-ai-hint="meal food" src={item.image} alt={item.name} className="rounded-lg w-full h-auto object-cover" />}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Estimated Nutrition</h4>
                        <div className='space-y-3'>
                          <NutritionBar value={item.analysis?.calories} goal={plan.dailyCalorieGoal} label="Calories" unit="kcal" colorClass="[&>*]:bg-chart-1" />
                          <NutritionBar value={item.analysis?.carbs} goal={plan.dailyCarbsGoal} label="Carbs" unit="g" colorClass="[&>*]:bg-chart-2" />
                          <NutritionBar value={item.analysis?.protein} goal={plan.dailyProteinGoal} label="Protein" unit="g" colorClass="[&>*]:bg-chart-3" />
                          <NutritionBar value={item.analysis?.fat} goal={plan.dailyFatGoal} label="Fat" unit="g" colorClass="[&>*]:bg-chart-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Identified Ingredients</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.analysis?.ingredients.map(ing => <Badge variant="secondary" key={ing}>{ing}</Badge>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {!isLoading && mealItems.length === 0 && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p>Click "Add Food" to snap a photo of your meal.</p>
          </div>
        )}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
      </CardContent>
    </Card>
  );
};
