import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Smartphone, 
  Video, 
  Settings, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export const OverlaySettings = () => {
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [autoDetection, setAutoDetection] = useState(true);
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    screenCapture: false,
    accessibility: false
  });

  const requestPermission = async (type: string) => {
    try {
      switch (type) {
        case "camera":
          await navigator.mediaDevices.getUserMedia({ video: true });
          setPermissions(prev => ({ ...prev, camera: true }));
          toast.success("Camera permission granted!");
          break;
        case "microphone":
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissions(prev => ({ ...prev, microphone: true }));
          toast.success("Microphone permission granted!");
          break;
        case "screenCapture":
          // @ts-ignore - getDisplayMedia exists
          await navigator.mediaDevices.getDisplayMedia({ video: true });
          setPermissions(prev => ({ ...prev, screenCapture: true }));
          toast.success("Screen capture permission granted!");
          break;
        case "accessibility":
          setPermissions(prev => ({ ...prev, accessibility: true }));
          toast.success("Accessibility permission simulated (requires system settings)");
          break;
      }
    } catch (error) {
      toast.error(`Failed to grant ${type} permission`);
    }
  };

  const permissionList = [
    {
      key: "camera",
      icon: Video,
      title: "Camera Access",
      description: "Required for video call filters",
      required: true
    },
    {
      key: "microphone", 
      icon: Video,
      title: "Microphone Access",
      description: "Optional for audio filters",
      required: false
    },
    {
      key: "screenCapture",
      icon: Monitor,
      title: "Screen Recording",
      description: "For desktop app overlay",
      required: true
    },
    {
      key: "accessibility",
      icon: Shield,
      title: "Overlay Permission",
      description: "System-level overlay access",
      required: true
    }
  ];

  const supportedApps = [
    { name: "Zoom", icon: Video, status: "supported" },
    { name: "Teams", icon: Video, status: "supported" },
    { name: "Discord", icon: Video, status: "supported" },
    { name: "WhatsApp", icon: Smartphone, status: "beta" },
    { name: "Skype", icon: Video, status: "supported" },
    { name: "Google Meet", icon: Video, status: "supported" }
  ];

  return (
    <Card className="glass-card p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Overlay Settings</h3>
          <div className="flex items-center gap-2">
            <Switch
              checked={overlayEnabled}
              onCheckedChange={setOverlayEnabled}
            />
            <span className="text-sm">Enable Overlay</span>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Required Permissions
          </h4>

          <div className="space-y-3">
            {permissionList.map((perm) => {
              const Icon = perm.icon;
              const granted = permissions[perm.key as keyof typeof permissions];
              
              return (
                <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{perm.title}</span>
                        {perm.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{perm.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {granted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => requestPermission(perm.key)}
                        className="btn-hero text-xs"
                      >
                        Grant
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto Detection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-detect Video Calls</h4>
              <p className="text-sm text-muted-foreground">
                Automatically apply filters when video apps are detected
              </p>
            </div>
            <Switch
              checked={autoDetection}
              onCheckedChange={setAutoDetection}
            />
          </div>
        </div>

        {/* Supported Apps */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Supported Applications</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {supportedApps.map((app) => {
              const Icon = app.icon;
              return (
                <div key={app.name} className="flex items-center gap-2 p-3 rounded-lg border border-border">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{app.name}</span>
                  <Badge 
                    variant={app.status === "supported" ? "default" : "secondary"}
                    className="ml-auto text-xs"
                  >
                    {app.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning */}
        {!overlayEnabled && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Overlay Disabled</p>
              <p className="text-sm text-muted-foreground">
                Enable overlay to use filters in video calls and other applications.
              </p>
            </div>
          </div>
        )}

        {/* Setup Guide */}
        <Button variant="outline" className="w-full btn-glass">
          <ExternalLink className="w-4 h-4 mr-2" />
          Setup Guide & Troubleshooting
        </Button>
      </div>
    </Card>
  );
};