import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MongoClient } from "mongodb";
import clientPromise from "@/lib/dbConnect";

/**
 * GET /api/properties
 * Fetches all property proposals
 */
export async function GET(request: Request) {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db('build-together'); // Use your default database
    const properties = await db
      .collection("properties")
      .find({})
      .sort({ created_at: -1 }) // Show newest first, using new field name
      .toArray();

    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json(
      { message: "Failed to fetch properties." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * Creates a new property proposal
 */
export async function POST(request: Request) {
  try {
    // 1. Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.name) {
      return NextResponse.json(
        { message: "You must be logged in to create a project." },
        { status: 401 }
      );
    }
    
    const creatorId = session.user.id;
    const creatorName = session.user.name;

    // 2. Parse the request body
    const body = await request.json();
    const { 
      title, 
      description, 
      location, 
      expected_members, 
      per_member_cost, 
      images 
    } = body;

    // 3. Validate input
    if (!title || !description || !location || !expected_members || !per_member_cost || !images) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(images) || images.length === 0 || !images.every(img => typeof img === 'string')) {
      return NextResponse.json(
        { message: "Images must be a non-empty array of strings." },
        { status: 400 }
      );
    }

    const expectedMembersNum = parseInt(expected_members, 10);
    const perMemberCostNum = parseFloat(per_member_cost);

    if (isNaN(expectedMembersNum) || expectedMembersNum <= 1) {
      return NextResponse.json(
        { message: "Expected members must be a number greater than 1." },
        { status: 400 }
      );
    }
    if (isNaN(perMemberCostNum) || perMemberCostNum <= 0) {
      return NextResponse.json(
        { message: "Per member cost must be a positive number." },
        { status: 400 }
      );
    }

    // 4. Connect to the database
    const client: MongoClient = await clientPromise;
    const db = client.db('build-together'); // Use your default database
    const propertiesCollection = db.collection("properties"); // Using "properties" as the collection name

    // 5. Create the new property document based on your schema
    const newProject = {
      title,
      description,
      location,
      images, // array of strings
      
      created_at: new Date(),
      created_by: {
        id: creatorId,
        name: creatorName,
      },
      
      // Add the creator as the first admin
      admins: [
        {
          id: creatorId,
          name: creatorName,
        }
      ],
      members: [], // Starts empty
      
      expected_members: expectedMembersNum,
      per_member_cost: perMemberCostNum,
      
      // Calculate the total target amount
      target_amount: expectedMembersNum * perMemberCostNum,
      
      status: "FUNDING", // Default status
    };

    // 6. Insert into database
    const result = await propertiesCollection.insertOne(newProject);

    return NextResponse.json(
      { message: "Project created successfully.", projectId: result.insertedId },
      { status: 201 }
    );

  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { message: "An error occurred during project creation." },
      { status: 500 }
    );
  }
}