import { GeneratedImage } from '@/types/image';

export class ImageUtils {
  /**
   * Downloads an image from a URL to the user's device
   */
  static async downloadImage(imageUrl: string, filename?: string): Promise<void> {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      // Convert to blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `ai-generated-${Date.now()}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download image');
    }
  }

  /**
   * Copies image URL to clipboard
   */
  static async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Generates a unique ID for images
   */
  static generateImageId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validates if a URL points to an image
   */
  static isImageUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname) || 
             url.includes('image') || 
             url.includes('img');
    } catch {
      return false;
    }
  }

  /**
   * Creates a filename from image metadata
   */
  static createFilename(image: GeneratedImage): string {
    const timestamp = new Date(image.timestamp).toISOString().slice(0, 10);
    const promptSlug = image.prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30);
    
    return `ai-${timestamp}-${promptSlug}-${image.style}-${image.aspectRatio.replace(':', 'x')}.png`;
  }

  /**
   * Loads an image and returns its dimensions
   */
  static loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  }

  /**
   * Checks if image URL is accessible
   */
  static async checkImageAccessibility(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Converts aspect ratio string to number
   */
  static aspectRatioToNumber(aspectRatio: string): number {
    const [width, height] = aspectRatio.split(':').map(Number);
    return width / height;
  }

  /**
   * Gets CSS aspect ratio value for Tailwind classes
   */
  static getCssAspectRatio(aspectRatio: string): string {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      default: return 'aspect-square';
    }
  }

  /**
   * Formats file size from bytes
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Formats timestamp to readable date
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Creates a shareable link for the image
   */
  static createShareableText(image: GeneratedImage): string {
    return `Check out this AI-generated image! 🎨\n\nPrompt: "${image.prompt}"\nStyle: ${image.style}\nGenerated: ${this.formatTimestamp(image.timestamp)}\n\n${image.url}`;
  }

  /**
   * Preloads an image to improve performance
   */
  static preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });
  }
}