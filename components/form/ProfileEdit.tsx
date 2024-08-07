'use client';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';

// Schema for validating profile information
const ProfileFormSchema = z.object({
  age: z.number().min(1, 'Please enter a valid age.').max(150, 'Please enter a valid age.'),
  address: z.string().min(1, 'Please enter an address.'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill.'),
  role: z.enum(['ELDER', 'VOLUNTEER']),
});

type FormData = z.infer<typeof ProfileFormSchema>;

const ProfileForm = () => {
  const data = useState<FormData>()
  const router = useRouter()
  const { toast } = useToast();
  const [userProfile, setuserProfile] = useState<any>(null);

  const { handleSubmit, register, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(ProfileFormSchema),
  });
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleSkillChange = (skill: string) => {
    setSelectedSkills((prev) => {
      const newSelectedSkills = prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill];
      setValue('skills', newSelectedSkills);
      return newSelectedSkills;
    });
  };

  const onSubmit: SubmitHandler<FormData> = async data => {
    try {
      const response = await fetch('/api/profileEdit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({
          age: data.age,
          address: data.address,
          skills: data.skills,
          role: data.role,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
      } else {
        toast({
          title: 'Profile Update Error',
          description: 'An error has occured while updating profile. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Profile Update Error',
        description: 'Failed to update profile. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  const skillOptions = ['Cooking', 'Shopping', 'Gardening', 'Painting', 'Fishing', 'Knitting', 'Woodworking', 'Photography'];

  useEffect(() => {
    // Fetch the existing profile data
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/profile');
        const profileData = await response.json();

        if (response.ok) {
          // Populate the form with the fetched data
          setValue('age', profileData.age);
          setValue('address', profileData.address);
          setSelectedSkills(profileData.skills || []);
          setValue('skills', profileData.skills || []);
          setValue('role', profileData.role);
          setuserProfile(profileData);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch profile data.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An error occurred while fetching profile data.',
          variant: 'destructive',
        });
      }
    };

    fetchProfileData();
  }, [setValue, toast]);
  
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="number"
          id="age"
          {...register('age', {valueAsNumber: true})}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.age?.message && <p className="text-sm text-red-400">{errors.age.message}</p>}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          {...register('address')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.address?.message && <p className="text-sm text-red-400">{errors.address.message}</p>}
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 pb-4">
        { !userProfile || userProfile.role === 'ELDER' ? 'What skills are you looking for?' : 'Skills'}
        </label>
        <div className="space-y-2 columns-3">
          {skillOptions.map((skill) => (
            <div key={skill} className="flex items-center">
              <input
                type="checkbox"
                id={skill}
                value={skill}
                checked={selectedSkills.includes(skill)}
                onChange={() => handleSkillChange(skill)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor={skill} className="ml-2 block text-sm text-gray-900">
                {skill}
              </label>
            </div>
          ))}
        </div>
        {errors.skills?.message && <p className="text-sm text-red-400">{errors.skills.message}</p>}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          {...register('role')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="ELDER">Elder</option>
          <option value="VOLUNTEER">Volunteer</option>
        </select>
        {errors.role?.message && <p className="text-sm text-red-400">{errors.role.message}</p>}
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
