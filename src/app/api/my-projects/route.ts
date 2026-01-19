import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("build-together");
    const propertiesCollection = db.collection("properties");

    const userId = session.user.id;

    const properties = await propertiesCollection.find({
      $or: [
        { "admins.id": userId },
        { "members.id": userId },
      ],
    }).toArray();

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
