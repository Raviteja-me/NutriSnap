'use client';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/splash-screen';
import { ProfileSetup } from '@/components/profile-setup';
import { Dashboard } from '@/components/dashboard';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { UserProfile, DietPlan, DailyLog, LoggedItem } from '@/lib/types';
import { generateDietPlan } from '@/lib/plan-generator';

type AppStatus = 'loading' | 'needs_profile' | 'ready';

const Home: FC = () => {
  const [status, setStatus] = useState<AppStatus>('loading');
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('nutrisnap-user-profile', null);
  const [plan, setPlan] = useLocalStorage<DietPlan | null>('nutrisnap-diet-plan', null);
  const [log, setLog] = useLocalStorage<Record<string, DailyLog>>('nutrisnap-food-log', {});

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus(profile ? 'ready' : 'needs_profile');
    }, 1500); // Splash screen duration

    return () => clearTimeout(timer);
  }, [profile]);

  const handleProfileSave = (data: UserProfile) => {
    setProfile(data);
    const newPlan = generateDietPlan(data);
    setPlan(newPlan);
    setStatus('ready');
  };

  const handleLogout = () => {
    setProfile(null);
    setPlan(null);
    setLog({});
    setStatus('needs_profile');
  };

  const today = new Date().toISOString().split('T')[0];
  const todayLog = log[today] || { date: today, meals: { breakfast: { items: [] }, lunch: { items: [] }, dinner: { items: [] } } };

  const handleLogItem = (mealType: 'breakfast' | 'lunch' | 'dinner', item: LoggedItem) => {
    const currentLog = log[today] || { date: today, meals: { breakfast: { items: [] }, lunch: { items: [] }, dinner: { items: [] } } };
    
    const updatedMeals = {
        ...currentLog.meals,
        [mealType]: {
            items: [...(currentLog.meals[mealType]?.items || []), item],
        }
    };

    const updatedLog = {
        ...log,
        [today]: {
            ...currentLog,
            meals: updatedMeals
        }
    };
    setLog(updatedLog);
  };

  const getMainComponent = () => {
    switch (status) {
      case 'loading':
        return <SplashScreen />;
      case 'needs_profile':
        return <ProfileSetup onSave={handleProfileSave} />;
      case 'ready':
        if (profile && plan) {
          return <Dashboard profile={profile} plan={plan} log={todayLog} onLogItem={handleLogItem} onLogout={handleLogout} />;
        }
        // If profile/plan is missing, reset
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
