import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from './calendar-client'

export const metadata: Metadata = {
  title: 'Event Calendar',
  description: 'View all upcoming events and activities at Centner Academy PTO',
}

// Revalidate every 5 minutes
export const revalidate = 300

export default async function CalendarPage() {
  const supabase = await createClient()

  // Fetch all published events
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Event Calendar
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse upcoming events and activities across all campuses
            </p>
          </div>

          {/* Calendar Client Component */}
          <CalendarClient initialEvents={events || []} />
        </div>
      </div>
    </div>
  )
}
