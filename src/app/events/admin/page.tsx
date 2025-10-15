'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Calendar, MapPin, Users, DollarSign, Ticket, ArrowLeft } from 'lucide-react'
import AIImageGenerator from '@/components/admin/AIImageGenerator'
import { Event } from '@/types/events'
import Image from 'next/image'
import Link from 'next/link'

export default function EventsAdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    campus: 'all' as 'preschool' | 'elementary' | 'middle-high' | 'all',
    image_url: '',
    max_attendees: '',
    rsvp_required: true,
    status: 'draft' as 'draft' | 'published' | 'cancelled',
    ticket_enabled: false,
    ticket_price: '',
    ticket_quantity: '',
    ticket_sales_start: '',
    ticket_sales_end: '',
    requires_approval: false,
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageGenerated = (imageUrl: string) => {
    handleInputChange('image_url', imageUrl)
    toast.success('Image added to event!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('You must be logged in to create events')
        return
      }

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date,
        end_date: formData.end_date || null,
        location: formData.location || null,
        campus: formData.campus,
        image_url: formData.image_url || null,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        rsvp_required: formData.rsvp_required,
        status: formData.status,
        ticket_enabled: formData.ticket_enabled,
        ticket_price: formData.ticket_price ? parseFloat(formData.ticket_price) : null,
        ticket_quantity: formData.ticket_quantity ? parseInt(formData.ticket_quantity) : null,
        ticket_sales_start: formData.ticket_sales_start || null,
        ticket_sales_end: formData.ticket_sales_end || null,
        requires_approval: formData.requires_approval,
        created_by: user.id,
      }

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error
        toast.success('Event updated successfully!')
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([eventData])

        if (error) throw error
        toast.success('Event created successfully!')
      }

      // Reset form and reload events
      resetForm()
      loadEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date.split('T')[0],
      end_date: event.end_date ? event.end_date.split('T')[0] : '',
      location: event.location || '',
      campus: event.campus,
      image_url: event.image_url || '',
      max_attendees: event.max_attendees?.toString() || '',
      rsvp_required: event.rsvp_required,
      status: event.status,
      ticket_enabled: event.ticket_enabled,
      ticket_price: event.ticket_price?.toString() || '',
      ticket_quantity: event.ticket_quantity?.toString() || '',
      ticket_sales_start: event.ticket_sales_start ? event.ticket_sales_start.split('T')[0] : '',
      ticket_sales_end: event.ticket_sales_end ? event.ticket_sales_end.split('T')[0] : '',
      requires_approval: event.requires_approval,
    })
    setShowForm(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      toast.success('Event deleted successfully')
      loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const resetForm = () => {
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      event_date: '',
      end_date: '',
      location: '',
      campus: 'all',
      image_url: '',
      max_attendees: '',
      rsvp_required: true,
      status: 'draft',
      ticket_enabled: false,
      ticket_price: '',
      ticket_quantity: '',
      ticket_sales_start: '',
      ticket_sales_end: '',
      requires_approval: false,
    })
    setShowForm(false)
  }

  // Generate smart prompt based on event details
  const generatePromptSuggestion = () => {
    if (!formData.title) return ''

    const campusDescriptions = {
      preschool: 'young children and preschoolers',
      elementary: 'elementary school students',
      'middle-high': 'middle and high school students',
      all: 'diverse group of students and families'
    }

    return `${formData.title} event with ${campusDescriptions[formData.campus]}, ${formData.location || 'school setting'}, professional event photography style`
  }

  if (!showForm) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Events</h1>
            <p className="text-muted-foreground mt-1">Create and manage school events</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <Button onClick={() => setShowForm(true)}>Create New Event</Button>
          </div>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No events yet. Create your first event!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {event.image_url && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(event.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.campus}
                        </span>
                        {event.ticket_enabled && (
                          <span className="flex items-center gap-1">
                            <Ticket className="w-4 h-4" />
                            ${event.ticket_price} • {event.tickets_sold}/{event.ticket_quantity} sold
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.status === 'published' ? 'bg-green-100 text-green-700' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </h1>
        <Button variant="outline" onClick={resetForm}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential event details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Spring Festival"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campus">Campus *</Label>
                <Select
                  value={formData.campus}
                  onValueChange={(value) => handleInputChange('campus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campuses</SelectItem>
                    <SelectItem value="preschool">Preschool</SelectItem>
                    <SelectItem value="elementary">Elementary</SelectItem>
                    <SelectItem value="middle-high">Middle & High School</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date">Start Date & Time *</Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., School Gymnasium"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Image Generator */}
        <AIImageGenerator
          title="Generate Event Image"
          description="Use AI to create a custom image for this event"
          onImageGenerated={handleImageGenerated}
          defaultPrompt={generatePromptSuggestion()}
          category="event"
        />

        {/* Image Preview */}
        {formData.image_url && (
          <Card>
            <CardHeader>
              <CardTitle>Current Event Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={formData.image_url}
                  alt="Event image"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => handleInputChange('image_url', '')}
              >
                Remove Image
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Attendance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendance Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>RSVP Required</Label>
                <p className="text-sm text-muted-foreground">
                  Attendees must RSVP to attend this event
                </p>
              </div>
              <Switch
                checked={formData.rsvp_required}
                onCheckedChange={(checked) => handleInputChange('rsvp_required', checked)}
              />
            </div>

            <div>
              <Label htmlFor="max_attendees">Maximum Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requires Approval</Label>
                <p className="text-sm text-muted-foreground">
                  RSVPs must be approved by admin
                </p>
              </div>
              <Switch
                checked={formData.requires_approval}
                onCheckedChange={(checked) => handleInputChange('requires_approval', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ticketing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Ticketing (Optional)
            </CardTitle>
            <CardDescription>
              Enable paid tickets for this event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Ticket Sales</Label>
                <p className="text-sm text-muted-foreground">
                  Sell tickets through Stripe
                </p>
              </div>
              <Switch
                checked={formData.ticket_enabled}
                onCheckedChange={(checked) => handleInputChange('ticket_enabled', checked)}
              />
            </div>

            {formData.ticket_enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticket_price">Ticket Price ($) *</Label>
                    <Input
                      id="ticket_price"
                      type="number"
                      step="0.01"
                      value={formData.ticket_price}
                      onChange={(e) => handleInputChange('ticket_price', e.target.value)}
                      placeholder="0.00"
                      required={formData.ticket_enabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ticket_quantity">Total Tickets *</Label>
                    <Input
                      id="ticket_quantity"
                      type="number"
                      value={formData.ticket_quantity}
                      onChange={(e) => handleInputChange('ticket_quantity', e.target.value)}
                      placeholder="100"
                      required={formData.ticket_enabled}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticket_sales_start">Sales Start Date</Label>
                    <Input
                      id="ticket_sales_start"
                      type="datetime-local"
                      value={formData.ticket_sales_start}
                      onChange={(e) => handleInputChange('ticket_sales_start', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ticket_sales_end">Sales End Date</Label>
                    <Input
                      id="ticket_sales_end"
                      type="datetime-local"
                      value={formData.ticket_sales_end}
                      onChange={(e) => handleInputChange('ticket_sales_end', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  )
}
