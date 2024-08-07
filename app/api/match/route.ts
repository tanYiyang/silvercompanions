import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

//define structure of volunteer and elder objects
interface Volunteer {
  id: number;
  name: string;
  skills: string[];
  location: string;
}

interface Elder {
  id: number;
  name: string;
  skills: string[];
  location: string;
}

//part 1 of the algorithm. calculate the points and create preference ranking

//calculate the points by comparing the skills and location. 1 point is added for every crtieria that matches
function pointsCalculator(volunteer: Volunteer, elder: Elder): number {
  let points = 0;

  elder.skills.forEach((skill) => {
    if (volunteer.skills.includes(skill)) {
      points += 1;
    }
  });

  if (volunteer.location === elder.location) {
    points += 1;
  }

  return points;
}

//creates preference ranking for an elder in descending order
function rankVolunteersForElder(volunteers: Volunteer[], elder: Elder): Volunteer[] {
  const rankedVolunteers = volunteers.map((volunteer) => ({
    volunteer,
    points: pointsCalculator(volunteer, elder),
  }));

  rankedVolunteers.sort((a, b) => b.points - a.points);

  return rankedVolunteers.map((v) => v.volunteer);
}

//creates preference ranking for a volunteer in descending order
function rankEldersForVolunteer(elders: Elder[], volunteer: Volunteer): Elder[] {
  const rankedElders = elders.map((elder) => ({
    elder,
    points: pointsCalculator(volunteer, elder),
  }));

  rankedElders.sort((a, b) => b.points - a.points);

  return rankedElders.map((e) => e.elder);
}

//part 2 of the algorithm. using the ranking above as input into gale shapley algorithm
function galeShapley(volunteers: Volunteer[], elders: Elder[]): { [key: number]: Elder } {
  const matches: { [key: number]: Elder } = {};
  const freeElders = [...elders];

  while (freeElders.length > 0) {
    const elder = freeElders.pop();
    const rankedVolunteers = rankVolunteersForElder(volunteers, elder!);

    for (const volunteer of rankedVolunteers) {
      if (!matches[volunteer.id]) {
        matches[volunteer.id] = elder!;
        break;
      } else {
        const currentElder = matches[volunteer.id];
        const rankedElders = rankEldersForVolunteer(elders, volunteer);

        if (rankedElders.indexOf(elder!) < rankedElders.indexOf(currentElder)) {
          matches[volunteer.id] = elder!;
          freeElders.push(currentElder);
          break;
        }
      }
    }
  }

  return matches;
}

//the actual api
export async function GET(req: Request) {

  try {
    const volunteers = await db.profile.findMany({
      where: { role: 'VOLUNTEER' },
    });
    
    const elders = await db.profile.findMany({
      where: { role: 'ELDER' },
    });

    const volunteerData: Volunteer[] = volunteers.map(v => ({
      id: v.id,
      name: v.name,
      skills: v.skills ?? [],
      location: v.address ?? '',
    }));

    const elderData: Elder[] = elders.map(e => ({
      id: e.id,
      name: e.name,
      skills: e.skills ?? [],
      location: e.address ?? '',
    }));

    const matches = galeShapley(volunteerData, elderData);
    const matchResults = Object.keys(matches).map(volunteerId => ({
      volunteerId: Number(volunteerId),
      volunteerName: volunteers.find(v => v.id === Number(volunteerId))?.name,
      elderId: matches[Number(volunteerId)].id,
      elderName: matches[Number(volunteerId)].name,
    }));
    return NextResponse.json(matchResults);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' });
  }
}
