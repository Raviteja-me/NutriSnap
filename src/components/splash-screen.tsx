import type { FC } from 'react';
import { Logo } from './logo';

interface SplashScreenProps {
  isGeneratingPlan?: boolean;
}

export const SplashScreen: FC<SplashScreenProps> = ({ isGeneratingPlan = false }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-card text-card-foreground animate-fade-in p-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <Logo />
        <p className="text-muted-foreground text-center">
          {isGeneratingPlan 
            ? "Building your personalized plan..." 
            : "Your personal AI-powered diet and health tracker."
          }
        </p>
        <div className="mt-8">
            <div className="w-5 h-5 rounded-full bg-primary animate-pulse delay-0"></div>
        </div>
      </div>
    </div>
  );
};
