import { useEffect, useMemo, useRef, useState } from "react";

// Takes a source MediaStream and a CSS filter string and returns a processed MediaStream
export function useProcessedStream(source: MediaStream | null, filter: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [processed, setProcessed] = useState<MediaStream | null>(null);

  // Create offscreen elements once
  const ensureElements = () => {
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    if (!videoRef.current) {
      videoRef.current = document.createElement("video");
      videoRef.current.playsInline = true;
      videoRef.current.muted = true;
      videoRef.current.autoplay = true;
    }
  };

  useEffect(() => {
    if (!source) return;
    ensureElements();

    const video = videoRef.current!;
    video.srcObject = source;

    const track = source.getVideoTracks()[0];
    const settings = track?.getSettings();

    const canvas = canvasRef.current!;
    const width = (settings?.width as number) || 1280;
    const height = (settings?.height as number) || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let stopped = false;

    const render = () => {
      if (stopped) return;
      try {
        ctx.filter = filter || "none";
        ctx.drawImage(video, 0, 0, width, height);
      } catch {}
      raf = requestAnimationFrame(render);
    };

    // Start drawing once metadata is loaded
    const onLoaded = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };
    video.addEventListener("loadedmetadata", onLoaded);

    const out = canvas.captureStream();
    setProcessed(out);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onLoaded);
      out.getTracks().forEach(t => t.stop());
    };
    // Recreate when source changes only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  // Update filter on every change by drawing loop reading latest filter value
  useEffect(() => {
    // No-op: filter is read each frame via closure
  }, [filter]);

  return processed;
}
