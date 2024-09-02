'use client';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';

// schema for validating user profile
const ProfileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  address: z.string().min(1, 'Please enter an address.'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill.'),
  role: z.enum(['ELDER', 'VOLUNTEER']),
  availability: z.array(z.string()).min(1, 'Please select at least one available day.'),
});

type FormData = z.infer<typeof ProfileFormSchema>;

const getAudioUrl = (skill: string) => `/audios/${skill}.m4a`;

const ProfileForm = () => {
  const data = useState<FormData>()
  const router = useRouter()
  const { toast } = useToast();
  const [userProfile, setuserProfile] = useState<any>(null);

  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(ProfileFormSchema),
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleSkillChange = (skill: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        const newSelectedSkills = [...prev, skill];
        //plays the audio onclick
        const audio = new Audio(getAudioUrl(skill));
        audio.play();
        setValue('skills', newSelectedSkills);
        return newSelectedSkills
      }
    });
  };

  const onSubmit: SubmitHandler<FormData> = async data => {
    try {
      const [year, month, day] = data.dateOfBirth.split('-');
      const formattedDateOfBirth = `${day}/${month}/${year}`;

      const profileData = {
        ...data,
        dateOfBirth: formattedDateOfBirth, 
      };

      const response = await fetch('/api/profileEdit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(profileData),
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
        description: 'An error has occured while updating profile. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const skillOptions = ['Cooking', 'Shopping', 'Gardening', 'Painting', 'Photography', 'Knitting'];
  const availabilityOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const selectedRole = watch('role', 'ELDER');
  useEffect(() => {

    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/profile');
        const profileData = await response.json();

        if (response.ok) {
          //conversion from string to date format
          const [day, month, year] = profileData.dateOfBirth.split('/');
          const formattedDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

          setValue('firstName', profileData.firstName);
          setValue('lastName', profileData.lastName);
          setValue('phoneNumber', profileData.phoneNumber);
          setValue('dateOfBirth', formattedDate.toISOString().split('T')[0]);
          setValue('address', profileData.address);
          setSelectedSkills(profileData.skills || []);
          setValue('skills', profileData.skills || []);
          setValue('role', profileData.role);
          setValue('availability', profileData.availability || []);
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
          description: 'Failed to fetch profile data.',
          variant: 'destructive',
        });
      }
    };

    fetchProfileData();
  }, [setValue, toast]);


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          {...register('firstName')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.firstName?.message && <p className="text-sm text-red-400">{errors.firstName.message}</p>}
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          {...register('lastName')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.lastName?.message && <p className="text-sm text-red-400">{errors.lastName.message}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="text"
          id="phoneNumber"
          {...register('phoneNumber')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.phoneNumber?.message && <p className="text-sm text-red-400">{errors.phoneNumber.message}</p>}
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <input
          type="date"
          id="dateOfBirth"
          {...register('dateOfBirth')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.dateOfBirth?.message && <p className="text-sm text-red-400">{errors.dateOfBirth.message}</p>}
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
          {!userProfile || userProfile.role === 'ELDER' ? 'What skills are you looking for?' : 'Skills'}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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

      {selectedRole === 'VOLUNTEER' && (
        <div>
          <label htmlFor="availability" className="block text-sm font-medium text-gray-700 pb-4">
            Availability
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {availabilityOptions.map((day) => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  id={day}
                  value={day}
                  {...register('availability')}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor={day} className="ml-2 block text-sm text-gray-900">
                  {day}
                </label>
              </div>
            ))}
          </div>
          {errors.availability?.message && <p className="text-sm text-red-400">{errors.availability.message}</p>}
        </div>
      )}

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
