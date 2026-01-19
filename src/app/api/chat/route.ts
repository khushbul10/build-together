import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.name) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { message, channel } = await req.json();

  try {
    await pusherServer.trigger(channel, "chat-event", {
      message,
      user: session.user.name,
      time: new Date().toLocaleTimeString(),
    });

    return new NextResponse("Message sent", { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error sending message", { status: 500 });
  }
}
