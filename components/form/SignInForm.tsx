'use client';
import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useToast } from "@/components/ui/use-toast"

// schema for validating user signin
const SignInFormSchema = z.object({
    email: z.string().min(1, 'Please enter a email.').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Please enter a password.')
      .min(8, 'Password must have at least 8 characters.'),
  });

type Inputs = z.infer<typeof SignInFormSchema>

const SignInForm = () => {
    const data = useState<Inputs>()
    const router = useRouter()
    const { toast } = useToast();
    const { handleSubmit, register, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(SignInFormSchema),
    });

    const onSubmit: SubmitHandler<Inputs> = async data => {
        const signinResponse = await signIn('credentials', { 
            email: data.email,
            password: data.password,
            redirect: false });
        if (signinResponse?.error) {
            toast({
                title: "Login Error",
                description: "Incorrect login details.",
                variant: 'destructive',
              })
        } else {
            router.push('/user');
            router.refresh();
        }
        }
        
    return (
    
        <div className="max-w-md mx-auto mt-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
            </label>
            <input
                placeholder="Johnsmith@mail.com"
                type="email"
                id="email"
                {...register('email')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email?.message && (<p className='text-sm text-red-400'>{errors.email.message}</p>)}
            </div>
    
            <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
            </label>
            <input
                type="password"
                id="password"
                {...register('password')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password?.message && (<p className='text-sm text-red-400'>{errors.password.message}</p>)}
            </div>
    

    
            <div>
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Sign In
            </button>
            </div>
        </form>
        </div>
        
      );
    };

export default SignInForm;
