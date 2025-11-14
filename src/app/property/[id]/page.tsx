import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import PropertyDetailsClient from "./PropertyDetailsClient";
import type { Property } from "@/types/property";
import clientPromise from "@/lib/dbConnect";

interface PageProps {
  // In newer Next.js versions the `params` passed to route handlers
  // can be a Promise. Mark it as such so callers can `await params`.
  params: Promise<{ id: string }> | { id: string };
}

/**
 * Server-side function to fetch a single property from MongoDB
 */
async function getProperty(id: string): Promise<Property | null> {
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

/**
 * The main page component
 */
export default async function PropertyPage({ params }: PageProps) {
  // `params` may be a Promise — unwrap it before accessing properties.
  const resolvedParams = await params;
  console.log("Resolved params:", resolvedParams.id);
  const property = await getProperty(resolvedParams.id);

  // If no property is found, show a 404 page
  if (!property) {
    notFound();
  }

  // Pass the server-fetched data to the Client Component
  return <PropertyDetailsClient property={property} />;
}