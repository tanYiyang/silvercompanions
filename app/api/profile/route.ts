import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.redirect('/login');
  }

  const sessionId = Number(session.user.id);

  try {
    const profile = await db.profile.findUnique({
      where: { userId: sessionId }
    });

    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ message: 'An error has occurred while fetching the profile', error });
  }
}
