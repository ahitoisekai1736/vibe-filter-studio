import { supabase } from "@/integrations/supabase/client";

export type SignalPayload = {
  type: "ring" | "offer" | "answer" | "ice" | "hangup";
  from: string; // user id
  to?: string;  // optional target user id for user-channel messages
  callId?: string;
  data?: any;
};

export function createCallChannel(callId: string) {
  const channel = supabase.channel(`call:${callId}`);

  const subscribe = (onMessage: (payload: SignalPayload) => void) => {
    channel
      .on("broadcast", { event: "signal" }, (payload) => {
        onMessage(payload.payload as SignalPayload);
      })
      .subscribe();
    return () => {
      // fire-and-forget cleanup
      supabase.removeChannel(channel);
    };
  };

  const send = async (payload: SignalPayload) => {
    await channel.send({ type: "broadcast", event: "signal", payload });
  };

  return { subscribe, send };
}

export function createUserChannel(userId: string) {
  const channel = supabase.channel(`user:${userId}`);
  const subscribe = (onMessage: (payload: SignalPayload) => void) => {
    channel
      .on("broadcast", { event: "notify" }, (payload) => {
        onMessage(payload.payload as SignalPayload);
      })
      .subscribe();
    return () => {
      // fire-and-forget cleanup
      supabase.removeChannel(channel);
    };
  };
  const notify = async (payload: SignalPayload) => {
    await channel.send({ type: "broadcast", event: "notify", payload });
  };
  return { subscribe, notify };
}
