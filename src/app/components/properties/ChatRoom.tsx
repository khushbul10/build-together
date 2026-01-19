"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher";

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

  useEffect(() => {
    const channel = pusherClient.subscribe(channelName);

    channel.bind("chat-event", (data: { user: string; message: string; timestamp: Date }) => {
      console.log("--- Pusher Event Received ---");
      console.log("Data from Pusher:", data);
      setMessages((prev) => {
        console.log("Previous messages state:", prev);
        const newMessages = [...prev, data];
        console.log("New messages state:", newMessages);
        return newMessages;
      });
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          channel: channelName,
        }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally, show an error to the user
    }

    setNewMessage("");
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
