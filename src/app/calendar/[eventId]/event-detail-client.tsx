'use client'

import { useState } from 'react'
import { Tables } from '@/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, MapPin, Users, Clock, Share2, Download, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createRSVP, deleteRSVP } from '@/app/actions/rsvp-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Event = Tables<'events'>
type RSVP = Tables<'event_rsvps'> & {
  profiles?: { full_name: string | null; email: string }
}

interface EventDetailClientProps {
  event: Event
  rsvps: RSVP[]
  userRsvp: RSVP | null
  relatedEvents: Pick<Event, 'id' | 'title' | 'event_date' | 'campus' | 'image_url'>[]
  isAuthenticated: boolean
}

const campusLabels: Record<string, string> = {
  all: 'All Campuses',
  preschool: 'Preschool',
  elementary: 'Elementary',
  'middle-high': 'Middle & High School',
}

const campusColors: Record<string, string> = {
  all: 'bg-primary/10 text-primary border-primary/20',
  preschool: 'bg-blue-100 text-blue-700 border-blue-200',
  elementary: 'bg-green-100 text-green-700 border-green-200',
  'middle-high': 'bg-purple-100 text-purple-700 border-purple-200',
}

export function EventDetailClient({
  event,
  rsvps,
  userRsvp: initialUserRsvp,
  relatedEvents,
  isAuthenticated,
}: EventDetailClientProps) {
  const router = useRouter()
  const [showRsvpDialog, setShowRsvpDialog] = useState(false)
  const [guestsCount, setGuestsCount] = useState(1)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRsvp, setUserRsvp] = useState(initialUserRsvp)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to RSVP')
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    const result = await createRSVP({
      event_id: event.id,
      parent_name: 'User', // This should come from profile
      parent_email: 'user@example.com', // This should come from profile
      num_adults: guestsCount,
      num_children: 0,
      notes,
    })

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('RSVP successful!')
      setShowRsvpDialog(false)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  const handleCancelRSVP = async () => {
    if (!userRsvp) return

    setIsSubmitting(true)
    const result = await deleteRSVP(userRsvp.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('RSVP cancelled')
      setUserRsvp(null)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || undefined,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const isEventFull = event.max_attendees && (event.current_attendees || 0) >= event.max_attendees
  const canRSVP = !userRsvp && !isEventFull && event.status === 'published'

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          {event.image_url && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.campus?.map((campus) => (
                      <Badge
                        key={campus}
                        variant="outline"
                        className={campusColors[campus] || campusColors.all}
                      >
                        {campusLabels[campus] || campus}
                      </Badge>
                    ))}
                    {event.event_type && (
                      <Badge variant="secondary">{event.event_type}</Badge>
                    )}
                    {event.status === 'cancelled' && (
                      <Badge variant="destructive">Cancelled</Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {event.description && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RSVP List */}
              {rsvps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attendees ({rsvps.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {rsvps.slice(0, 10).map((rsvp) => (
                        <div key={rsvp.id} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>
                            {rsvp.profiles?.full_name || 'Anonymous'}
                            {rsvp.guests_count && rsvp.guests_count > 1 && (
                              <span className="text-muted-foreground">
                                {' '}+{rsvp.guests_count - 1} guest{rsvp.guests_count > 2 ? 's' : ''}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                      {rsvps.length > 10 && (
                        <p className="text-sm text-muted-foreground">
                          And {rsvps.length - 10} more...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{formatDate(event.event_date)}</p>
                      {event.end_date && (
                        <p className="text-sm text-muted-foreground">
                          Until {formatDate(event.end_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <p>{event.location}</p>
                    </div>
                  )}

                  {event.max_attendees && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <p>
                        {event.current_attendees || 0} / {event.max_attendees} attendees
                        {isEventFull && (
                          <Badge variant="destructive" className="ml-2">Full</Badge>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userRsvp ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">You're attending!</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCancelRSVP}
                        disabled={isSubmitting}
                      >
                        Cancel RSVP
                      </Button>
                    </div>
                  ) : canRSVP ? (
                    <Button
                      className="w-full"
                      onClick={() => setShowRsvpDialog(true)}
                      disabled={isSubmitting}
                    >
                      RSVP Now
                    </Button>
                  ) : isEventFull ? (
                    <Button className="w-full" disabled>
                      Event Full
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Event
                  </Button>
                </CardContent>
              </Card>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {relatedEvents.map((relatedEvent) => (
                      <Link
                        key={relatedEvent.id}
                        href={`/calendar/${relatedEvent.id}`}
                        className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <p className="font-medium text-sm mb-1">{relatedEvent.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(relatedEvent.event_date)}
                        </p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Dialog */}
      <Dialog open={showRsvpDialog} onOpenChange={setShowRsvpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSVP for {event.title}</DialogTitle>
            <DialogDescription>
              Let us know you're coming!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="10"
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests or information..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRsvpDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRSVP} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Confirm RSVP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
