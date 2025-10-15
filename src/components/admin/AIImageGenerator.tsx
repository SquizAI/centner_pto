'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2, Info, Lightbulb, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface AIImageGeneratorProps {
  title: string
  description?: string
  onImageGenerated: (imageUrl: string) => void
  defaultPrompt?: string
  category?: 'event' | 'news' | 'volunteer' | 'general'
}

const promptTips = {
  event: {
    title: 'Event Image Tips',
    tips: [
      'Include the event type (party, meeting, fundraiser, sports)',
      'Mention the setting (school, outdoor, gymnasium, auditorium)',
      'Specify the mood (fun, energetic, celebratory, professional)',
      'Add visual elements (balloons, decorations, people, activities)',
    ],
    example: 'Vibrant school fundraiser with colorful balloons, happy families, bake sale table, outdoor setting, sunny day, professional photography style',
  },
  news: {
    title: 'News Article Tips',
    tips: [
      'Focus on the story theme (achievement, announcement, community)',
      'Include relevant imagery (students, teachers, school building)',
      'Specify the tone (inspiring, informative, celebratory)',
      'Add contextual elements that support the story',
    ],
    example: 'Inspiring school achievement photo, students celebrating, graduation caps in air, diverse group, joyful expressions, professional news style',
  },
  volunteer: {
    title: 'Volunteer Opportunity Tips',
    tips: [
      'Show the activity type (organizing, helping, teaching)',
      'Include people working together (teamwork, collaboration)',
      'Specify the environment (classroom, outdoor, event space)',
      'Convey a helpful and welcoming atmosphere',
    ],
    example: 'Friendly volunteers organizing school event, diverse group working together, colorful materials, indoor classroom, warm lighting, professional photo',
  },
  general: {
    title: 'Image Generation Tips',
    tips: [
      'Be specific and descriptive',
      'Mention colors, mood, and setting',
      'Include what you want to see',
      'Specify the style (photo, illustration, modern, vibrant)',
    ],
    example: 'Modern school community event, diverse families enjoying activities, colorful setting, professional photography style',
  },
}

export default function AIImageGenerator({
  title,
  description,
  onImageGenerated,
  defaultPrompt = '',
  category = 'general',
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTips, setShowTips] = useState(false)

  const tips = promptTips[category]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      setGeneratedImage(data.imageUrl)
      toast.success('Image generated successfully!')
    } catch (error) {
      console.error('Error generating image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  const handleUseImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage)
      toast.success('Image added!')
      setGeneratedImage(null)
      setPrompt('')
    }
  }

  const useExamplePrompt = () => {
    setPrompt(tips.example)
    toast.success('Example prompt loaded!')
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTips(!showTips)}
            className="text-muted-foreground"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            {showTips ? 'Hide' : 'Show'} Tips
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tips Panel */}
        {showTips && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h4 className="font-semibold text-blue-900">{tips.title}</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  {tips.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={useExamplePrompt}
                    className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Use Example Prompt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="flex items-center gap-2">
            Image Description
            <span className="text-xs text-muted-foreground font-normal">
              (Be specific and descriptive)
            </span>
          </Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="space-y-3">
            <Label>Generated Image</Label>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
              <Image
                src={generatedImage}
                alt="Generated image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUseImage} className="flex-1">
                <ImageIcon className="w-4 h-4 mr-2" />
                Use This Image
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedImage(null)}
              >
                Discard
              </Button>
            </div>
          </div>
        )}

        {/* Generate Button */}
        {!generatedImage && (
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image with AI
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Powered by Google Gemini AI • Images generated are royalty-free
        </p>
      </CardContent>
    </Card>
  )
}
