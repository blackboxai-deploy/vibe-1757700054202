export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio: string;
  style: string;
  quality: string;
}

export interface GenerationRequest {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  style: 'realistic' | 'artistic' | 'cartoon' | 'abstract' | 'photography' | 'digital-art';
  quality: 'standard' | 'high' | 'ultra';
  systemPrompt?: string;
}

export interface GenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  processingTime?: number;
}

export interface AppSettings {
  systemPrompt: string;
  defaultStyle: string;
  defaultAspectRatio: string;
  defaultQuality: string;
  theme: 'light' | 'dark' | 'system';
}