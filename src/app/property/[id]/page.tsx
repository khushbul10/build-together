import { notFound } from "next/navigation";
import PropertyDetailsClient from "./PropertyDetailsClient";
import { getPropertyById } from "@/lib/properties";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * The main page component
 */
export default async function PropertyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const property = await getPropertyById(resolvedParams.id);

  // If no property is found, show a 404 page
  if (!property) {
    notFound();
  }

  // Pass the server-fetched data to the Client Component
  return <PropertyDetailsClient property={property} />;
}