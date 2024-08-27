import ProfileForm from "@/components/form/ProfileEdit";
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"


const page = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return (
        <div className="w-1/2 h-5/6">
        <div className="text-4xl font-bold">My Profile</div>
        <div className="pt-5"> 
        <ProfileForm/>
        </div>
        </div>
    )
    }

  return (
    <div>Unauthenticated user. Please login.</div>
  )
}

export default page