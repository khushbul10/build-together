import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Property } from "@/types/property";
import clientPromise from "@/lib/dbConnect";

async function getMyProperties() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
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

    // The MongoDB driver returns documents with _id as an ObjectId.
    // We need to convert it to a string to ensure it's serializable
    // for the client component.
    return JSON.parse(JSON.stringify(properties));
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    return [];
  }
}

export default async function MyProjectsPage() {
  const properties: Property[] = await getMyProperties();
// ... existing code ...

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Projects</h1>

      {properties.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">You haven't joined or created any projects yet.</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Explore existing projects or start your own!</p>
          <div className="mt-6">
            <Link href="/" className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Browse Projects
            </Link>
            <span className="mx-4 text-gray-300 dark:text-gray-600">|</span>
            <Link href="/create" className="text-base font-medium text-green-600 dark:text-green-400 hover:underline">
              Create a New Property
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Link key={property._id} href={`/property/${property._id}`} className="block group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-105">
                <img src={property.images[0]} alt={property.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{property.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 truncate">{property.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-300">
                    <span>{property.location}</span>
                    <span>{new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
