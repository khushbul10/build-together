"use client";

import { pusherClient } from "@/lib/pusher";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

interface Message {
  user: string;
  message: string;
  time: string;
}

export default function ChatRoom({ channelName }: { channelName: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!channelName) return;

    const channel = pusherClient.subscribe(channelName);

    channel.bind("chat-event", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Unsubscribe when the component unmounts
    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

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
    <div className="mt-10">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Project Chat</h3>
      <div className="h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col">
        <div className="flex-grow overflow-y-auto pr-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.user === session.user?.name ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.user === session.user?.name ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"}`}>
                <p className="font-semibold text-sm">{msg.user}</p>
                <p className="text-base">{msg.message}</p>
                <p className="text-xs text-right mt-1 opacity-75">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow rounded-l-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
