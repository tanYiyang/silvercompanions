import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import * as z from "zod";

// schema for validating user registration
const UserSchema = z.object({
    username: z.string().min(1, 'Please enter a username.').max(50),
    email: z.string().min(1, 'Please enter a email.').email('Invalid email.'),
    password: z
      .string()
      .min(1, 'Please enter a password.')
      .min(8, 'Password must have at least 8 characters.'),
  });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password, email } = UserSchema.parse(body);

        //check for existing user
        const existingUser = await db.user.findFirst({
            where: {
                OR: [ 
                    { email: email},
                    { username: username}
                ]  }
        })

        if (existingUser) {
            return NextResponse.json({ user: null, message: "User already exists"})
        }

        const encPassword = await hash(password, 15);

        const newUser = await db.user.create({
            data: {
                username,
                password: encPassword,
                email
            }
        });
        return NextResponse.json({user: newUser, message: "User creation successful"});
    } catch(err) {
        return NextResponse.json({message: "User creation failed"});
    }
}