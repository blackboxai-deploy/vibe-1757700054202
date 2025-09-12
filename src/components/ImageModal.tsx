'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GeneratedImage } from '@/types/image';
import { ImageUtils } from '@/lib/image-utils';

interface ImageModalProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (imageId: string) => void;
}

export function ImageModal({ image, isOpen, onClose, onDelete }: ImageModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!image) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const filename = ImageUtils.createFilename(image);
      await ImageUtils.downloadImage(image.url, filename);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await ImageUtils.copyToClipboard(image.url);
      toast.success('Image URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await ImageUtils.copyToClipboard(image.prompt);
      toast.success('Prompt copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleShare = async () => {
    try {
      const shareText = ImageUtils.createShareableText(image);
      await ImageUtils.copyToClipboard(shareText);
      toast.success('Share text copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share text');
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this image?')) {
      onDelete(image.id);
      onClose();
      toast.success('Image deleted');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-left">Generated Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Image Display */}
          <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
            <img
              src={image.url}
              alt={image.prompt}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(90vh - 200px)' }}
            />
          </div>

          {/* Image Details Sidebar */}
          <div className="lg:w-80 space-y-4 overflow-y-auto">
            {/* Metadata */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{image.style}</Badge>
                <Badge variant="outline">{image.aspectRatio}</Badge>
                <Badge variant="outline">{image.quality}</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Generated {ImageUtils.formatTimestamp(image.timestamp)}
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Prompt</h4>
              <div className="text-sm bg-muted/50 p-3 rounded-md max-h-32 overflow-y-auto">
                {image.prompt}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPrompt}
                className="w-full"
              >
                Copy Prompt
              </Button>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Actions</h4>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="default"
                  size="sm"
                  className="w-full"
                >
                  {isDownloading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </div>
                  ) : (
                    'Download Image'
                  )}
                </Button>

                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Copy URL
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Copy Share Text
                </Button>

                {onDelete && (
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Delete Image
                  </Button>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-medium">Details</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Style:</span>
                  <span className="capitalize">{image.style.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aspect Ratio:</span>
                  <span>{image.aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span className="capitalize">{image.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-mono">{image.id.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Actions Bar */}
        <div className="lg:hidden flex gap-2 pt-4 border-t">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1"
            size="sm"
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
          <Button
            onClick={handleCopyPrompt}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Copy Prompt
          </Button>
          {onDelete && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
            >
              Delete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}