import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { EventDetailClient } from './event-detail-client'

interface EventDetailPageProps {
  params: Promise<{ eventId: string }>
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { eventId } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('title, description, image_url')
    .eq('id', eventId)
    .single()

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: event.title,
    description: event.description || `Details for ${event.title}`,
    openGraph: {
      title: event.title,
      description: event.description || undefined,
      images: event.image_url ? [event.image_url] : undefined,
    },
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params
  const supabase = await createClient()
  const user = await getCurrentUser()

  // Fetch event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    notFound()
  }

  // Check if event is published or user is admin
  if (event.status !== 'published' && (!user || !['admin', 'super_admin'].includes(user.profile.role))) {
    notFound()
  }

  // Fetch RSVPs
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('*, profiles(full_name, email)')
    .eq('event_id', eventId)
    .eq('status', 'confirmed')

  // Check if current user has RSVP'd
  let userRsvp = null
  if (user) {
    const { data } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single()
    userRsvp = data
  }

  // Fetch related events (same campus, upcoming)
  const { data: relatedEvents } = await supabase
    .from('events')
    .select('id, title, event_date, campus, image_url')
    .eq('status', 'published')
    .neq('id', eventId)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .limit(3)

  return (
    <EventDetailClient
      event={event}
      rsvps={rsvps || []}
      userRsvp={userRsvp}
      relatedEvents={relatedEvents || []}
      isAuthenticated={!!user}
    />
  )
}
