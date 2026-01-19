import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.name) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { message, channel } = await req.json();
  const propertyId = channel.replace('presence-property-', '');

  if (!ObjectId.isValid(propertyId)) {
    return new NextResponse("Invalid property ID", { status: 400 });
  }

  const chatMessage = {
    message,
    user: session.user.name,
    timestamp: new Date(),
  };

  try {
    // 1. Save message to database
    const client = await clientPromise;
    const db = client.db('build-together');
    await db.collection("properties").updateOne(
      { _id: new ObjectId(propertyId) },
      { $push: { chat_messages: chatMessage } } as any
    );

    // 2. Trigger Pusher event
    await pusherServer.trigger(channel, "chat-event", chatMessage);

    return new NextResponse("Message sent", { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error sending message", { status: 500 });
  }
}
