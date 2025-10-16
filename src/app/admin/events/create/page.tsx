import { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-utils'
import { EventFormClient } from './event-form-client'

export const metadata: Metadata = {
  title: 'Create Event',
  description: 'Create a new event for the Centner Academy PTO',
}

export default async function CreateEventPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Create New Event
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill in the details below to create a new event
            </p>
          </div>

          {/* Event Form */}
          <EventFormClient />
        </div>
      </div>
    </div>
  )
}
