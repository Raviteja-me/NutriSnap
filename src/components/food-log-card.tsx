'use client';
import { useState, useRef, type FC, useMemo } from 'react';
import { Camera, Sunrise, Sun, Moon, PlusCircle, Edit } from 'lucide-react';
import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Meal, LoggedItem, DietPlan, FoodAnalysis } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';

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
  const getAverage = (match: RegExpMatchArray | null): number | undefined => {
    if (!match || !match[1]) return undefined;
    
    const parts = match[1].split(/[-–—]/).map(p => parseInt(p.trim(), 10));
    
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return Math.round((parts[0] + parts[1]) / 2);
    }
    
    if (parts.length === 1 && !isNaN(parts[0])) {
      return parts[0];
    }

    return undefined;
  };

  const calories = getAverage(info.match(/calories:?\s*([\d\s-–—]+)/i));
  const protein = getAverage(info.match(/protein:?\s*([\d\s-–—]+)g/i));
  const carbs = getAverage(info.match(/(?:carbohydrates|carbs):?\s*([\d\s-–—]+)g/i));
  const fat = getAverage(info.match(/fat:?\s*([\d\s-–—]+)g/i));
  
  return { calories, protein, carbs, fat };
};

const NutritionBar: FC<{value?: number, goal: number, label: string, unit: string, colorClass: string}> = ({value = 0, goal, label, unit, colorClass}) => (
  <div>
    <div className='flex justify-between items-baseline mb-1'>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{value}{unit} / {goal}{unit}</p>
    </div>
    <Progress value={goal > 0 ? (value / goal) * 100 : 0} className={colorClass + " h-2"} />
  </div>
);

const AddFoodDialog: FC<{mealType: 'breakfast' | 'lunch' | 'dinner', onLogItem: FoodLogCardProps['onLogItem']}> = ({mealType, onLogItem}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setIsOpen(false);
    
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
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the food image.' });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'File Error', description: 'Could not read the selected file.' });
    }
  };

  const handleTextSubmit = async () => {
    if(!textInput) return;
    setIsLoading(true);
    setIsOpen(false);
    
    try {
        const result = await analyzeFoodImage({ photoDataUri: `data:text/plain;base64,${btoa(`Analyze the nutritional content of: ${textInput}`)}` });
        const parsedNutrition = parseNutritionalInfo(result.nutritionalInformation);
        const newItem: LoggedItem = {
          id: Date.now().toString(),
          name: result.dishName,
          analysis: { ...result, ...parsedNutrition },
          loggedAt: new Date().toISOString(),
        };
        onLogItem(mealType, newItem);
        setTextInput('');
    } catch(error) {
        console.error('Error analyzing text input:', error);
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the typed entry.' });
    } finally {
        setIsLoading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Food
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Food Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Button onClick={triggerFileInput} className="w-full" variant="outline"><Camera className="mr-2 h-4 w-4"/>Snap a Photo</Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>
            <div className='space-y-2'>
              <Input 
                placeholder="e.g., 'A bowl of oatmeal with berries'" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
              />
              <Button onClick={handleTextSubmit} className="w-full"><Edit className="mr-2 h-4 w-4" />Log Manually</Button>
            </div>
        </div>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}

export const FoodLogCard: FC<FoodLogCardProps> = ({ mealType, title, meal, onLogItem, plan }) => {
  const [isLoading, setIsLoading] = useState(false);
    
  const mealItems = meal?.items || [];

  const mealTotals = useMemo(() => {
    return (meal?.items || []).reduce((acc, item) => {
        acc.calories += item.analysis?.calories || 0;
        acc.protein += item.analysis?.protein || 0;
        acc.carbs += item.analysis?.carbs || 0;
        acc.fat += item.analysis?.fat || 0;
        return acc;
    }, {calories: 0, protein: 0, carbs: 0, fat: 0});
  }, [meal]);

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
            <AddFoodDialog mealType={mealType} onLogItem={onLogItem} />
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
                    <div className={`space-y-4 ${!item.image && "md:col-span-2"}`}>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Estimated Nutrition</h4>
                        <div className='space-y-3'>
                          <NutritionBar value={item.analysis?.calories} goal={plan.dailyCalorieGoal/3} label="Calories" unit="kcal" colorClass="[&>*]:bg-chart-1" />
                          <NutritionBar value={item.analysis?.carbs} goal={plan.dailyCarbsGoal/3} label="Carbs" unit="g" colorClass="[&>*]:bg-chart-2" />
                          <NutritionBar value={item.analysis?.protein} goal={plan.dailyProteinGoal/3} label="Protein" unit="g" colorClass="[&>*]:bg-chart-3" />
                          <NutritionBar value={item.analysis?.fat} goal={plan.dailyFatGoal/3} label="Fat" unit="g" colorClass="[&>*]:bg-chart-4" />
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
            <p>Click "Add Food" to snap a photo or type in your meal.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
