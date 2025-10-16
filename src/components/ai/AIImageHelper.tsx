'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImagePlus, Loader2, Copy, CheckCircle } from 'lucide-react'
import { generateImagePromptAction } from '@/app/actions/ai-actions'
import { toast } from 'sonner'

interface AIImageHelperProps {
  onPromptGenerated?: (prompt: string) => void
}

export function AIImageHelper({ onPromptGenerated }: AIImageHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [subject, setSubject] = useState('')
  const [style, setStyle] = useState<'professional' | 'fun' | 'educational' | 'festive'>(
    'professional'
  )
  const [context, setContext] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject for the image')
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateImagePromptAction({
        subject,
        style,
        context: context || undefined,
      })

      if (result.success && result.prompt) {
        setGeneratedPrompt(result.prompt)
        if (onPromptGenerated) {
          onPromptGenerated(result.prompt)
        }
        toast.success('Image prompt generated!')
      } else {
        toast.error(result.error || 'Failed to generate image prompt')
      }
    } catch (error) {
      console.error('Error generating image prompt:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      toast.success('Prompt copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSubject('')
    setContext('')
    setGeneratedPrompt('')
    setCopied(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <ImagePlus className="h-4 w-4" />
        AI Image Prompt
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              AI Image Prompt Generator
            </DialogTitle>
            <DialogDescription>
              Generate a detailed prompt for image generation services like DALL-E or Midjourney
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Subject Input */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Image Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Children participating in a science fair"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <Label>Image Style</Label>
              <Select
                value={style}
                onValueChange={(v: 'professional' | 'fun' | 'educational' | 'festive') =>
                  setStyle(v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="fun">Fun & Playful</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="festive">Festive & Celebratory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Context Input */}
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea
                id="context"
                placeholder="e.g., For a school event announcement, should show diversity and inclusivity"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>

            {/* Generate Button */}
            {!generatedPrompt && (
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Prompt...
                  </>
                ) : (
                  <>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Generate Image Prompt
                  </>
                )}
              </Button>
            )}

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated Prompt</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded-md border p-4 bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{generatedPrompt}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this prompt with DALL-E, Midjourney, or other AI image generation services
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {generatedPrompt && (
              <Button type="button" variant="outline" onClick={handleGenerate}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Generate New Prompt
              </Button>
            )}
            <Button type="button" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
