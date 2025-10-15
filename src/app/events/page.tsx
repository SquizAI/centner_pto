'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-styles.css'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, MapPin, Users, Clock, Share2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const localizer = momentLocalizer(moment)

interface Event {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  location?: string
  campus?: string
  max_attendees?: number
  rsvp_count?: number
  image_url?: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    email: '',
    phone: '',
    attendees: 1,
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          event_date,
          end_date,
          location,
          campus,
          max_attendees,
          current_attendees,
          image_url
        `)
        .eq('status', 'published')
        .order('event_date', { ascending: true })

      if (error) throw error

      const formattedEvents: Event[] = (data || []).map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(event.event_date),
        end: new Date(event.end_date || event.event_date),
        location: event.location,
        campus: event.campus?.[0] || 'all',
        max_attendees: event.max_attendees,
        rsvp_count: event.current_attendees || 0,
        image_url: event.image_url,
      }))

      setEvents(formattedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const eventStyleGetter = (event: Event) => {
    const campusColors: { [key: string]: string } = {
      preschool: 'hsl(var(--preschool))',
      elementary: 'hsl(var(--elementary))',
      'middle-high': 'hsl(var(--middle-high))',
    }

    return {
      style: {
        backgroundColor: event.campus ? campusColors[event.campus] : 'hsl(var(--primary))',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0',
        display: 'block',
      },
    }
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
  }

  const handleRSVP = async () => {
    if (!selectedEvent) return

    // Validate form
    if (!rsvpForm.name || !rsvpForm.email) {
      toast.error('Please fill in required fields')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      // Note: Current schema requires user_id (auth), but for now we'll store guest info in notes
      const guestInfo = `Name: ${rsvpForm.name}, Email: ${rsvpForm.email}${rsvpForm.phone ? `, Phone: ${rsvpForm.phone}` : ''}`
      const fullNotes = rsvpForm.notes ? `${guestInfo}\n\n${rsvpForm.notes}` : guestInfo

      const { error } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: selectedEvent.id,
          user_id: null, // Will be populated once auth is implemented
          status: 'confirmed',
          guests_count: rsvpForm.attendees,
          notes: fullNotes
        })

      if (error) throw error

      toast.success('RSVP submitted successfully!')
      setRsvpDialogOpen(false)
      setRsvpForm({ name: '', email: '', phone: '', attendees: 1, notes: '' })
      loadEvents() // Refresh to get updated RSVP count
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      toast.error('Failed to submit RSVP. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = (platform: 'email' | 'copy') => {
    if (!selectedEvent) return

    const eventUrl = `${window.location.origin}/events/${selectedEvent.id}`
    const date = moment(selectedEvent.start).format('MMMM D, YYYY [at] h:mm A')

    if (platform === 'email') {
      const subject = `Event: ${selectedEvent.title}`
      const body = `Check out this event!\n\n${selectedEvent.title}\n${date}\n${selectedEvent.location ? `Location: ${selectedEvent.location}\n` : ''}\n${selectedEvent.description}\n\nRSVP: ${eventUrl}`
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      toast.success('Opening email client...')
    } else if (platform === 'copy') {
      const shareText = `${selectedEvent.title}\n${date}\n${selectedEvent.location ? `Location: ${selectedEvent.location}\n` : ''}\n${eventUrl}`
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Event link copied to clipboard!')
      }).catch(() => {
        toast.error('Failed to copy link')
      })
    }
    setShareDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Events Calendar</h1>
            <p className="text-muted-foreground">Upcoming events across all campuses</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">Calendar</CardTitle>
                    <CardDescription className="text-sm">View events by month, week, or day</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[hsl(var(--preschool))] text-white text-xs">Preschool</Badge>
                    <Badge className="bg-[hsl(var(--elementary))] text-white text-xs">Elementary</Badge>
                    <Badge className="bg-[hsl(var(--middle-high))] text-white text-xs">Middle/High</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading events...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[500px] sm:h-[550px] lg:h-[650px]">
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      view={view}
                      date={date}
                      onView={(newView) => setView(newView)}
                      onNavigate={(newDate) => setDate(newDate)}
                      onSelectEvent={handleSelectEvent}
                      eventPropGetter={eventStyleGetter}
                      style={{ height: '100%' }}
                      popup
                      toolbar
                      views={['month', 'week', 'day', 'agenda']}
                      step={30}
                      showMultiDayTimes
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Details / Upcoming Events */}
          <div className="space-y-6">
            {selectedEvent ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{selectedEvent.title}</CardTitle>
                        {selectedEvent.campus && (
                          <Badge className={`bg-[hsl(var(--${selectedEvent.campus}))] text-white`}>
                            {selectedEvent.campus.charAt(0).toUpperCase() + selectedEvent.campus.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEvent.image_url && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={selectedEvent.image_url}
                          alt={selectedEvent.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <p className="text-muted-foreground">{selectedEvent.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {moment(selectedEvent.start).format('MMMM D, YYYY')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {moment(selectedEvent.start).format('h:mm A')} -{' '}
                            {moment(selectedEvent.end).format('h:mm A')}
                          </p>
                        </div>
                      </div>

                      {selectedEvent.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <p className="text-sm">{selectedEvent.location}</p>
                        </div>
                      )}

                      {selectedEvent.max_attendees && (
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm">
                              {selectedEvent.rsvp_count} / {selectedEvent.max_attendees} attendees
                            </p>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${(selectedEvent.rsvp_count! / selectedEvent.max_attendees) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                        onClick={() => setRsvpDialogOpen(true)}
                      >
                        RSVP Now
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShareDialogOpen(true)}
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Click on the calendar to view details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          {event.campus && (
                            <Badge className={`bg-[hsl(var(--${event.campus}))] text-white text-xs`}>
                              {event.campus}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {moment(event.start).format('MMM D, YYYY • h:mm A')}
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                      </motion.div>
                    ))}

                    {events.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No upcoming events</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* RSVP Dialog */}
        <Dialog open={rsvpDialogOpen} onOpenChange={setRsvpDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>RSVP for {selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                {selectedEvent && moment(selectedEvent.start).format('MMMM D, YYYY [at] h:mm A')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={rsvpForm.name}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={rsvpForm.email}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(305) 555-0123"
                  value={rsvpForm.phone}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendees">Number of Attendees</Label>
                <Input
                  id="attendees"
                  type="number"
                  min="1"
                  value={rsvpForm.attendees}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, attendees: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes..."
                  value={rsvpForm.notes}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRsvpDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRSVP}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {submitting ? 'Submitting...' : 'Submit RSVP'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Share Event</DialogTitle>
              <DialogDescription>
                Share {selectedEvent?.title} with others
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShare('email')}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Share via Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShare('copy')}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
