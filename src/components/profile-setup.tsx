'use client';

import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { UserProfile } from '@/lib/types';
import { Logo } from './logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(12, { message: 'You must be at least 12 years old.' }).max(100),
  height: z.coerce.number().min(100, { message: 'Height must be in cm.' }).max(250),
  weight: z.coerce.number().min(30, { message: 'Weight must be in kg.' }).max(300),
  country: z.string().min(2, { message: 'Please enter your country.' }),
  state: z.string().min(2, { message: 'Please enter your state or region.' }),
  disorders: z.string().optional(),
  goal: z.enum(['lose', 'maintain', 'gain'], { required_error: 'Please select a goal.' }),
});

interface ProfileSetupProps {
  onSave: (data: UserProfile) => void;
}

export const ProfileSetup: FC<ProfileSetupProps> = ({ onSave }) => {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      country: '',
      state: '',
      disorders: '',
    },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    onSave(values);
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background p-4 animate-fade-in overflow-y-auto">
       <div className="w-full text-center mb-6 pt-8">
        <Logo />
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>Let's set up your profile to personalize your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="180" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="75" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
               <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="e.g. USA" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>State / Region</FormLabel><FormControl><Input placeholder="e.g. California" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField
                control={form.control}
                name="disorders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Conditions</FormLabel>
                    <FormControl><Textarea placeholder="Any allergies, medical conditions, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your goal" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lose">Lose Weight</SelectItem>
                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                        <SelectItem value="gain">Gain Muscle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Get Started</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className='pb-8'></div>
    </div>
  );
};
