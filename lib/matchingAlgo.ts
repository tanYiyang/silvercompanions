import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
//this contains the algorithm and its relevant functions

//define structure of volunteer and elder objects
export interface Volunteer {
    id: number;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    availability: string[];
    skills: string[];
    location: string;
  }
  
export interface Elder {
    id: number;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    skills: string[];
    location: string;
  }

const client = new Client({});

//part 1 of the algorithm. calculate the points and create preference ranking

//batch the locations to reduce the number of API requests
export async function getTravelTimes(volunteers: Volunteer[], elders: Elder[]): Promise<{ [key: string]: number }> {
    const volunteerLocations = volunteers.map(v => v.location);
    const elderLocations = elders.map(e => e.location);
  
    
    const travelTimes = await getBatchTravelTime(volunteerLocations, elderLocations);

    const travelTimeMap: { [key: string]: number } = {};
    volunteers.forEach((volunteer, vIndex) => {
      elders.forEach((elder, eIndex) => {
        const key = `${volunteer.id}-${elder.id}`;
        travelTimeMap[key] = travelTimes[vIndex][eIndex];
      });
    });
    
    return travelTimeMap;
  }
  
//calculates the travelling time between locations
export async function getBatchTravelTime(volunteerLocations: string[], elderLocations: string[]): Promise<number[][]> {
    try {
      const response = await client.distancematrix({
        params: {
          origins: volunteerLocations,
          destinations: elderLocations,
          mode: TravelMode.transit,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        },
      });
  
      // retrieves the time in minutes
      const durations = response.data.rows.map(row =>
        row.elements.map(element => element.status === 'OK' && element.duration?.value ? element.duration.value / 60 : null)
      );

      return durations as number[][];
    } catch (error) {
      return [];
    }
  }
  
//calculate the points by comparing the skills and location
export async function pointsCalculator(volunteer: Volunteer, elder: Elder, travelTimeMap: { [key: string]: number }): Promise<number> {
    let points = 0;

    //higher weights for skills
    const skillWeight = 0.7
    const locationWeight = 0.3
    
    //skill points calculation
    let skillPoints = 0;
    elder.skills.forEach((skill) => {
      if (volunteer.skills.includes(skill)) {
        skillPoints += 2;
      }
    });
  
    //location points calculation
    const key = `${volunteer.id}-${elder.id}`;
    const travelTime = travelTimeMap[key];
    let locationPoints = 0;
    if (travelTime < 20) {
      locationPoints += 3;
    } else if (travelTime >= 20 && travelTime < 40) {
      locationPoints += 2;
    } else if (travelTime >= 40 && travelTime < 60) {
      locationPoints += 1;
    }
    
    //if there is no matching skill, the locationpoints will not be accounted for, in order to ensure that preferences take priority
    if (skillPoints === 0) {
      locationPoints = 0;
    }

    points = (skillPoints * skillWeight) + (locationPoints * locationWeight);
    
    return points;
  }
  
//creates preference ranking for an elder in descending order
export async function rankVolunteersForElder(volunteers: Volunteer[], elder: Elder, travelTimeMap: { [key: string]: number }): Promise<Volunteer[]> {
    const rankedVolunteers = await Promise.all(volunteers.map(async (volunteer) => ({
      volunteer,
      points: await pointsCalculator(volunteer, elder, travelTimeMap),
    })));
  
    rankedVolunteers.sort((a, b) => b.points - a.points);
  
    return rankedVolunteers.map((v) => v.volunteer);
  }
  
//creates preference ranking for a volunteer in descending order
export async function rankEldersForVolunteer(elders: Elder[], volunteer: Volunteer, travelTimeMap: { [key: string]: number }): Promise<Elder[]> {
    const rankedElders = await Promise.all(elders.map(async (elder) => ({
      elder,
      points: await pointsCalculator(volunteer, elder, travelTimeMap),
    })));
  
    rankedElders.sort((a, b) => b.points - a.points);
  
    return rankedElders.map((e) => e.elder);
  }
  
//part 2 of the algorithm. using the ranking above as input into gale shapley algorithm
export async function galeShapley(volunteers: Volunteer[], elders: Elder[], travelTimeMap: { [key: string]: number }): Promise<{ [key: number]: Elder[] }> {
    const matches: { [key: number]: Elder[] } = {};
    const freeElders = [...elders];
    const volunteerAssignments: { [key: number] :number} = {}

    volunteers.forEach((volunteer) => {
      matches[volunteer.id] = []
      volunteerAssignments[volunteer.id] = 0;
    });
    while (freeElders.length > 0) {
      const elder = freeElders.pop();
      const rankedVolunteers = await rankVolunteersForElder(volunteers, elder!, travelTimeMap);
  
      for (const volunteer of rankedVolunteers) {
        if (volunteerAssignments[volunteer.id] < volunteer.availability.length) {
          matches[volunteer.id].push(elder!);
          volunteerAssignments[volunteer.id] += 1;
          break;
        } else {
          const currentElder = matches[volunteer.id][matches[volunteer.id].length - 1];
          const rankedElders = await rankEldersForVolunteer(elders, volunteer, travelTimeMap);
  
          if (rankedElders.indexOf(elder!) < rankedElders.indexOf(currentElder)) {
            matches[volunteer.id] = matches[volunteer.id].slice(0, -1); 
            matches[volunteer.id].push(elder!);
            freeElders.push(currentElder);
            break;
          }
        }
      }
    }
    return matches;
  }