'use client';
import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';

// schema for validating user registration
const SignUpFormSchema = z.object({
    username: z.string().min(1, 'Please enter a username.').max(50),
    email: z.string().min(1, 'Please enter a email.').email('Invalid email.'),
    password: z
      .string()
      .min(1, 'Please enter a password.')
      .min(8, 'Password must have at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please re-enter your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The passwords do not match.',
  });

type Inputs = z.infer<typeof SignUpFormSchema>

const SignupForm = () => {
    const data = useState<Inputs>()
    const router = useRouter()
    const { toast } = useToast();
    
    const { handleSubmit, register, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(SignUpFormSchema),
    });

    const onSubmit: SubmitHandler<Inputs> = async data => {
        const response = await fetch('/api/user', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password
            })
        })
        if (response.ok) {
            router.push('/signin')
        } else {
            toast({
                title: "Signup Error",
                description: "An error has occured. Please try again.",
                variant: 'destructive',
              })
        }
    }
    return (
    
        <div className="max-w-md mx-auto mt-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
            </label>
            <input
                placeholder="John Smith"
                type="text"
                id="username"
                {...register('username')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.username?.message && (<p className='text-sm text-red-400'>{errors.username.message}</p>)}
            </div>
    
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
            </label>
            <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.confirmPassword?.message && (<p className='text-sm text-red-400'>{errors.confirmPassword.message}</p>)}
            </div>
    
            <div>
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Sign Up
            </button>
            </div>
        </form>
        </div>
        
      );
    };

export default SignupForm;
