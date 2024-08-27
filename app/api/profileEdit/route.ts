import { NextResponse } from 'next/server';
import * as z from "zod";
import { db } from "@/lib/db";
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// schema for validating user role and skills selection
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

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.redirect('/login');
    }
  
      const body = await req.json();
      const { firstName, lastName, phoneNumber, dateOfBirth, address, skills, availability, role } = ProfileFormSchema.parse(body);
      const sessionId = Number(session.user.id)
      const existingProfile = await db.profile.findFirst({
        where: {userId: sessionId}
      })
  
    const profileData = {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      address,
      skills,
      availability,
      role,
    }

    let user;

    if (existingProfile) {
      user = await db.profile.update({
        where: { userId: sessionId },
        data: profileData
      });
    } else {
      user = await db.profile.create({
        data: {
          userId: sessionId,
          ...profileData
        }
      })
    }

    
    return NextResponse.json(user);
} catch(err) {
  return NextResponse.json({message: "Profile update failed"});
}
  }


  
