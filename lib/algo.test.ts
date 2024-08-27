import { galeShapley, Volunteer, Elder, getTravelTimes, rankEldersForVolunteer, rankVolunteersForElder } from "./matchingAlgo";
import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
//this contains all the test cases for the matching algorithm and it is done using jest.
//run "npm test" to run all the tests

//mock setup of the google distance matrix api
describe('Gale-Shapley Algorithm Tests', () => {
  let mockDistancematrix: jest.Mock;

  beforeEach(() => {
    mockDistancematrix = jest.fn();
    Client.prototype.distancematrix = mockDistancematrix;
  });

  test('Availability Test: The number of elders that a volunteer can be matched with should be less than or equal than their number of available days, while still respecting the preferences.', async () => {
    mockDistancematrix.mockImplementationOnce(({ params }) => {
      return Promise.resolve({
        data: {
          destination_addresses: ["Bedok, Singapore", "Jurong East, Singapore", "Bedok, Singapore"],
          origin_addresses: ["Bedok, Singapore"],
          rows: [
            {
              elements: [
                {
                  distance: { text: "1.0 km", value: 1000 },
                  duration: { text: "5 mins", value: 100 },
                  status: "OK"
                },
                {
                  distance: { text: "31.6 km", value: 31635 },
                  duration: { text: "1 hour 7 mins", value: 4021 },
                  status: "OK"
                },
                {
                  distance: { text: "1.0 km", value: 1000 },
                  duration: { text: "5 mins", value: 100 },
                  status: "OK"
                }
              ]
            },
          ],
          status: "OK"
        }
      });
    });

    const volunteers: Volunteer[] = [
      { id: 1, skills: ['cooking', 'gardening'], location: 'Bedok, Singapore', availability: ['Monday', 'Tuesday'] },
    ];
    const elders: Elder[] = [
      { id: 1, skills: ['gardening'], location: 'Bedok, Singapore' },
      { id: 2, skills: ['cooking'], location: 'Jurong East, Singapore' },
      { id: 3, skills: ['cooking'], location: 'Bedok, Singapore' },
    ];

    const travelTimeMap = await getTravelTimes(volunteers, elders);
    const matches = await galeShapley(volunteers, elders, travelTimeMap);
    const matchedElders = matches[1].map(elder => elder.id);
    
    expect(matchedElders).toEqual(expect.arrayContaining([1, 3])); //volunteer 1 should be matched with elder 1 and elder 3 
  });

  test('Preference Priority Test: The priority in the matching should be skill preferences, not location.', async () => {
    mockDistancematrix.mockImplementationOnce(({ params }) => {
      return Promise.resolve({
        data: {
          destination_addresses: ["Jurong East, Singapore"],
          origin_addresses: ["Jurong East, Singapore", "Tampines, Singapore"],
          rows: [
            {
              elements: [
                {
                  distance: { text: "31.6 km", value: 31635 },
                  duration: { text: "1 hour 7 mins", value: 4021 },
                  status: "OK"
                }
              ]
            },
            {
              elements: [
                {
                  distance: { text: "1.0 km", value: 1000 },
                  duration: { text: "5 mins", value: 100 },
                  status: "OK"
                }
              ]
            }
          ],
          status: "OK"
        }
      });
    });

    const volunteers: Volunteer[] = [
      { id: 1, skills: ['cooking', 'gardening'], location: 'Tampines, Singapore', availability: ['Wednesday'] },
      { id: 2, skills: ['cooking'], location: 'Jurong East, Singapore', availability: ['Thursday'] },
    ];
    const elders: Elder[] = [
      { id: 1, skills: ['cooking', 'gardening'], location: 'Jurong East, Singapore' },

    ];
    const travelTimeMap = await getTravelTimes(volunteers, elders);
    const matches = await galeShapley(volunteers, elders, travelTimeMap);
    const matchedElders = matches[1].map(elder => elder.id);
    
    expect(matchedElders).toEqual(expect.arrayContaining([1])); //volunteer 1 should be matched with elder 1
  });

  test('Stable Matching Test: The matches produces are stable, whereby no pair of a volunteer and elder would prefer each other over their current matches.', async () => {
    mockDistancematrix.mockImplementationOnce(({ params }) => {
      return Promise.resolve({
        data: {
          destination_addresses: ["Jurong East, Singapore", "Bedok, Singapore", "Tampines, Singapore"],
          origin_addresses: ["Bedok, Singapore", "Jurong East, Singapore", "Tampines, Singapore"],
          rows: [
            {
              elements: [
                {
                  distance: { text: "31.6 km", value: 31635 },
                  duration: { text: "1 hour 7 mins", value: 4021 },
                  status: "OK"
                },
                {
                  distance: { text: "1.0 km", value: 1000 },
                  duration: { text: "5 mins", value: 300 },
                  status: "OK"
                },
                {
                  distance: { text: "10.0 km", value: 10000 },
                  duration: { text: "30 mins", value: 1800 },
                  status: "OK"
                }
              ]
            },
            {
              elements: [
                {
                  distance: { text: "1.0 km", value: 1000 },
                  duration: { text: "5 mins", value: 300 },
                  status: "OK"
                },
                {
                  distance: { text: "31.6 km", value: 31635 },
                  duration: { text: "1 hour 7 mins", value: 4021 },
                  status: "OK"
                },
                {
                  distance: { text: "10.0 km", value: 10000 },
                  duration: { text: "30mins", value: 1800 },
                  status: "OK"
                },
              ]
            },
            {
              elements: [
                {
                  distance: { text: "10.0 km", value: 10000 },
                  duration: { text: "30mins", value: 1800 },
                  status: "OK"
                },
                {
                  distance: { text: "10km", value: 10000 },
                  duration: { text: "30mins", value: 1800 },
                  status: "OK"
                },
                {
                  distance: { text: "1.0 km", value: 1000 },
                  duration: { text: "5 mins", value: 300 },
                  status: "OK"
                }
              ]
            },
          ],
          status: "OK"
        }
      });
    });

    const volunteers: Volunteer[] = [
      { id: 1, skills: ['gardening'], location: 'Bedok, Singapore', availability: ['Monday'] },
      { id: 2, skills: ['cooking'], location: 'Jurong East, Singapore', availability: ['Tuesday'] },
      { id: 3, skills: ['gardening', 'cooking'], location: 'Tampines, Singapore', availability: ['Wednesday'] },
    ];

    const elders: Elder[] = [
      { id: 1, skills: ['gardening'], location: 'Jurong East, Singapore' },
      { id: 2, skills: ['cooking'], location: 'Bedok, Singapore' },
      { id: 3, skills: ['cooking'], location: 'Tampines, Singapore' },
    ];    
    const travelTimeMap = await getTravelTimes(volunteers, elders);
    const matches = await galeShapley(volunteers, elders, travelTimeMap);
    
    // check for any blocking pairs, if no blocks pairs, it means a stable matching has been achieved
    

    // iteration through all pairs
    for (const volunteer of volunteers) {
      for (const elder of elders) {
        const currentMatchedElders = matches[volunteer.id] || [];


        // check for blocking pair only occurs if the current elder is not already matched with the volunteer
        if (!currentMatchedElders.includes(elder)) {

          // the elder that the volunteer is currently matched with
          const currentMatchedElder = currentMatchedElders[0];

          // finds the volunteer who is matched with this elder
          const currentMatchedVolunteer = Object.keys(matches).find(volunteerId => 
            matches[Number(volunteerId)].includes(elder)
          );

          // checks if the volunteer prefers this elder over their currentMatchedElder
          const rankedEldersForVolunteer = await rankEldersForVolunteer(elders, volunteer, travelTimeMap);

          // ranking of the preferred elder for the volunteer
          const preferredElderIndex = rankedEldersForVolunteer.indexOf(elder);

          //ranking of the currently matched elder for the volunteer
          const currentMatchedElderIndex = rankedEldersForVolunteer.indexOf(currentMatchedElder);

          // checks if the elder prefers this volunteer over their currentMatchedVolunteer      
          const rankedVolunteersForElder = await rankVolunteersForElder(volunteers, elder, travelTimeMap);

          //ranking of the preferred volunteer for the elder
          const preferredVolunteerIndex = rankedVolunteersForElder.indexOf(volunteer);

          //ranking of the currently matched volunteer for the elder
          let currentMatchedVolunteerIndex = -1;
          if (currentMatchedVolunteer) {
            const matchedVolunteer = volunteers.find(v => v.id === Number(currentMatchedVolunteer));

            if (matchedVolunteer) {
              currentMatchedVolunteerIndex = rankedVolunteersForElder.indexOf(matchedVolunteer);
            }
          }
          
          //throws an error is a blocking pair is found
          if (preferredElderIndex < currentMatchedElderIndex && preferredVolunteerIndex < currentMatchedVolunteerIndex) {
            throw new Error(`Blocking pair found: Volunteer ${volunteer.id} and Elder ${elder.id} prefer each other over their current matches.`);
          }
        }
      }
    }

    // If no blocking pair was found, the matching is stable
    expect(matches).toBeDefined();
  });
});