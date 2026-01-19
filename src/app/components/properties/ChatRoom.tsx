"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import PusherClient from "pusher-js";

interface Message {
  user: string;
  message: string;
  time: string;
}

interface ChatRoomProps {
  channelName: string;
  initialMessages: {
    user: string;
    message: string;
    timestamp: Date;
  }[];
}

export default function ChatRoom({ channelName, initialMessages }: ChatRoomProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<PusherClient | null>(null);

  useEffect(() => {
    // Initialize Pusher client
    if (!pusherRef.current) {
      pusherRef.current = new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_KEY!,
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          authEndpoint: "/api/pusher/auth",
        }
      );
    }

    const pusher = pusherRef.current;
    const channel = pusher.subscribe(channelName);

    // Log subscription state
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to', channelName);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Subscription error:', error);
    });

    channel.bind("chat-event", (data: { user: string; message: string; timestamp: Date }) => {
      console.log("--- Pusher Event Received ---");
      console.log("Data from Pusher:", data);
      setMessages((prev) => {
        console.log("Previous messages state:", prev);
        
        // Check if this message already exists (to prevent duplicates from optimistic updates)
        const isDuplicate = prev.some((msg) => 
          msg.user === data.user && 
          msg.message === data.message &&
          Math.abs(new Date(msg.timestamp).getTime() - new Date(data.timestamp).getTime()) < 2000 // Within 2 seconds
        );
        
        if (isDuplicate) {
          console.log("Duplicate message detected, skipping");
          return prev;
        }
        
        const newMessages = [...prev, data];
        console.log("New messages state:", newMessages);
        return newMessages;
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [channelName]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.name) return;

    const messageText = newMessage.trim();
    const optimisticMessage = {
      user: session.user.name,
      message: messageText,
      timestamp: new Date(),
    };

    // Optimistically add message to UI immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          channel: channelName,
        }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg !== optimisticMessage));
      // Optionally, show an error to the user
    }
  };

  if (!session) {
    return (
      <div className="mt-10 p-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
        <p className="text-gray-700 dark:text-gray-300">Please sign in to view and participate in the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 mb-4 ${
              msg.user === session?.user?.name ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                msg.user === session?.user?.name
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              <p className="text-sm font-bold">{msg.user}</p>
              <p className="text-base">{msg.message}</p>
              <p className="text-xs text-right opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={!session}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
            disabled={!session || !newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
