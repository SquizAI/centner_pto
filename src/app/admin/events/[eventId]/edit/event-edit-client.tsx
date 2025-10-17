'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateEvent, deleteEvent } from '@/app/actions/event-actions'
import { toast } from 'sonner'
import { Save, Trash2, ArrowLeft } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AIContentHelper } from '@/components/ai/AIContentHelper'
import { AIImageHelper } from '@/components/ai/AIImageHelper'
import { SocialMediaPostComposer } from '@/components/social-media/SocialMediaPostComposer'

interface EventEditClientProps {
  event: any
  rsvps: any[]
}

export function EventEditClient({ event, rsvps }: EventEditClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
    end_date: event.end_date ? new Date(event.end_date).toISOString().split('T')[0] : '',
    location: event.location || '',
    campus: event.campus || 'all',
    image_url: event.image_url || '',
    max_attendees: event.max_attendees?.toString() || '',
    event_type: event.event_type || '',
    status: event.status || 'draft',
    rsvp_required: event.rsvp_required || false,
    ticket_enabled: event.ticket_enabled || false,
    ticket_price: event.ticket_price?.toString() || '',
    ticket_quantity: event.ticket_quantity?.toString() || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
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
      status: formData.status as 'draft' | 'published' | 'cancelled',
      rsvp_required: formData.rsvp_required,
      ticket_enabled: formData.ticket_enabled,
      ticket_price: formData.ticket_price ? parseFloat(formData.ticket_price) : undefined,
      ticket_quantity: formData.ticket_quantity ? parseInt(formData.ticket_quantity) : undefined,
    }

    const result = await updateEvent(event.id, eventData)

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      toast.success('Event updated successfully')
      router.push('/admin/events')
      router.refresh()
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    const result = await deleteEvent(event.id)

    if (result.error) {
      toast.error(result.error)
      setIsDeleting(false)
    } else {
      toast.success('Event deleted successfully')
      router.push('/admin/events')
      router.refresh()
    }
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update event details and manage attendees</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the event</CardDescription>
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
            <CardDescription>Additional information and settings</CardDescription>
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
            <CardDescription>Control when and how the event is published</CardDescription>
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

        {/* Social Media Sharing */}
        {formData.status === 'published' && (
          <Card>
            <CardHeader>
              <CardTitle>Share Event</CardTitle>
              <CardDescription>Post this event to social media</CardDescription>
            </CardHeader>
            <CardContent>
              <SocialMediaPostComposer
                sourceContent={`${formData.title}\n\n${formData.description}\n\nDate: ${new Date(formData.event_date).toLocaleDateString()}\nLocation: ${formData.location || 'TBA'}`}
                sourceTitle={formData.title}
                sourceImage={formData.image_url}
                onPost={(result) => {
                  if (result.success) {
                    toast.success(`Event shared to ${result.platforms.join(' and ')}!`)
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* RSVPs Section */}
        {rsvps && rsvps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>RSVPs ({rsvps.length})</CardTitle>
              <CardDescription>People who have registered for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rsvps.map((rsvp: any) => (
                  <div
                    key={rsvp.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{rsvp.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">
                        {rsvp.profiles?.email || 'No email'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(rsvp.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isSubmitting || isDeleting}
                className="sm:order-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the event
                  {rsvps.length > 0 && ` and remove ${rsvps.length} RSVP(s)`}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting || isDeleting}
            className="sm:order-2"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="sm:order-3 sm:ml-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Update Event'}
          </Button>
        </div>
      </form>
    </div>
  )
}
