import { notFound } from "next/navigation";
import PropertyDetailsClient from "./PropertyDetailsClient";
import { getPropertyById } from "@/lib/properties";

interface PageProps {
  params: { id: string };
}

/**
 * The main page component
 */
export default async function PropertyPage({ params }: PageProps) {
  const property = await getPropertyById(params.id);

  // If no property is found, show a 404 page
  if (!property) {
    notFound();
  }

  // Pass the server-fetched data to the Client Component
  return <PropertyDetailsClient property={property} />;
}