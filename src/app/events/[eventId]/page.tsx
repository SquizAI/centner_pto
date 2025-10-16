import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EventDetailClient from './event-detail-client'
import { Event } from '@/types/events'

interface EventPageProps {
  params: Promise<{ eventId: string }>
}

async function getEvent(eventId: string): Promise<Event | null> {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    return null
  }

  return event
}

async function getEventRSVPs(eventId: string) {
  const supabase = await createClient()

  const { count } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)

  return count || 0
}

async function getUserRSVP(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: rsvp } = await supabase
    .from('event_rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  return rsvp
}

async function getRelatedEvents(eventId: string, campus: string) {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .or(`campus.eq.${campus},campus.eq.all`)
    .neq('id', eventId)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3)

  return events || []
}

export async function generateMetadata({ params }: EventPageProps) {
  const { eventId } = await params
  const event = await getEvent(eventId)

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: `${event.title} | Centner Academy PTO`,
    description: event.description || `Join us for ${event.title}`,
    openGraph: {
      title: event.title,
      description: event.description || undefined,
      images: event.image_url ? [event.image_url] : undefined,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params
  const event = await getEvent(eventId)

  if (!event) {
    notFound()
  }

  const [rsvpCount, userRSVP, relatedEvents] = await Promise.all([
    getEventRSVPs(eventId),
    getUserRSVP(eventId),
    getRelatedEvents(eventId, event.campus),
  ])

  return (
    <EventDetailClient
      event={event}
      rsvpCount={rsvpCount}
      userRSVP={userRSVP}
      relatedEvents={relatedEvents}
    />
  )
}
