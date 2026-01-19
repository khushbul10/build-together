"use client";

import { pusherClient } from "@/lib/pusher";
import { PusherProvider as PusherClientProvider } from "@pusher/pusher-react";

export function PusherProvider({ children }: { children: React.ReactNode }) {
  return (
    <PusherClientProvider client={pusherClient}>
      {children}
    </PusherClientProvider>
  );
}
