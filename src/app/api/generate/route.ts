import { NextRequest, NextResponse } from 'next/server';
import { AIClient } from '@/lib/ai-client';
import { GenerationRequest } from '@/types/image';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerationRequest = await request.json();
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate prompt
    const validation = AIClient.validatePrompt(body.prompt);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Set defaults for missing fields
    const generationRequest: GenerationRequest = {
      prompt: body.prompt,
      aspectRatio: body.aspectRatio || '1:1',
      style: body.style || 'realistic',
      quality: body.quality || 'high',
      systemPrompt: body.systemPrompt
    };

    // Generate image
    const result = await AIClient.generateImage(generationRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        processingTime: result.processingTime
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API Error:', error);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - image generation took too long';
      statusCode = 408;
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'Invalid request format';
      statusCode = 400;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}