'use client';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/splash-screen';
import { ProfileSetup } from '@/components/profile-setup';
import { Dashboard } from '@/components/dashboard';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { UserProfile, DietPlan, DailyLog, LoggedItem } from '@/lib/types';
import { generateInitialDietPlan, addYogaPlanToDietPlan } from '@/lib/plan-generator';
import { useToast } from '@/hooks/use-toast';

type AppStatus = 'loading' | 'needs_profile' | 'generating_plan' | 'ready';

const Home: FC = () => {
  const [status, setStatus] = useState<AppStatus>('loading');
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('nutrisnap-user-profile', null);
  const [plan, setPlan] = useLocalStorage<DietPlan | null>('nutrisnap-diet-plan', null);
  const [log, setLog] = useLocalStorage<Record<string, DailyLog>>('nutrisnap-food-log', {});
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile && plan) {
        setStatus('ready');
        // Check if yoga plan needs to be generated
        if (profile && plan && !plan.yogaPlan) {
          addYogaPlanToDietPlan(profile, plan).then(newPlan => {
            setPlan(newPlan);
          }).catch(error => {
            console.error("Failed to add yoga plan:", error);
            // Non-critical error, no need to toast, but we can log it.
          });
        }
      } else {
        setStatus('needs_profile');
      }
    }, 1500); // Splash screen duration

    return () => clearTimeout(timer);
  }, []); // Run only once on initial load


  const handleProfileSave = async (data: UserProfile) => {
    setProfile(data);
    setStatus('generating_plan');
    try {
      // Step 1: Generate the initial plan with meals and nutrition goals.
      const initialPlan = await generateInitialDietPlan(data);
      setPlan(initialPlan);
      setStatus('ready'); // Go to dashboard immediately

      // Step 2: Generate and add the yoga plan in the background.
      const finalPlan = await addYogaPlanToDietPlan(data, initialPlan);
      setPlan(finalPlan); // Update the plan with yoga data.

    } catch (error) {
        console.error("Failed to generate diet plan:", error);
        toast({
            variant: 'destructive',
            title: 'Plan Generation Failed',
            description: 'Could not create your personalized diet plan. Please try again.',
        });
        // Reset to profile setup if plan generation fails
        setProfile(null);
        setPlan(null);
        setStatus('needs_profile');
    }
  };

  const handleLogout = () => {
    setProfile(null);
    setPlan(null);
    setLog({});
    setStatus('needs_profile');
  };

  const handleLogItem = (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', item: LoggedItem) => {
    const dayLog = log[date] || { date, meals: { breakfast: { items: [] }, lunch: { items: [] }, dinner: { items: [] } } };
    
    const updatedMeals = {
        ...dayLog.meals,
        [mealType]: {
            items: [...(dayLog.meals[mealType]?.items || []), item],
        }
    };

    const updatedLog = {
        ...log,
        [date]: {
            ...dayLog,
            meals: updatedMeals
        }
    };
    setLog(updatedLog);
  };

  const getMainComponent = () => {
    switch (status) {
      case 'loading':
      case 'generating_plan':
        return <SplashScreen isGeneratingPlan={status === 'generating_plan'} />;
      case 'needs_profile':
        return <ProfileSetup onSave={handleProfileSave} />;
      case 'ready':
        if (profile && plan) {
          return <Dashboard profile={profile} plan={plan} log={log} onLogItem={handleLogItem} onLogout={handleLogout} />;
        }
        // If profile/plan is missing, reset
        setProfile(null);
        setPlan(null);
        setStatus('needs_profile');
        return <ProfileSetup onSave={handleProfileSave} />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mx-auto bg-card shadow-lg rounded-2xl overflow-hidden h-[85vh] max-h-[900px]">
        {getMainComponent()}
      </div>
    </main>
  );
};

export default Home;
