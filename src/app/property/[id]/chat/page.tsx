import { getPropertyById } from "@/lib/properties";
import ChatRoom from "@/app/components/properties/ChatRoom";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PropertyChatPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const property = await getPropertyById(resolvedParams.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Group Chat</p>
        </div>
        <Link href={`/property/${property._id}`} className="text-blue-500 hover:underline">
          &larr; Back to Project Details
        </Link>
      </div>
      <ChatRoom 
        channelName={`presence-property-${property._id}`}
        initialMessages={property.chat_messages || []}
      />
    </div>
  );
}
