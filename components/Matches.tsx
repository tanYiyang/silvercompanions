'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaPhoneAlt } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaSearchLocation } from "react-icons/fa";

interface Match {
  volunteerId: number;
  volunteerName: string;
  volunteerPhone: string;
  volunteerAvailability: string;
  elderId: number;
  elderName: string;
  elderPhone: string;
  elderAddress: string;
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user) {
        const response = await fetch('/api/profile', {
          method: 'GET',
        });
        const profileData = await response.json();
        setUserRole(profileData.role);
      }
    };

    fetchUserRole();
  }, [session]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (session?.user) {
        const response = await fetch('/api/match', {
          method: 'GET',
        });
        if (response.ok) {
          const matchData: Match[] = await response.json();
          setMatches(matchData);
        }
      }
    };
    fetchMatches();
  }, [session]);

  return (
    <div>
      {matches.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {matches.map(match => (
            <li key={match.elderId || match.volunteerId} className="py-4 ">
              {userRole === 'VOLUNTEER' ? (
                <div className="flex flex-col">
                  <p className="text-lg font-medium text-indigo-600 truncate">{match.elderName}</p>
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                  <FaPhoneAlt className='mr-2'/>
                    Phone: {match.elderPhone}
                  </p>
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                  <FaSearchLocation className='mr-2'/>
                    Address: {match.elderAddress}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Contact them to schedule a session!</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="text-lg font-medium text-indigo-600">{match.volunteerName}</p>
                  <p className="mt-2 flex items-center text-sm text-gray-500">
                  <FaPhoneAlt className='mr-2'/>
                    Phone: {match.volunteerPhone}
                  </p>
                  <p className="mt-1 flex items-center text-sm text-gray-500">
                    <FaCalendarAlt className='mr-2'/>
                    Availability: {match.volunteerAvailability}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Contact them to schedule a session!</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500">No match yet</p>
        </div>
      )}
    </div>
  );
};

export default Matches;
