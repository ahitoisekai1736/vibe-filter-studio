import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { useColorGrading } from "@/context/color-grading";
import { useProcessedStream } from "@/hooks/useProcessedStream";
import { createCallChannel, type SignalPayload } from "@/lib/signaling";
import { acceptAnswer, acceptOffer, createOffer, createPeerConnection } from "@/lib/webrtc";
import { toast } from "sonner";

export default function CallPage() {
  const { callId = "" } = useParams();
  const { user } = useAuth();
  const { computeFilterString } = useColorGrading();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [rawStream, setRawStream] = useState<MediaStream | null>(null);
  const filterString = useMemo(() => computeFilterString(), [computeFilterString]);
  const processedStream = useProcessedStream(rawStream, filterString);

  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    document.title = "Call - VibeFilter Studio";
  }, []);

  useEffect(() => {
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(setRawStream).catch((e) => {
      console.error(e);
      toast.error("Camera/Mic permission required");
    });
    return () => {
      setRawStream(null);
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && processedStream) {
      localVideoRef.current.srcObject = processedStream;
    }
  }, [processedStream]);

  useEffect(() => {
    if (!callId || !user) return;

    const pc = createPeerConnection((ev) => {
      if (remoteVideoRef.current) {
        const [stream] = ev.streams;
        remoteVideoRef.current.srcObject = stream;
      }
    });
    pcRef.current = pc;

    const { subscribe, send } = createCallChannel(callId);

    const unsubscribe = subscribe(async (payload: SignalPayload) => {
      if (!pcRef.current || !user) return;
      if (payload.from === user.id) return; // ignore self

      if (payload.type === "offer" && payload.data) {
        const answer = await acceptOffer(pcRef.current, payload.data);
        await send({ type: "answer", from: user.id, callId, data: answer });
      } else if (payload.type === "answer" && payload.data) {
        await acceptAnswer(pcRef.current, payload.data);
      } else if (payload.type === "ice" && payload.data) {
        try { await pcRef.current.addIceCandidate(payload.data); } catch {}
      } else if (payload.type === "hangup") {
        toast("Call ended");
      }
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send({ type: "ice", from: user.id, callId, data: e.candidate });
      }
    };

    return () => {
      unsubscribe();
      pc.close();
      pcRef.current = null;
    };
  }, [callId, user]);

  const startCall = async () => {
    if (!pcRef.current || !processedStream || !user) return;
    processedStream.getTracks().forEach((t) => pcRef.current!.addTrack(t, processedStream));
    const offer = await createOffer(pcRef.current);
    const { send } = createCallChannel(callId!);
    await send({ type: "offer", from: user.id, callId, data: offer });
    toast("Calling...");
  };

  const joinCall = async () => {
    if (!pcRef.current || !processedStream) return;
    processedStream.getTracks().forEach((t) => pcRef.current!.addTrack(t, processedStream));
    toast("Ready to answer");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Call</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card p-2">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded-md" />
        </Card>
        <Card className="glass-card p-2">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-md" />
        </Card>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={startCall}>Start Call</Button>
        <Button variant="outline" onClick={joinCall}>Join</Button>
      </div>
    </main>
  );
}
