'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GenerationRequest } from '@/types/image';

interface GenerationFormProps {
  onGenerate: (request: GenerationRequest) => void;
  isGenerating: boolean;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
}

export function GenerationForm({ 
  onGenerate, 
  isGenerating, 
  systemPrompt, 
  onSystemPromptChange 
}: GenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<GenerationRequest['aspectRatio']>('1:1');
  const [style, setStyle] = useState<GenerationRequest['style']>('realistic');
  const [quality, setQuality] = useState<GenerationRequest['quality']>('high');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    onGenerate({
      prompt: prompt.trim(),
      aspectRatio,
      style,
      quality,
      systemPrompt
    });
  };

  const styleOptions = [
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
    { value: 'artistic', label: 'Artistic', description: 'Creative and expressive' },
    { value: 'cartoon', label: 'Cartoon', description: 'Animated and playful' },
    { value: 'abstract', label: 'Abstract', description: 'Creative interpretation' },
    { value: 'photography', label: 'Photography', description: 'Professional photos' },
    { value: 'digital-art', label: 'Digital Art', description: 'Modern illustrations' }
  ];

  const aspectRatioOptions = [
    { value: '1:1', label: 'Square (1:1)', description: 'Perfect for social media' },
    { value: '16:9', label: 'Landscape (16:9)', description: 'Widescreen format' },
    { value: '9:16', label: 'Portrait (9:16)', description: 'Mobile-friendly' },
    { value: '4:3', label: 'Classic (4:3)', description: 'Traditional format' }
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard', description: 'Good quality, faster' },
    { value: 'high', label: 'High', description: 'Better detail' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Generate AI Image
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Generating...
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate... (e.g., 'A serene mountain landscape at sunset with a calm lake reflecting the orange sky')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={1000}
              disabled={isGenerating}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {prompt.length}/1000 characters
            </div>
          </div>

          {/* Basic Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={(value: GenerationRequest['style']) => setStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value: GenerationRequest['aspectRatio']) => setAspectRatio(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatioOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <Select value={quality} onValueChange={(value: GenerationRequest['quality']) => setQuality(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" type="button" className="w-full justify-between p-0 h-auto">
                <span>Advanced Settings</span>
                <div className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-current transform rotate-45" />
                  </div>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Custom system prompt to guide the AI's behavior..."
                  value={systemPrompt}
                  onChange={(e) => onSystemPromptChange(e.target.value)}
                  rows={3}
                  disabled={isGenerating}
                  className="resize-none text-sm"
                />
                <div className="text-xs text-muted-foreground">
                  This prompt guides how the AI interprets your request. Leave blank for default behavior.
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Generate Button */}
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-medium"
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Generating Image...
              </div>
            ) : (
              'Generate Image'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}