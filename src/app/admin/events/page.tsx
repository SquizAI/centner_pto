import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-utils'
import { AdminEventsClient } from './admin-events-client'

export const metadata: Metadata = {
  title: 'Manage Events',
  description: 'Admin dashboard for managing events',
}

export default async function AdminEventsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch all events (including drafts and cancelled)
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      event_rsvps(count)
    `)
    .order('event_date', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
  }

  // Get event counts by status
  const eventCounts = {
    all: events?.length || 0,
    published: events?.filter((e) => e.status === 'published').length || 0,
    draft: events?.filter((e) => e.status === 'draft').length || 0,
    cancelled: events?.filter((e) => e.status === 'cancelled').length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto lg:mx-0 lg:max-w-none">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Event Management
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-3xl">
              Create, edit, and manage events for the PTO calendar. Click <span className="font-semibold">Create Event</span> to add a new event, or select an existing event below to edit or delete it. Use the filters to view events by status or campus.
            </p>
          </div>

          {/* Admin Events Client Component */}
          <AdminEventsClient
            initialEvents={events || []}
            eventCounts={eventCounts}
          />
        </div>
      </div>
    </div>
  )
}
