import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Import bcrypt
import { MongoClient } from "mongodb"; // Import MongoClient
import clientPromise from "./dbConnect";

export const authOptions: NextAuthOptions = {
  // Use the MongoDBAdapter
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This is the crucial part for CredentialsProvider
      async authorize(credentials) {
        console.log("CredentialsProvider loaded");

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        console.log("Authorizing user:", credentials.email);

        // We must connect to the DB to find the user
        const client: MongoClient = await clientPromise;
        const db = client.db('build-together'); // Use your default database
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({
          email: credentials.email,
        });

        if (!user) {
          // No user found
          throw new Error("No user found with that email");
        }

        // Check if password matches
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password // Assumes you store the hashed password in `user.password`
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        console.log("User authorized:", user.email);

        // Return a user object *without* the password.
        // The adapter will handle the rest.
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  pages: {
    signIn: "/signin",
    // Use a user-facing error page instead of the internal API error route.
    // This prevents redirects to /api/auth/error which can return the
    // "action with HTTP GET is not supported" message when visited directly.
    error: "/auth/error",
  },
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt", 
  },
  

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.email = token.email;
      session.user.name = token.name;
      return session;
    },
  },
  
  // Database sessions are the default when using an adapter
};