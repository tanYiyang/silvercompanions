import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
    const session = await getServerSession(authOptions);
    if (session && session.user) {
        const abc = session.user.id
    return NextResponse.json({abc});
    }
}