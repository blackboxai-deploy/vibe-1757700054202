import { GenerationRequest, GenerationResponse } from '@/types/image';

const AI_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const CUSTOMER_ID = 'cus_S16jfiBUH2cc7P';
const AUTHORIZATION = 'Bearer xxx';

export class AIClient {
  private static readonly TIMEOUT = 5 * 60 * 1000; // 5 minutes

  static async generateImage(request: GenerationRequest): Promise<GenerationResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildImagePrompt(request);
      
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'customerId': CUSTOMER_ID,
          'Content-Type': 'application/json',
          'Authorization': AUTHORIZATION,
        },
        body: JSON.stringify({
          model: 'replicate/black-forest-labs/flux-1.1-pro',
          messages: [{
            role: 'user',
            content: prompt
          }]
        }),
        signal: AbortSignal.timeout(this.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      // Extract image URL from the response
      let imageUrl = '';
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        const content = data.choices[0].message.content;
        // Look for image URLs in the response
        const urlMatch = content.match(/https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp)/i);
        if (urlMatch) {
          imageUrl = urlMatch[0];
        } else {
          // If no direct URL found, the content might be the URL itself
          if (content.startsWith('http') && (content.includes('.jpg') || content.includes('.png') || content.includes('.webp'))) {
            imageUrl = content.trim();
          }
        }
      }

      if (!imageUrl) {
        throw new Error('No image URL found in response');
      }

      return {
        success: true,
        imageUrl,
        processingTime
      };

    } catch (error: any) {
      console.error('AI Image Generation Error:', error);
      
      let errorMessage = 'Failed to generate image';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private static buildImagePrompt(request: GenerationRequest): string {
    const { prompt, aspectRatio, style, quality, systemPrompt } = request;
    
    // Base system prompt
    const defaultSystemPrompt = "Generate a high-quality image based on the following description. Focus on creating visually appealing, detailed, and professional-looking imagery.";
    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;
    
    // Style modifiers
    const styleModifiers = {
      realistic: "photorealistic, highly detailed, professional photography",
      artistic: "artistic, creative, expressive, fine art style",
      cartoon: "cartoon style, animated, colorful, playful",
      abstract: "abstract art, creative interpretation, artistic expression",
      photography: "professional photography, sharp focus, excellent composition",
      'digital-art': "digital art, modern, clean, professional illustration"
    };

    // Quality modifiers
    const qualityModifiers = {
      standard: "good quality",
      high: "high quality, detailed",
      ultra: "ultra high quality, extremely detailed, masterpiece"
    };

    // Aspect ratio info (for context, not direct control)
    const aspectRatioContext = {
      '1:1': "square composition",
      '16:9': "landscape orientation, cinematic",
      '9:16': "portrait orientation, vertical",
      '4:3': "classic composition"
    };

    // Build the complete prompt
    const fullPrompt = [
      finalSystemPrompt,
      `Create an image: ${prompt}`,
      `Style: ${styleModifiers[style]}`,
      `Quality: ${qualityModifiers[quality]}`,
      `Composition: ${aspectRatioContext[aspectRatio]}`,
      "Ensure the image is visually striking and professionally crafted."
    ].join(' ');

    return fullPrompt;
  }

  static validatePrompt(prompt: string): { isValid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { isValid: false, error: 'Prompt cannot be empty' };
    }

    if (prompt.length < 3) {
      return { isValid: false, error: 'Prompt must be at least 3 characters long' };
    }

    if (prompt.length > 1000) {
      return { isValid: false, error: 'Prompt must be less than 1000 characters' };
    }

    // Check for potentially inappropriate content (basic filter)
    const inappropriatePatterns = [
      /\b(nude|naked|nsfw|explicit|sexual)\b/i,
      /\b(violence|gore|blood|death)\b/i
    ];

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(prompt)) {
        return { isValid: false, error: 'Prompt contains inappropriate content' };
      }
    }

    return { isValid: true };
  }
}