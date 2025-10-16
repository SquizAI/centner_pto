import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-utils'
import { EventEditClient } from './event-edit-client'

interface EditEventPageProps {
  params: Promise<{ eventId: string }>
}

export const metadata: Metadata = {
  title: 'Edit Event',
  description: 'Edit event details and manage signups',
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  await requireAdmin()
  const { eventId } = await params
  const supabase = await createClient()

  // Fetch event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    notFound()
  }

  // Fetch RSVPs
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select(`
      *,
      profiles(full_name, email, phone)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  return <EventEditClient event={event} rsvps={rsvps || []} />
}
