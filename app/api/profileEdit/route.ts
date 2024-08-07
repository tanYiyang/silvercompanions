import { NextResponse } from 'next/server';
import * as z from "zod";
import { db } from "@/lib/db";
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// schema for validating user role and skills selection
const ProfileFormSchema = z.object({
  age: z.number().min(1, 'Please enter a valid age.').max(150, 'Please enter a valid age.'),
  address: z.string().min(1, 'Please enter an address.'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill.'),
  role: z.enum(['ELDER', 'VOLUNTEER']),
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.redirect('/login');
    }
    
    
      const body = await req.json();
      const { age, address, skills, role } = ProfileFormSchema.parse(body);
      const sessionId = Number(session.user.id)
      const existingProfile = await db.profile.findFirst({
        where: {userId: sessionId}
      })
  
    const profileData = {
      age: Number(age),
      address,
      skills,
      role
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
  return NextResponse.json({message: "Profile update failed."});
}
  }


  
