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

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

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
      <div className="mt-10 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 text-center shadow-xl">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join the Conversation</h3>
        <p className="text-gray-600 dark:text-gray-300">Please sign in to view and participate in the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Project Chat</h3>
            <p className="text-xs text-white/80">Real-time collaboration</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.user === session?.user?.name;
            const userInitial = msg.user.charAt(0).toUpperCase();
            
            return (
              <div
                key={index}
                className={`flex items-end gap-2 sm:gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar for other users */}
                {!isOwnMessage && (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                    {userInitial}
                  </div>
                )}
                
                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] sm:max-w-xs md:max-w-md p-3 sm:p-4 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                    isOwnMessage
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                  }`}
                >
                  <p className={`text-xs sm:text-sm font-bold mb-1 ${
                    isOwnMessage ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                  }`}>{msg.user}</p>
                  <p className="text-sm sm:text-base break-words">{msg.message}</p>
                  <p className={`text-xs text-right mt-2 ${
                    isOwnMessage ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Avatar for own messages */}
                {isOwnMessage && (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                    {userInitial}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>
      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          <div className="flex-grow relative min-w-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full pl-4 pr-12 sm:pl-6 sm:pr-14 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              disabled={!session}
            />
            {/* Emoji Button Placeholder */}
            <button
              type="button"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 z-10"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 flex-shrink-0"
            disabled={!session || !newMessage.trim()}
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="h-5 w-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
