import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/dbConnect";

/**
 * POST /api/properties/[id]/join
 * Allows a logged-in user to join a project.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // `context.params` may be a Promise in newer Next.js versions — unwrap it.
    const resolvedParams = await context.params;
    const propertyId = resolvedParams.id;
    console.log("JOIN ROUTE: Attempting to join project", propertyId);


    // 1. Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.id) {
      return NextResponse.json(
        { message: "You must be logged in to join." },
        { status: 401 }
      );
    }
    const user = session.user;

    // 2. Validate Property ID
    if (!ObjectId.isValid(propertyId)) {
      return NextResponse.json(
        { message: "Invalid Project ID." },
        { status: 400 }
      );
    }

    // 3. Get the project from DB
    const client = await clientPromise;
    const db = client.db('build-together'); // Use your default database
    const propertiesCollection = db.collection("properties");

    const property = await propertiesCollection.findOne({
      _id: new ObjectId(propertyId),
    });

    if (!property) {
      return NextResponse.json(
        { message: "Project not found." },
        { status: 404 }
      );
    }
    
    // 4. Check if user is already part of the project
    // (We check both admins and members arrays)
    const isAdmin = property.admins.some((admin: any) => admin.id === user.id);
    const isMember = property.members.some((member: any) => member.id === user.id);

    if (isAdmin || isMember) {
      return NextResponse.json(
        { message: "You are already part of this project." },
        { status: 409 } // 409 Conflict
      );
    }

    // 5. Add the user to the "members" array
    const newMember = {
      id: user.id,
      name: user.name,
      joined_at: new Date(),
    };

    await propertiesCollection.updateOne(
      { _id: new ObjectId(propertyId) },
      { $push: { members: newMember } } as any
    );

    return NextResponse.json(
      { message: "Successfully joined project!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Join project error:", error);
    return NextResponse.json(
      { message: "An error occurred while joining the project." },
      { status: 500 }
    );
  }
}