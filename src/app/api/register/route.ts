import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/dbConnect";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  try {
    console.log("Register API called");
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // 1. Get the database client
    const client: MongoClient = await clientPromise;
    const db = client.db('build-together');
    const usersCollection = db.collection("users");

    // 2. Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 } // 409 Conflict
      );
    }

    // 3. Hash the password
    // A salt round of 10 or 12 is recommended
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Insert the new user into the database
    // The MongoDB adapter will look for `emailVerified`, so we set it to null
    // It will also automatically add `_id`
    const result = await usersCollection.insertOne({
      name: name,
      email: email,
      password: hashedPassword, // Store the hashed password
      image: null, // Optional: set a default image
      emailVerified: null, // Required by NextAuth adapter
    });

    // 5. Return a success response
    return NextResponse.json(
      {
        message: "User registered successfully.",
        userId: result.insertedId,
      },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration." },
      { status: 500 }
    );
  }
}