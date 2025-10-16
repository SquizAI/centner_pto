'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createEvent } from '@/app/actions/event-actions'
import { toast } from 'sonner'
import { Save, Eye } from 'lucide-react'
import { AIContentHelper } from '@/components/ai/AIContentHelper'
import { AIImageHelper } from '@/components/ai/AIImageHelper'

export function EventFormClient() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    campus: 'all' as 'preschool' | 'elementary' | 'middle-high' | 'all',
    image_url: '',
    max_attendees: '',
    event_type: '',
    status: 'draft' as 'draft' | 'published' | 'cancelled',
  })

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault()
    setIsSubmitting(true)

    const eventData = {
      title: formData.title,
      description: formData.description || undefined,
      event_date: formData.event_date,
      end_date: formData.end_date || undefined,
      location: formData.location || undefined,
      campus: formData.campus,
      image_url: formData.image_url || undefined,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      status: asDraft ? 'draft' as const : formData.status,
      rsvp_required: false,
    }

    const result = await createEvent(eventData)

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      toast.success(asDraft ? 'Event saved as draft' : 'Event created successfully')
      router.push('/admin/events')
    }
  }

  const handleChange = (
    field: string,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Essential details about the event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Fall Festival 2024"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <AIContentHelper
                onApply={(content) => handleChange('description', content)}
                contentType="event"
                currentContent={formData.description}
                context={{
                  title: formData.title,
                  campus: [formData.campus],
                  eventType: formData.event_type,
                }}
              />
            </div>
            <Textarea
              id="description"
              placeholder="Describe the event..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleChange('event_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Main Campus Auditorium"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Additional information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campus">Campus *</Label>
              <Select
                value={formData.campus}
                onValueChange={(value) => handleChange('campus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  <SelectItem value="preschool">Preschool</SelectItem>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="middle-high">Middle & High School</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Input
                id="event_type"
                placeholder="e.g., Fundraiser, Social, Meeting"
                value={formData.event_type}
                onChange={(e) => handleChange('event_type', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_attendees">Max Attendees</Label>
            <Input
              id="max_attendees"
              type="number"
              min="1"
              placeholder="Leave empty for unlimited"
              value={formData.max_attendees}
              onChange={(e) => handleChange('max_attendees', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="image_url">Event Image URL</Label>
              <AIImageHelper />
            </div>
            <Input
              id="image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste a URL to an event image (recommended: 1200x630px). Use AI Image Prompt for generating images with DALL-E or similar services.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Options</CardTitle>
          <CardDescription>
            Control when and how the event is published
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'published' | 'cancelled') =>
                handleChange('status', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isSubmitting}
          className="sm:order-2"
        >
          <Save className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="sm:order-3 sm:ml-auto"
        >
          {formData.status === 'published' ? (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Create & Publish
            </>
          ) : (
            'Create Event'
          )}
        </Button>
      </div>
    </form>
  )
}
