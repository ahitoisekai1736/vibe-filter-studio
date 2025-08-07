import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Heart } from "lucide-react";
import { toast } from "sonner";

const filterCategories = [
  "All",
  "Beauty", 
  "Artistic",
  "Vintage",
  "Professional",
  "Fun",
  "AR Effects"
];

const filters = [
  {
    id: 1,
    name: "Smooth Skin",
    category: "Beauty",
    premium: false,
    rating: 4.8,
    downloads: "12K",
    preview: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Golden Hour",
    category: "Professional",
    premium: true,
    rating: 4.9,
    downloads: "8.5K",
    preview: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop"
  },
  {
    id: 3,
    name: "Neon Glow",
    category: "Artistic",
    premium: false,
    rating: 4.7,
    downloads: "15K",
    preview: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=150&fit=crop"
  },
  {
    id: 4,
    name: "Film Grain",
    category: "Vintage",
    premium: false,
    rating: 4.6,
    downloads: "9.2K",
    preview: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=150&h=150&fit=crop"
  },
  {
    id: 5,
    name: "Rainbow Lens",
    category: "Fun",
    premium: true,
    rating: 4.8,
    downloads: "6.7K",
    preview: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=150&fit=crop"
  },
  {
    id: 6,
    name: "Cat Ears AR",
    category: "AR Effects",
    premium: false,
    rating: 4.5,
    downloads: "20K",
    preview: "https://images.unsplash.com/photo-1606914469633-e5e4c9fb8fdd?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 7,
    name: "Soft Focus",
    category: "Beauty",
    premium: false,
    rating: 4.7,
    downloads: "11K",
    preview: "https://images.unsplash.com/photo-1494790108755-2616c3906a50?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 8,
    name: "Chrome Effect",
    category: "Artistic",
    premium: true,
    rating: 4.9,
    downloads: "4.2K",
    preview: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=150&h=150&fit=crop"
  }
];

export const FilterGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredFilters = filters.filter(filter => 
    selectedCategory === "All" || filter.category === selectedCategory
  );

  const toggleFavorite = (filterId: number) => {
    setFavorites(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const downloadFilter = (filterName: string) => {
    toast.success(`${filterName} filter downloaded!`);
  };

  return (
    <Card className="glass-card p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Filter Gallery</h3>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {filteredFilters.length} filters
          </Badge>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {filterCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "btn-hero text-xs" : "btn-glass text-xs"}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFilters.map((filter) => (
            <div key={filter.id} className="filter-card glass-card p-3 space-y-3">
              <div className="relative">
                <img
                  src={filter.preview}
                  alt={filter.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                {filter.premium && (
                  <Badge className="absolute top-2 left-2 bg-gradient-primary text-xs">
                    PRO
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 p-1 h-auto"
                  onClick={() => toggleFavorite(filter.id)}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favorites.includes(filter.id) 
                        ? "fill-red-500 text-red-500" 
                        : "text-white"
                    }`} 
                  />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{filter.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                      {filter.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {filter.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {filter.downloads}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full btn-hero text-xs"
                  onClick={() => downloadFilter(filter.name)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};