import { VideoPreview } from "@/components/VideoPreview";
import { ColorGrading } from "@/components/ColorGrading";
import { FilterGallery } from "@/components/FilterGallery";
import { OverlaySettings } from "@/components/OverlaySettings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Video, Palette, Sparkles, Settings, Crown, Download } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const features = [
    {
      icon: Video,
      title: "Real-time Filters",
      description: "Apply stunning filters to video calls instantly"
    },
    {
      icon: Palette,
      title: "Color Grading",
      description: "Professional color correction tools"
    },
    {
      icon: Sparkles,
      title: "AR Effects",
      description: "Advanced augmented reality filters"
    },
    {
      icon: Settings,
      title: "System Overlay",
      description: "Works with any video application"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              Professional Video Filter Studio
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              VibeFilter Studio
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Transform your video calls with professional-grade filters and color grading. 
              Compatible with Zoom, Teams, Discord, and more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-hero text-lg px-8 py-4">
                <Download className="w-5 h-5 mr-2" />
                Download for PC
              </Button>
              <Button variant="outline" className="btn-glass text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Try Web Version
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="glass-card p-6 text-center space-y-4 filter-card">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Main App Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <VideoPreview />
            <FilterGallery />
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <ColorGrading />
            <OverlaySettings />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <Card className="glass-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Video Experience?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of content creators and professionals using VibeFilter Studio 
            to enhance their video presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-hero text-lg px-8 py-4">
              Get Started Free
            </Button>
            <Button variant="outline" className="btn-glass text-lg px-8 py-4">
              View Pricing
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Index;
