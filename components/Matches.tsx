'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Match {
  elderId: number;
  elderName: string;
  volunteerId: number;
  volunteerName: string;
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      const response = await fetch('/api/match', {
        method: 'GET',
      });
      const matchData = await response.json();
      setMatches(matchData);
    };
    fetchMatches();
  }, []);

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
    if (session?.user && userRole) {
      const userId = session.user.id;

      if (userRole === 'ELDER') {
        setUserMatches(matches.filter(match => match.elderId === Number(userId)));
      } else if (userRole === 'VOLUNTEER') {
        setUserMatches(matches.filter(match => match.volunteerId === Number(userId)));
      }
    }
  }, [matches, session, userRole]);

  return (
    <div>
      <ul>
        {userMatches.length > 0 ? (
          userMatches.map((match, index) => (
            <li key={index}>
              {userRole === 'ELDER' ? (
                <>Volunteer {match.volunteerName}</>
              ) : (
                <>Elder {match.elderName}</>
              )}
            </li>
          ))
        ) : (
          <li>No match yet</li>
        )}
      </ul>
    </div>
  );
};

export default Matches;
