import { useEffect } from "react";
import { useAuth } from "@/context/auth";
import { createUserChannel, type SignalPayload } from "@/lib/signaling";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function NotificationsListener() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const { subscribe } = createUserChannel(user.id);
    const unsubscribe = subscribe((payload: SignalPayload) => {
      if (payload.type === "ring" && payload.callId) {
        toast("Incoming call", {
          description: "Click to join the call",
          action: {
            label: "Accept",
            onClick: () => navigate(`/call/${payload.callId}`),
          },
        });
      }
    });
    return unsubscribe;
  }, [user, navigate]);

  return null;
}
