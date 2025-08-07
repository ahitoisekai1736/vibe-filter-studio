import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, VideoOff, Settings, Download } from "lucide-react";
import { toast } from "sonner";

export const VideoPreview = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("none");

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsPlaying(true);
        toast.success("Camera connected successfully!");
      }
    } catch (error) {
      toast.error("Unable to access camera. Please check permissions.");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsPlaying(false);
    }
  };

  const toggleCamera = () => {
    if (isPlaying) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const applyFilter = (filter: string) => {
    setCurrentFilter(filter);
    toast.success(`${filter} filter applied!`);
  };

  const getFilterStyle = () => {
    switch (currentFilter) {
      case "vintage":
        return "sepia(100%) contrast(120%) brightness(90%)";
      case "cool":
        return "hue-rotate(180deg) saturate(120%)";
      case "warm":
        return "hue-rotate(-30deg) saturate(110%) brightness(110%)";
      case "dramatic":
        return "contrast(150%) brightness(90%) saturate(130%)";
      case "soft":
        return "blur(1px) brightness(110%) contrast(90%)";
      default:
        return "none";
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Live Preview</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCamera}
              className="btn-glass"
            >
              {isPlaying ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" className="btn-glass">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="btn-glass">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: getFilterStyle() }}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Camera not active</p>
            </div>
          )}
          
          {currentFilter !== "none" && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full">
              <span className="text-sm font-medium text-primary">{currentFilter}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { name: "none", label: "Original" },
            { name: "vintage", label: "Vintage" },
            { name: "cool", label: "Cool" },
            { name: "warm", label: "Warm" },
            { name: "dramatic", label: "Dramatic" },
            { name: "soft", label: "Soft" }
          ].map((filter) => (
            <Button
              key={filter.name}
              variant={currentFilter === filter.name ? "default" : "outline"}
              size="sm"
              onClick={() => applyFilter(filter.name)}
              className={currentFilter === filter.name ? "btn-hero text-xs" : "btn-glass text-xs"}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};