import { getPropertyById } from "@/lib/properties";
import ChatRoom from "@/app/components/properties/ChatRoom";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PropertyChatPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/property/${params.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Property Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          Chat for: {property.title}
        </h1>
      </div>
      
      <ChatRoom channelName={`chat-${property._id}`} />
    </div>
  );
}
