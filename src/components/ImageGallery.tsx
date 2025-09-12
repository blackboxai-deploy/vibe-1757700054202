'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GeneratedImage } from '@/types/image';
import { ImageUtils } from '@/lib/image-utils';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
  onDeleteImage: (imageId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'prompt-az' | 'prompt-za';
type FilterOption = 'all' | 'realistic' | 'artistic' | 'cartoon' | 'abstract' | 'photography' | 'digital-art';

export function ImageGallery({ images, onImageClick, onDeleteImage }: ImageGalleryProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort images
  const processedImages = useMemo(() => {
    let filtered = images;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(image => 
        image.prompt.toLowerCase().includes(query) ||
        image.style.toLowerCase().includes(query)
      );
    }

    // Apply style filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(image => image.style === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'prompt-az':
          return a.prompt.localeCompare(b.prompt);
        case 'prompt-za':
          return b.prompt.localeCompare(a.prompt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, sortBy, filterBy, searchQuery]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.classList.add('loaded');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f82b8c2f-dfea-4919-ba41-84b981b5e01c.png`;
  };

  if (images.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                <div className="w-8 h-6 bg-muted-foreground/40 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No images yet</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Generate your first AI image using the form above. Your created images will appear here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search images by prompt or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="artistic">Artistic</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="digital-art">Digital Art</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="prompt-az">Prompt A-Z</SelectItem>
                  <SelectItem value="prompt-za">Prompt Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {processedImages.length} of {images.length} images
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {processedImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {processedImages.map((image) => (
            <Card 
              key={image.id} 
              className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => onImageClick(image)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover transition-opacity opacity-0 duration-300"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ 
                      opacity: '0',
                      transition: 'opacity 0.3s ease-in-out' 
                    }}
                    onLoadCapture={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '1';
                    }}
                  />
                  
                  {/* Overlay with badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {image.style.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                          {image.aspectRatio}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Loading placeholder */}
                  <div className="absolute inset-0 bg-muted animate-pulse" 
                       style={{ display: 'none' }} />
                </div>

                {/* Image Info */}
                <div className="p-3 space-y-2">
                  <p className="text-sm line-clamp-2 text-muted-foreground">
                    {image.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{ImageUtils.formatTimestamp(image.timestamp)}</span>
                    <span className="capitalize">{image.quality}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No images found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or filter criteria.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setFilterBy('all');
                }}
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}