import { Leaf } from 'lucide-react';
import type { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex items-center justify-center gap-2 text-primary">
      <Leaf className="w-8 h-8" />
      <span className="text-3xl font-bold font-headline">NutriSnap</span>
    </div>
  );
};
