import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null | undefined; // <-- IS THIS HERE?
      email?: string | null | undefined;
      name?: string | null | undefined;
    } & DefaultSession["user"];
  }
}