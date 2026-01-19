import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  console.log("Pusher auth request - Session:", session?.user?.name);

  if (!session?.user) {
    console.error("Pusher auth failed - No session");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await req.text();
  console.log("Pusher auth data:", data);
  
  const [socketId, channelName] = data
    .split("&")
    .map((str) => str.split("=")[1]);

  console.log("Authorizing channel:", channelName, "for socket:", socketId);

  const presenceData = {
    user_id: session.user.id,
    user_info: {
      name: session.user.name,
      email: session.user.email,
    },
  };

  try {
    const auth = pusherServer.authorizeChannel(
      socketId,
      channelName,
      presenceData
    );

    console.log("Channel authorized successfully");
    return NextResponse.json(auth);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new NextResponse("Error authorizing channel", { status: 500 });
  }
}
