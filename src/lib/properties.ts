import { ObjectId } from "mongodb";
import clientPromise from "@/lib/dbConnect";
import type { Property } from "@/types/property";

/**
 * Server-side function to fetch a single property from MongoDB
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  // 1. Validate the ID
  if (!ObjectId.isValid(id)) {
    return null;
  }

  try {
    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db('build-together'); // Use your default database
    
    // 3. Find the property
    const property = await db.collection("properties").findOne({
      _id: new ObjectId(id),
    });

    if (!property) {
      return null;
    }

    // 4. Serialize the data
    // We must do this to pass it from a Server Component to a Client Component.
    // This converts ObjectId and Date objects to plain strings.
    const serializedProperty = JSON.parse(JSON.stringify(property));

    // Fix the _id field which gets mangled by stringify
    serializedProperty._id = property._id.toString();

    return serializedProperty;
    
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}
