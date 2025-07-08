'use client';
import { useState, useRef, type FC } from 'react';
import { Camera, Sunrise, Sun, Moon, Zap, RotateCw } from 'lucide-react';
import { analyzeFoodImage } from '@/ai/flows/analyze-food-image';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Meal, FoodAnalysis } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

interface FoodLogCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  loggedMeal?: Meal;
  onLogMeal: (meal: Meal) => void;
}

const mealIcons = {
  breakfast: <Sunrise className="w-6 h-6" />,
  lunch: <Sun className="w-6 h-6" />,
  dinner: <Moon className="w-6 h-6" />,
};

const parseNutritionalInfo = (info: string): Omit<FoodAnalysis, 'ingredients' | 'nutritionalInformation'> => {
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

export const FoodLogCard: FC<FoodLogCardProps> = ({ mealType, title, loggedMeal, onLogMeal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        
        const newMeal: Meal = {
          id: mealType,
          name: title,
          image: photoDataUri,
          analysis: { ...result, ...parsedNutrition },
          loggedAt: new Date().toISOString(),
        };
        onLogMeal(newMeal);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className='flex items-center gap-3'>
                <div className="p-2 rounded-full bg-primary/10 text-primary">{mealIcons[mealType]}</div>
                <CardTitle>{title}</CardTitle>
            </div>
            {!loggedMeal && !isLoading && (
              <Button variant="ghost" size="sm" onClick={triggerFileInput}>
                <Camera className="mr-2 h-4 w-4" /> Log Meal
              </Button>
            )}
            {loggedMeal && (
              <Button variant="ghost" size="sm" onClick={triggerFileInput}>
                <RotateCw className="mr-2 h-4 w-4" /> Re-log
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
        {!isLoading && loggedMeal?.analysis && (
          <div className="grid md:grid-cols-2 gap-4 items-start">
            {loggedMeal.image && <img data-ai-hint="meal food" src={loggedMeal.image} alt={title} className="rounded-lg w-full h-auto object-cover" />}
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Estimated Nutrition</h4>
                <p className="text-sm text-muted-foreground">{loggedMeal.analysis.nutritionalInformation}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Identified Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {loggedMeal.analysis.ingredients.map(ing => <Badge variant="secondary" key={ing}>{ing}</Badge>)}
                </div>
              </div>
            </div>
          </div>
        )}
        {!isLoading && !loggedMeal && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p>Click "Log Meal" to snap a photo of your food.</p>
          </div>
        )}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
      </CardContent>
    </Card>
  );
};
