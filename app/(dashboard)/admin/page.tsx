import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

const page = async () => {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    return <div>admin page. welcome {session?.user.username} </div>
  }
  return (
    <div>unauthenticated user. please login.</div>
  )
}

export default page