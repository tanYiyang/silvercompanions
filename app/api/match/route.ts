import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { galeShapley, Volunteer, Elder, getTravelTimes } from '@/lib/matchingAlgo';

//matching api
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;

    const currentUser = await db.profile.findUnique({
      where: { userId: Number(userId) },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const volunteers = await db.profile.findMany({
      where: { role: 'VOLUNTEER' },
    });
    
    const elders = await db.profile.findMany({
      where: { role: 'ELDER' },
    });

    const volunteerData: Volunteer[] = volunteers.map(v => ({
      id: v.id,
      firstName: v.firstName ?? 'NA',
      lastName: v.lastName ?? 'NA',
      phoneNumber: v.phoneNumber ?? 'NA',
      skills: v.skills ?? [],
      location: v.address ?? '',
      availability: v.availability ?? [],
    }));

    const elderData: Elder[] = elders.map(e => ({
      id: e.id,
      firstName: e.firstName ?? 'NA',
      lastName: e.lastName ?? 'NA',
      phoneNumber: e.phoneNumber ?? 'NA',
      skills: e.skills ?? [],
      location: e.address ?? '',
    }));
    
    const travelTimeMap = await getTravelTimes(volunteerData, elderData);

    const matches = await galeShapley(volunteerData, elderData, travelTimeMap);

    let matchResults: any[] = [];


if (currentUser.role === 'VOLUNTEER') {
  matchResults = matches[Number(currentUser.id)]?.map(elder => {
    const volunteerName = `${currentUser.firstName} ${currentUser.lastName}`;

    return {
      volunteerId: currentUser.id,
      volunteerName: volunteerName,
      volunteerPhone: currentUser.phoneNumber,
      volunteerAvailability: currentUser.availability.join(', '),
      elderId: elder.id,
      elderName: `${elder.firstName} ${elder.lastName}`,
      elderPhone: elder.phoneNumber,
      elderAddress: elder.location 
    };
  }) ?? [];
  
} else if (currentUser.role === 'ELDER') {
  matchResults = Object.keys(matches).flatMap(volunteerId => {
    const volunteer = volunteers.find(v => v.id === Number(volunteerId));
    const volunteerName = volunteer ? `${volunteer.firstName} ${volunteer.lastName}` : 'NA';

    return matches[Number(volunteerId)].filter(e => e.id === Number(currentUser.id)).map(elder => ({
      volunteerId: Number(volunteerId),
      volunteerName: volunteerName,
      volunteerPhone: volunteer?.phoneNumber,
      volunteerAvailability: volunteer?.availability.join(', '),
      elderId: elder.id,
      elderName: `${elder.firstName} ${elder.lastName}`,
      elderPhone: elder.phoneNumber, 
      elderAddress: elder.location 
    }));
  });
}
    
    return NextResponse.json(matchResults);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
