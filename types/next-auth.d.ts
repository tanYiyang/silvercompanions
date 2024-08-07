// code modified from https://next-auth.js.org/getting-started/typescript
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User{
    username: string
  }
  interface Session {
    user: User & {
        username: string
    }
    token: {
        username: string
    }
  }
}