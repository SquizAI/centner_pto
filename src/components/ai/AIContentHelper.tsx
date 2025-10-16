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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { generateContentAction, improveContentAction } from '@/app/actions/ai-actions'
import { toast } from 'sonner'

interface AIContentHelperProps {
  onApply: (content: string) => void
  contentType: 'event' | 'news' | 'volunteer' | 'general'
  currentContent?: string
  context?: {
    title?: string
    description?: string
    campus?: string[]
    eventType?: string
  }
}

export function AIContentHelper({
  onApply,
  contentType,
  currentContent,
  context,
}: AIContentHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [contentLength, setContentLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [mode, setMode] = useState<'generate' | 'improve'>('generate')

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      let result

      if (mode === 'improve' && currentContent) {
        result = await improveContentAction(
          currentContent,
          customPrompt || 'Make this more engaging and professional'
        )
      } else {
        result = await generateContentAction({
          type: contentType,
          context,
          prompt: customPrompt || undefined,
          length: contentLength,
        })
      }

      if (result.success && result.content) {
        setGeneratedContent(result.content)
        toast.success('Content generated successfully!')
      } else {
        toast.error(result.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApply = () => {
    if (generatedContent) {
      onApply(generatedContent)
      setIsOpen(false)
      setGeneratedContent('')
      setCustomPrompt('')
      toast.success('Content applied!')
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setMode(currentContent ? 'improve' : 'generate')
          setIsOpen(true)
        }}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {currentContent ? 'Improve with AI' : 'Generate with AI'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Content Assistant
            </DialogTitle>
            <DialogDescription>
              {mode === 'improve'
                ? 'Let AI help improve your existing content'
                : 'Let AI help you create engaging content'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Mode Selection */}
            {currentContent && (
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(v: 'generate' | 'improve') => setMode(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generate">Generate New Content</SelectItem>
                    <SelectItem value="improve">Improve Existing Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Length Selection (only for generate mode) */}
            {mode === 'generate' && (
              <div className="space-y-2">
                <Label>Content Length</Label>
                <Select
                  value={contentLength}
                  onValueChange={(v: 'short' | 'medium' | 'long') => setContentLength(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (2-3 sentences)</SelectItem>
                    <SelectItem value="medium">Medium (1-2 paragraphs)</SelectItem>
                    <SelectItem value="long">Long (3-4 paragraphs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">
                {mode === 'improve' ? 'Improvement Instructions' : 'Custom Prompt'} (Optional)
              </Label>
              <Textarea
                id="prompt"
                placeholder={
                  mode === 'improve'
                    ? 'e.g., Make it more exciting and add a call to action'
                    : 'e.g., Emphasize the educational benefits and family-friendly atmosphere'
                }
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>

            {/* Generate Button */}
            {!generatedContent && (
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {mode === 'improve' ? 'Improve Content' : 'Generate Content'}
                  </>
                )}
              </Button>
            )}

            {/* Generated Content */}
            {generatedContent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated Content</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded-md border p-4 bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {generatedContent && (
              <Button type="button" onClick={handleApply}>
                Apply Content
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
