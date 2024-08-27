import Matches from '@/components/Matches';
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

const page = async() => {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return (
      <div className='w-1/2 h-5/6'>
        <h1>You have matched with:</h1>
        <Matches />
      </div>
    );
  }
    return (
      <div>Unauthenticated user. Please login.</div>
    )
  }

export default page
