'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  ArrowLeft,
  Download,
  Ticket,
  DollarSign,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { format, formatDistance } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RSVPButton from '@/components/events/RSVPButton'
import CalendarExport from '@/components/events/CalendarExport'
import TicketPurchaseDialog from '@/components/events/TicketPurchaseDialog'
import { Event, EventRSVP } from '@/types/events'
import { toast } from 'sonner'

interface EventDetailClientProps {
  event: Event
  rsvpCount: number
  userRSVP: EventRSVP | null
  relatedEvents: Event[]
}

export default function EventDetailClient({
  event,
  rsvpCount: initialRSVPCount,
  userRSVP: initialUserRSVP,
  relatedEvents,
}: EventDetailClientProps) {
  const router = useRouter()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [rsvpCount, setRsvpCount] = useState(initialRSVPCount)
  const [userRSVP, setUserRSVP] = useState(initialUserRSVP)

  const eventDate = new Date(event.event_date)
  const endDate = event.end_date ? new Date(event.end_date) : eventDate
  const isPastEvent = eventDate < new Date()
  const isUpcoming = !isPastEvent

  const handleShare = (platform: 'email' | 'copy') => {
    const eventUrl = `${window.location.origin}/events/${event.id}`
    const date = format(eventDate, 'MMMM d, yyyy [at] h:mm a')

    if (platform === 'email') {
      const subject = `Event: ${event.title}`
      const body = `Check out this event!\n\n${event.title}\n${date}\n${event.location ? `Location: ${event.location}\n` : ''}\n${event.description}\n\nRSVP: ${eventUrl}`
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      toast.success('Opening email client...')
    } else if (platform === 'copy') {
      const shareText = `${event.title}\n${date}\n${event.location ? `Location: ${event.location}\n` : ''}\n${eventUrl}`
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Event link copied to clipboard!')
      }).catch(() => {
        toast.error('Failed to copy link')
      })
    }
    setShareDialogOpen(false)
  }

  const handleRSVPSuccess = () => {
    setRsvpCount(prev => prev + 1)
    router.refresh()
  }

  const handleRSVPCancel = () => {
    setRsvpCount(prev => Math.max(0, prev - 1))
    setUserRSVP(null)
    router.refresh()
  }

  const campusColors: { [key: string]: string } = {
    preschool: 'bg-[hsl(var(--preschool))]',
    elementary: 'bg-[hsl(var(--elementary))]',
    'middle-high': 'bg-[hsl(var(--middle-high))]',
    all: 'bg-primary',
  }

  const campusLabels: { [key: string]: string } = {
    preschool: 'Preschool',
    elementary: 'Elementary',
    'middle-high': 'Middle/High School',
    all: 'All Campuses',
  }

  const capacityPercentage = event.max_attendees
    ? (rsvpCount / event.max_attendees) * 100
    : 0
  const ticketAvailability = event.ticket_quantity
    ? ((event.ticket_quantity - (event.tickets_sold || 0)) / event.ticket_quantity) * 100
    : 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/events')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header Image */}
            {event.image_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-xl"
              >
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                />
                {isPastEvent && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      Past Event
                    </Badge>
                  </div>
                )}
              </motion.div>
            )}

            {/* Event Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={`${campusColors[event.campus]} text-white`}>
                          {campusLabels[event.campus]}
                        </Badge>
                        {event.ticket_enabled && (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            <Ticket className="w-3 h-3 mr-1" />
                            Ticketed Event
                          </Badge>
                        )}
                        {event.rsvp_required && !event.ticket_enabled && (
                          <Badge variant="outline">
                            RSVP Required
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                      <CardDescription className="text-base">
                        {formatDistance(eventDate, new Date(), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShareDialogOpen(true)}
                      className="flex-shrink-0"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Description */}
                  {event.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About this Event</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  )}

                  {/* Event Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-muted-foreground mb-1">
                          Date & Time
                        </p>
                        <p className="font-semibold">
                          {format(eventDate, 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(eventDate, 'h:mm a')}
                          {event.end_date && ` - ${format(endDate, 'h:mm a')}`}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-muted-foreground mb-1">
                            Location
                          </p>
                          <p className="font-semibold">{event.location}</p>
                        </div>
                      </div>
                    )}

                    {/* Attendance */}
                    {!event.ticket_enabled && event.max_attendees && (
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="w-full">
                          <p className="font-medium text-sm text-muted-foreground mb-1">
                            Attendance
                          </p>
                          <p className="font-semibold mb-2">
                            {rsvpCount} / {event.max_attendees} people
                          </p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                            />
                          </div>
                          {capacityPercentage >= 90 && (
                            <p className="text-xs text-orange-600 mt-1">
                              Almost full!
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tickets */}
                    {event.ticket_enabled && (
                      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <Ticket className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="w-full">
                          <p className="font-medium text-sm text-muted-foreground mb-1">
                            Tickets
                          </p>
                          <p className="font-semibold mb-1">
                            ${event.ticket_price?.toFixed(2)} per ticket
                          </p>
                          {event.ticket_quantity && (
                            <>
                              <p className="text-sm text-muted-foreground mb-2">
                                {event.ticket_quantity - (event.tickets_sold || 0)} available
                              </p>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ width: `${ticketAvailability}%` }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* External Ticket Sales Link */}
                    {event.external_ticket_url && (
                      <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <Ticket className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="w-full">
                          <p className="font-medium text-sm text-muted-foreground mb-1">
                            Tickets Available
                          </p>
                          <p className="text-sm mb-3">
                            Purchase tickets through our ticketing partner
                          </p>
                          <Button
                            asChild
                            className="w-full"
                            size="sm"
                          >
                            <a
                              href={event.external_ticket_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Ticket className="w-4 h-4 mr-2" />
                              Buy Tickets
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RSVP Status Alert */}
                  {userRSVP && (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        You have RSVP'd to this event
                        {userRSVP.num_adults + userRSVP.num_children > 1 &&
                          ` with ${userRSVP.num_adults + userRSVP.num_children} guests`}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Capacity Warning */}
                  {!event.ticket_enabled &&
                    event.max_attendees &&
                    rsvpCount >= event.max_attendees && (
                      <Alert className="border-orange-500 bg-orange-50">
                        <XCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          This event has reached maximum capacity
                        </AlertDescription>
                      </Alert>
                    )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-xl border-0 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {event.ticket_enabled || event.external_ticket_url ? 'Get Tickets' : 'RSVP'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isUpcoming ? (
                    <>
                      {event.ticket_enabled ? (
                        <>
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Price</span>
                              <span className="text-2xl font-bold">
                                ${event.ticket_price?.toFixed(2)}
                              </span>
                            </div>
                            {event.ticket_quantity && (
                              <p className="text-xs text-muted-foreground text-center">
                                {event.ticket_quantity - (event.tickets_sold || 0)} tickets remaining
                              </p>
                            )}
                          </div>
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setTicketDialogOpen(true)}
                            disabled={
                              event.ticket_quantity
                                ? event.tickets_sold >= event.ticket_quantity
                                : false
                            }
                          >
                            <Ticket className="w-4 h-4 mr-2" />
                            {event.ticket_quantity && event.tickets_sold >= event.ticket_quantity
                              ? 'Sold Out'
                              : 'Buy Tickets'}
                          </Button>
                        </>
                      ) : event.external_ticket_url ? (
                        <Button
                          asChild
                          className="w-full"
                          size="lg"
                        >
                          <a
                            href={event.external_ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Ticket className="w-4 h-4 mr-2" />
                            Buy Tickets
                          </a>
                        </Button>
                      ) : (
                        <RSVPButton
                          event={event}
                          userRSVP={userRSVP}
                          rsvpCount={rsvpCount}
                          onRSVPSuccess={handleRSVPSuccess}
                          onRSVPCancel={handleRSVPCancel}
                        />
                      )}
                      <CalendarExport event={event} />
                    </>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        This event has already passed
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-xl">Related Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedEvents.map((relatedEvent) => (
                      <Link
                        key={relatedEvent.id}
                        href={`/events/${relatedEvent.id}`}
                        className="block group"
                      >
                        <div className="p-3 border rounded-lg hover:shadow-md transition-all">
                          <h4 className="font-semibold group-hover:text-primary transition-colors mb-1">
                            {relatedEvent.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(relatedEvent.event_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
            <DialogDescription>
              Share {event.title} with others
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

      {/* Ticket Purchase Dialog */}
      {event.ticket_enabled && (
        <TicketPurchaseDialog
          event={event}
          open={ticketDialogOpen}
          onOpenChange={setTicketDialogOpen}
        />
      )}
    </div>
  )
}
