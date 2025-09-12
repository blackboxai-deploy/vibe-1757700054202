'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { GenerationForm } from './GenerationForm';
import { ImageGallery } from './ImageGallery';
import { ImageModal } from './ImageModal';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GeneratedImage, GenerationRequest } from '@/types/image';
import { StorageManager } from '@/lib/storage';
import { ImageUtils } from '@/lib/image-utils';

export function ImageGenerator() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  // Load data from storage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedImages = StorageManager.getImages();
        const settings = StorageManager.getSettings();
        setImages(storedImages);
        setSystemPrompt(settings.systemPrompt);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load stored images');
      }
    };

    loadData();
  }, []);

  // Save system prompt changes
  useEffect(() => {
    if (systemPrompt !== '') {
      StorageManager.saveSettings({ systemPrompt });
    }
  }, [systemPrompt]);

  const handleGenerate = useCallback(async (request: GenerationRequest) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        // Create new image object
        const newImage: GeneratedImage = {
          id: ImageUtils.generateImageId(),
          url: data.imageUrl,
          prompt: request.prompt,
          timestamp: Date.now(),
          aspectRatio: request.aspectRatio,
          style: request.style,
          quality: request.quality,
        };

        // Add to state and storage
        setImages(prev => [newImage, ...prev]);
        StorageManager.saveImage(newImage);

        toast.success(`Image generated successfully! ${data.processingTime ? `(${(data.processingTime / 1000).toFixed(1)}s)` : ''}`);
        
        // Auto-open the newly generated image
        setSelectedImage(newImage);
        setIsModalOpen(true);
        
      } else {
        throw new Error(data.error || 'Generation failed');
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      
      let errorMessage = 'Failed to generate image';
      
      if (error.message?.includes('timeout') || error.message?.includes('408')) {
        errorMessage = 'Generation timed out. The AI service may be busy - please try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleImageClick = useCallback((image: GeneratedImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  }, []);

  const handleDeleteImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    StorageManager.deleteImage(imageId);
    toast.success('Image deleted');
  }, []);

  const handleClearAll = useCallback(() => {
    if (images.length === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete all ${images.length} images? This action cannot be undone.`);
    if (confirmed) {
      setImages([]);
      StorageManager.clearAllImages();
      toast.success('All images deleted');
    }
  }, [images.length]);

  const handleExportData = useCallback(() => {
    try {
      const dataJson = StorageManager.exportData();
      const blob = new Blob([dataJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-images-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  }, []);

  const storageInfo = StorageManager.getStorageInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Image Generator</h1>
              <p className="text-muted-foreground text-sm">Create stunning images with artificial intelligence</p>
            </div>
            <div className="flex items-center gap-3">
              {images.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{storageInfo.imagesCount} images</span>
                  <span>•</span>
                  <span>{storageInfo.estimatedSize}</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Generation Form */}
        <GenerationForm
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
        />

        {/* Management Actions */}
        {images.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium">Your Generated Images</h3>
                  <p className="text-sm text-muted-foreground">
                    {images.length} images stored locally ({storageInfo.estimatedSize})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                  >
                    Export Data
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Gallery */}
        <ImageGallery
          images={images}
          onImageClick={handleImageClick}
          onDeleteImage={handleDeleteImage}
        />

        {/* Image Modal */}
        <ImageModal
          image={selectedImage}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDeleteImage}
        />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>AI Image Generator • Powered by advanced AI technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}