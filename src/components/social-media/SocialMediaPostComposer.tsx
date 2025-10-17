'use client'

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Share2,
  Instagram,
  Facebook,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react'
import { generateSocialPostAction } from '@/app/actions/ai-actions'
import { toast } from 'sonner'
import Image from 'next/image'

interface SocialMediaAccount {
  id: string
  platform: 'instagram' | 'facebook'
  username: string
  connected: boolean
}

interface SocialMediaPostComposerProps {
  sourceContent: string
  sourceTitle?: string
  sourceImage?: string
  onPost?: (result: { success: boolean; platforms: string[] }) => void
}

export function SocialMediaPostComposer({
  sourceContent,
  sourceTitle,
  sourceImage,
  onPost,
}: SocialMediaPostComposerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scheduleDate, setScheduleDate] = useState('')
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([])
  const [postStatus, setPostStatus] = useState<{
    platform: string
    status: 'pending' | 'success' | 'error'
    message?: string
  }[]>([])

  useEffect(() => {
    // Load connected social media accounts
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    // TODO: Implement API call to load connected accounts
    // For now, using mock data
    setAccounts([
      {
        id: '1',
        platform: 'instagram',
        username: '@centneracademy',
        connected: true,
      },
      {
        id: '2',
        platform: 'facebook',
        username: 'Centner Academy PTO',
        connected: true,
      },
    ])
  }

  const handleGeneratePost = async (tone: 'professional' | 'friendly' | 'excited' = 'friendly') => {
    setIsGenerating(true)
    try {
      // Determine platform for generation
      const platform = selectedPlatforms.length === 1
        ? selectedPlatforms[0] as 'instagram' | 'facebook'
        : 'both'

      const result = await generateSocialPostAction(sourceContent, platform, tone)

      if (result.success && result.post) {
        setCaption(result.post.caption)
        setHashtags(result.post.hashtags)
        toast.success('Post generated successfully!')
      } else {
        toast.error(result.error || 'Failed to generate post')
      }
    } catch (error) {
      console.error('Error generating post:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePost = async () => {
    if (!caption.trim()) {
      toast.error('Please enter a caption')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    setIsPosting(true)
    const results: typeof postStatus = []

    for (const platform of selectedPlatforms) {
      results.push({
        platform,
        status: 'pending',
      })
    }
    setPostStatus(results)

    // TODO: Implement actual posting logic
    // For now, simulate posting
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const finalResults = results.map((r) => ({
      ...r,
      status: 'success' as const,
      message: 'Posted successfully',
    }))

    setPostStatus(finalResults)
    setIsPosting(false)

    if (onPost) {
      onPost({
        success: true,
        platforms: selectedPlatforms,
      })
    }

    toast.success(`Posted to ${selectedPlatforms.join(' and ')}!`)
    setTimeout(() => {
      setIsOpen(false)
      resetForm()
    }, 2000)
  }

  const resetForm = () => {
    setCaption('')
    setHashtags([])
    setSelectedPlatforms([])
    setScheduleDate('')
    setPostStatus([])
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    )
  }

  const connectedAccounts = accounts.filter((a) => a.connected)
  const fullCaption = caption + (hashtags.length > 0 ? '\n\n' + hashtags.map(h => `#${h}`).join(' ') : '')

  return (
    <>
      <Button
        variant="default"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        disabled={connectedAccounts.length === 0}
      >
        <Share2 className="h-4 w-4" />
        Post to Social Media
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Post to Social Media
            </DialogTitle>
            <DialogDescription>
              {sourceTitle && `Share "${sourceTitle}" on social media`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Select Platforms */}
            <div className="space-y-3">
              <Label>Select Platforms</Label>
              <div className="grid grid-cols-2 gap-3">
                {connectedAccounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPlatforms.includes(account.id)
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => togglePlatform(account.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedPlatforms.includes(account.id)}
                        onCheckedChange={() => togglePlatform(account.id)}
                      />
                      {account.platform === 'instagram' ? (
                        <Instagram className="h-5 w-5 text-pink-600" />
                      ) : (
                        <Facebook className="h-5 w-5 text-blue-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium capitalize">{account.platform}</p>
                        <p className="text-xs text-muted-foreground">{account.username}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* AI Generate Options */}
            <div className="space-y-2">
              <Label>Generate with AI</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGeneratePost('friendly')}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Friendly
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGeneratePost('professional')}
                  disabled={isGenerating}
                >
                  Professional
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGeneratePost('excited')}
                  disabled={isGenerating}
                >
                  Excited
                </Button>
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {caption.length} characters
                {selectedPlatforms.includes('instagram') && caption.length > 2200 && (
                  <span className="text-destructive ml-2">
                    (Instagram limit: 2200 characters)
                  </span>
                )}
              </p>
            </div>

            {/* Hashtags */}
            {hashtags.length > 0 && (
              <div className="space-y-2">
                <Label>Hashtags</Label>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Image Preview */}
            {sourceImage && (
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={sourceImage}
                    alt="Post image"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Preview */}
            {caption && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{fullCaption}</p>
                </Card>
              </div>
            )}

            {/* Post Status */}
            {postStatus.length > 0 && (
              <div className="space-y-2">
                {postStatus.map((status) => (
                  <div
                    key={status.platform}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted"
                  >
                    {status.status === 'pending' && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {status.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {status.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-sm capitalize">{status.platform}</span>
                    {status.message && (
                      <span className="text-xs text-muted-foreground ml-auto">{status.message}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePost}
              disabled={isPosting || !caption.trim() || selectedPlatforms.length === 0}
            >
              {isPosting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Post Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
