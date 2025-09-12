import { GeneratedImage, AppSettings } from '@/types/image';

const STORAGE_KEYS = {
  IMAGES: 'ai-generator-images',
  SETTINGS: 'ai-generator-settings'
};

export class StorageManager {
  // Images management
  static saveImage(image: GeneratedImage): void {
    try {
      const existingImages = this.getImages();
      const updatedImages = [image, ...existingImages];
      
      // Keep only the latest 50 images to prevent storage bloat
      const limitedImages = updatedImages.slice(0, 50);
      
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(limitedImages));
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  }

  static getImages(): GeneratedImage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IMAGES);
      if (!stored) return [];
      
      const images = JSON.parse(stored);
      return Array.isArray(images) ? images : [];
    } catch (error) {
      console.error('Failed to load images:', error);
      return [];
    }
  }

  static deleteImage(imageId: string): void {
    try {
      const images = this.getImages();
      const filteredImages = images.filter(img => img.id !== imageId);
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(filteredImages));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  static clearAllImages(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.IMAGES);
    } catch (error) {
      console.error('Failed to clear images:', error);
    }
  }

  // Settings management
  static saveSettings(settings: Partial<AppSettings>): void {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) return this.getDefaultSettings();
      
      const settings = JSON.parse(stored);
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  private static getDefaultSettings(): AppSettings {
    return {
      systemPrompt: "Generate a high-quality image based on the following description. Focus on creating visually appealing, detailed, and professional-looking imagery.",
      defaultStyle: 'realistic',
      defaultAspectRatio: '1:1',
      defaultQuality: 'high',
      theme: 'system'
    };
  }

  // Utility functions
  static getStorageInfo(): { imagesCount: number; estimatedSize: string } {
    try {
      const images = this.getImages();
      const imagesJson = localStorage.getItem(STORAGE_KEYS.IMAGES) || '';
      const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS) || '';
      
      const totalBytes = new Blob([imagesJson + settingsJson]).size;
      const estimatedSize = this.formatBytes(totalBytes);
      
      return {
        imagesCount: images.length,
        estimatedSize
      };
    } catch (error) {
      return { imagesCount: 0, estimatedSize: '0 B' };
    }
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  static exportData(): string {
    try {
      const data = {
        images: this.getImages(),
        settings: this.getSettings(),
        exportDate: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  }

  static importData(jsonData: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.images && Array.isArray(data.images)) {
        localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(data.images));
      }
      
      if (data.settings && typeof data.settings === 'object') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid data format' };
    }
  }
}